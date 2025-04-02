import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GamerService } from './gamer.service';
import { GamerToDtoMapper } from './mapper/gamer-to-dto.mapper';
import { GamerDto } from './dto/gamer-dto';
import { UpdateGamerDto } from './dto/update-gamer-dto';
import { AccountIdPipe } from 'src/utils/pipes/account-id.pipe';
import { GamerRankingDto } from './dto/gamer-ranking-dto';
import { UseReferralCodeDto } from './dto/use-referral-code-dto';

@Controller('gamers')
@ApiTags('Gamers')
@ApiBearerAuth()
export class GamerController {
  constructor(
    private readonly gamerService: GamerService,
    private readonly mapper: GamerToDtoMapper,
  ) {}

  @Get('ranking')
  public getRanking(): Promise<GamerRankingDto[]> {
    return this.gamerService.getRanking();
  }

  @Get(':accountId')
  public async fetchOrCreate(
    @Param('accountId', AccountIdPipe) accountId: string,
  ): Promise<GamerDto> {
    const gamer = await this.gamerService.fetchOrCreate(accountId);

    return this.mapper.toDto(gamer);
  }

  @Put(':accountId')
  public async update(
    @Param('accountId', AccountIdPipe) accountId: string,
    @Body() updateGamerDto: UpdateGamerDto,
  ): Promise<GamerDto> {
    const { username } = updateGamerDto;
    const gamer = await this.gamerService.updateUsername(accountId, username);

    return this.mapper.toDto(gamer);
  }

  @Post('use-referral-code/:accountId')
  public useReferralCode(
    @Param('accountId', AccountIdPipe) accountId: string,
    @Body() useRefCodeDto: UseReferralCodeDto,
  ): Promise<boolean> {
    return this.gamerService.useReferralCode(
      accountId,
      useRefCodeDto.referralCode,
      useRefCodeDto.signature,
      useRefCodeDto.network,
    );
  }
}
