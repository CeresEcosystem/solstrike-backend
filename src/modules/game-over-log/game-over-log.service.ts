import { Injectable } from '@nestjs/common';
import { GameOverLog, GameOverLogType } from './entity/game-over-log.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { GameOverLogDto } from './dto/game-over-log.dto';
import { BurnLogDto } from './dto/burn-log.dto';
import Big from 'big.js';
import { ChipService } from '../chips/chip.service';
import { GamerService } from '../gamer/gamer.service';
import {
  WINNER_MULTIPLIER,
  TOTAL_WINNERS_POINTS_REWARD,
  GAMER_POINTS_REWARD,
  REFERRAL_MULTIPLIER,
  REFERRAL_PERC,
  WINNER_PERC,
} from './game-over-log.constants';
import { Gamer } from '../gamer/entity/gamer.entity';
import {
  PageDto,
  PageMetaDto,
  PageOptionsDto,
} from '@ceresecosystem/ceres-lib/packages/ceres-backend-common';
import { GameOverIndividualLog } from './entity/game-over-individual-log.entity';
import { EndGameResultDto } from '../game/dto/end-game-player-result.dto';

@Injectable()
export class GameOverLogService {
  constructor(
    @InjectRepository(GameOverLog, 'pg')
    private readonly gameOverLogRepo: Repository<GameOverLog>,
    @InjectRepository(GameOverIndividualLog, 'pg')
    private readonly gameOverIndividualLogRepo: Repository<GameOverIndividualLog>,
    private readonly chipService: ChipService,
    private readonly gamerService: GamerService,
  ) {}

  public async getTotalChipsByType(type: GameOverLogType): Promise<number> {
    const { total } = await this.gameOverLogRepo
      .createQueryBuilder()
      .select('SUM(game_chips)', 'total')
      .where({ type })
      .getRawOne<{ total: string }>();

    return Number(total);
  }

  public async getByType(
    type: GameOverLogType,
    pageOptions: PageOptionsDto,
  ): Promise<PageDto<GameOverLog>> {
    const [data, totalCount] = await this.gameOverLogRepo.findAndCount({
      skip: pageOptions.skip,
      take: pageOptions.size,
      where: { type },
      order: { createdAt: 'DESC' },
    });

    const pageMeta = new PageMetaDto(
      pageOptions.page,
      pageOptions.size,
      totalCount,
    );

    return new PageDto(data, pageMeta);
  }

  public async insertBurnLog(burnLog: BurnLogDto): Promise<void> {
    await this.gameOverLogRepo.insert({ ...burnLog, type: 'burn' });
  }

  public async insertIndividualLogs(
    gameId: string,
    reporterAccountId: string,
    playerResults: EndGameResultDto[],
  ): Promise<void> {
    await Promise.all(
      playerResults.map(async (playerResult) => {
        await this.gameOverIndividualLogRepo.insert({
          gameId,
          reporterAccountId,
          playerAccountId: playerResult.accountId,
          kills: playerResult.kills,
          deaths: playerResult.deaths,
          headshots: playerResult.deaths,
          createdAt: new Date(),
        });
      }),
    );
  }

  public async getIndividualEndGameResults(
    gameId: string,
    reporterAccountId: string,
  ): Promise<EndGameResultDto[]> {
    const individualGameResults = await this.gameOverIndividualLogRepo.findBy({
      gameId,
      reporterAccountId,
    });

    return individualGameResults.map((log) => ({
      accountId: log.playerAccountId,
      kills: log.kills,
      deaths: log.deaths,
      headshots: log.headshots,
    }));
  }

  public async createLogsForGame(
    gameId: string,
    winnerAccountIds: string[],
    playerResults: EndGameResultDto[],
  ): Promise<void> {
    const playerAccountIds = playerResults.map((result) => result.accountId);
    const chipAmount = await this.chipService.getChipAmount();
    const gamers = await this.gamerService.findByAccountIds(playerAccountIds);
    const winners = gamers.filter((gamer) =>
      winnerAccountIds.includes(gamer.accountId),
    );
    const losers = gamers.filter(
      (gamer) => !winnerAccountIds.includes(gamer.accountId),
    );

    const logs: GameOverLogDto[] = this.buildLogs(
      gameId,
      chipAmount,
      winners,
      losers,
      playerResults,
    );

    await this.gameOverLogRepo.insert(logs);
  }

