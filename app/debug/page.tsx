"use client"

import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase"
import { useState, useEffect } from "react"

export default function DebugPage() {
  const { user, userProfile, loading, error } = useAuth()
  const [users, setUsers] = useState<any[]>([])
  const [dbError, setDbError] = useState("")
  const [supabaseUrl, setSupabaseUrl] = useState("")

  useEffect(() => {
    setSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL || "Not configured")
    
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from("users")
          .select("uid, email, name, role, status, join_date")
          .order("join_date", { ascending: false })
        
        if (error) throw error
        
        setUsers(data || [])
      } catch (error: any) {
        setDbError(error.message)
      }
    }

    fetchUsers()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="modern-card p-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Debug Information</h1>
          <p className="text-muted-foreground">System status and configuration details</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Auth State */}
          <div className="modern-card p-6">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
              Auth State
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-secondary rounded-lg">
                <span className="font-semibold text-foreground">Loading:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${loading ? "bg-warning/20 text-warning" : "bg-success/20 text-success"}`}>
                  {loading ? "Yes" : "No"}
                </span>
              </div>
              <div className="p-3 bg-secondary rounded-lg">
                <p className="font-semibold text-foreground mb-1">User:</p>
                <p className="text-muted-foreground font-mono text-sm">{user ? user.email : "None"}</p>
              </div>
              <div className="p-3 bg-secondary rounded-lg">
                <p className="font-semibold text-foreground mb-1">User ID:</p>
                <p className="text-muted-foreground font-mono text-sm break-all">{user ? user.uid : "None"}</p>
              </div>
              <div className="p-3 bg-secondary rounded-lg">
                <p className="font-semibold text-foreground mb-1">Profile:</p>
                <pre className="text-muted-foreground font-mono text-xs mt-2 overflow-auto">{userProfile ? JSON.stringify(userProfile, null, 2) : "None"}</pre>
              </div>
              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
                  <p className="font-semibold text-destructive mb-1">Error:</p>
                  <p className="text-destructive text-sm">{error}</p>
                </div>
              )}
            </div>
          </div>

          {/* Supabase Config */}
          <div className="modern-card p-6">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
              Supabase Config
            </h2>
            <div className="space-y-3">
              <div className="p-3 bg-secondary rounded-lg">
                <p className="font-semibold text-foreground mb-1">Project URL:</p>
                <p className="text-muted-foreground font-mono text-sm break-all">{supabaseUrl}</p>
              </div>
              <div className="flex justify-between items-center p-3 bg-secondary rounded-lg">
                <span className="font-semibold text-foreground">Anon Key:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"}`}>
                  {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Configured" : "Missing"}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-secondary rounded-lg">
                <span className="font-semibold text-foreground">Client Status:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${supabase ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"}`}>
                  {supabase ? "Connected" : "Not Connected"}
                </span>
              </div>
            </div>
          </div>

          {/* Database Users */}
          <div className="modern-card p-6 lg:col-span-2">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse"></div>
              Database Users
            </h2>
            {dbError ? (
              <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
                <p className="text-destructive font-semibold">Error: {dbError}</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">Total Users:</span>
                  <span className="px-4 py-1 bg-primary/20 text-primary rounded-full font-bold">{users.length}</span>
                </div>
                {users.length === 0 ? (
                  <div className="p-6 bg-secondary rounded-lg text-center">
                    <p className="text-muted-foreground">No users found in database</p>
                    <a href="/setup" className="inline-block mt-4 btn-primary">
                      Create Test Users
                    </a>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {users.map((user, index) => (
                      <div key={index} className="p-4 bg-secondary rounded-lg border border-border">
                        <pre className="text-sm text-foreground font-mono overflow-auto">{JSON.stringify(user, null, 2)}</pre>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-4">
          <a href="/setup" className="btn-primary flex-1 text-center">
            Setup Test Users
          </a>
          <a href="/login" className="btn-secondary flex-1 text-center">
            Go to Login
          </a>
        </div>
      </div>
    </div>
  )
}