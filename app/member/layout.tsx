"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import MemberSidebar from "@/components/member/sidebar"

export default function MemberLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { userProfile, loading } = useAuth()

  useEffect(() => {
    if (!loading) {
      if (!userProfile) {
        router.push("/login")
      } else if (userProfile.role !== "member") {
        // Redirect to appropriate dashboard based on role
        if (userProfile.role === "admin") {
          router.push("/admin")
        } else {
          router.push("/login")
        }
      }
    }
  }, [userProfile, loading, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <MemberSidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
