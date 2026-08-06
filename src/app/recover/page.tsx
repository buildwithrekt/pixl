"use client"

import { useState } from "react"
import { Nav } from "@/components/nav"
import { Footer } from "@/components/footer"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Eyebrow } from "@/components/ui/eyebrow"
import { Chip } from "@/components/ui/chip"

interface RecoveryResult {
  success: boolean
  message: string
  data?: {
    txHash: string
    from: string
    amount: string
    memo: string | null
    status: "pending" | "matched" | "orphan" | "invalid"
    zoneId?: string
  }
}

export default function RecoverPage() {
  const [txHash, setTxHash] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<RecoveryResult | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!txHash.trim()) return

    setIsLoading(true)
    setResult(null)

    try {
      const res = await fetch("/api/recover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ txHash: txHash.trim() }),
      })

      const data = await res.json()
      setResult(data)
    } catch {
      setResult({
        success: false,
        message: "Failed to check transaction. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "matched":
        return "text-green-600"
      case "orphan":
        return "text-yellow"
      case "invalid":
        return "text-red"
      default:
        return "text-blue"
    }
  }

  return (
    <main className="min-h-screen bg-paper">
      <Nav />

      <div className="max-w-2xl mx-auto px-6 py-16">
        <Eyebrow className="mb-4">PAYMENT RECOVERY</Eyebrow>
        <h1 className="font-display text-display-lg text-ink mb-4">
          Lost your zone?
        </h1>
        <p className="text-ink/70 mb-8">
          If you made a payment but your zone wasn&apos;t created, enter your
          transaction hash below. We&apos;ll verify the payment and help you
          recover your pixels.
        </p>

        {/* Search form */}
        <Card shadow="blue" className="p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="txHash"
                className="block font-pixel text-[10px] text-ink/60 uppercase mb-2"
              >
                Transaction Hash
              </label>
              <input
                id="txHash"
                type="text"
                value={txHash}
                onChange={(e) => setTxHash(e.target.value)}
                placeholder="0x..."
                className="w-full px-4 py-3 border-2 border-ink rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue"
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Checking..." : "Check Payment"}
            </Button>
          </form>
        </Card>

        {/* Result */}
        {result && (
          <Card
            shadow={result.success ? "yellow" : "red"}
            className="p-6"
          >
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-sm flex items-center gap-3">
                {result.success ? "Payment Found" : "Error"}
                {result.data && (
                  <Chip
                    variant={result.data.status === "matched" ? "default" : "secondary"}
                    className={getStatusColor(result.data.status)}
                  >
                    {result.data.status.toUpperCase()}
                  </Chip>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-4">
              <p className="text-ink/70">{result.message}</p>

              {result.data && (
                <div className="bg-paper rounded-lg p-4 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-ink/60">From:</span>
                    <span className="font-mono truncate max-w-[200px]">
                      {result.data.from}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink/60">Amount:</span>
                    <span className="font-pixel">{result.data.amount} $PIXEL</span>
                  </div>
                  {result.data.memo && (
                    <div className="flex justify-between">
                      <span className="text-ink/60">Memo:</span>
                      <span className="font-mono truncate max-w-[200px]">
                        {result.data.memo}
                      </span>
                    </div>
                  )}
                  {result.data.zoneId && (
                    <div className="flex justify-between">
                      <span className="text-ink/60">Zone:</span>
                      <a
                        href={`/zone/${result.data.zoneId}`}
                        className="text-blue hover:underline"
                      >
                        View zone →
                      </a>
                    </div>
                  )}
                </div>
              )}

              {result.data?.status === "orphan" && (
                <div className="bg-yellow/20 rounded-lg p-4">
                  <p className="text-sm font-medium mb-2">
                    Your payment was received but not linked to a zone.
                  </p>
                  <p className="text-sm text-ink/70">
                    This usually happens when a reservation expired before the
                    transaction confirmed. Your case has been added to our
                    recovery queue. Contact{" "}
                    <a
                      href="https://twitter.com/PIXELBOARD"
                      className="text-blue hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      @PIXELBOARD
                    </a>{" "}
                    on X with this transaction hash for manual assistance.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Help text */}
        <div className="mt-12 text-center">
          <p className="text-sm text-ink/50 mb-4">
            Can&apos;t find your transaction?
          </p>
          <a
            href="https://robinhoodchain.blockscout.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue hover:underline text-sm"
          >
            Search on Robinhood Chain Explorer →
          </a>
        </div>
      </div>

      <Footer />
    </main>
  )
}
