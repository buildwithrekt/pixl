import { ImageResponse } from "next/og"
import { prisma } from "@/lib/prisma"

// Use nodejs runtime for Prisma compatibility
export const runtime = "nodejs"

export const alt = "Zone on BLOK"
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
          backgroundColor: "#FAF5EA",
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
            backgroundColor: "#E9E1CF",
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
                  border: "3px solid #17150F",
                  borderRadius: 8,
                }}
              >
                {Array.from({ length: 64 }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      width: 25,
                      height: 25,
                      backgroundColor: i % 2 === 0 ? "#FAF5EA" : "#E9E1CF",
                    }}
                  />
                ))}
              </div>
              <span
                style={{
                  marginTop: 16,
                  fontSize: 14,
                  color: "#17150F",
                  opacity: 0.5,
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
          {/* BLOK badge */}
          <div
            style={{
              display: "flex",
              fontSize: 24,
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

          {/* Zone name */}
          <div
            style={{
              fontSize: 42,
              fontWeight: 800,
              color: "#17150F",
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
                  backgroundColor: "#FFC800",
                  padding: "8px 16px",
                  borderRadius: 8,
                  border: "2px solid #17150F",
                }}
              >
                <span style={{ fontSize: 16, fontWeight: 600, color: "#17150F" }}>
                  {pixels.toLocaleString()} pixels
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  backgroundColor:
                    zone?.status === "DRAWN"
                      ? "#E8402A"
                      : zone?.status === "PAID"
                      ? "#FF8A00"
                      : "#FFC800",
                  padding: "8px 16px",
                  borderRadius: 8,
                  border: "2px solid #17150F",
                }}
              >
                <span style={{ fontSize: 16, fontWeight: 600, color: "#17150F" }}>
                  {zone?.status || "RESERVED"}
                </span>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                fontSize: 18,
                color: "#17150F",
                opacity: 0.7,
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
            width: 24,
            height: 24,
            backgroundColor: "#E8402A",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 24,
            right: 24,
            width: 24,
            height: 24,
            backgroundColor: "#2A5BFF",
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  )
}
