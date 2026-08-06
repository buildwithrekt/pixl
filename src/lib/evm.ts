import { createPublicClient, http, parseAbi, encodeFunctionData } from "viem"
import { robinhoodChain, robinhoodChainTestnet } from "./wagmi"

// ERC20 ABI for transfer
const ERC20_ABI = parseAbi([
  "function transfer(address to, uint256 amount) returns (bool)",
  "function balanceOf(address account) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
])

// Get chain based on environment
export function getChain() {
  return process.env.NEXT_PUBLIC_CHAIN_ENV === "mainnet"
    ? robinhoodChain
    : robinhoodChainTestnet
}

// Get public client
export function getPublicClient() {
  const chain = getChain()
  return createPublicClient({
    chain,
    transport: http(),
  })
}

// Get $PIXEL token address
export function getPixelTokenAddress(): `0x${string}` {
  const address = process.env.NEXT_PUBLIC_PIXEL_TOKEN_ADDRESS
  if (!address) throw new Error("PIXEL_TOKEN_ADDRESS not configured")
  return address as `0x${string}`
}

// Get treasury wallet address (server-side)
export function getTreasuryAddress(): `0x${string}` {
  const address = process.env.TREASURY_WALLET || process.env.NEXT_PUBLIC_TREASURY_WALLET
  if (!address) throw new Error("TREASURY_WALLET not configured")
  return address as `0x${string}`
}

// Get treasury wallet address (client-side)
export function getPublicTreasuryAddress(): `0x${string}` {
  const address = process.env.NEXT_PUBLIC_TREASURY_WALLET
  if (!address) throw new Error("NEXT_PUBLIC_TREASURY_WALLET not configured")
  return address as `0x${string}`
}

// Encode transfer data with memo in data field
export function encodeTransferWithMemo(
  to: `0x${string}`,
  amount: bigint,
  memo: string
): `0x${string}` {
  // Standard ERC20 transfer
  const transferData = encodeFunctionData({
    abi: ERC20_ABI,
    functionName: "transfer",
    args: [to, amount],
  })

  // Append memo as hex (will be in transaction input data)
  const memoHex = Buffer.from(memo).toString("hex")

  return `${transferData}${memoHex}` as `0x${string}`
}

// Get token balance
export async function getTokenBalance(
  walletAddress: `0x${string}`
): Promise<bigint> {
  const client = getPublicClient()
  const tokenAddress = getPixelTokenAddress()

  const balance = await client.readContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: [walletAddress],
  })

  return balance
}

// Verify a transaction
export async function verifyTransaction(txHash: `0x${string}`): Promise<{
  confirmed: boolean
  from: string | null
  to: string | null
  amount: bigint | null
  memo: string | null
}> {
  const client = getPublicClient()

  try {
    const receipt = await client.getTransactionReceipt({ hash: txHash })

    if (!receipt || receipt.status !== "success") {
      return { confirmed: false, from: null, to: null, amount: null, memo: null }
    }

    const tx = await client.getTransaction({ hash: txHash })

    // Extract memo from input data (after the function selector + args)
    let memo: string | null = null
    if (tx.input && tx.input.length > 138) {
      // 0x + 4 bytes selector + 64 bytes address + 64 bytes amount = 138 chars
      const memoHex = tx.input.slice(138)
      try {
        memo = Buffer.from(memoHex, "hex").toString("utf-8")
      } catch {
        memo = null
      }
    }

    // Parse transfer event from logs
    const transferLog = receipt.logs.find(
      (log) =>
        log.topics[0] ===
        "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef" // Transfer event signature
    )

    let amount: bigint | null = null
    let to: string | null = null

    if (transferLog) {
      // Decode transfer event
      to = `0x${transferLog.topics[2]?.slice(26)}` || null
      amount = transferLog.data ? BigInt(transferLog.data) : null
    }

    return {
      confirmed: true,
      from: tx.from,
      to,
      amount,
      memo,
    }
  } catch (error) {
    console.error("Error verifying transaction:", error)
    return { confirmed: false, from: null, to: null, amount: null, memo: null }
  }
}
