"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "./supabase"
import type { User } from "@supabase/supabase-js"

interface UserProfile {
  uid: string
  email: string
  role: "admin" | "member"
  name: string
  status?: string
}

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  loading: boolean
  error: string | null
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    // Get initial session
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!mounted) return

        setUser(session?.user ?? null)
        
        if (session?.user) {
          await fetchUserProfile(session.user.id)
        } else {
          setLoading(false)
        }
      } catch (error) {
        console.error("Auth initialization error:", error)
        if (mounted) {
          setLoading(false)
        }
      }
    }

    initAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return

      setUser(session?.user ?? null)
      setError(null)

      if (session?.user) {
        await fetchUserProfile(session.user.id)
      } else {
        setUserProfile(null)
        setLoading(false)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("uid, email, role, name, status")
        .eq("uid", userId)
        .single()

      if (error) {
        // Don't show errors for profile not found - this is normal during user creation
        if (error.code === 'PGRST116') {
          setUserProfile(null)
          // Don't set error or sign out - this is temporary during user creation
        } else {
          console.error("Error fetching user profile:", error)
          setError("Failed to load user profile: " + error.message)
          setUserProfile(null)
          await supabase.auth.signOut()
        }
      } else if (data) {
        // Check if user is deleted
        if (data.status === "Deleted") {
          setError("Your account has been deleted. Please contact administrator.")
          setUserProfile(null)
          // Sign out deleted user
          await supabase.auth.signOut()
          return
        }
        
        setUserProfile(data as UserProfile)
        setError(null) // Clear any previous errors
      } else {
        setUserProfile(null)
        // Don't set error or sign out - profile might be being created
      }
    } catch (error: any) {
      console.error("Error fetching user profile:", error)
      setError("Failed to load user profile: " + (error.message || "Unknown error"))
      setUserProfile(null)
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setUserProfile(null)
      setError(null)
    } catch (error) {
      console.error("Error signing out:", error)
      setError("Failed to sign out. Please try again.")
    }
  }

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, error, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
