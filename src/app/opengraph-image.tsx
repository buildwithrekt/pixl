import { ImageResponse } from "next/og"

export const runtime = "edge"

export const alt = "BLOKR - Collaborative Pixel Canvas"
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = "image/png"

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#000000",
          position: "relative",
        }}
      >
        {/* Grid pattern background */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            flexWrap: "wrap",
            opacity: 0.1,
          }}
        >
          {Array.from({ length: 400 }).map((_, i) => (
            <div
              key={i}
              style={{
                width: 60,
                height: 63,
                border: "1px solid #ccfd03",
              }}
            />
          ))}
        </div>

        {/* Glow effect */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 600,
            height: 600,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(204, 253, 3, 0.15) 0%, transparent 70%)",
          }}
        />

        {/* Main content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1,
          }}
        >
          {/* Wordmark */}
          <div
            style={{
              display: "flex",
              fontSize: 140,
              fontWeight: 800,
              letterSpacing: "0.05em",
              marginBottom: 24,
              color: "#ccfd03",
            }}
          >
            BLOKR
          </div>

          {/* Tagline */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              fontSize: 36,
              color: "#ffffff",
              textAlign: "center",
              maxWidth: 800,
              lineHeight: 1.4,
            }}
          >
            <span style={{ display: "flex" }}>One million pixels. Bought by degens,</span>
            <span style={{ display: "flex" }}>claimed by memecoins.</span>
          </div>

          {/* Badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginTop: 40,
              backgroundColor: "#ccfd03",
              padding: "12px 24px",
              borderRadius: 8,
            }}
          >
            <span
              style={{
                fontSize: 18,
                fontWeight: 600,
                color: "#000000",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              Live on Robinhood Chain
            </span>
          </div>
        </div>

        {/* Decorative pixels - lime corners */}
        <div
          style={{
            position: "absolute",
            top: 40,
            left: 40,
            width: 24,
            height: 24,
            backgroundColor: "#ccfd03",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 40,
            right: 40,
            width: 24,
            height: 24,
            backgroundColor: "#ccfd03",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 40,
            left: 40,
            width: 24,
            height: 24,
            backgroundColor: "#ccfd03",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 40,
            right: 40,
            width: 24,
            height: 24,
            backgroundColor: "#ccfd03",
          }}
        />

        {/* URL */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            display: "flex",
            fontSize: 20,
            color: "#666666",
            letterSpacing: "0.05em",
          }}
        >
          blokr.store
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
