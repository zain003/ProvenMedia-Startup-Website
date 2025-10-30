"use client"

import { motion } from "framer-motion"
import { useAuth } from "@/lib/auth-context"
import { CheckCircle, FileText, MessageSquare } from "lucide-react"
import { memo, useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

interface Task {
  id: string
  title: string
  status: string
  dueDate: string
}

const MemberDashboard = memo(function MemberDashboard() {
  const { userProfile } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [tasksCount, setTasksCount] = useState(0)
  const [filesCount, setFilesCount] = useState(0)
  const [ticketsCount, setTicketsCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (!userProfile) return

      try {
        // Fetch tasks assigned to this user
        const { data: tasksData, error: tasksError } = await supabase
          .from("tasks")
          .select("id, title, status, due_date, priority")
          .eq("assigned_to", userProfile.uid)
          .order("due_date", { ascending: true })
          .limit(10)

        if (tasksError) throw tasksError

        const userTasks: Task[] = (tasksData || []).map((task) => ({
          id: task.id,
          title: task.title,
          status: task.status,
          dueDate: new Date(task.due_date).toLocaleDateString(),
        }))

        setTasks(userTasks.slice(0, 3)) // Show only first 3 tasks
        setTasksCount(userTasks.length)

        // Fetch files assigned to this user or "all"
        const { data: filesData, error: filesError } = await supabase
          .from("files")
          .select("id, name, size")
          .or(`assigned_to.eq.${userProfile.uid},assigned_to.eq.all`)
          .order("uploaded_at", { ascending: false })
          .limit(10)

        if (filesError) throw filesError
        setFilesCount(filesData?.length || 0)

        // Fetch support tickets submitted by this user
        const { data: ticketsData, error: ticketsError } = await supabase
          .from("support_tickets")
          .select("id, status")
          .eq("user_id", userProfile.uid)
          .limit(100)

        if (ticketsError) throw ticketsError
        setTicketsCount(ticketsData?.length || 0)
      } catch (error: any) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [userProfile])

  return (
    <div className="p-8 space-y-8 bg-gradient-to-br from-primary/5 via-background to-accent/5 min-h-screen">
      {/* Welcome Section */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="modern-card p-8 space-y-4">
        <h1 className="text-4xl font-bold text-foreground">Welcome, {userProfile?.name || "Team Member"} 👋</h1>
        <p className="text-muted-foreground text-lg">Here's what you need to know today</p>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="modern-card p-6 hover:scale-105 transition-transform duration-300"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-14 h-14 gradient-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
              <CheckCircle className="w-7 h-7 text-white" />
            </div>
          </div>
          <div>
            <p className="text-muted-foreground text-sm font-medium mb-1">Active Tasks</p>
            <p className="text-4xl font-bold text-foreground">{loading ? "..." : tasksCount}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="modern-card p-6 hover:scale-105 transition-transform duration-300"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-accent to-primary rounded-xl flex items-center justify-center shadow-lg shadow-accent/30">
              <FileText className="w-7 h-7 text-white" />
            </div>
          </div>
          <div>
            <p className="text-muted-foreground text-sm font-medium mb-1">Files Available</p>
            <p className="text-4xl font-bold text-foreground">{loading ? "..." : filesCount}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="modern-card p-6 hover:scale-105 transition-transform duration-300"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-14 h-14 gradient-success rounded-xl flex items-center justify-center shadow-lg shadow-success/30">
              <MessageSquare className="w-7 h-7 text-white" />
            </div>
          </div>
          <div>
            <p className="text-muted-foreground text-sm font-medium mb-1">My Tickets</p>
            <p className="text-4xl font-bold text-foreground">{loading ? "..." : ticketsCount}</p>
          </div>
        </motion.div>
      </div>

      {/* Tasks Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="modern-card p-8"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">My Tasks</h2>
          {tasksCount > 3 && (
            <a href="/member/tasks" className="text-primary hover:underline text-sm font-semibold">
              View All ({tasksCount})
            </a>
          )}
        </div>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-primary/20 border-t-primary"></div>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No tasks assigned yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-5 bg-secondary/50 rounded-xl hover:bg-secondary transition-all duration-200 border border-border hover:border-primary/30 hover:shadow-md"
              >
                <div className="flex-1">
                  <p className="font-semibold text-foreground text-lg">{task.title}</p>
                  <p className="text-sm text-muted-foreground mt-1">Due: {task.dueDate}</p>
                </div>
                <span
                  className={`px-4 py-2 rounded-lg text-sm font-semibold shadow-sm ${
                    task.status === "In Progress"
                      ? "bg-primary/20 text-primary border border-primary/30"
                      : task.status === "On Hold"
                        ? "bg-warning/20 text-warning border border-warning/30"
                        : "bg-success/20 text-success border border-success/30"
                  }`}
                >
                  {task.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
})

export default MemberDashboard
