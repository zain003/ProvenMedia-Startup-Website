"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import Loading from "@/components/ui/loading"
import { motion } from "framer-motion"
import { AlertCircle, CheckCircle, ExternalLink } from "lucide-react"

export default function Home() {
  const router = useRouter()
  const { user, userProfile, loading, error } = useAuth()
  const [showSetup, setShowSetup] = useState(false)

  useEffect(() => {
    // Check if Supabase is configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseKey || supabaseUrl === 'your_project_url_here') {
      setShowSetup(true)
      return
    }

    console.log("Home page auth state:", { loading, user: !!user, userProfile, error })
    
    // Redirect immediately if not loading
    if (!loading) {
      if (error) {
        console.warn("Auth error, redirecting to login:", error)
        router.push("/login")
      } else if (!user) {
        console.log("No user, redirecting to login")
        router.push("/login")
      } else if (userProfile) {
        console.log("User profile found, redirecting based on role:", userProfile.role)
        if (userProfile.role === "admin") {
          router.replace("/admin")
        } else if (userProfile.role === "member") {
          router.replace("/member")
        } else {
          console.error("Unknown user role:", userProfile.role)
          router.push("/login")
        }
      } else {
        // User exists but profile not loaded yet - wait a bit longer
        console.log("User exists but no profile yet, waiting...")
      }
    }
  }, [user, userProfile, loading, error, router])

  if (showSetup) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="modern-card p-8 text-center"
          >
            <div className="w-16 h-16 bg-warning/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-warning" />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Supabase Setup Required</h1>
            <p className="text-muted-foreground text-lg">
              Your app needs to be connected to Supabase to work properly
            </p>
          </motion.div>

          {/* Setup Steps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="modern-card p-8 space-y-6"
          >
            <h2 className="text-2xl font-bold text-foreground mb-4">Quick Setup (5 minutes)</h2>
            
            <div className="space-y-4">
              {/* Step 1 */}
              <div className="flex gap-4 p-4 bg-secondary/50 rounded-xl">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-foreground mb-2">Create Supabase Project</h3>
                  <p className="text-muted-foreground text-sm mb-3">
                    Sign up at Supabase and create a new project
                  </p>
                  <a
                    href="https://supabase.com/dashboard"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                  >
                    Go to Supabase Dashboard
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-4 p-4 bg-secondary/50 rounded-xl">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-foreground mb-2">Get Your Credentials</h3>
                  <p className="text-muted-foreground text-sm">
                    In your Supabase project, go to <strong>Settings → API</strong> and copy:
                  </p>
                  <ul className="text-muted-foreground text-sm mt-2 space-y-1">
                    <li>• Project URL</li>
                    <li>• anon/public key</li>
                  </ul>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4 p-4 bg-secondary/50 rounded-xl">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-foreground mb-2">Update .env.local</h3>
                  <p className="text-muted-foreground text-sm mb-3">
                    Open <code className="bg-secondary px-2 py-1 rounded">.env.local</code> in your project and paste your credentials
                  </p>
                  <div className="bg-background p-4 rounded-lg border border-border font-mono text-xs">
                    <div className="text-muted-foreground">NEXT_PUBLIC_SUPABASE_URL=your_url_here</div>
                    <div className="text-muted-foreground">NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key_here</div>
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex gap-4 p-4 bg-secondary/50 rounded-xl">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                  4
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-foreground mb-2">Run Database Schema</h3>
                  <p className="text-muted-foreground text-sm">
                    In Supabase <strong>SQL Editor</strong>, copy and run the contents of <code className="bg-secondary px-2 py-1 rounded">supabase-schema.sql</code>
                  </p>
                </div>
              </div>

              {/* Step 5 */}
              <div className="flex gap-4 p-4 bg-secondary/50 rounded-xl">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                  5
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-foreground mb-2">Create Storage Bucket</h3>
                  <p className="text-muted-foreground text-sm">
                    In Supabase <strong>Storage</strong>, create a new bucket named <code className="bg-secondary px-2 py-1 rounded">files</code> and make it public
                  </p>
                </div>
              </div>

              {/* Step 6 */}
              <div className="flex gap-4 p-4 bg-secondary/50 rounded-xl">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                  6
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-foreground mb-2">Create Admin User</h3>
                  <p className="text-muted-foreground text-sm mb-2">
                    In Supabase dashboard:
                  </p>
                  <ol className="text-muted-foreground text-sm space-y-1 ml-4 list-decimal">
                    <li>Go to <strong>Authentication → Users</strong></li>
                    <li>Click <strong>Add User</strong></li>
                    <li>Email: <code className="bg-secondary px-1 rounded">zain@provenmedia.nl</code></li>
                    <li>Password: <code className="bg-secondary px-1 rounded">Welkom26!</code></li>
                    <li>Copy the User ID (UUID)</li>
                    <li>Go to <strong>SQL Editor</strong> and run:</li>
                  </ol>
                  <div className="bg-background p-3 rounded-lg border border-border font-mono text-xs mt-2">
                    <div className="text-muted-foreground">INSERT INTO users (uid, email, name, role, status, join_date)</div>
                    <div className="text-muted-foreground">VALUES ('PASTE-USER-ID', 'zain@provenmedia.nl', 'Zain', 'admin', 'active', NOW());</div>
                  </div>
                </div>
              </div>

              {/* Step 7 */}
              <div className="flex gap-4 p-4 bg-secondary/50 rounded-xl">
                <div className="flex-shrink-0 w-8 h-8 bg-success text-white rounded-full flex items-center justify-center font-bold">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-foreground mb-2">Restart Dev Server & Login</h3>
                  <p className="text-muted-foreground text-sm mb-3">
                    After updating .env.local, restart your development server
                  </p>
                  <div className="bg-background p-3 rounded-lg border border-border font-mono text-sm mb-3">
                    <span className="text-muted-foreground">npm run dev</span>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Then go to <code className="bg-secondary px-2 py-1 rounded">/login</code> and use your admin credentials
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Documentation Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="modern-card p-6"
          >
            <h3 className="font-bold text-foreground mb-4">📚 Documentation</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <a href="/QUICK-START.md" className="p-3 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors">
                <p className="font-semibold text-foreground">Quick Start Guide</p>
                <p className="text-sm text-muted-foreground">5-minute setup walkthrough</p>
              </a>
              <a href="/SETUP-CHECKLIST.md" className="p-3 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors">
                <p className="font-semibold text-foreground">Setup Checklist</p>
                <p className="text-sm text-muted-foreground">Verify your configuration</p>
              </a>
              <a href="/supabase-schema.sql" className="p-3 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors">
                <p className="font-semibold text-foreground">Database Schema</p>
                <p className="text-sm text-muted-foreground">SQL to run in Supabase</p>
              </a>
              <a href="/MIGRATION-COMPLETE.md" className="p-3 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors">
                <p className="font-semibold text-foreground">Migration Guide</p>
                <p className="text-sm text-muted-foreground">Detailed instructions</p>
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Loading size="lg" text="Loading..." />
    </div>
  )
}
