import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import {
  DataSource,
  EntityManager,
  In,
  MoreThan,
  Not,
  Repository,
} from 'typeorm';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Gamer } from './entity/gamer.entity';
import { GamerRankingDto } from './dto/gamer-ranking-dto';
import { ethers } from 'ethers';
import { Keyring } from '@polkadot/keyring';
import {
  ASTAR_RPC_URL,
  DEO_ASTAR_ADDRESS,
  DEO_ETH_ADDRESS,
  DEO_XOR_ADDRESS,
  ETH_RPC_URL,
} from './gamer.constants';
import * as deoABI from '../../utils/files/abi.json';
import { FPNumber } from '@sora-substrate/math';
import { GamerLog } from './entity/gamer-log.entity';
import { SoraClient } from '@ceresecosystem/ceres-lib/packages/ceres-backend-common';
import isValidSignature from 'src/utils/signature.utils';

@Injectable()
export class GamerService {
  private readonly logger = new Logger(GamerService.name);

  private readonly gameETHAstarWallet;
  private readonly contractETH;
  private readonly contractAstar;
  private readonly gameSORAWallet;

  constructor(
    @InjectDataSource('pg')
    private readonly dataSource: DataSource,
    @InjectRepository(Gamer, 'pg')
    private readonly gamerRepo: Repository<Gamer>,
    @InjectRepository(GamerLog, 'pg')
    private readonly gamerLogRepo: Repository<GamerLog>,
    private readonly soraClient: SoraClient,
  ) {
    // Load DEO Arena wallet on SORA
    const keyring = new Keyring();
    this.gameSORAWallet = keyring.addFromMnemonic(
      process.env.GAME_SORA_WALLET,
      {},
      'sr25519',
    );

    // Load DEO Arena wallet on ETH/Astar
    this.gameETHAstarWallet = ethers.Wallet.fromMnemonic(
      process.env.GAME_ETH_ASTAR_WALLET,
    );

    // Initialize connection with Ethereum
    const ethProvider = new ethers.providers.JsonRpcProvider(ETH_RPC_URL);
    const ethWalletSigner = this.gameETHAstarWallet.connect(ethProvider);
    this.contractETH = new ethers.Contract(
      DEO_ETH_ADDRESS,
      deoABI,
      ethWalletSigner,
    );

    // Initialize connection with Astar
    const astarProvider = new ethers.providers.JsonRpcProvider(ASTAR_RPC_URL);
    const astarWalletSigner = this.gameETHAstarWallet.connect(astarProvider);
    this.contractAstar = new ethers.Contract(
      DEO_ASTAR_ADDRESS,
      deoABI,
      astarWalletSigner,
    );
  }

  public findByAccountIds(accountIds: string[]): Promise<Gamer[]> {
    return this.gamerRepo.findBy({ accountId: In(accountIds) });
  }

  public async fetchOrCreate(accountId: string): Promise<Gamer> {
    const gamerExists = await this.gamerRepo.existsBy({ accountId });

    if (!gamerExists) {
      await this.gamerRepo.save({ accountId });
    }

    return this.gamerRepo.findOneBy({ accountId });
  }

  public async updateUsername(
    accountId: string,
    username: string,
  ): Promise<Gamer> {
    await this.gamerRepo.update(
      { accountId },
      { username, updatedAt: new Date() },
    );

    return this.gamerRepo.findOneByOrFail({ accountId });
  }

  public async addChips(accountId: string, chipsToAdd: number): Promise<void> {
    const gamer = await this.gamerRepo.findOneByOrFail({ accountId });

    await this.gamerRepo
      .createQueryBuilder()
      .update()
      .set({ chips: () => `chips + ${chipsToAdd}` })
      .where({ id: gamer.id })
      .execute();
  }

  public async subtractChips(
    accountId: string,
    chipsToSubtract: number,
  ): Promise<void> {
    await this.dataSource.transaction(async (manager: EntityManager) => {
      const gamerManager = manager.withRepository(this.gamerRepo);

      const gamer = await gamerManager.findOneByOrFail({
        accountId,
      });

      if (gamer.chips < chipsToSubtract) {
        throw new BadRequestException('Gamer does not have enough chips.');
      }

      await gamerManager
        .createQueryBuilder()
        .update()
        .set({ chips: () => `chips - ${chipsToSubtract}` })
        .where({ id: gamer.id })
        .execute();
    });
  }

  public async incrementPartyCount(accountId: string): Promise<void> {
    await this.gamerRepo
      .createQueryBuilder()
      .update()
      .set({ partyCount: () => 'party + 1' })
      .where({ accountId })
      .execute();
  }

