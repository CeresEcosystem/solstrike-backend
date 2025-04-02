import { Injectable } from '@nestjs/common';
import { KeyValueDataService } from '../key-value-data/key-value-data.service';

const CHIP_AMOUNT_LABEL = 'AMOUNT_GAME_CHIP';

@Injectable()
export class ChipService {
  constructor(private readonly keyValueDataService: KeyValueDataService) {}

  public getChipAmount(): Promise<number> {
    return this.keyValueDataService.getValue(CHIP_AMOUNT_LABEL);
  }

  public setChipAmount(amount: number): Promise<void> {
    return this.keyValueDataService.setValue(CHIP_AMOUNT_LABEL, amount);
  }
}
