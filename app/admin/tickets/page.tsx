"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Mail, User, Calendar, CheckCircle, Clock, AlertCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface Ticket {
  id: string
  name: string
  email: string
  subject: string
  message: string
  status: "open" | "in_progress" | "closed"
  created_at: string
  user_id?: string
}

export default function SupportTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<"all" | "open" | "in_progress" | "closed">("all")

  useEffect(() => {
    fetchTickets()
  }, [])

  const fetchTickets = async () => {
    try {
      const { data, error } = await supabase
        .from("support_tickets")
        .select("id, name, email, subject, message, status, created_at, user_id")
        .order("created_at", { ascending: false })

      if (error) throw error

      setTickets(data || [])
    } catch (error) {
      console.error("Error fetching tickets:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateTicketStatus = async (ticketId: string, newStatus: "open" | "in_progress" | "closed") => {
    try {
      const { error } = await supabase
        .from("support_tickets")
        .update({ status: newStatus })
        .eq("id", ticketId)

      if (error) throw error

      setTickets(tickets.map(t => t.id === ticketId ? { ...t, status: newStatus } : t))
    } catch (error) {
      console.error("Error updating ticket:", error)
    }
  }

  const filteredTickets = filterStatus === "all" 
    ? tickets 
    : tickets.filter(t => t.status === filterStatus)

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

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="modern-card p-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">Support Tickets</h1>
        <p className="text-muted-foreground text-lg">View and manage support requests from team members</p>
      </motion.div>

      {/* Filter Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex gap-2 flex-wrap"
      >
        {(["all", "open", "in_progress", "closed"] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-smooth capitalize ${
              filterStatus === status
                ? "bg-primary text-white"
                : "bg-secondary/50 text-foreground hover:bg-secondary"
            }`}
          >
            {status === "all" ? "All Tickets" : status.replace("_", " ")}
            {status !== "all" && (
              <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                {tickets.filter(t => t.status === status).length}
              </span>
            )}
          </button>
        ))}
      </motion.div>

      {/* Tickets List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary"></div>
            <p className="mt-4 text-foreground">Loading tickets...</p>
          </div>
        ) : filteredTickets.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="modern-card p-12 text-center">
            <Mail className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-foreground text-lg">No {filterStatus !== "all" ? filterStatus : ""} tickets found</p>
            <p className="text-muted-foreground text-sm mt-2">
              {filterStatus === "all" 
                ? "Support tickets from team members will appear here" 
                : `No tickets with status: ${filterStatus.replace("_", " ")}`}
            </p>
          </motion.div>
        ) : (
          filteredTickets.map((ticket, index) => (
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
                        <User className="w-4 h-4" />
                        <span>{ticket.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        <span>{ticket.email}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <select
                    value={ticket.status}
                    onChange={(e) => updateTicketStatus(ticket.id, e.target.value as any)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium border-2 ${getStatusColor(ticket.status)}`}
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
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
          <p className="text-foreground text-sm font-semibold">Open Tickets</p>
          <p className="text-3xl font-bold text-primary">{tickets.filter(t => t.status === "open").length}</p>
        </div>
        <div className="glass-panel p-6 space-y-2">
          <p className="text-foreground text-sm font-semibold">In Progress</p>
          <p className="text-3xl font-bold text-warning">{tickets.filter(t => t.status === "in_progress").length}</p>
        </div>
        <div className="glass-panel p-6 space-y-2">
          <p className="text-foreground text-sm font-semibold">Closed</p>
          <p className="text-3xl font-bold text-success">{tickets.filter(t => t.status === "closed").length}</p>
        </div>
      </motion.div>
    </div>
  )
}
