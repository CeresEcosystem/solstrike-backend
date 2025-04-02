import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GamerService } from './gamer.service';
import { GamerToDtoMapper } from './mapper/gamer-to-dto.mapper';
import { GamerDto } from './dto/gamer-dto';
import { UpdateGamerDto } from './dto/update-gamer-dto';
import { AccountIdPipe } from 'src/utils/pipes/account-id.pipe';
import { GamerRankingDto } from './dto/gamer-ranking-dto';
import { UseReferralCodeDto } from './dto/use-referral-code-dto';
import { ClaimBackDeoDto } from './dto/claim-back-deo-dto';
import { ChipService } from '../chips/chip.service';

@Controller('gamers')
@ApiTags('Gamers')
@ApiBearerAuth()
export class GamerController {
  constructor(
    private readonly gamerService: GamerService,
    private readonly chipService: ChipService,
    private readonly mapper: GamerToDtoMapper,
  ) {}

  @Get('ranking')
  public getRanking(): Promise<GamerRankingDto[]> {
    return this.gamerService.getRanking();
  }

  @Get(':accountId')
  public async fetchOrCreate(
    @Param('accountId', AccountIdPipe) accountId: string,
  ): Promise<{ player: GamerDto; chipPrice: number }> {
    const gamer = await this.gamerService.fetchOrCreate(accountId);
    const chipPrice = await this.chipService.getChipAmount();

    return {
      player: this.mapper.toDto(gamer),
      chipPrice,
    };
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

  @Post('claim-back-deo/:accountId')
  public claimBackDEO(
    @Param('accountId', AccountIdPipe) accountId: string,
    @Body() claimBackDeoDto: ClaimBackDeoDto,
  ): Promise<boolean> {
    return this.gamerService.claimBackDEO(
      accountId,
      claimBackDeoDto.deo,
      claimBackDeoDto.signature,
      claimBackDeoDto.network,
    );
  }
}
