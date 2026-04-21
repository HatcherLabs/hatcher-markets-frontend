// Client-side Solana payment helper — builds + signs + submits a
// transfer transaction to the treasury wallet, then returns the tx
// signature that the backend verifies on-chain.
//
// Supports three rails:
//   - SOL:   native System Program transfer
//   - USDC:  SPL transfer under the classic Token Program
//   - HATCH: SPL transfer under Token-2022
//
// All three return a base58 signature the caller passes to
// createRental({ paymentTx }).

import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import {
  createTransferCheckedInstruction,
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountInstruction,
  TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
} from '@solana/spl-token';

export type CryptoRail = 'SOL' | 'USDC' | 'HATCH';

const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
const USDC_DECIMALS = 6;
const HATCH_DECIMALS = 6;

interface PayOptions {
  connection: Connection;
  wallet: {
    publicKey: PublicKey;
    signTransaction: (tx: Transaction) => Promise<Transaction>;
  };
  treasury: PublicKey;
  /** Amount in token units (SOL, USDC, or HATCH — not lamports/base units). */
  amount: number;
}

async function sendAndConfirm(
  connection: Connection,
  signedTx: Transaction,
): Promise<string> {
  const sig = await connection.sendRawTransaction(signedTx.serialize(), {
    skipPreflight: false,
    preflightCommitment: 'confirmed',
  });
  await connection.confirmTransaction(sig, 'confirmed');
  return sig;
}

async function paySol(opts: PayOptions): Promise<string> {
  const { connection, wallet, treasury, amount } = opts;
  const lamports = Math.round(amount * LAMPORTS_PER_SOL);

  const tx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: wallet.publicKey,
      toPubkey: treasury,
      lamports,
    }),
  );

  const { blockhash } = await connection.getLatestBlockhash('confirmed');
  tx.recentBlockhash = blockhash;
  tx.feePayer = wallet.publicKey;

  const signed = await wallet.signTransaction(tx);
  return sendAndConfirm(connection, signed);
}

async function paySpl(
  opts: PayOptions & { mint: string; decimals: number; programId: PublicKey },
): Promise<string> {
  const { connection, wallet, treasury, amount, mint, decimals, programId } = opts;

  const mintKey = new PublicKey(mint);
  const fromAta = getAssociatedTokenAddressSync(mintKey, wallet.publicKey, false, programId);
  const toAta = getAssociatedTokenAddressSync(mintKey, treasury, false, programId);
  const rawAmount = BigInt(Math.round(amount * 10 ** decimals));

  const tx = new Transaction();

  // If the treasury ATA for this mint doesn't exist yet, the sender
  // pays the rent to create it. This only happens once per mint +
  // treasury pair, so the cost amortizes to ~free.
  const toAtaInfo = await connection.getAccountInfo(toAta);
  if (!toAtaInfo) {
    tx.add(
      createAssociatedTokenAccountInstruction(
        wallet.publicKey,
        toAta,
        treasury,
        mintKey,
        programId,
      ),
    );
  }

  tx.add(
    createTransferCheckedInstruction(
      fromAta,
      mintKey,
      toAta,
      wallet.publicKey,
      rawAmount,
      decimals,
      [],
      programId,
    ),
  );

  const { blockhash } = await connection.getLatestBlockhash('confirmed');
  tx.recentBlockhash = blockhash;
  tx.feePayer = wallet.publicKey;

  const signed = await wallet.signTransaction(tx);
  return sendAndConfirm(connection, signed);
}

export async function payRail(
  rail: CryptoRail,
  opts: PayOptions,
): Promise<string> {
  switch (rail) {
    case 'SOL':
      return paySol(opts);
    case 'USDC':
      return paySpl({ ...opts, mint: USDC_MINT, decimals: USDC_DECIMALS, programId: TOKEN_PROGRAM_ID });
    case 'HATCH': {
      const hatchMint =
        process.env.NEXT_PUBLIC_HATCHER_MINT ||
        'Cntmo5DJNQkB2vYyS4mUx2UoTW4mPrHgWefz8miZpump';
      return paySpl({
        ...opts,
        mint: hatchMint,
        decimals: HATCH_DECIMALS,
        programId: TOKEN_2022_PROGRAM_ID,
      });
    }
  }
}
