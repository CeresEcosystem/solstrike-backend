import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { StartGameDto } from './dto/start-game.dto';
import { GameService } from './game.service';
import { EndGameDto } from './dto/end-game.dto';
import { StatisticsDto } from './dto/statistics.dto';

@Controller('games')
@ApiTags('Games')
@ApiBearerAuth()
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Get('statistics')
  public getStatistics(): Promise<StatisticsDto> {
    return this.gameService.getStatistics();
  }

  @Post('play')
  public startGame(@Body() startGameDto: StartGameDto): Promise<void> {
    return this.gameService.startGame(startGameDto);
  }

  @Post('over')
  public endGame(@Body() endGameDto: EndGameDto): Promise<void> {
    return this.gameService.endGame(endGameDto);
  }
}
