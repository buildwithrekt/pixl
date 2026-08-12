import { Nav } from "@/components/nav"
import { Footer } from "@/components/footer"
import Image from "next/image"

export default function NFTsPage() {
  return (
    <main className="min-h-screen bg-black flex flex-col">
      <Nav />

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <Image
          src="/image-11.png.png"
          alt="NFT"
          width={512}
          height={512}
          className="max-w-full h-auto"
          style={{ imageRendering: "pixelated" }}
        />
      </div>

      <Footer />
    </main>
  )
}
