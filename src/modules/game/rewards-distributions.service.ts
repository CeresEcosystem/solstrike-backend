import { Injectable, Logger } from '@nestjs/common';
import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  clusterApiUrl,
} from '@solana/web3.js';
import { SolStrike } from 'src/utils/idl/sol_strike';
import { ConfigService } from '@nestjs/config';
import * as anchor from '@coral-xyz/anchor';
import * as fs from 'fs';
import * as path from 'path';
import { AnchorProvider, Wallet, Program } from '@coral-xyz/anchor';
import { SYSTEM_PROGRAM_ID } from '@coral-xyz/anchor/dist/cjs/native/system';
import {
  TOKEN_2022_PROGRAM_ID,
  getAssociatedTokenAddress,
} from '@solana/spl-token';

@Injectable()
export class RewardsDistService {
  private connection: Connection;
  private program: Program<SolStrike>;
  private wallet: Wallet;
  private keypair: Keypair;
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
    this.keypair = Keypair.fromSecretKey(keypairBytes);

    this.wallet = new anchor.Wallet(this.keypair);

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

    const [firstPlaceAuthority, firstPlaceClaimableRewardsAccount] = accIds[0]
      ? [new PublicKey(accIds[0]), this.findProgramAddress(accIds[0])]
      : [null, null];
    const [secondPlaceAuthority, secondPlaceClaimableRewardsAccount] = accIds[1]
      ? [new PublicKey(accIds[1]), this.findProgramAddress(accIds[1])]
      : [null, null];
    const [thirdPlaceAuthority, thirdPlaceClaimableRewardsAccount] = accIds[2]
      ? [new PublicKey(accIds[2]), this.findProgramAddress(accIds[2])]
      : [null, null];

    const [chipMintPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from('CHIP_MINT')],
      this.program.programId,
    );

    const [treasuryPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from('TREASURY')],
      this.program.programId,
    );

    const treasuryChipTokenAccount = await getAssociatedTokenAddress(
      chipMintPDA,
      treasuryPDA,
      true,
      TOKEN_2022_PROGRAM_ID,
    );

    const distributeRewardsInstructions = await this.program.methods
      .setClaimableRewards()
      .accountsStrict({
        signer: this.wallet.publicKey,
        program: this.program.programId,
        programData: programDataAccount,
        chipMint: chipMintPDA,
        treasury: treasuryPDA,
        treasuryChipTokenAccount: treasuryChipTokenAccount,
        firstPlaceClaimableRewardsAccount,
        firstPlaceAuthority,
        secondPlaceClaimableRewardsAccount,
        secondPlaceAuthority,
        thirdPlaceClaimableRewardsAccount,
        thirdPlaceAuthority,
        tokenProgram: TOKEN_2022_PROGRAM_ID,
        systemProgram: SYSTEM_PROGRAM_ID,
      })
      .instruction();

    const distributeRewardsTransaction = new Transaction().add(
      distributeRewardsInstructions,
    );

    distributeRewardsTransaction.feePayer = this.wallet.publicKey;

    distributeRewardsTransaction.recentBlockhash = (
      await this.connection.getLatestBlockhash()
    ).blockhash;

    distributeRewardsTransaction.sign(this.keypair);

    await this.connection.sendRawTransaction(
      distributeRewardsTransaction.serialize(),
    );

    this.logger.log('✅ Rewards distributed!');
  }

  private findProgramAddress(accId: string): PublicKey {
    const [account] = PublicKey.findProgramAddressSync(
      [new PublicKey(accId).toBuffer()],
      this.program.programId,
    );

    return account;
  }
}
