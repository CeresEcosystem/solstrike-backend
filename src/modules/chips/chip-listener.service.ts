import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { AnchorProvider, Program, Wallet } from '@coral-xyz/anchor';
import { Connection, Keypair, clusterApiUrl } from '@solana/web3.js';
import { GamerService } from '../gamer/gamer.service';

import { SolStrike } from '../../utils/idl/sol_strike';

import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ChipListenerService implements OnModuleInit {
  private connection: Connection;
  private readonly logger = new Logger(ChipListenerService.name);

  constructor(private readonly gamerService: GamerService) {}

  async onModuleInit() {
    this.connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

    const payer = Keypair.generate();

    const dummyWallet: Wallet = {
      payer,
      publicKey: payer.publicKey,
      signTransaction: async (tx) => tx,
      signAllTransactions: async (txs) => txs,
    };

    const idlPath = path.resolve(__dirname, '../../utils/idl/idl.json');

    const idlData = fs.readFileSync(idlPath, 'utf8');
    const idl = JSON.parse(idlData);

    const provider = new AnchorProvider(this.connection, dummyWallet);

    const program = new Program<SolStrike>(idl as SolStrike, provider);

    program.addEventListener('reserveChipsEvent', async (event, _slot) => {
      const walletAccount = event.user.toBase58();
      const chipAmount = event.amount.toNumber() / Math.pow(10, 9);

      await this.gamerService.addReservedChips(walletAccount, chipAmount);

      this.logger.log(
        `ReserveChipsEvent: ${event.user.toBase58()} reserved ${chipAmount}`,
      );
    });
  }
}
