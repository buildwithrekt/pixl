import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "BLOKR - Collaborative Pixel Canvas"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function OGImage() {
  // Fetch the composite image URL
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

  return new ImageResponse(
    (
      <div
        style={{
          background: "#FAF5EA",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              fontSize: "72px",
              fontWeight: 800,
              color: "#17150F",
              letterSpacing: "-2px",
            }}
          >
            PIXEL
          </div>
          <div
            style={{
              fontSize: "72px",
              fontWeight: 800,
              color: "#E8402A",
              letterSpacing: "-2px",
            }}
          >
            BOARD
          </div>
        </div>

        {/* Canvas preview placeholder */}
        <div
          style={{
            width: "400px",
            height: "400px",
            background: "#fff",
            border: "4px solid #17150F",
            borderRadius: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "8px 8px 0 #17150F",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "8px",
            }}
          >
            {/* Grid pattern */}
            <div
              style={{
                display: "flex",
                gap: "4px",
              }}
            >
              {[...Array(8)].map((_, row) => (
                <div key={row} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  {[...Array(8)].map((_, col) => {
                    const colors = ["#E8402A", "#2A5BFF", "#FFC800", "#FF8A00", "#FAF5EA"]
                    const color = colors[Math.floor((row + col) * 7.3) % colors.length]
                    return (
                      <div
                        key={col}
                        style={{
                          width: "32px",
                          height: "32px",
                          background: color,
                          borderRadius: "4px",
                          border: "2px solid #17150F",
                        }}
                      />
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tagline */}
        <div
          style={{
            marginTop: "24px",
            fontSize: "24px",
            color: "#17150F",
            opacity: 0.6,
          }}
        >
          One million pixels. Bought by degens.
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
