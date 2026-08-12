import type { Metadata } from "next"
import { Nav } from "@/components/nav"
import { Footer } from "@/components/footer"
import { Eyebrow } from "@/components/ui/eyebrow"

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "BLOKR terms of service and conditions of use.",
}

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-black">
      <Nav />

      <div className="max-w-3xl mx-auto px-6 py-16">
        <Eyebrow className="mb-4">LEGAL</Eyebrow>
        <h1 className="font-display text-4xl font-bold text-white mb-4">
          Terms of Service
        </h1>
        <p className="text-gray-500 mb-12">Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>

        <div className="prose prose-invert max-w-none space-y-8">
          <section>
            <h2 className="font-display text-xl text-white mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-400 leading-relaxed">
              By accessing or using BLOKR, you agree to be bound by these Terms of Service.
              BLOKR is a decentralized pixel canvas application built on{" "}
              <span className="font-mono text-lime">Robinhood Chain</span>.
              If you do not agree to these terms, do not use the service.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-white mb-4">2. Description of Service</h2>
            <p className="text-gray-400 leading-relaxed mb-4">
              BLOKR is a collaborative pixel canvas where users can purchase rectangular zones
              using $BLOKR tokens. The service includes:
            </p>
            <ul className="list-disc list-inside text-gray-400 space-y-2">
              <li>A 1024×1024 pixel canvas divided into 8×8 pixel cells</li>
              <li>Zone reservation and payment system</li>
              <li>Image upload functionality for claimed zones</li>
              <li>Gallery and zone viewing features</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl text-white mb-4">3. Blockchain Transactions</h2>
            <p className="text-gray-400 leading-relaxed mb-4">
              All payments are processed on{" "}
              <span className="font-mono text-lime">Robinhood Chain</span>{" "}
              using $BLOKR tokens. You acknowledge that:
            </p>
            <ul className="list-disc list-inside text-gray-400 space-y-2">
              <li>Blockchain transactions are irreversible once confirmed</li>
              <li>You are responsible for ensuring correct wallet addresses and amounts</li>
              <li>Transaction fees (gas) are your responsibility</li>
              <li>All collected $BLOKR tokens are burned every 24 hours</li>
              <li>We cannot reverse or refund confirmed transactions</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl text-white mb-4">4. Zone Ownership</h2>
            <p className="text-gray-400 leading-relaxed">
              Upon successful payment, you receive the right to display content in your purchased zone.
              This is a license to use canvas space, not ownership of any underlying technology or
              intellectual property. Zones are permanent and immutable once claimed.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-white mb-4">5. Content Guidelines</h2>
            <p className="text-gray-400 leading-relaxed mb-4">
              You agree not to upload content that:
            </p>
            <ul className="list-disc list-inside text-gray-400 space-y-2">
              <li>Is illegal, harmful, or promotes violence</li>
              <li>Contains hate speech or discriminatory content</li>
              <li>Infringes on intellectual property rights</li>
              <li>Contains malware or malicious code</li>
              <li>Is pornographic or sexually explicit</li>
              <li>Impersonates others or spreads misinformation</li>
            </ul>
            <p className="text-gray-400 leading-relaxed mt-4">
              We reserve the right to moderate content that violates these guidelines.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-white mb-4">6. Reservation System</h2>
            <p className="text-gray-400 leading-relaxed">
              Zone reservations are valid for 10 minutes. If payment is not completed within this
              window, the reservation expires and the zone becomes available again. No tokens are
              charged for expired reservations.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-white mb-4">7. Disclaimer of Warranties</h2>
            <p className="text-gray-400 leading-relaxed">
              BLOKR is provided &quot;as is&quot; without warranties of any kind. We do not guarantee
              uninterrupted access, error-free operation, or that the canvas will remain available
              indefinitely. The canvas data is stored off-chain; only payments are on-chain.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-white mb-4">8. Limitation of Liability</h2>
            <p className="text-gray-400 leading-relaxed">
              To the maximum extent permitted by law, BLOKR and its operators shall not be
              liable for any indirect, incidental, special, consequential, or punitive damages,
              including loss of tokens, data, or profits.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-white mb-4">9. Changes to Terms</h2>
            <p className="text-gray-400 leading-relaxed">
              We may update these terms at any time. Continued use of BLOKR after changes
              constitutes acceptance of the new terms. Material changes will be announced on the platform.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-white mb-4">10. Contact</h2>
            <p className="text-gray-400 leading-relaxed">
              For questions about these terms, contact us on{" "}
              <a
                href="https://twitter.com/BLOKR"
                target="_blank"
                rel="noopener noreferrer"
                className="text-lime hover:underline"
              >
                X (@BLOKR)
              </a>.
            </p>
          </section>
        </div>
      </div>

      <Footer />
    </main>
  )
}
