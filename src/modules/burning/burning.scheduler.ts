import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BurningService } from './burning.service';
import { FPNumber } from '@sora-substrate/math';
import { Keyring } from '@polkadot/keyring';
import { DEO_XOR_ADDRESS } from '../gamer/gamer.constants';
import { SoraClient } from '@ceresecosystem/ceres-lib/packages/ceres-backend-common';

@Injectable()
export class BurningScheduler {
  private readonly logger = new Logger(BurningScheduler.name);
  private readonly gameSORAWallet;

  constructor(
    private readonly burningService: BurningService,
    private readonly soraClient: SoraClient,
  ) {
    // Load DEO Arena wallet on SORA
    const keyring = new Keyring();
    this.gameSORAWallet = keyring.addFromMnemonic(
      process.env.GAME_SORA_WALLET,
      {},
      'sr25519',
    );
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async burnDEO(): Promise<void> {
    this.logger.log('Start burning DEO.');

    const deoToBurn = await this.burningService.getTotalBurned();

    if (deoToBurn === 0) {
      this.logger.log('Nothing to burn, aborting.');

      return;
    }

    const soraApi = await this.soraClient.getSoraApi();
    const extrinsic = soraApi.tx?.assets?.burn(
      DEO_XOR_ADDRESS,
      FPNumber.fromNatural(deoToBurn).toString(),
    );

    const succeeded = await (new Promise<boolean>(async (resolve) => {
      const unSub = await extrinsic
        ?.signAndSend(this.gameSORAWallet, (result) => {
          if (result?.status?.isFinalized) {
            if (unSub) {
              unSub();
            }

            const failedEvents = result.events.filter(({ event }) =>
              soraApi.events?.system?.ExtrinsicFailed?.is(event),
            );
            resolve(failedEvents.length === 0);
          }
        })
        .catch(() => {
          resolve(false);
        });
    }));

    if (succeeded) {
      await this.burningService.burnChips(deoToBurn);
      let deoBurned = await this.burningService.getDeoBurned();
      deoBurned += deoToBurn;
      await this.burningService.updateDeoBurned(deoBurned);
      this.logger.log('DEO burning was successful!');
    } else {
      this.logger.error('DEO burning failed!');
    }
  }
}
