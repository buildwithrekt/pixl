import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js"
import {
  getAssociatedTokenAddress,
  createTransferInstruction,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token"

// Constants
export const MEMO_PROGRAM_ID = new PublicKey(
  "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"
)

// Get connection
export function getConnection(): Connection {
  const rpcUrl =
    process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com"
  return new Connection(rpcUrl, "confirmed")
}

// Get $PIXEL token mint
export function getPixelTokenMint(): PublicKey {
  const mint = process.env.NEXT_PUBLIC_PIXEL_TOKEN_MINT
  if (!mint) throw new Error("PIXEL_TOKEN_MINT not configured")
  return new PublicKey(mint)
}

// Get treasury wallet
export function getTreasuryWallet(): PublicKey {
  const treasury = process.env.TREASURY_WALLET
  if (!treasury) throw new Error("TREASURY_WALLET not configured")
  return new PublicKey(treasury)
}

// Create SPL transfer transaction with memo
export async function createPaymentTransaction(
  payerPubkey: PublicKey,
  amount: bigint,
  reservationId: string
): Promise<Transaction> {
  const connection = getConnection()
  const pixelMint = getPixelTokenMint()
  const treasury = getTreasuryWallet()

  // Get ATAs
  const payerAta = await getAssociatedTokenAddress(pixelMint, payerPubkey)
  const treasuryAta = await getAssociatedTokenAddress(pixelMint, treasury)

  // Create transaction
  const transaction = new Transaction()

  // Add transfer instruction
  const transferIx = createTransferInstruction(
    payerAta,
    treasuryAta,
    payerPubkey,
    amount,
    [],
    TOKEN_PROGRAM_ID
  )
  transaction.add(transferIx)

  // Add memo instruction with reservationId
  const memoIx = new TransactionInstruction({
    programId: MEMO_PROGRAM_ID,
    keys: [],
    data: Buffer.from(reservationId, "utf-8"),
  })
  transaction.add(memoIx)

  // Get latest blockhash
  const { blockhash } = await connection.getLatestBlockhash()
  transaction.recentBlockhash = blockhash
  transaction.feePayer = payerPubkey

  return transaction
}

// Verify a transaction signature
export async function verifyTransaction(
  signature: string
): Promise<{
  confirmed: boolean
  memo: string | null
  amount: bigint | null
  sender: string | null
}> {
  const connection = getConnection()

  try {
    const tx = await connection.getParsedTransaction(signature, {
      maxSupportedTransactionVersion: 0,
    })

    if (!tx || !tx.meta || tx.meta.err) {
      return { confirmed: false, memo: null, amount: null, sender: null }
    }

    // Extract memo
    let memo: string | null = null
    const memoInstruction = tx.transaction.message.instructions.find(
      (ix) =>
        "programId" in ix &&
        ix.programId.toString() === MEMO_PROGRAM_ID.toString()
    )
    if (memoInstruction && "data" in memoInstruction) {
      memo = memoInstruction.data as string
    }

    // Extract transfer amount and sender (simplified - would need more parsing for SPL)
    // This is a simplified version - in production, parse the actual transfer instruction
    const amount = BigInt(0) // TODO: Parse from transfer instruction
    const sender = tx.transaction.message.accountKeys[0]?.pubkey.toString() || null

    return {
      confirmed: true,
      memo,
      amount,
      sender,
    }
  } catch (error) {
    console.error("Error verifying transaction:", error)
    return { confirmed: false, memo: null, amount: null, sender: null }
  }
}
