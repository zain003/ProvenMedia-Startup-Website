"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { User, Lock, Mail, LogOut, ArrowLeft } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase"

export default function ProfilePage() {
  const router = useRouter()
  const { user, userProfile, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setMessage("")
    setLoading(true)

    try {
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        setError("New passwords do not match")
        setLoading(false)
        return
      }

      if (passwordForm.newPassword.length < 6) {
        setError("Password must be at least 6 characters")
        setLoading(false)
        return
      }

      if (!user || !user.email) {
        setError("User not found")
        setLoading(false)
        return
      }

      // Verify current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: passwordForm.currentPassword,
      })

      if (signInError) {
        setError("Current password is incorrect")
        setLoading(false)
        return
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordForm.newPassword
      })

      if (updateError) throw updateError

      setMessage("Password updated successfully!")
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })

      setTimeout(() => setMessage(""), 3000)
    } catch (err: any) {
      setError(err.message || "Failed to update password")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await signOut()
    router.push("/login")
  }

  return (
    <div className="p-8 space-y-8 bg-gradient-to-br from-primary/5 via-background to-accent/5 min-h-screen">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="modern-card p-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-3 hover:bg-secondary rounded-xl transition-all duration-200 text-foreground hover:shadow-md"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-4xl font-bold text-foreground">Profile Settings</h1>
            <p className="text-muted-foreground text-lg">Manage your account and preferences</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <div className="modern-card p-6 space-y-4">
            <div className="w-16 h-16 gradient-primary rounded-xl flex items-center justify-center shadow-lg">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="font-bold text-foreground text-lg">{userProfile?.name}</p>
              <p className="text-sm text-muted-foreground">{userProfile?.email}</p>
              <p className="text-xs text-muted-foreground mt-2 capitalize">
                <span className="font-semibold">Role:</span> {userProfile?.role}
              </p>
            </div>
          </div>

          <div className="modern-card p-4 space-y-2">
            <button
              onClick={() => setActiveTab("profile")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-semibold ${
                activeTab === "profile"
                  ? "bg-primary text-white shadow-lg shadow-primary/30"
                  : "text-foreground hover:bg-secondary hover:shadow-md"
              }`}
            >
              <User className="w-5 h-5" />
              <span>Profile</span>
            </button>
            <button
              onClick={() => setActiveTab("password")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-semibold ${
                activeTab === "password"
                  ? "bg-primary text-white shadow-lg shadow-primary/30"
                  : "text-foreground hover:bg-secondary hover:shadow-md"
              }`}
            >
              <Lock className="w-5 h-5" />
              <span>Change Password</span>
            </button>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-200 modern-card font-semibold hover:shadow-md"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          {activeTab === "profile" && (
            <div className="modern-card p-8 space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-6">Profile Information</h2>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Full Name</label>
                  <input
                    type="text"
                    value={userProfile?.name || ""}
                    disabled
                    className="input-modern opacity-60 cursor-not-allowed"
                  />
                  <p className="text-xs text-muted-foreground mt-2">Contact admin to change your name</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="email"
                      value={userProfile?.email || ""}
                      disabled
                      className="input-modern pl-12 opacity-60 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Account Status</label>
                  <div className="px-4 py-3 bg-secondary rounded-xl border-2 border-border">
                    <span
                      className={`inline-block px-4 py-2 rounded-lg text-sm font-semibold shadow-sm ${
                        userProfile?.status === "In Progress"
                          ? "bg-primary/20 text-primary border border-primary/30"
                          : userProfile?.status === "On Hold"
                            ? "bg-warning/20 text-warning border border-warning/30"
                            : userProfile?.status === "Finished"
                              ? "bg-success/20 text-success border border-success/30"
                              : "bg-success/20 text-success border border-success/30"
                      }`}
                    >
                      {userProfile?.status || "Active"}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Role</label>
                  <input
                    type="text"
                    value={userProfile?.role === "admin" ? "Administrator" : "Team Member"}
                    disabled
                    className="input-modern opacity-60 cursor-not-allowed capitalize"
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-border bg-secondary/30 -mx-8 -mb-8 px-8 py-6 rounded-b-xl">
                <p className="text-sm text-foreground font-medium">
                  📝 Your profile information is managed by your administrator. Contact them to make changes.
                </p>
              </div>
            </div>
          )}

          {activeTab === "password" && (
            <div className="modern-card p-8 space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-6">Change Password</h2>
              </div>

              {message && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-success/10 border-2 border-success/30 rounded-xl p-4 text-success text-sm font-semibold"
                >
                  ✓ {message}
                </motion.div>
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-destructive/10 border-2 border-destructive/30 rounded-xl p-4 text-destructive text-sm font-semibold"
                >
                  ✗ {error}
                </motion.div>
              )}

              <form onSubmit={handlePasswordChange} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Current Password</label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    placeholder="Enter your current password"
                    className="input-modern"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">New Password</label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    placeholder="Enter your new password"
                    className="input-modern"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-2">Minimum 6 characters</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    placeholder="Confirm your new password"
                    className="input-modern"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Updating Password...
                    </span>
                  ) : (
                    "Update Password"
                  )}
                </button>
              </form>

              <div className="pt-6 border-t border-border bg-secondary/30 -mx-8 -mb-8 px-8 py-6 rounded-b-xl space-y-3">
                <h3 className="font-bold text-foreground">🔒 Password Requirements</h3>
                <ul className="text-sm text-foreground space-y-2">
                  <li>• Minimum 6 characters</li>
                  <li>• Use a mix of uppercase and lowercase letters</li>
                  <li>• Include numbers and special characters for better security</li>
                  <li>• Don't reuse your previous passwords</li>
                </ul>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
