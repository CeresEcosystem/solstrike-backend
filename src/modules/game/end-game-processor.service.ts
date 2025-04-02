import { Injectable, Logger } from '@nestjs/common';
import { GameOverLogService } from '../game-over-log/game-over-log.service';
import { GameService } from './game.service';
import { Cron } from '@nestjs/schedule';
import { CronExpression } from '@ceresecosystem/ceres-lib/packages/ceres-backend-common';
import { Game } from './entity/game.entity';
import * as crypto from 'crypto';
import { EndGameResultDto } from './dto/end-game-player-result.dto';

@Injectable()
export class EndGameProcessorService {
  private readonly logger = new Logger(EndGameProcessorService.name);
  private isRunning = false;

  constructor(
    private readonly gameService: GameService,
    private readonly gameOverLogService: GameOverLogService,
  ) {}

  @Cron(CronExpression.EVERY_10_SECONDS)
  public async runProcessor(): Promise<void> {
    this.logger.debug('Running end game processor.');

    if (this.isRunning) {
      this.logger.log('End game processor is already running, skipping.');

      return;
    }

    this.isRunning = true;

    try {
      await this.processFinishedGames();
    } catch (e) {
      this.logger.error('Error happened during end game results processing', e);
    } finally {
      this.isRunning = false;
    }

    this.logger.debug('End game processor finished.');
  }

  private async processFinishedGames(): Promise<void> {
    const gamesToProcess = await this.gameService.getFinishedGames();

    gamesToProcess.forEach((gameParties, gameId) =>
      this.processGameResults(gameId, gameParties),
    );
  }

  // eslint-disable-next-line max-lines-per-function
  private async processGameResults(
    gameId: string,
    gameParties: Game[],
  ): Promise<void> {
    if (gameParties.length < 2) {
      this.logger.debug(
        `Only one player signed up for game ${gameId}, skipping...`,
      );

      return;
    }

    const individualGameResults = (
      await Promise.all(
        gameParties.map((gameParty) =>
          this.gameOverLogService.getIndividualEndGameResults(
            gameId,
            gameParty.accountId,
          ),
        ),
      )
    ).filter((results) => results.length > 0);

    if (individualGameResults.length === 0) {
      this.logger.warn(
        `There are no individual results for game ${gameId}, skipping...`,
      );

      return;
    }

    // Hash results for easier management
    const hashedResults = new Map<string, EndGameResultDto[]>();

    individualGameResults.forEach((results) => {
      const hash = crypto.createHash('md5');
      const entryHash = hash.update(JSON.stringify(results)).digest('base64');
      hashedResults.set(entryHash, results);
    });

    // Count repetitions of individual hash values
    const resultsCounter = new Map<string, number>();

    hashedResults.forEach((_, entryHash) => {
      const hashCount = resultsCounter.get(entryHash) || 0;
      resultsCounter.set(entryHash, hashCount + 1);
    });

    // Get the most common game result
    const maxScore = Math.max(...resultsCounter.values());
    const topHashedResults: string[] = [...resultsCounter.entries()]
      .filter(([, counter]) => counter === maxScore)
      .map(([entryHash]) => entryHash);

    // Cancel the game if there is no consensus (there are multiple results with the max score)
    if (topHashedResults.length > 1) {
      this.logger.error(
        `Result inconsistences found for game ${gameId}, game is canceled.`,
        JSON.stringify(individualGameResults),
      );
      await this.gameService.resolveGameProcessing(gameId);

      return;
    }

    const gameResultList = hashedResults.get(topHashedResults[0]);
    this.logger.debug(`Result for game ${gameId}:`, gameResultList);

    const winnerAccountIds = this.findWinners(gameResultList);
    this.logger.debug(`Winner(s) for game ${gameId} are ${winnerAccountIds}`);

    await this.gameOverLogService.createLogsForGame(
      gameId,
      winnerAccountIds,
      gameResultList,
    );

    await this.gameService.resolveGameProcessing(gameId);
  }

  private findWinners(gameResultList: EndGameResultDto[]): string[] {
    // Find winner by max kills
    const maxKills = Math.max(...gameResultList.map((player) => player.kills));

    const playersWithMaxKills = gameResultList.filter(
      (r) => r.kills === maxKills,
    );

    if (playersWithMaxKills.length === 1) {
      return [playersWithMaxKills[0].accountId];
    }

    // Find winner by min deaths
    const minDeaths = Math.min(
      ...playersWithMaxKills.map((player) => player.deaths),
    );

    const playersWithMinDeaths = playersWithMaxKills.filter(
      (r) => r.deaths === minDeaths,
    );

    if (playersWithMinDeaths.length === 1) {
      return [playersWithMinDeaths[0].accountId];
    }

    // Find winner(s) by max headshots
    const maxHeadshots = Math.max(
      ...playersWithMinDeaths.map((player) => player.headshots),
    );

    const playersWithMaxHeadshots = playersWithMinDeaths.filter(
      (r) => r.headshots === maxHeadshots,
    );

    return playersWithMaxHeadshots.map((player) => player.accountId);
  }
}
