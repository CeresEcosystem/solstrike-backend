import { Injectable, Logger } from '@nestjs/common';
import { Connection, Keypair, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { SolStrike } from '../../utils/idl/sol_strike';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { AnchorProvider, Wallet, Program } from '@coral-xyz/anchor';
import { SYSTEM_PROGRAM_ID } from '@coral-xyz/anchor/dist/cjs/native/system';

@Injectable()
export class RewardsDistService {
  private connection: Connection;
  private program: Program<SolStrike>;
  private wallet: Wallet;
  private readonly logger = new Logger(RewardsDistService.name);

  constructor(private readonly configService: ConfigService) {
    this.connection = new Connection(clusterApiUrl('devnet'));
    this.initialize();
  }

  private initialize() {
    const providerBytesRaw = this.configService.get<string>('PROGRAM_PROVIDER');
    if (!providerBytesRaw) {
      throw new Error('PROGRAM_PROVIDER is not set in env');
    }

    const keypairBytes = Uint8Array.from(JSON.parse(providerBytesRaw));
    const keypair = Keypair.fromSecretKey(keypairBytes);

    this.wallet = {
      payer: keypair,
      publicKey: keypair.publicKey,
      signTransaction: async (tx) => tx,
      signAllTransactions: async (txs) => txs,
    };

    const provider = new AnchorProvider(this.connection, this.wallet);

    const idlPath = path.resolve(__dirname, '../../utils/idl/idl.json');
    const idlData = fs.readFileSync(idlPath, 'utf8');
    const idl = JSON.parse(idlData);

    this.program = new Program<SolStrike>(idl as SolStrike, provider);
    this.logger.log('Anchor Program initialized');
  }

  async distributeRewards(accIds: string[]) {
    const programDataInfo =
      await this.program.provider.connection.getAccountInfo(
        this.program.programId,
      );
    if (!programDataInfo?.data) throw new Error('Invalid program account data');

    const programDataAccount = new PublicKey(
      programDataInfo.data.subarray(programDataInfo.data.length - 32),
    );

    const [firstPlace] = PublicKey.findProgramAddressSync(
      [new PublicKey(accIds[0]).toBuffer()],
      this.program.programId,
    );

    const [secondPlace] = PublicKey.findProgramAddressSync(
      [new PublicKey(accIds[1]).toBuffer()],
      this.program.programId,
    );

    const [thirdPlace] = PublicKey.findProgramAddressSync(
      [new PublicKey(accIds[2]).toBuffer()],
      this.program.programId,
    );

    await this.program.methods
      .setClaimableRewards()
      .accountsStrict({
        signer: this.wallet.publicKey,
        program: this.program.provider.publicKey,
        programData: programDataAccount,
        firstPlaceClaimableRewardsAccount: firstPlace,
        firstPlaceAuthority: new PublicKey(accIds[0]),
        secondPlaceClaimableRewardsAccount: secondPlace,
        secondPlaceAuthority: new PublicKey(accIds[1]),
        thirdPlaceClaimableRewardsAccount: thirdPlace,
        thirdPlaceAuthority: new PublicKey(accIds[2]),
        systemProgram: SYSTEM_PROGRAM_ID,
      })
      .rpc();

    this.logger.log('✅ Rewards distributed!');
  }
}
