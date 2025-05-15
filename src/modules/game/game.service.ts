import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { In, IsNull, MoreThan, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { GamerService } from '../gamer/gamer.service';
import { Game } from './entity/game.entity';
import { GameOverLogService } from '../game-over-log/game-over-log.service';
import { hasDuplicates } from '@ceresecosystem/ceres-lib/packages/ceres-backend-common';
import { StartGameDto } from './dto/start-game.dto';
import isValidSignature from 'src/utils/signature.utils';
import { EndGameDto } from './dto/end-game.dto';
import { StatisticsDto } from './dto/statistics.dto';
import { GAME_DURATION, GAME_PROCESSING_TIMEOUT } from './game.const';

@Injectable()
export class GameService {
  private readonly logger = new Logger(GameService.name);

  constructor(
    @InjectRepository(Game, 'pg')
    private readonly gameRepo: Repository<Game>,
    private readonly gamerService: GamerService,
    private readonly gameOverLogService: GameOverLogService,
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

  public isPlayerInGame(gameId: string, accountId: string): Promise<boolean> {
    return this.gameRepo.exists({
      where: { gameId, accountId },
    });
  }

  public isGameInProgress(
    gameId: string,
    accountId?: string,
  ): Promise<boolean> {
    return this.gameRepo.exists({
      where: { gameId, accountId, finishedAt: IsNull() },
    });
  }

  public async getFinishedGames(): Promise<Map<string, Game[]>> {
    const gameParties = await this.gameRepo.findBy({
      resultsProcessed: false,
    });

    // Filter out games that are processed already.
    // In case player end game request was late it would appear in the list above.
    const alreadyProcessedGameIds = (
      await this.gameRepo.findBy({
        gameId: In(gameParties.map((game) => game.gameId)),
        resultsProcessed: true,
      })
    ).map((game) => game.gameId);

    const gamesMap = new Map<string, Game[]>();

    // Group game parties by game id
    gameParties
      .filter((game) => !alreadyProcessedGameIds.includes(game.gameId))
      .forEach((gameParty) => {
        const entry = gamesMap.get(gameParty.gameId);

        if (entry) {
          entry.push(gameParty);
        } else {
          gamesMap.set(gameParty.gameId, [gameParty]);
        }
      });

    return gamesMap;
  }

  public async resolveGameProcessing(gameId: string): Promise<void> {
    await this.gameRepo.update({ gameId }, { resultsProcessed: true });
  }

  public async startGame(startGameDto: StartGameDto): Promise<void> {
    const { accountId, signature, signedMessage } = startGameDto;
    await this.verifySignature(signature, signedMessage, accountId);

    const { gameId } = startGameDto;
    await this.verifyUniquePlayer(gameId, accountId);

    await this.gamerService.subtractChips(accountId, 1);
    await this.gamerService.incrementPartyCount(accountId);
    await this.gameRepo.insert({
      gameId,
      accountId,
      resultsProcessed: false,
      finishedAt: null,
    });
  }

  public async endGame(endGameDto: EndGameDto): Promise<void> {
    const { accountId, signature, signedMessage } = endGameDto;
    await this.verifySignature(signature, signedMessage, accountId);

    const { gameId, playerResults } = endGameDto;
    this.validateEndGameRequest(playerResults.map((res) => res.accountId));

    await this.gameOverLogService.insertIndividualLogs(
      gameId,
      accountId,
      playerResults,
    );

    await this.gameRepo.update(
      { gameId, accountId },
      { finishedAt: new Date() },
    );
  }

  public async getStatistics(): Promise<StatisticsDto> {
    const todayStart = new Date(new Date().setHours(0, 0, 0, 0));
    const fiveMinutesAgo = new Date(
      Date.now() - GAME_DURATION - GAME_PROCESSING_TIMEOUT,
    );

    const stats = await Promise.all([
      this.gameRepo
        .createQueryBuilder('game')
        .select('COUNT(DISTINCT game.hash)', 'count')
        .where('game.resultsProcessed = :processed', { processed: false })
        .andWhere('game.createdAt > :fiveMinutesAgo', { fiveMinutesAgo })
        .getRawOne(),
      this.gameRepo
        .createQueryBuilder('game')
        .select('COUNT(DISTINCT game.hash)', 'count')
        .where('game.createdAt > :todayStart', { todayStart })
        .getRawOne(),
      this.gameRepo
        .createQueryBuilder('game')
        .select('COUNT(DISTINCT game.hash)', 'count')
        .getRawOne(),
      this.gameRepo
        .createQueryBuilder('game')
        .select('COUNT(DISTINCT game.accountId)', 'count')
        .where('game.resultsProcessed = :processed', { processed: false })
        .andWhere('game.createdAt > :fiveMinutesAgo', { fiveMinutesAgo })
        .getRawOne(),
      this.gameRepo
        .createQueryBuilder('game')
        .select('COUNT(DISTINCT game.accountId)', 'count')
        .where('game.createdAt > :todayStart', { todayStart })
        .getRawOne(),
      this.gamerService.getGamersTotalCount(),
    ]);

    return {
      games: {
        countInProgress: Number(stats[0].count),
        countToday: Number(stats[1].count),
        countTotal: Number(stats[2].count),
      },
      players: {
        countInProgress: Number(stats[3].count),
        countToday: Number(stats[4].count),
        countTotal: stats[5],
      },
    };
  }

  private async verifySignature(
    signature: string,
    signedMessage: string,
    accountId: string,
  ): Promise<void> {
    let isValid = false;

    try {
      isValid = await isValidSignature(signature, signedMessage, accountId);
    } catch (e) {
      this.logger.warn(
        'Exception happened while verifying Arena start/end game request',
        e,
      );
    }

    if (!isValid) {
      throw new BadRequestException('Signature is invalid.');
    }
  }

  private async verifyUniquePlayer(
    gameId: string,
    accountId: string,
  ): Promise<void> {
    const playersInGame = await this.findAccountIdsForGame(gameId);

    if (playersInGame.includes(accountId)) {
      throw new BadRequestException('Player is already in the game.');
    }
  }

  private validateEndGameRequest(playerAccountIds: string[]): void {
    if (hasDuplicates(playerAccountIds)) {
      throw new BadRequestException('Account ids must be unique.');
    }
  }

  private async findAccountIdsForGame(gameId: string): Promise<string[]> {
    const gameRows = await this.gameRepo.findBy({ gameId });

    return gameRows.map((game) => game.accountId);
  }
}
