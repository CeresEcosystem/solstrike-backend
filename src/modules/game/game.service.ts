import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { In, IsNull, LessThan, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { GamerService } from '../gamer/gamer.service';
import { Game } from './entity/game.entity';
import { GameOverLogService } from '../game-over-log/game-over-log.service';
import {
  GAME_DURATION_KEY,
  GAME_FINISHED_SECONDS_BUFFER,
} from './game.constants';
import { KeyValueDataService } from '../key-value-data/key-value-data.service';
import {
  hasDuplicates,
  subtractMinutes,
} from '@ceresecosystem/ceres-lib/packages/ceres-backend-common';
import { StartGameDto } from './dto/start-game.dto';
import isValidSignature from 'src/utils/signature.utils';
import { EndGameDto } from './dto/end-game.dto';

@Injectable()
export class GameService {
  private readonly logger = new Logger(GameService.name);

  constructor(
    @InjectRepository(Game, 'pg')
    private readonly gameRepo: Repository<Game>,
    private readonly gamerService: GamerService,
    private readonly gameOverLogService: GameOverLogService,
    private readonly keyValueDataService: KeyValueDataService,
  ) {}

  public getGameDuration(): Promise<number> {
    return this.keyValueDataService.getValue(GAME_DURATION_KEY);
  }

  public setGameDuration(duration: number): Promise<void> {
    return this.keyValueDataService.setValue(GAME_DURATION_KEY, duration);
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
    const startTime = this.subSeconds(
      subtractMinutes(new Date(), await this.getGameDuration()),
      GAME_FINISHED_SECONDS_BUFFER,
    );

    const gameParties = await this.gameRepo.findBy({
      createdAt: LessThan(startTime),
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
    const { accountId, signature, signedMessage, network } = startGameDto;
    this.verifySignature(network, signature, signedMessage, accountId);

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
    const { accountId, signature, signedMessage, network } = endGameDto;
    this.verifySignature(network, signature, signedMessage, accountId);

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

  private verifySignature(
    network: string,
    signature: string,
    signedMessage: string,
    accountId: string,
  ): void {
    let isValid = false;

    try {
      isValid = isValidSignature(network, signature, signedMessage, accountId);
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

  private subSeconds(date: Date, seconds: number): Date {
    date.setSeconds(date.getSeconds() - seconds);

    return date;
  }
}
