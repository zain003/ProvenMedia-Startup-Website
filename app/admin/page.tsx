"use client"

import { motion } from "framer-motion"
import { BarChart3, Users, FileText, TrendingUp, Upload, Mail } from "lucide-react"
import { memo, useMemo, useState, useEffect } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

const AdminDashboard = memo(function AdminDashboard() {
  const [teamCount, setTeamCount] = useState(0)
  const [filesCount, setFilesCount] = useState(0)
  const [tasksCount, setTasksCount] = useState(0)
  const [storageUsed, setStorageUsed] = useState("0 MB")
  const [loading, setLoading] = useState(false) // Start as false for faster initial render
  const [recentFiles, setRecentFiles] = useState<any[]>([])
  const [ticketsCount, setTicketsCount] = useState(0)

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true)
      try {
        // Fetch all data in parallel for better performance
        const [usersResult, filesResult, tasksResult, ticketsResult] = await Promise.all([
          // Get team members count (only active members) - only count, no data
          supabase
            .from("users")
            .select("id", { count: "exact", head: true })
            .eq("role", "member")
            .neq("status", "Deleted"),
          
          // Get files with only needed fields
          supabase
            .from("files")
            .select("id, name, size, assigned_to_name")
            .order("uploaded_at", { ascending: false })
            .limit(4),
          
          // Get tasks count only
          supabase
            .from("tasks")
            .select("id", { count: "exact", head: true }),
          
          // Get open tickets count only
          supabase
            .from("support_tickets")
            .select("id", { count: "exact", head: true })
            .eq("status", "open")
        ])

        if (usersResult.error) throw usersResult.error
        if (filesResult.error) throw filesResult.error
        if (tasksResult.error) throw tasksResult.error
        if (ticketsResult.error) throw ticketsResult.error

        setTeamCount(usersResult.count || 0)
        setFilesCount(filesResult.data?.length || 0)
        setTasksCount(tasksResult.count || 0)
        setTicketsCount(ticketsResult.count || 0)

        // Calculate storage from the limited file results
        const totalBytes = filesResult.data?.reduce((sum, file) => {
          return sum + (file.size || 0)
        }, 0) || 0

        // Format storage size
        const formatSize = (bytes: number) => {
          if (bytes === 0) return "0 MB"
          const k = 1024
          const sizes = ["Bytes", "KB", "MB", "GB"]
          const i = Math.floor(Math.log(bytes) / Math.log(k))
          return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i]
        }

        setStorageUsed(formatSize(totalBytes))
        setRecentFiles(filesResult.data || [])
      } catch (error: any) {
        console.error("Error fetching stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const stats = useMemo(() => [
    { label: "Team Members", value: loading ? "..." : teamCount.toString(), icon: Users, color: "from-primary" },
    { label: "Open Tickets", value: loading ? "..." : ticketsCount.toString(), icon: Mail, color: "from-warning" },
    { label: "Files Uploaded", value: loading ? "..." : filesCount.toString(), icon: FileText, color: "from-accent" },
    { label: "Active Tasks", value: loading ? "..." : tasksCount.toString(), icon: TrendingUp, color: "from-success" },
  ], [teamCount, ticketsCount, filesCount, tasksCount, loading])

  return (
    <div className="p-8 space-y-8 bg-gradient-to-br from-primary/5 via-background to-accent/5 min-h-screen">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="modern-card p-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground text-lg">Welcome back, manage your workspace</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          const gradientClass = stat.color === "from-primary" ? "gradient-primary" : 
                               stat.color === "from-accent" ? "bg-gradient-to-br from-accent to-primary" :
                               stat.color === "from-success" ? "gradient-success" :
                               "bg-gradient-to-br from-warning to-accent"
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="modern-card p-6 hover:scale-105 transition-transform duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-14 h-14 ${gradientClass} rounded-xl flex items-center justify-center shadow-lg`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
              </div>
              <div>
                <p className="text-muted-foreground text-sm font-medium mb-1">{stat.label}</p>
                <p className="text-4xl font-bold text-foreground">{stat.value}</p>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="modern-card p-8"
      >
        <h2 className="text-2xl font-bold text-foreground mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link 
            href="/admin/team"
            className="p-5 bg-primary/10 hover:bg-primary/20 border-2 border-primary/30 hover:border-primary rounded-xl transition-all duration-200 text-primary font-semibold text-lg hover:shadow-lg hover:shadow-primary/20 active:scale-95 flex items-center justify-center gap-2"
          >
            <Users className="w-5 h-5" />
            Manage Team
          </Link>
          <Link 
            href="/admin/upload"
            className="p-5 bg-accent/10 hover:bg-accent/20 border-2 border-accent/30 hover:border-accent rounded-xl transition-all duration-200 text-accent font-semibold text-lg hover:shadow-lg hover:shadow-accent/20 active:scale-95 flex items-center justify-center gap-2"
          >
            <Upload className="w-5 h-5" />
            Upload Files
          </Link>
          <Link 
            href="/admin/files"
            className="p-5 bg-success/10 hover:bg-success/20 border-2 border-success/30 hover:border-success rounded-xl transition-all duration-200 text-success font-semibold text-lg hover:shadow-lg hover:shadow-success/20 active:scale-95 flex items-center justify-center gap-2"
          >
            <FileText className="w-5 h-5" />
            All Files
          </Link>
        </div>
      </motion.div>

      {/* Recent Files */}
      {recentFiles.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="modern-card p-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">Recent Files</h2>
            <Link href="/admin/files" className="text-primary hover:underline text-sm font-medium">
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentFiles.map((file, index) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="p-4 bg-secondary/50 rounded-xl border border-border hover:border-primary/30 transition-smooth"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate text-sm">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {file.assigned_to_name}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
})

export default AdminDashboard
