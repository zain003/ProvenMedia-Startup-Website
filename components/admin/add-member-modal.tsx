"use client"

import type React from "react"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Mail, User, Lock } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface AddMemberModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function AddMemberModal({ isOpen, onClose, onSuccess }: AddMemberModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    // Save admin session at the start (outside try block for error handling)
    let adminSession: any = null

    try {
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match")
        setLoading(false)
        return
      }

      if (formData.password.length < 6) {
        setError("Password must be at least 6 characters")
        setLoading(false)
        return
      }

      // IMPORTANT: We need to create the auth user WITHOUT logging in as them
      // Supabase auth.signUp() automatically logs you in, which is not what we want
      // Solution: Save admin session and restore it immediately after
      
      // First, save the current admin session
      const { data: { session: currentSession } } = await supabase.auth.getSession()
      if (!currentSession) throw new Error("No active session")
      
      adminSession = currentSession // Store for error handling
      
      // Create user account in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: undefined,
          data: {
            name: formData.name,
          }
        }
      })

      if (authError) throw authError
      if (!authData.user) throw new Error("Failed to create user")

      // CRITICAL: Restore admin session IMMEDIATELY before database insert
      // This ensures the admin (not the new user) performs the insert
      await supabase.auth.setSession({
        access_token: currentSession.access_token,
        refresh_token: currentSession.refresh_token,
      })

      // Small delay to ensure session is restored
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Add user profile to database (now as admin)
      const { error: dbError } = await supabase.from("users").insert({
        uid: authData.user.id,
        name: formData.name,
        email: formData.email,
        role: "member",
        status: "In Progress",
        join_date: new Date().toISOString(),
      })

      if (dbError) {
        console.error("Failed to create member profile:", dbError)
        throw dbError
      }

      // Final verification: Ensure admin is still logged in
      const { data: { session: finalSession } } = await supabase.auth.getSession()
      if (finalSession?.user?.id !== currentSession.user?.id) {
        await supabase.auth.setSession({
          access_token: currentSession.access_token,
          refresh_token: currentSession.refresh_token,
        })
        // Wait for session to stabilize
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      })
      
      alert(`✅ Success!\n\nMember "${formData.name}" has been added.\nEmail: ${formData.email}\n\nThey can now login with their credentials.`)
      onSuccess()
      onClose()
    } catch (err: any) {
      console.error("Error adding member:", err)
      
      // CRITICAL: Restore admin session even if there's an error
      if (adminSession) {
        try {
          const { data: { session: currentSessionCheck } } = await supabase.auth.getSession()
          
          // If session changed, restore admin session
          if (currentSessionCheck?.user?.id !== adminSession.user?.id) {
            console.log("Restoring admin session after error...")
            await supabase.auth.setSession({
              access_token: adminSession.access_token,
              refresh_token: adminSession.refresh_token,
            })
          }
        } catch (restoreError) {
          console.error("Failed to restore session after error:", restoreError)
        }
      }
      
      // Provide user-friendly error messages
      if (err.message?.includes("already registered") || err.message?.includes("already exists")) {
        setError("This email is already registered. Please use a different email.")
      } else if (err.code === "23505" || err.message?.includes("duplicate key")) {
        // Check if it's a deleted user
        const { data: existingUser } = await supabase
          .from("users")
          .select("email, status")
          .eq("email", formData.email)
          .single()
        
        if (existingUser && existingUser.status === "Deleted") {
          setError("This email was previously used. The old account has been deleted. Please try again.")
          // Delete the old record to allow recreation
          await supabase.from("users").delete().eq("email", formData.email)
        } else {
          setError("This email is already in use. Please use a different email.")
        }
      } else if (err.code === "auth/invalid-email") {
        setError("Invalid email address format")
      } else if (err.code === "auth/weak-password") {
        setError("Password is too weak. Please use at least 6 characters")
      } else {
        setError(err.message || "Failed to add member")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50"
          >
            <div className="glass-panel p-8 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground">Add Team Member</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-secondary rounded-lg transition-smooth text-muted hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-destructive/10 border-2 border-destructive/30 rounded-xl p-4 text-destructive text-sm font-semibold"
                  >
                    ⚠️ {error}
                  </motion.div>
                )}

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-5 h-5 text-muted" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-smooth text-foreground placeholder-muted"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-5 h-5 text-muted" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-smooth text-foreground placeholder-muted"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-5 h-5 text-muted" />
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-smooth text-foreground placeholder-muted"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-5 h-5 text-muted" />
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-smooth text-foreground placeholder-muted"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-2 bg-secondary/50 text-foreground rounded-lg hover:bg-secondary transition-smooth font-medium"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-primary to-accent text-white rounded-lg hover:shadow-lg hover:shadow-primary/50 transition-smooth font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Adding..." : "Add Member"}
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
