import { Injectable, Logger } from '@nestjs/common';
import { DENOMINATOR } from '../farming/farming.constants';
import { GamerService } from './gamer.service';
import { ethers } from 'ethers';
import {
  ASTAR_RPC_URL,
  DEO_ASTAR_ADDRESS,
  DEO_ETH_ADDRESS,
  DEO_XOR_ADDRESS,
  ETH_RPC_URL,
  GAME_WALLET_ETH_ASTAR,
  GAME_WALLET_SORA,
} from './gamer.constants';
import * as deoABI from '../../utils/files/abi.json';
import { SoraClient } from '@ceresecosystem/ceres-lib/packages/ceres-backend-common';

@Injectable()
export class GamerBuyChipsListener {
  private readonly logger = new Logger(GamerBuyChipsListener.name);

  constructor(
    private readonly gamerService: GamerService,
    private readonly soraClient: SoraClient,
  ) {
    this.runListeners();
  }

  private runListeners(): void {
    this.logger.log('Buy chips listeners initializing.');

    this.runEthereumListener();
    this.runAsterListener();
    this.runSoraListener();
  }

  private runEthereumListener(): void {
    const ethProvider = new ethers.providers.JsonRpcProvider(ETH_RPC_URL);
    const ethContract = new ethers.Contract(
      DEO_ETH_ADDRESS,
      deoABI,
      ethProvider,
    );

    ethContract.on('Transfer', async (from, to, value) => {
      if (to === GAME_WALLET_ETH_ASTAR) {
        const chips = parseFloat(ethers.utils.formatUnits(value, 18));
        await this.gamerService.addChips(from, chips);
        this.logger.log(
          `${from} account id bought ${chips} chips on Ethereum.`,
        );
      }
    });
  }

  private runAsterListener(): void {
    const provider = new ethers.providers.JsonRpcProvider(ASTAR_RPC_URL);
    const contract = new ethers.Contract(DEO_ASTAR_ADDRESS, deoABI, provider);

    contract.on('Transfer', async (from, _to, value) => {
      const chips = parseFloat(ethers.utils.formatUnits(value, 18));
      await this.gamerService.addChips(from, chips);
      this.logger.log(`${from} account id bought ${chips} chips on Astar.`);
    });
  }

  private async runSoraListener(): Promise<void> {
    const soraApi = await this.soraClient.getSoraApi();

    soraApi.query.system.events((events) => {
      for (const record of events) {
        const { event } = record;

        if (event?.section !== 'assets' || event?.method !== 'Transfer') {
          continue;
        }

        this.processSoraEvent(event);
      }
    });
  }

  private async processSoraEvent(event): Promise<void> {
    const types = event.typeDef;
    const data = event?.data?.toHuman();

    if (
      types[1].type === 'AccountId32' &&
      data[1] === GAME_WALLET_SORA &&
      data[2].code === DEO_XOR_ADDRESS
    ) {
      const amount = parseInt(data[3].replace(/,/g, '')) / DENOMINATOR;
      const chips = parseFloat(amount.toFixed(2));
      await this.gamerService.addChips(data[0], chips);

      this.logger.log(`${data[0]} account id bought ${chips} chips on SORA.`);
    }
  }
}
