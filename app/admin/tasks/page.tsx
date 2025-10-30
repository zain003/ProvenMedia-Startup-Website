"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Plus, Edit2, Trash2, CheckCircle, Clock, AlertCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/auth-context"

interface Task {
  id: string
  title: string
  description: string
  status: "In Progress" | "On Hold" | "Finished"
  dueDate: string
  priority: "High" | "Medium" | "Low"
  assignedTo: string
  assignedToName: string
  createdAt: string
}

interface TeamMember {
  id: string
  name: string
  email: string
}

export default function AdminTasksPage() {
  const { userProfile } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "In Progress" as "In Progress" | "On Hold" | "Finished",
    dueDate: "",
    priority: "Medium" as "High" | "Medium" | "Low",
    assignedTo: "",
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch tasks and members in parallel
      const [tasksResult, membersResult] = await Promise.all([
        supabase
          .from("tasks")
          .select("id, title, description, status, due_date, priority, assigned_to, assigned_to_name, created_at")
          .order("created_at", { ascending: false }),
        supabase
          .from("users")
          .select("uid, name, email")
          .eq("role", "member")
          .neq("status", "Deleted")
          .order("name")
      ])

      if (tasksResult.error) throw tasksResult.error
      if (membersResult.error) throw membersResult.error

      const tasksList: Task[] = (tasksResult.data || []).map((task) => ({
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        dueDate: task.due_date,
        priority: task.priority,
        assignedTo: task.assigned_to,
        assignedToName: task.assigned_to_name,
        createdAt: task.created_at,
      }))

      const membersList: TeamMember[] = (membersResult.data || []).map((user) => ({
        id: user.uid,
        name: user.name,
        email: user.email,
      }))

      setTasks(tasksList)
      setMembers(membersList)
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const selectedMember = members.find(m => m.id === formData.assignedTo)
    if (!selectedMember) return

    try {
      if (editingTask) {
        // Update existing task
        const { error } = await supabase
          .from("tasks")
          .update({
            title: formData.title,
            description: formData.description,
            status: formData.status,
            due_date: formData.dueDate,
            priority: formData.priority,
            assigned_to: formData.assignedTo,
            assigned_to_name: selectedMember.name,
          })
          .eq("id", editingTask.id)

        if (error) throw error

        setTasks(tasks.map(t => t.id === editingTask.id ? {
          ...t,
          ...formData,
          assignedToName: selectedMember.name,
        } : t))
      } else {
        // Create new task
        const { data, error } = await supabase
          .from("tasks")
          .insert({
            title: formData.title,
            description: formData.description,
            status: formData.status,
            due_date: formData.dueDate,
            priority: formData.priority,
            assigned_to: formData.assignedTo,
            assigned_to_name: selectedMember.name,
            assigned_by: userProfile?.name || "Admin",
            created_at: new Date().toISOString(),
          })
          .select()
          .single()

        if (error) throw error
        
        setTasks([...tasks, {
          id: data.id,
          ...formData,
          assignedToName: selectedMember.name,
          createdAt: new Date().toISOString(),
        }])
      }

      // Reset form
      setFormData({
        title: "",
        description: "",
        status: "In Progress",
        dueDate: "",
        priority: "Medium",
        assignedTo: "",
      })
      setIsModalOpen(false)
      setEditingTask(null)
    } catch (error) {
      console.error("Error saving task:", error)
    }
  }

  const handleEdit = (task: Task) => {
    setEditingTask(task)
    setFormData({
      title: task.title,
      description: task.description,
      status: task.status,
      dueDate: task.dueDate,
      priority: task.priority,
      assignedTo: task.assignedTo,
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return

    try {
      const { error } = await supabase.from("tasks").delete().eq("id", taskId)

      if (error) throw error

      setTasks(tasks.filter(t => t.id !== taskId))
    } catch (error) {
      console.error("Error deleting task:", error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Finished":
        return <CheckCircle className="w-5 h-5 text-success" />
      case "In Progress":
        return <Clock className="w-5 h-5 text-primary" />
      case "On Hold":
        return <AlertCircle className="w-5 h-5 text-warning" />
      default:
        return <Clock className="w-5 h-5 text-muted-foreground" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-destructive/20 text-destructive border-destructive/30"
      case "Medium":
        return "bg-warning/20 text-warning border-warning/30"
      case "Low":
        return "bg-success/20 text-success border-success/30"
      default:
        return "bg-secondary text-foreground border-border"
    }
  }

  return (
    <div className="p-8 space-y-8 bg-gradient-to-br from-primary/5 via-background to-accent/5 min-h-screen">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="modern-card p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Task Management</h1>
            <p className="text-muted-foreground text-lg">Assign and manage tasks for team members</p>
          </div>
          <button
            onClick={() => {
              setEditingTask(null)
              setFormData({
                title: "",
                description: "",
                status: "In Progress",
                dueDate: "",
                priority: "Medium",
                assignedTo: "",
              })
              setIsModalOpen(true)
            }}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create Task
          </button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="modern-card p-6"
        >
          <p className="text-sm text-muted-foreground font-semibold mb-1">Total Tasks</p>
          <p className="text-4xl font-bold text-foreground">{tasks.length}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="modern-card p-6"
        >
          <p className="text-sm text-muted-foreground font-semibold mb-1">In Progress</p>
          <p className="text-4xl font-bold text-primary">{tasks.filter(t => t.status === "In Progress").length}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="modern-card p-6"
        >
          <p className="text-sm text-muted-foreground font-semibold mb-1">On Hold</p>
          <p className="text-4xl font-bold text-warning">{tasks.filter(t => t.status === "On Hold").length}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="modern-card p-6"
        >
          <p className="text-sm text-muted-foreground font-semibold mb-1">Completed</p>
          <p className="text-4xl font-bold text-success">{tasks.filter(t => t.status === "Finished").length}</p>
        </motion.div>
      </div>

      {/* Tasks List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="modern-card p-8"
      >
        <h2 className="text-2xl font-bold text-foreground mb-6">All Tasks</h2>
        
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary"></div>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-foreground mb-4">No tasks created yet</p>
            <button onClick={() => setIsModalOpen(true)} className="btn-primary">
              Create Your First Task
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-6 bg-secondary/50 rounded-xl border border-border hover:border-primary/30 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="mt-1">{getStatusIcon(task.status)}</div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-foreground">{task.title}</h3>
                      <p className="text-foreground text-sm mt-1">{task.description}</p>
                      <div className="flex items-center gap-4 mt-3">
                        <span className="text-sm text-foreground">
                          <strong>Assigned to:</strong> {task.assignedToName}
                        </span>
                        <span className="text-sm text-foreground">
                          <strong>Due:</strong> {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                        <span className={`px-3 py-1 rounded-lg text-sm font-semibold border ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(task)}
                      className="p-3 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(task.id)}
                      className="p-3 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="modern-card p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-2xl font-bold text-foreground mb-6">
              {editingTask ? "Edit Task" : "Create New Task"}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Task Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter task title"
                  className="input-modern"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter task description"
                  rows={3}
                  className="input-modern"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Assign To</label>
                  <select
                    value={formData.assignedTo}
                    onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                    className="input-modern"
                    required
                  >
                    <option value="">Select member</option>
                    {members.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Due Date</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="input-modern"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="input-modern"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="input-modern"
                  >
                    <option value="In Progress">In Progress</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Finished">Finished</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="submit" className="btn-primary flex-1">
                  {editingTask ? "Update Task" : "Create Task"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false)
                    setEditingTask(null)
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}
