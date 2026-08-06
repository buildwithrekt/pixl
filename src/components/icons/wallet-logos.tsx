import React from "react"

interface LogoProps {
  className?: string
  size?: number
}

export function MetaMaskLogo({ className, size = 32 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
    >
      <path
        d="M27.2 3.2L17.6 10.4L19.2 6.08L27.2 3.2Z"
        fill="#E17726"
      />
      <path
        d="M4.8 3.2L14.32 10.48L12.8 6.08L4.8 3.2Z"
        fill="#E27625"
      />
      <path
        d="M23.68 21.28L21.28 25.12L26.72 26.64L28.32 21.36L23.68 21.28Z"
        fill="#E27625"
      />
      <path
        d="M3.68 21.36L5.28 26.64L10.72 25.12L8.32 21.28L3.68 21.36Z"
        fill="#E27625"
      />
      <path
        d="M10.4 14.24L8.88 16.48L14.24 16.72L14.08 10.96L10.4 14.24Z"
        fill="#E27625"
      />
      <path
        d="M21.6 14.24L17.84 10.88L17.76 16.72L23.12 16.48L21.6 14.24Z"
        fill="#E27625"
      />
      <path
        d="M10.72 25.12L13.92 23.52L11.12 21.36L10.72 25.12Z"
        fill="#E27625"
      />
      <path
        d="M18.08 23.52L21.28 25.12L20.88 21.36L18.08 23.52Z"
        fill="#E27625"
      />
      <path
        d="M21.28 25.12L18.08 23.52L18.32 25.6L18.32 26.56L21.28 25.12Z"
        fill="#D5BFB2"
      />
      <path
        d="M10.72 25.12L13.68 26.56L13.68 25.6L13.92 23.52L10.72 25.12Z"
        fill="#D5BFB2"
      />
      <path
        d="M13.76 19.6L11.04 18.8L12.96 17.92L13.76 19.6Z"
        fill="#233447"
      />
      <path
        d="M18.24 19.6L19.04 17.92L20.96 18.8L18.24 19.6Z"
        fill="#233447"
      />
      <path
        d="M10.72 25.12L11.12 21.28L8.32 21.36L10.72 25.12Z"
        fill="#CC6228"
      />
      <path
        d="M20.88 21.28L21.28 25.12L23.68 21.36L20.88 21.28Z"
        fill="#CC6228"
      />
      <path
        d="M23.12 16.48L17.76 16.72L18.24 19.6L19.04 17.92L20.96 18.8L23.12 16.48Z"
        fill="#CC6228"
      />
      <path
        d="M11.04 18.8L12.96 17.92L13.76 19.6L14.24 16.72L8.88 16.48L11.04 18.8Z"
        fill="#CC6228"
      />
      <path
        d="M8.88 16.48L11.12 21.36L11.04 18.8L8.88 16.48Z"
        fill="#E27525"
      />
      <path
        d="M20.96 18.8L20.88 21.36L23.12 16.48L20.96 18.8Z"
        fill="#E27525"
      />
      <path
        d="M14.24 16.72L13.76 19.6L14.4 22.8L14.56 18.56L14.24 16.72Z"
        fill="#E27525"
      />
      <path
        d="M17.76 16.72L17.44 18.56L17.6 22.8L18.24 19.6L17.76 16.72Z"
        fill="#E27525"
      />
      <path
        d="M18.24 19.6L17.6 22.8L18.08 23.52L20.88 21.36L20.96 18.8L18.24 19.6Z"
        fill="#F5841F"
      />
      <path
        d="M11.04 18.8L11.12 21.36L13.92 23.52L14.4 22.8L13.76 19.6L11.04 18.8Z"
        fill="#F5841F"
      />
      <path
        d="M18.32 26.56L18.32 25.6L18.08 25.36H13.92L13.68 25.6L13.68 26.56L10.72 25.12L11.76 25.92L13.84 27.36H18.16L20.24 25.92L21.28 25.12L18.32 26.56Z"
        fill="#C0AC9D"
      />
      <path
        d="M18.08 23.52L17.6 22.8H14.4L13.92 23.52L13.68 25.6L13.92 25.36H18.08L18.32 25.6L18.08 23.52Z"
        fill="#161616"
      />
      <path
        d="M27.68 11.04L28.48 7.04L27.2 3.2L18.08 10.08L21.6 14.24L26.56 15.68L27.68 14.32L27.2 13.92L27.92 13.28L27.36 12.8L28.08 12.24L27.68 11.04Z"
        fill="#763E1A"
      />
      <path
        d="M3.52 7.04L4.32 11.04L3.92 12.24L4.64 12.8L4.08 13.28L4.8 13.92L4.32 14.32L5.44 15.68L10.4 14.24L13.92 10.08L4.8 3.2L3.52 7.04Z"
        fill="#763E1A"
      />
      <path
        d="M26.56 15.68L21.6 14.24L23.12 16.48L20.88 21.36L23.68 21.28H28.32L26.56 15.68Z"
        fill="#F5841F"
      />
      <path
        d="M10.4 14.24L5.44 15.68L3.68 21.28H8.32L11.12 21.36L8.88 16.48L10.4 14.24Z"
        fill="#F5841F"
      />
      <path
        d="M17.76 16.72L18.08 10.08L19.2 6.08H12.8L13.92 10.08L14.24 16.72L14.4 18.56L14.4 22.8H17.6L17.6 18.56L17.76 16.72Z"
        fill="#F5841F"
      />
    </svg>
  )
}

