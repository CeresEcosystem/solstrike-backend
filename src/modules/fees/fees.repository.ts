import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Fee } from './entity/fee.entity';

@Injectable()
export class FeesRepository {
  constructor(
    @InjectRepository(Fee)
    private readonly repository: Repository<Fee>,
  ) {}

  public findAll(): Promise<Fee[]> {
    return this.repository.find();
  }

  public upsertAll(fees: Fee[]): Promise<void[]> {
    return Promise.all(
      fees.map(async (fee) => {
        await this.upsert(fee);
      }),
    );
  }

  private async upsert(fee: Fee): Promise<void> {
    fee.updatedAt = new Date();

    const existingFee = await this.repository.findOneBy({
      type: fee.type,
    });

    if (!existingFee) {
      await this.repository.insert(fee);

      return;
    }

    await this.repository.update(
      {
        type: fee.type,
      },
      fee,
    );
  }
}
