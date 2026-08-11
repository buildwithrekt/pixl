import { Inngest } from "inngest"

// Create Inngest client
export const inngest = new Inngest({
  id: "blok",
})

// Event types for type safety
export type InngestEvents = {
  "zone/reserved": {
    data: {
      zoneId: string
      wallet: string
      expiresAt: string
    }
  }
  "zone/paid": {
    data: {
      zoneId: string
      wallet: string
      txSignature: string
      amount: string
    }
  }
  "zone/drawn": {
    data: {
      zoneId: string
      imageUrl: string
    }
  }
  "composite/regenerate": {
    data: Record<string, never>
  }
}
