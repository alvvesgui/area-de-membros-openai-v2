"use client"

import type React from "react"

import { useEffect, useState } from "react"

export function ResponsiveLayout({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  return <div className={`h-screen ${isMobile ? "mobile-layout" : "desktop-layout"}`}>{children}</div>
}
