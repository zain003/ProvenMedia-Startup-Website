"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Mail, Calendar, CheckCircle, Clock, AlertCircle, RefreshCw } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase"

interface Ticket {
  id: string
  subject: string
  message: string
  status: "open" | "in_progress" | "closed"
  created_at: string
}

export default function MyTicketsPage() {
  const { userProfile } = useAuth()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTickets()
  }, [userProfile])

  const fetchTickets = async () => {
    if (!userProfile) return

    try {
      const { data, error } = await supabase
        .from("support_tickets")
        .select("id, name, email, subject, message, status, created_at")
        .eq("user_id", userProfile.uid)
        .order("created_at", { ascending: false })

      if (error) throw error

      setTickets(data || [])
    } catch (error) {
      console.error("Error fetching tickets:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "closed":
        return <CheckCircle className="w-5 h-5 text-success" />
      case "in_progress":
        return <Clock className="w-5 h-5 text-warning" />
      case "open":
        return <AlertCircle className="w-5 h-5 text-primary" />
      default:
        return <Mail className="w-5 h-5 text-muted-foreground" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "closed":
        return "bg-success/20 text-success border-success/30"
      case "in_progress":
        return "bg-warning/20 text-warning border-warning/30"
      case "open":
        return "bg-primary/20 text-primary border-primary/30"
      default:
        return "bg-secondary text-foreground border-border"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "closed":
        return "Closed"
      case "in_progress":
        return "In Progress"
      case "open":
        return "Open"
      default:
        return status
    }
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="modern-card p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">My Support Tickets</h1>
            <p className="text-muted-foreground text-lg">Track your support requests and their status</p>
          </div>
          <button
            onClick={fetchTickets}
            className="p-3 bg-primary/10 hover:bg-primary/20 rounded-xl transition-smooth text-primary"
            title="Refresh tickets"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </motion.div>

      {/* Tickets List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary"></div>
            <p className="mt-4 text-foreground">Loading your tickets...</p>
          </div>
        ) : tickets.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="modern-card p-12 text-center">
            <Mail className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-foreground text-lg">No support tickets yet</p>
            <p className="text-muted-foreground text-sm mt-2">
              Submit a ticket from the Support page to get help
            </p>
            <a
              href="/member/support"
              className="inline-block mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-smooth font-medium"
            >
              Submit a Ticket
            </a>
          </motion.div>
        ) : (
          tickets.map((ticket, index) => (
            <motion.div
              key={ticket.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass-panel p-6 space-y-4 hover:shadow-lg hover:shadow-primary/10 transition-smooth"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="mt-1">{getStatusIcon(ticket.status)}</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground">{ticket.subject}</h3>
                    <p className="text-foreground text-sm mt-2">{ticket.message}</p>
                    
                    <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>Submitted: {new Date(ticket.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <span className={`px-4 py-2 rounded-lg text-sm font-medium border-2 ${getStatusColor(ticket.status)}`}>
                    {getStatusLabel(ticket.status)}
                  </span>
                </div>
              </div>

              {/* Status explanation */}
              <div className="pt-3 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  {ticket.status === "open" && "⏳ Your ticket is waiting to be reviewed by admin"}
                  {ticket.status === "in_progress" && "🔄 Admin is working on your request"}
                  {ticket.status === "closed" && "✅ Your ticket has been resolved"}
                </p>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Stats */}
      {tickets.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="glass-panel p-6 space-y-2">
            <p className="text-foreground text-sm font-semibold">Open Tickets</p>
            <p className="text-3xl font-bold text-primary">{tickets.filter(t => t.status === "open").length}</p>
          </div>
          <div className="glass-panel p-6 space-y-2">
            <p className="text-foreground text-sm font-semibold">In Progress</p>
            <p className="text-3xl font-bold text-warning">{tickets.filter(t => t.status === "in_progress").length}</p>
          </div>
          <div className="glass-panel p-6 space-y-2">
            <p className="text-foreground text-sm font-semibold">Resolved</p>
            <p className="text-3xl font-bold text-success">{tickets.filter(t => t.status === "closed").length}</p>
          </div>
        </motion.div>
      )}
    </div>
  )
}
