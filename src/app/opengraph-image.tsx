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
          backgroundColor: "#FAF5EA",
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
            opacity: 0.15,
          }}
        >
          {Array.from({ length: 400 }).map((_, i) => (
            <div
              key={i}
              style={{
                width: 60,
                height: 63,
                border: "1px solid #17150F",
              }}
            />
          ))}
        </div>

        {/* Main content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Wordmark */}
          <div
            style={{
              display: "flex",
              fontSize: 120,
              fontWeight: 800,
              letterSpacing: "0.05em",
              marginBottom: 24,
            }}
          >
            <span style={{ display: "flex", color: "#E8402A" }}>B</span>
            <span style={{ display: "flex", color: "#2A5BFF" }}>L</span>
            <span style={{ display: "flex", color: "#FF8A00" }}>O</span>
            <span style={{ display: "flex", color: "#17150F" }}>K</span>
          </div>

          {/* Tagline */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              fontSize: 32,
              color: "#17150F",
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
              backgroundColor: "#FFC800",
              padding: "12px 24px",
              borderRadius: 8,
              border: "3px solid #17150F",
              boxShadow: "4px 4px 0 #17150F",
            }}
          >
            <span
              style={{
                fontSize: 18,
                fontWeight: 600,
                color: "#17150F",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              Live on Robinhood Chain
            </span>
          </div>
        </div>

        {/* Decorative pixels */}
        <div
          style={{
            position: "absolute",
            top: 40,
            left: 40,
            width: 32,
            height: 32,
            backgroundColor: "#E8402A",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 40,
            right: 40,
            width: 32,
            height: 32,
            backgroundColor: "#2A5BFF",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 40,
            left: 40,
            width: 32,
            height: 32,
            backgroundColor: "#FFC800",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 40,
            right: 40,
            width: 32,
            height: 32,
            backgroundColor: "#FF8A00",
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  )
}
