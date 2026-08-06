import { http, createConfig } from "wagmi"
import { injected, coinbaseWallet, walletConnect } from "wagmi/connectors"
import { defineChain } from "viem"

// Define Robinhood Chain
export const robinhoodChain = defineChain({
  id: 4663,
  name: "Robinhood Chain",
  nativeCurrency: {
    name: "Ethereum",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.mainnet.chain.robinhood.com"],
    },
    alchemy: {
      http: ["https://robinhood-mainnet.g.alchemy.com/v2"],
    },
  },
  blockExplorers: {
    default: {
      name: "Robinhood Explorer",
      url: "https://robinhoodchain.blockscout.com",
    },
  },
})

// Robinhood Chain Testnet
export const robinhoodChainTestnet = defineChain({
  id: 46630,
  name: "Robinhood Chain Testnet",
  nativeCurrency: {
    name: "Ethereum",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.testnet.chain.robinhood.com"],
    },
    alchemy: {
      http: ["https://robinhood-testnet.g.alchemy.com/v2"],
    },
  },
  blockExplorers: {
    default: {
      name: "Robinhood Testnet Explorer",
      url: "https://explorer.testnet.chain.robinhood.com",
    },
  },
  testnet: true,
})

export const config = createConfig({
  chains: [robinhoodChain, robinhoodChainTestnet],
  connectors: [
    injected(), // MetaMask, Rabby, etc.
    coinbaseWallet({
      appName: "PIXELBOARD",
    }),
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "demo",
    }),
  ],
  transports: {
    [robinhoodChain.id]: http(),
    [robinhoodChainTestnet.id]: http(),
  },
})
