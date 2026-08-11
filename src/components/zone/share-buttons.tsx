"use client"

import React, { useState, useCallback } from "react"

interface ShareButtonsProps {
  title: string
  className?: string
}

export function ShareButtons({ title, className }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const input = document.createElement("input")
      input.value = window.location.href
      document.body.appendChild(input)
      input.select()
      document.execCommand("copy")
      document.body.removeChild(input)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [])

  const handleShareTwitter = useCallback(() => {
    const text = `Check out "${title}" on BLOKR!`
    const url = window.location.href
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      "_blank",
      "width=550,height=420"
    )
  }, [title])

  const handleShareFarcaster = useCallback(() => {
    const text = `Check out "${title}" on BLOKR!`
    const url = window.location.href
    window.open(
      `https://warpcast.com/~/compose?text=${encodeURIComponent(text)}&embeds[]=${encodeURIComponent(url)}`,
      "_blank"
    )
  }, [title])

  return (
    <div className={`flex items-center gap-2 ${className || ""}`}>
      <span className="font-mono text-[10px] text-gray-500 uppercase mr-2">Share</span>

      {/* Copy link */}
      <button
        onClick={handleCopyLink}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 border border-gray-700 rounded-[4px] hover:border-lime hover:text-lime transition-all"
        title="Copy link"
      >
        {copied ? <CheckIcon /> : <LinkIcon />}
        <span className="font-mono text-[10px] uppercase">
          {copied ? "Copied!" : "Link"}
        </span>
      </button>

      {/* Twitter/X */}
      <button
        onClick={handleShareTwitter}
        className="flex items-center justify-center w-9 h-9 bg-gray-900 border border-gray-700 rounded-[4px] hover:border-lime hover:text-lime transition-all"
        title="Share on X"
      >
        <XIcon />
      </button>

      {/* Farcaster */}
      <button
        onClick={handleShareFarcaster}
        className="flex items-center justify-center w-9 h-9 bg-gray-900 border border-gray-700 rounded-[4px] hover:border-lime hover:text-lime transition-all"
        title="Share on Farcaster"
      >
        <FarcasterIcon />
      </button>
    </div>
  )
}

function LinkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-gray-400">
      <path
        d="M6 8l2-2M5 9L3 11a1.5 1.5 0 002 2l2-2M9 5l2-2a1.5 1.5 0 00-2-2L7 3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="square"
      />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-lime">
      <path
        d="M2 7l4 4 6-8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="square"
      />
    </svg>
  )
}

function XIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-gray-400">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function FarcasterIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-gray-400">
      <path d="M3 4h18v16H3V4zm2 2v12h14V6H5zm2 2h10v2H7V8zm0 4h10v2H7v-2z" />
    </svg>
  )
}