  public async getRanking(): Promise<GamerRankingDto[]> {
    const gamers = await this.gamerRepo.find({
      where: { points: MoreThan(0), partyCount: MoreThan(0) },
      order: {
        points: 'DESC',
        kills: 'DESC',
        deaths: 'DESC',
        headshots: 'DESC',
      },
    });

    return gamers.map((gamer, idx) => ({
      userId: gamer.id,
      username: gamer.username || gamer.accountId,
      accountId: gamer.accountId,
      points: gamer.points,
      partyCount: gamer.partyCount,
      kills: gamer.kills,
      deaths: gamer.deaths,
      headshots: gamer.headshots,
      place: idx + 1,
    }));
  }

  public async saveGamerLogs(seasonId: string): Promise<void> {
    const gamers = await this.gamerRepo.find();
    const gamerLogs = gamers.map((gamer) => ({
      ...gamer,
      seasonId,
    }));

    await this.gamerLogRepo.insert(gamerLogs);
  }

  public async resetPointsForAll(): Promise<void> {
    await this.gamerRepo
      .createQueryBuilder()
      .update({
        points: 0,
        partyCount: 0,
        kills: 0,
        deaths: 0,
        headshots: 0,
      })
      .execute();
  }

  public claimBackDEO(
    accountId: string,
    deo: string,
    signature: string,
    network: string,
  ): Promise<boolean> {
    const tokens = parseFloat(deo);

    if (isNaN(tokens)) {
      return Promise.resolve(false);
    }

    let isValid = false;

    try {
      isValid = this.isClaimBackDeoRequestValid(network, signature, accountId);
    } catch (e) {
      this.logger.warn(
        'Exception happened while verifying claim back DEO request',
        e,
      );
    }

    if (!isValid) {
      return Promise.resolve(false);
    }

    if (network === 'ASTAR' || network === 'ETHEREUM') {
      return this.claimBackDeoAstarEth(network, tokens, accountId);
    }

    if (network === 'SORA') {
      return this.claimBackDeoSora(accountId, tokens);
    }

    return Promise.resolve(false);
  }

  private isClaimBackDeoRequestValid(
    network: string,
    signature: string,
    accountId: string,
  ): boolean {
    const message = 'Claim back DEO';

    return isValidSignature(network, signature, message, accountId);
  }

  private async claimBackDeoAstarEth(
    network: string,
    tokens: number,
    accountId: string,
  ): Promise<boolean> {
    const contract =
      network === 'ASTAR' ? this.contractAstar : this.contractETH;
    const numberOfTokens = ethers.utils.parseUnits(tokens.toString(), 18);

    const tx = await contract.transfer(accountId, numberOfTokens, {
      gasLimit: 100000,
    });
    const transactionReceipt = await tx.wait();
    const txStatus = transactionReceipt?.status === 1;

    if (txStatus) {
      await this.subtractChips(accountId, tokens);
    }

    return txStatus;
  }

  private async claimBackDeoSora(
    accountId: string,
    tokens: number,
  ): Promise<boolean> {
    const soraApi = await this.soraClient.getSoraApi();
    const extrinsic = soraApi.tx?.assets?.transfer(
      DEO_XOR_ADDRESS,
      accountId,
      FPNumber.fromNatural(tokens).toString(),
    );

    const tx = new Promise<boolean>(async (resolve) => {
      const unSub = await extrinsic
        ?.signAndSend(this.gameSORAWallet, (result) => {
          if (result?.status?.isFinalized) {
            if (unSub) {
              unSub();
            }

            const failedEvents = result.events.filter(({ event }) =>
              soraApi.events?.system?.ExtrinsicFailed?.is(event),
            );
            resolve(failedEvents.length === 0);
          }
        })
        .catch(() => {
          resolve(false);
        });
    });

    const txStatus = await tx;
    if (txStatus) {
      await this.subtractChips(accountId, tokens);
    }

    return txStatus;
  }

  public async useReferralCode(
    accountId: string,
    referralCode: string,
    signature: string,
    network: string,
  ): Promise<boolean> {
    let referralUsed = false;
    let isValid = false;

    try {
      const message = 'Use referral code';

      isValid = isValidSignature(network, signature, message, accountId);
    } catch (e) {
      this.logger.warn('Exception happened on use referral code.', e);
    }

    if (isValid) {
      const gamer = await this.gamerRepo.findOneBy({ accountId });
      if (gamer) {
        referralUsed = await this.useReferralCodeIfValid(gamer, referralCode);
      }
    }

    return referralUsed;
  }

  private async useReferralCodeIfValid(
    gamer: Gamer,
    referralCode: string,
  ): Promise<boolean> {
    if (!referralCode || !!gamer.referralUserId) {
      return false;
    }

    const referringGamer = await this.gamerRepo.findOneBy({
      id: Not(gamer.id),
      referralCode,
    });

    if (!referringGamer) {
      return false;
    }

    await this.gamerRepo.update(
      { id: referringGamer.id },
      { referralUsed: true },
    );
    await this.gamerRepo.update(
      { id: gamer.id },
      { referralUserId: referringGamer.id },
    );

    return true;
  }
}
