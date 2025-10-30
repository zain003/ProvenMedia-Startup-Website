"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { CheckCircle2, Circle, Clock, AlertCircle } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase"

interface Task {
  id: string
  title: string
  description: string
  status: "In Progress" | "On Hold" | "Finished"
  dueDate: string
  priority: "High" | "Medium" | "Low"
  assignedBy: string
}

export default function MyTasksPage() {
  const { userProfile } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<"all" | "In Progress" | "On Hold" | "Finished">("all")

  useEffect(() => {
    const fetchTasks = async () => {
      if (!userProfile) return

      try {
        const { data, error } = await supabase
          .from("tasks")
          .select("id, title, description, status, due_date, priority, assigned_by")
          .eq("assigned_to", userProfile.uid)
          .order("due_date", { ascending: true })

        if (error) throw error

        const tasksList: Task[] = (data || []).map((task) => ({
          id: task.id,
          title: task.title,
          description: task.description,
          status: task.status,
          dueDate: task.due_date,
          priority: task.priority,
          assignedBy: task.assigned_by,
        }))

        setTasks(tasksList)
      } catch (error) {
        console.error("Error fetching tasks:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTasks()
  }, [userProfile])

  const filteredTasks = filterStatus === "all" ? tasks : tasks.filter((t) => t.status === filterStatus)

  const updateTaskStatus = async (taskId: string, newStatus: "In Progress" | "On Hold" | "Finished") => {
    try {
      const { error } = await supabase
        .from("tasks")
        .update({ status: newStatus })
        .eq("id", taskId)

      if (error) throw error

      // Update local state
      setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t))
    } catch (error) {
      console.error("Error updating task status:", error)
      alert("Failed to update task status. Please try again.")
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Finished":
        return <CheckCircle2 className="w-5 h-5 text-success" />
      case "In Progress":
        return <Circle className="w-5 h-5 text-primary" />
      case "On Hold":
        return <AlertCircle className="w-5 h-5 text-warning" />
      default:
        return <Circle className="w-5 h-5 text-muted" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-error/20 text-error"
      case "Medium":
        return "bg-warning/20 text-warning"
      case "Low":
        return "bg-success/20 text-success"
      default:
        return "bg-muted/20 text-muted"
    }
  }

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date() && dueDate !== ""
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <div>
          <h1 className="text-4xl font-bold text-foreground">My Tasks</h1>
          <p className="text-muted-foreground text-lg">Track your assigned tasks and deadlines</p>
        </div>
      </motion.div>

      {/* Filter Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex gap-2 flex-wrap"
      >
        {(["all", "In Progress", "On Hold", "Finished"] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-smooth ${
              filterStatus === status
                ? "bg-primary text-white"
                : "bg-secondary/50 text-foreground hover:bg-secondary"
            }`}
          >
            {status === "all" ? "All Tasks" : status}
          </button>
        ))}
      </motion.div>

      {/* Tasks List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary"></div>
            <p className="mt-4 text-foreground">Loading tasks...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="modern-card p-12 text-center">
            <p className="text-foreground">No tasks assigned to you yet</p>
          </motion.div>
        ) : (
          filteredTasks.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass-panel p-6 space-y-4 hover:shadow-lg hover:shadow-primary/10 transition-smooth"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="mt-1">{getStatusIcon(task.status)}</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground">{task.title}</h3>
                    <p className="text-foreground text-sm mt-1">{task.description}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                  <select
                    value={task.status}
                    onChange={(e) => updateTaskStatus(task.id, e.target.value as any)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium border-2 ${
                      task.status === "Finished"
                        ? "bg-success/20 text-success border-success/30"
                        : task.status === "In Progress"
                        ? "bg-primary/20 text-primary border-primary/30"
                        : "bg-warning/20 text-warning border-warning/30"
                    }`}
                  >
                    <option value="In Progress">In Progress</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Finished">Finished</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <Clock className="w-4 h-4" />
                  <span>
                    Due: {new Date(task.dueDate).toLocaleDateString()}
                    {isOverdue(task.dueDate) && <span className="text-error ml-2">(Overdue)</span>}
                  </span>
                </div>
                <span className="text-xs text-foreground">Assigned by {task.assignedBy}</span>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <div className="glass-panel p-6 space-y-2">
          <p className="text-foreground text-sm font-semibold">In Progress</p>
          <p className="text-3xl font-bold text-primary">{tasks.filter((t) => t.status === "In Progress").length}</p>
        </div>
        <div className="glass-panel p-6 space-y-2">
          <p className="text-foreground text-sm font-semibold">On Hold</p>
          <p className="text-3xl font-bold text-warning">{tasks.filter((t) => t.status === "On Hold").length}</p>
        </div>
        <div className="glass-panel p-6 space-y-2">
          <p className="text-foreground text-sm font-semibold">Finished</p>
          <p className="text-3xl font-bold text-success">{tasks.filter((t) => t.status === "Finished").length}</p>
        </div>
      </motion.div>
    </div>
  )
}
