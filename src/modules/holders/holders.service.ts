import { Injectable } from '@nestjs/common';
import { DEO_ADDRESS, KEY } from './holders.constants';
import { SoraClient } from '@ceresecosystem/ceres-lib/packages/ceres-backend-common';

@Injectable()
export class HoldersService {
  constructor(private readonly soraClient: SoraClient) {}

  public async getHoldersCount(): Promise<number> {
    const soraApi = await this.soraClient.getSoraApi();
    const keys = (await soraApi.rpc.state.getKeys(KEY)).toHuman() as string[];

    return keys.filter((key) => key.includes(DEO_ADDRESS)).length;
  }
}
