import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { AnchorProvider, Program, Wallet, Idl } from '@coral-xyz/anchor';
import { Connection, Keypair, clusterApiUrl } from '@solana/web3.js';
import { GamerService } from '../gamer/gamer.service';

import { SolStrike } from '../../utils/idl/sol_strike';

import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ChipsService implements OnModuleInit {
  private connection: Connection;
  private readonly logger = new Logger(ChipsService.name);

  constructor(private readonly gamerService: GamerService) {}

  async onModuleInit() {
    this.connection = new Connection(clusterApiUrl('devnet'));

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

    program.addEventListener('reserveChipsEvent', (event, _slot) => {
      const walletAccount = event.user.toBase58();
      const chipAmount = event.amount.toNumber() / Math.pow(10, 9);

      this.gamerService.addReservedChips(walletAccount, chipAmount);

      this.logger.log(
        `ReserveChipsEvent: ${event.user.toBase58()} reserved ${chipAmount}`,
      );
    });
  }
}