  private buildLogs(
    gameId: string,
    chipAmount: number,
    winners: Gamer[],
    losers: Gamer[],
    playerResults: EndGameResultDto[],
  ): GameOverLogDto[] {
    const winnersCount = winners.length;
    const gamersCount = winners.length + losers.length;
    const chipsInGame = new Big(chipAmount).mul(gamersCount).toNumber();
    const logs: GameOverLogDto[] = [];

    logs.push(
      ...this.buildReferralLogs(
        [...winners, ...losers],
        gameId,
        chipsInGame,
        gamersCount,
        winnersCount,
      ),
    );

    logs.push(
      ...this.buildWinnerLogs(
        winners,
        gameId,
        chipsInGame,
        gamersCount,
        winnersCount,
        playerResults,
      ),
    );

    logs.push(
      ...this.buildLoserLogs(
        losers,
        gameId,
        gamersCount,
        winnersCount,
        playerResults,
      ),
    );

    logs.push(
      this.buildBurnLog(logs, gameId, gamersCount, chipAmount, winnersCount),
    );

    return logs;
  }

  private buildReferralLogs(
    gamers: Gamer[],
    gameId: string,
    chipsInGame: number,
    gamersCount: number,
    winnersCount: number,
  ): GameOverLogDto[] {
    return gamers
      .filter((gamer) => !gamer.referralUserId)
      .map((gamer) => ({
        gameId,
        type: 'referral',
        typeId: gamer.id,
        userId: gamer.referralUserId,
        gameChips: new Big(chipsInGame).mul(REFERRAL_MULTIPLIER).toNumber(),
        perc: REFERRAL_PERC,
        totalPerc: REFERRAL_PERC,
        gamersCount,
        winnersCount,
        points: 0,
        kills: 0,
        deaths: 0,
        headshots: 0,
      }));
  }

  private buildWinnerLogs(
    winners: Gamer[],
    gameId: string,
    chipsInGame: number,
    gamersCount: number,
    winnersCount: number,
    playerResults: EndGameResultDto[],
  ): GameOverLogDto[] {
    const winnerChipsReward = new Big(chipsInGame)
      .mul(WINNER_MULTIPLIER)
      .div(winnersCount)
      .toNumber();
    const winnerPointsReward = new Big(TOTAL_WINNERS_POINTS_REWARD)
      .div(winnersCount)
      .plus(GAMER_POINTS_REWARD)
      .toNumber();

    return winners.map((winner) => {
      const playerResult = playerResults.find(
        (result) => result.accountId === winner.accountId,
      );

      return {
        gameId,
        type: 'winner',
        typeId: winner.id,
        userId: winner.id,
        gameChips: winnerChipsReward,
        perc: WINNER_PERC,
        totalPerc: new Big(WINNER_PERC).div(winnersCount).toNumber(),
        gamersCount,
        winnersCount,
        points: winnerPointsReward,
        kills: playerResult.kills,
        deaths: playerResult.deaths,
        headshots: playerResult.headshots,
      };
    });
  }

  private buildLoserLogs(
    losers: Gamer[],
    gameId: string,
    gamersCount: number,
    winnersCount: number,
    playerResults: EndGameResultDto[],
  ): GameOverLogDto[] {
    return losers.map((loser) => {
      const playerResult = playerResults.find(
        (result) => result.accountId === loser.accountId,
      );

      return {
        gameId,
        type: 'loser',
        typeId: loser.id,
        userId: loser.id,
        gameChips: 0,
        perc: 0,
        totalPerc: 0,
        gamersCount,
        winnersCount,
        points: GAMER_POINTS_REWARD,
        kills: playerResult.kills,
        deaths: playerResult.deaths,
        headshots: playerResult.headshots,
      };
    });
  }

  private buildBurnLog(
    logs: GameOverLogDto[],
    gameId: string,
    gamersCount: number,
    chipAmount: number,
    winnersCount: number,
  ): GameOverLogDto {
    const totalPercSum = logs
      .map((log) => log.totalPerc)
      .reduce((sum, totalPerc) => new Big(sum).add(totalPerc).toNumber(), 0);
    const burnPercent = new Big(100).minus(totalPercSum).toNumber();
    const burnChips = new Big(gamersCount)
      .mul(chipAmount)
      .mul(burnPercent)
      .div(100)
      .toNumber();

    return {
      gameId,
      type: 'burn',
      typeId: 0,
      userId: 0,
      gameChips: burnChips,
      perc: burnPercent,
      totalPerc: burnPercent,
      gamersCount,
      winnersCount,
      points: 0,
      kills: 0,
      deaths: 0,
      headshots: 0,
    };
  }
}
