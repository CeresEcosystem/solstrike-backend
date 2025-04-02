import { Body, Controller, Get, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { StartGameDto } from './dto/start-game.dto';
import { GameService } from './game.service';
import { EndGameDto } from './dto/end-game.dto';
import {
  AuthGuard,
  Role,
  Roles,
  RolesGuard,
} from '@ceresecosystem/ceres-lib/packages/ceres-backend-common';
import { SetGameDurationDto } from './dto/set-game-duration.dto';

@Controller('games')
@ApiTags('Games')
@ApiBearerAuth()
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Get('duration')
  @ApiTags('Admin')
  public getGameDuration(): Promise<number> {
    return this.gameService.getGameDuration();
  }

  @Put('duration')
  @Roles(Role.Admin)
  @UseGuards(RolesGuard)
  @UseGuards(AuthGuard)
  @ApiTags('Admin')
  public setGameDuration(
    @Body() setGameDurationDto: SetGameDurationDto,
  ): Promise<void> {
    return this.gameService.setGameDuration(
      setGameDurationDto.durationInMinutes,
    );
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
