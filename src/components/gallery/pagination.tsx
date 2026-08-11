import Link from "next/link"
import { Button } from "@/components/ui/button"

interface PaginationProps {
  currentPage: number
  totalPages: number
  baseUrl: string
  searchParams?: Record<string, string>
}

export function Pagination({
  currentPage,
  totalPages,
  baseUrl,
  searchParams = {},
}: PaginationProps) {
  if (totalPages <= 1) return null

  const buildUrl = (page: number) => {
    const params = new URLSearchParams(searchParams)
    params.set("page", String(page))
    return `${baseUrl}?${params.toString()}`
  }

  // Generate page numbers to show
  const pages: (number | "...")[] = []

  if (totalPages <= 7) {
    // Show all pages
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i)
    }
  } else {
    // Show first, last, and pages around current
    pages.push(1)

    if (currentPage > 3) {
      pages.push("...")
    }

    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i)
    }

    if (currentPage < totalPages - 2) {
      pages.push("...")
    }

    pages.push(totalPages)
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-12">
      {/* Previous */}
      {currentPage > 1 ? (
        <Button variant="secondary" size="sm" asChild>
          <Link href={buildUrl(currentPage - 1)}>←</Link>
        </Button>
      ) : (
        <Button variant="secondary" size="sm" disabled>
          ←
        </Button>
      )}

      {/* Page numbers */}
      {pages.map((page, i) =>
        page === "..." ? (
          <span key={`ellipsis-${i}`} className="px-2 text-gray-500">
            ...
          </span>
        ) : (
          <Button
            key={page}
            variant={page === currentPage ? "default" : "secondary"}
            size="sm"
            asChild={page !== currentPage}
          >
            {page === currentPage ? (
              <span>{page}</span>
            ) : (
              <Link href={buildUrl(page)}>{page}</Link>
            )}
          </Button>
        )
      )}

      {/* Next */}
      {currentPage < totalPages ? (
        <Button variant="secondary" size="sm" asChild>
          <Link href={buildUrl(currentPage + 1)}>→</Link>
        </Button>
      ) : (
        <Button variant="secondary" size="sm" disabled>
          →
        </Button>
      )}
    </div>
  )
}
