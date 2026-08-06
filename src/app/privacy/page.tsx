import type { Metadata } from "next"
import { Nav } from "@/components/nav"
import { Footer } from "@/components/footer"
import { Eyebrow } from "@/components/ui/eyebrow"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "PIXELBOARD privacy policy and data handling practices.",
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-paper">
      <Nav />

      <div className="max-w-3xl mx-auto px-6 py-16">
        <Eyebrow className="mb-4">LEGAL</Eyebrow>
        <h1 className="font-display text-display-lg text-ink mb-4">
          Privacy Policy
        </h1>
        <p className="text-ink/60 mb-12">Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>

        <div className="prose prose-ink max-w-none space-y-8">
          <section>
            <h2 className="font-display text-xl text-ink mb-4">1. Introduction</h2>
            <p className="text-ink/70 leading-relaxed">
              PIXELBOARD is committed to protecting your privacy. This policy explains how we collect,
              use, and protect information when you use our decentralized pixel canvas on{" "}
              <span className="font-pixel text-[#ccff00] bg-ink px-1.5 py-0.5 rounded">Robinhood Chain</span>.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-ink mb-4">2. Information We Collect</h2>

            <h3 className="font-display text-lg text-ink mb-3 mt-6">Wallet Information</h3>
            <p className="text-ink/70 leading-relaxed mb-4">
              When you connect your wallet, we collect your public wallet address. This is necessary
              to process transactions and link zones to owners. We never have access to your private
              keys or seed phrases.
            </p>

            <h3 className="font-display text-lg text-ink mb-3">Transaction Data</h3>
            <p className="text-ink/70 leading-relaxed mb-4">
              All transactions are recorded on{" "}
              <span className="font-pixel text-[#ccff00] bg-ink px-1.5 py-0.5 rounded">Robinhood Chain</span>{" "}
              and are publicly visible. This includes payment amounts, timestamps, and wallet addresses.
            </p>

            <h3 className="font-display text-lg text-ink mb-3">Uploaded Content</h3>
            <p className="text-ink/70 leading-relaxed mb-4">
              Images you upload to your zones are stored on our servers and displayed publicly on
              the canvas. Do not upload content containing personal information you wish to keep private.
            </p>

            <h3 className="font-display text-lg text-ink mb-3">Usage Data</h3>
            <p className="text-ink/70 leading-relaxed">
              We may collect anonymous usage statistics such as page views, feature usage, and error
              logs to improve the service. This data is not linked to your wallet address.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-ink mb-4">3. How We Use Information</h2>
            <ul className="list-disc list-inside text-ink/70 space-y-2">
              <li>Process zone purchases and link them to your wallet</li>
              <li>Display your uploaded images on the canvas</li>
              <li>Verify payment status and transaction authenticity</li>
              <li>Provide customer support for payment recovery</li>
              <li>Improve the platform and fix bugs</li>
              <li>Prevent fraud and abuse</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl text-ink mb-4">4. Information Sharing</h2>
            <p className="text-ink/70 leading-relaxed mb-4">
              We do not sell your personal information. Information may be shared in these cases:
            </p>
            <ul className="list-disc list-inside text-ink/70 space-y-2">
              <li><strong>Public blockchain:</strong> Transaction data is inherently public on{" "}
                <span className="font-pixel text-[#ccff00] bg-ink px-1.5 py-0.5 rounded">Robinhood Chain</span>
              </li>
              <li><strong>Canvas display:</strong> Your zones and images are publicly visible</li>
              <li><strong>Service providers:</strong> We use Vercel for hosting and image storage</li>
              <li><strong>Legal requirements:</strong> When required by law or to protect rights</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl text-ink mb-4">5. Data Storage</h2>
            <p className="text-ink/70 leading-relaxed">
              Zone data and images are stored on secure servers. Transaction records exist permanently
              on the blockchain. We retain zone data indefinitely as part of the permanent canvas.
              The canvas itself is stored off-chain in our database.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-ink mb-4">6. Your Rights</h2>
            <p className="text-ink/70 leading-relaxed mb-4">
              Due to the nature of blockchain and public canvas:
            </p>
            <ul className="list-disc list-inside text-ink/70 space-y-2">
              <li>Transaction history cannot be deleted from the blockchain</li>
              <li>Zones are permanent and cannot be removed once claimed</li>
              <li>You can disconnect your wallet at any time</li>
              <li>Contact us for questions about your data</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl text-ink mb-4">7. Cookies</h2>
            <p className="text-ink/70 leading-relaxed">
              We use minimal cookies for essential functionality such as wallet connection state.
              We do not use tracking cookies or third-party advertising cookies.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-ink mb-4">8. Security</h2>
            <p className="text-ink/70 leading-relaxed">
              We implement industry-standard security measures to protect your data. However, no
              system is completely secure. You are responsible for keeping your wallet credentials safe.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-ink mb-4">9. Children&apos;s Privacy</h2>
            <p className="text-ink/70 leading-relaxed">
              PIXELBOARD is not intended for users under 18. We do not knowingly collect information
              from minors. If you believe a minor has provided us information, please contact us.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-ink mb-4">10. Changes to Policy</h2>
            <p className="text-ink/70 leading-relaxed">
              We may update this privacy policy periodically. Changes will be posted on this page
              with an updated revision date.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-ink mb-4">11. Contact</h2>
            <p className="text-ink/70 leading-relaxed">
              For privacy-related questions, contact us on{" "}
              <a
                href="https://twitter.com/PIXELBOARD"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue hover:underline"
              >
                X (@PIXELBOARD)
              </a>.
            </p>
          </section>
        </div>
      </div>

      <Footer />
    </main>
  )
}