export function CoinbaseLogo({ className, size = 32 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
    >
      <rect width="32" height="32" rx="8" fill="#0052FF" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16 6C10.477 6 6 10.477 6 16C6 21.523 10.477 26 16 26C21.523 26 26 21.523 26 16C26 10.477 21.523 6 16 6ZM13.5 13C12.672 13 12 13.672 12 14.5V17.5C12 18.328 12.672 19 13.5 19H18.5C19.328 19 20 18.328 20 17.5V14.5C20 13.672 19.328 13 18.5 13H13.5Z"
        fill="white"
      />
    </svg>
  )
}

export function WalletConnectLogo({ className, size = 32 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
    >
      <rect width="32" height="32" rx="8" fill="#3B99FC" />
      <path
        d="M10.4 12.8C13.5 9.7 18.5 9.7 21.6 12.8L22 13.2C22.2 13.4 22.2 13.7 22 13.9L20.8 15.1C20.7 15.2 20.5 15.2 20.4 15.1L19.9 14.6C17.7 12.4 14.3 12.4 12.1 14.6L11.5 15.2C11.4 15.3 11.2 15.3 11.1 15.2L9.9 14C9.7 13.8 9.7 13.5 9.9 13.3L10.4 12.8ZM24.1 15.3L25.2 16.4C25.4 16.6 25.4 16.9 25.2 17.1L20.3 22C20.1 22.2 19.7 22.2 19.5 22L16.2 18.7C16.15 18.65 16.05 18.65 16 18.7L12.7 22C12.5 22.2 12.1 22.2 11.9 22L6.8 17.1C6.6 16.9 6.6 16.6 6.8 16.4L7.9 15.3C8.1 15.1 8.5 15.1 8.7 15.3L12 18.6C12.05 18.65 12.15 18.65 12.2 18.6L15.5 15.3C15.7 15.1 16.1 15.1 16.3 15.3L19.6 18.6C19.65 18.65 19.75 18.65 19.8 18.6L23.1 15.3C23.5 15.1 23.9 15.1 24.1 15.3Z"
        fill="white"
      />
    </svg>
  )
}

export function WalletLogos({ size = 32 }: { size?: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="p-2 bg-white border-2 border-ink rounded-lg shadow-hard-sm hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-hard-md transition-all">
        <MetaMaskLogo size={size} />
      </div>
      <div className="p-2 bg-white border-2 border-ink rounded-lg shadow-hard-sm hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-hard-md transition-all">
        <CoinbaseLogo size={size} />
      </div>
      <div className="p-2 bg-white border-2 border-ink rounded-lg shadow-hard-sm hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-hard-md transition-all">
        <WalletConnectLogo size={size} />
      </div>
    </div>
  )
}
