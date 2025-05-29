/*

    THIS SERVICE IS FOR TESTING PURPOSES ONLY!

*/

import {
  Injectable,
  OnModuleInit,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { Program, AnchorProvider, setProvider } from '@coral-xyz/anchor';
import * as anchor from '@coral-xyz/anchor';
import {
  clusterApiUrl,
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  Keypair,
  Transaction,
} from '@solana/web3.js';
import {
  getAssociatedTokenAddress,
  TOKEN_2022_PROGRAM_ID,
} from '@solana/spl-token';
import { bs58 } from '@coral-xyz/anchor/dist/cjs/utils/bytes';
import { SolStrike } from 'src/utils/idl/sol_strike';
import isValidSignature from 'src/utils/signature.utils';

import * as fs from 'fs';
import * as path from 'path';
import { ReserveChipDto } from './dto/reserve-chips.dto';

@Injectable()
export class ReserveChipService implements OnModuleInit {
  private readonly logger = new Logger(ReserveChipService.name);
  private connection: Connection;
  private program: Program<SolStrike>;
  private signers: Keypair[];

  async onModuleInit() {
    this.connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

    this.signers = [
      Keypair.fromSecretKey(bs58.decode(process.env.TEST_WALLET1)),
      Keypair.fromSecretKey(bs58.decode(process.env.TEST_WALLET2)),
      Keypair.fromSecretKey(bs58.decode(process.env.TEST_WALLET3)),
      Keypair.fromSecretKey(bs58.decode(process.env.TEST_WALLET4)),
    ];

    const wallet = new anchor.Wallet(this.signers[0]);

    const provider = new AnchorProvider(this.connection, wallet, {
      preflightCommitment: 'processed',
    });

    setProvider(provider);

    const idlPath = path.resolve(__dirname, '../../utils/idl/idl.json');
    const idlData = fs.readFileSync(idlPath, 'utf8');
    const idl = JSON.parse(idlData);

    this.program = new Program<SolStrike>(idl as SolStrike, provider);
  }

  async reserveChips({
    accountId,
    signedMessage,
    signatureHash,
  }: ReserveChipDto): Promise<string> {
    await this.verifySignature(accountId, signedMessage, signatureHash);

    const userPubKey = new PublicKey(accountId);

    const matchingSigner = this.signers.find(
      (signer) => signer.publicKey.toString() === accountId,
    );

    if (!matchingSigner) {
      throw new BadRequestException(
        'Account ID does not match any available test wallets',
      );
    }

    const [chipMintPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from('CHIP_MINT')],
      this.program.programId,
    );

    const userChipTokenAccountAddress = await getAssociatedTokenAddress(
      chipMintPDA,
      userPubKey,
      false,
      TOKEN_2022_PROGRAM_ID,
    );

    const buyInstruction = await this.program.methods
      .buyChipWithSol(new anchor.BN(LAMPORTS_PER_SOL))
      .accountsPartial({
        buyer: userPubKey,
        chipMint: chipMintPDA,
        buyerChipAccount: userChipTokenAccountAddress,
        tokenProgram: TOKEN_2022_PROGRAM_ID,
      })
      .instruction();

    const buyTx = new Transaction().add(buyInstruction);
    buyTx.feePayer = userPubKey;
    buyTx.recentBlockhash = (
      await this.connection.getLatestBlockhash()
    ).blockhash;
    buyTx.sign(matchingSigner);

    const buyTxid = await this.connection.sendRawTransaction(buyTx.serialize());

    this.logger.log(`Bought chips in transaction: ${buyTxid}`);

    const reserveInstruction = await this.program.methods
      .reserveChips(new anchor.BN(LAMPORTS_PER_SOL))
      .accountsPartial({
        signer: userPubKey,
        chipMint: chipMintPDA,
        userChipAccount: userChipTokenAccountAddress,
        tokenProgram: TOKEN_2022_PROGRAM_ID,
      })
      .instruction();

    const reserveTx = new Transaction().add(reserveInstruction);
    reserveTx.feePayer = userPubKey;
    reserveTx.recentBlockhash = (
      await this.connection.getLatestBlockhash()
    ).blockhash;
    reserveTx.sign(matchingSigner);

    const reserveTxid = await this.connection.sendRawTransaction(
      reserveTx.serialize(),
    );

    this.logger.log(`Reserved chips in transaction: ${reserveTxid}`);

    return reserveTxid;
  }

  private async verifySignature(
    accountId: string,
    signedMessage: string,
    signatureHash: string,
  ): Promise<void> {
    let isValid = false;

    try {
      isValid = await isValidSignature(signatureHash, signedMessage, accountId);
    } catch (e) {
      this.logger.warn(
        'Exception happened while verifying Arena start/end game request',
        e,
      );
    }

    if (!isValid) {
      throw new BadRequestException('Signature is invalid.');
    }
  }
}
