import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Globals } from './key-value-data.entity';

@Injectable()
export class KeyValueDataService {
  constructor(
    @InjectRepository(Globals, 'pg')
    private readonly globalsRepo: Repository<Globals>,
  ) {}

  public async getValue(key: string): Promise<number> {
    const { value } = await this.globalsRepo.findOneByOrFail({
      label: key,
    });

    return Number(value);
  }

  public async setValue(key: string, value: number): Promise<void> {
    const existingValue = await this.globalsRepo.findOneBy({
      label: key,
    });

    if (existingValue) {
      await this.globalsRepo.update({ label: key }, { value });

      return;
    }

    await this.globalsRepo.insert({
      label: key,
      value,
    });
  }
}
