import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "BLOKR - Collaborative Pixel Canvas"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#000000",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
        }}
      >
        {/* Glow effect */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(204, 253, 3, 0.1) 0%, transparent 70%)",
          }}
        />

        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "32px",
            zIndex: 1,
          }}
        >
          <div
            style={{
              fontSize: "64px",
              fontWeight: 800,
              color: "#ccfd03",
              letterSpacing: "-2px",
            }}
          >
            BLOKR
          </div>
          <div
            style={{
              fontSize: "64px",
              fontWeight: 800,
              color: "#ffffff",
              letterSpacing: "-2px",
            }}
          >
            BOARD
          </div>
        </div>

        {/* Canvas preview placeholder */}
        <div
          style={{
            width: "320px",
            height: "320px",
            background: "#111111",
            border: "2px solid #ccfd03",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1,
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
                gap: "3px",
              }}
            >
              {[...Array(8)].map((_, row) => (
                <div key={row} style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                  {[...Array(8)].map((_, col) => {
                    const isLime = (row + col) % 3 === 0
                    return (
                      <div
                        key={col}
                        style={{
                          width: "28px",
                          height: "28px",
                          background: isLime ? "#ccfd03" : "#222222",
                          borderRadius: "3px",
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
            marginTop: "32px",
            fontSize: "24px",
            color: "#666666",
            zIndex: 1,
          }}
        >
          One million pixels. Bought by degens.
        </div>

        {/* Decorative corners */}
        <div style={{ position: "absolute", top: 24, left: 24, width: 16, height: 16, backgroundColor: "#ccfd03" }} />
        <div style={{ position: "absolute", top: 24, right: 24, width: 16, height: 16, backgroundColor: "#ccfd03" }} />
        <div style={{ position: "absolute", bottom: 24, left: 24, width: 16, height: 16, backgroundColor: "#ccfd03" }} />
        <div style={{ position: "absolute", bottom: 24, right: 24, width: 16, height: 16, backgroundColor: "#ccfd03" }} />

        {/* URL */}
        <div
          style={{
            position: "absolute",
            bottom: 24,
            fontSize: 18,
            color: "#444444",
            letterSpacing: "0.05em",
          }}
        >
          blokr.store/board
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
