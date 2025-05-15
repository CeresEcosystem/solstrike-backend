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
import { GamerLog } from './entity/gamer-log.entity';
import isValidSignature from 'src/utils/signature.utils';
import { EndGameResultDto } from '../game/dto/end-game-player-result.dto';
import { GamerLeaderboardDto } from './dto/leaderboard.dto';
import { Game } from '../game/entity/game.entity';
import { GAME_DURATION, GAME_PROCESSING_TIMEOUT } from '../game/game.const';

@Injectable()
export class GamerService {
  private readonly logger = new Logger(GamerService.name);

  constructor(
    @InjectDataSource('pg')
    private readonly dataSource: DataSource,
    @InjectRepository(Gamer, 'pg')
    private readonly gamerRepo: Repository<Gamer>,
    @InjectRepository(GamerLog, 'pg')
    private readonly gamerLogRepo: Repository<GamerLog>,
    @InjectRepository(Game, 'pg')
    private readonly gameRepo: Repository<Game>,
  ) {}

  public isPlayerInActiveGame(accountId: string): Promise<boolean> {
    const fiveMinutesAgo = new Date(
      Date.now() - GAME_DURATION - GAME_PROCESSING_TIMEOUT,
    );

    return this.gameRepo.exists({
      where: {
        resultsProcessed: false,
        accountId,
        createdAt: MoreThan(fiveMinutesAgo),
      },
    });
  }

  public getGamersTotalCount(): Promise<number> {
    return this.gamerRepo.count();
  }

  public findByAccountIds(accountIds: string[]): Promise<Gamer[]> {
    return this.gamerRepo.findBy({ accountId: In(accountIds) });
  }

  public async fetchOrCreate(
    accountId: string,
  ): Promise<Gamer & { isInActiveGame: boolean }> {
    const gamerExists = await this.gamerRepo.existsBy({ accountId });

    if (!gamerExists) {
      await this.gamerRepo.save({ accountId });
    }

    const gamer = await this.gamerRepo.findOneBy({ accountId });
    const isInActiveGame = await this.isPlayerInActiveGame(accountId);

    return { ...gamer, isInActiveGame };
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

  public async addReservedChips(
    accountId: string,
    chipsToAdd: number,
  ): Promise<void> {
    const gamer = await this.gamerRepo.findOneByOrFail({ accountId });

    await this.gamerRepo
      .createQueryBuilder()
      .update()
      .set({ reservedChips: () => `reserved_chips + ${chipsToAdd}` })
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

      if (gamer.reservedChips < chipsToSubtract) {
        throw new BadRequestException('Gamer does not have enough chips.');
      }

      await gamerManager
        .createQueryBuilder()
        .update()
        .set({ reservedChips: () => `reserved_chips - ${chipsToSubtract}` })
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

  public async getLeaderboardPositions(
    accountId: string,
  ): Promise<GamerLeaderboardDto[]> {
    const allGamers = await this.gamerRepo.find({
      where: { points: MoreThan(0), partyCount: MoreThan(0) },
      order: {
        points: 'DESC',
      },
    });

    const leaderboard = allGamers.map((gamer, idx) => ({
      accountId: gamer.accountId,
      username: gamer.username || gamer.accountId,
      points: gamer.points,
      partyCount: gamer.partyCount,
      kills: gamer.kills,
      deaths: gamer.deaths,
      place: idx + 1,
    }));

    const topTen = leaderboard.slice(0, 10);

    const playerEntry = leaderboard.find(
      (gamer) => gamer.accountId === accountId,
    );

    if (!playerEntry || topTen.find((gamer) => gamer.accountId === accountId)) {
      return topTen;
    }

    return [...topTen, playerEntry];
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

  public async useReferralCode(
    accountId: string,
    referralCode: string,
    signature: string,
  ): Promise<boolean> {
    let referralUsed = false;
    let isValid = false;

    try {
      const message = 'Use referral code';

      isValid = await isValidSignature(signature, message, accountId);
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

  async distributeGameStatsAndPoints(
    gameResultList: EndGameResultDto[],
  ): Promise<void> {
    const updates = gameResultList.map((player) => {
      const pts = Math.max(3 * player.kills - player.deaths, 0);

      return this.gamerRepo
        .createQueryBuilder()
        .update()
        .set({
          points: () => `points + ${pts}`,
          kills: () => `kills + ${player.kills}`,
          deaths: () => `deaths + ${player.deaths}`,
          headshots: () => `headshots + ${player.headshots}`,
        })
        .where({ accountId: player.accountId })
        .execute();
    });

    await Promise.all(updates);
  }
}
