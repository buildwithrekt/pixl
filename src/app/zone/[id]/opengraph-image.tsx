import { ImageResponse } from "next/og"
import { prisma } from "@/lib/prisma"

// Use nodejs runtime for Prisma compatibility
export const runtime = "nodejs"

export const alt = "Zone on BLOKR"
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = "image/png"

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  let zone: {
    x: number
    y: number
    w: number
    h: number
    projectName: string | null
    imageUrl: string | null
    totalPixels: number
    status: string
  } | null = null

  if (prisma) {
    zone = await prisma.zone.findUnique({
      where: { id },
      select: {
        x: true,
        y: true,
        w: true,
        h: true,
        projectName: true,
        imageUrl: true,
        totalPixels: true,
        status: true,
      },
    })
  }

  const name = zone?.projectName || `Zone at (${zone?.x ?? 0}, ${zone?.y ?? 0})`
  const pixels = zone?.totalPixels ?? 0
  const position = zone ? `(${zone.x}, ${zone.y})` : "(0, 0)"
  const sizeText = zone ? `${zone.w}×${zone.h} cells` : "0×0 cells"

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          backgroundColor: "#000000",
          position: "relative",
        }}
      >
        {/* Left side - Zone image or placeholder */}
        <div
          style={{
            width: "50%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#111111",
            position: "relative",
          }}
        >
          {zone?.imageUrl ? (
            <img
              src={zone.imageUrl}
              alt=""
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {/* Grid pattern placeholder */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  width: 200,
                  height: 200,
                  border: "2px solid #ccfd03",
                  borderRadius: 8,
                }}
              >
                {Array.from({ length: 64 }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      width: 25,
                      height: 25,
                      backgroundColor: i % 2 === 0 ? "#1a1a1a" : "#222222",
                    }}
                  />
                ))}
              </div>
              <span
                style={{
                  marginTop: 16,
                  fontSize: 14,
                  color: "#666666",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                No artwork yet
              </span>
            </div>
          )}
        </div>

        {/* Right side - Info */}
        <div
          style={{
            width: "50%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: 48,
          }}
        >
          {/* BLOKR badge */}
          <div
            style={{
              display: "flex",
              fontSize: 28,
              fontWeight: 800,
              letterSpacing: "0.05em",
              marginBottom: 24,
              color: "#ccfd03",
            }}
          >
            BLOKR
          </div>

          {/* Zone name */}
          <div
            style={{
              fontSize: 42,
              fontWeight: 800,
              color: "#ffffff",
              lineHeight: 1.1,
              marginBottom: 24,
            }}
          >
            {name}
          </div>

          {/* Stats */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: "#ccfd03",
                  padding: "8px 16px",
                  borderRadius: 8,
                }}
              >
                <span style={{ fontSize: 16, fontWeight: 600, color: "#000000" }}>
                  {pixels.toLocaleString()} pixels
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: zone?.status === "DRAWN" ? "#ccfd03" : "#333333",
                  padding: "8px 16px",
                  borderRadius: 8,
                }}
              >
                <span
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: zone?.status === "DRAWN" ? "#000000" : "#ccfd03",
                  }}
                >
                  {zone?.status || "RESERVED"}
                </span>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                fontSize: 18,
                color: "#888888",
              }}
            >
              <span style={{ display: "flex" }}>Position: {position}</span>
              <span style={{ display: "flex", margin: "0 12px" }}>•</span>
              <span style={{ display: "flex" }}>Size: {sizeText}</span>
            </div>
          </div>
        </div>

        {/* Decorative corner pixels */}
        <div
          style={{
            position: "absolute",
            top: 24,
            right: 24,
            width: 20,
            height: 20,
            backgroundColor: "#ccfd03",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 24,
            right: 24,
            width: 20,
            height: 20,
            backgroundColor: "#ccfd03",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 24,
            left: 24,
            width: 20,
            height: 20,
            backgroundColor: "#ccfd03",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 24,
            left: 24,
            width: 20,
            height: 20,
            backgroundColor: "#ccfd03",
          }}
        />

        {/* URL */}
        <div
          style={{
            position: "absolute",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            fontSize: 16,
            color: "#555555",
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
