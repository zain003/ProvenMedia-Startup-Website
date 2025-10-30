"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Search, Trash2, Plus } from "lucide-react"
import { supabase } from "@/lib/supabase"
import AddMemberModal from "@/components/admin/add-member-modal"

interface TeamMember {
  id: string
  name: string
  email: string
  joinDate: string
}

export default function ManageTeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetchTeamMembers()
  }, [])

  const fetchTeamMembers = async () => {
    try {
      setLoading(true)
      
      // Add timeout protection
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      )
      
      const queryPromise = supabase
        .from("users")
        .select("id, name, email, join_date")
        .eq("role", "member")
        .neq("status", "Deleted")
        .order("name")

      const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any

      if (error) throw error

      const teamData: TeamMember[] = (data || []).map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        joinDate: user.join_date ? new Date(user.join_date).toLocaleDateString() : new Date().toLocaleDateString(),
      }))

      setMembers(teamData)
    } catch (error: any) {
      console.error("Error fetching team members:", error)
      alert(`Failed to load team members: ${error.message}. Please refresh the page.`)
      setMembers([]) // Set empty array on error
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (memberId: string) => {
    if (confirm("⚠️ This will mark the member as deleted. They will not appear in the system anymore. Are you sure?")) {
      try {
        const member = members.find(m => m.id === memberId)
        if (!member) return
        
        // Mark user as deleted instead of actually deleting
        const { data: updateData, error: dbError } = await supabase
          .from("users")
          .update({ status: "Deleted" })
          .eq("id", memberId)
          .select()

        if (dbError) {
          console.error("Failed to delete member:", dbError)
          throw dbError
        }
        
        if (!updateData || updateData.length === 0) {
          throw new Error("Failed to update user status")
        }

        // Remove from local state
        setMembers(members.filter((m) => m.id !== memberId))
        
        alert("✓ Member deleted successfully from the system.")
      } catch (error) {
        console.error("Error deleting member:", error)
        alert("Failed to delete member. Please try again.")
      }
    }
  }

  const filteredMembers = members.filter(
    (member) =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="modern-card p-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Manage Team</h1>
            <p className="text-muted-foreground text-lg">View and manage all team members</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsModalOpen(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Member
          </motion.button>
        </div>
        
        {/* Info Banner */}
        <div className="mt-4 p-4 bg-warning/10 border-2 border-warning/30 rounded-xl">
          <p className="text-sm text-foreground">
            <strong>⚠️ Warning:</strong> Deleting a member will mark them as deleted in the system. 
            They will not appear in any lists and cannot login. The data remains in the database for record-keeping.
          </p>
        </div>
      </motion.div>

      {/* Search */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="relative">
          <Search className="absolute left-4 top-3 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-secondary/50 border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-smooth text-foreground placeholder-muted"
          />
        </div>
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-panel overflow-hidden"
      >
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="p-8 text-center text-foreground">No team members found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Join Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((member, index) => (
                  <motion.tr
                    key={member.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-border/50 hover:bg-secondary/30 transition-smooth"
                  >
                    <td className="px-6 py-4 text-foreground font-medium">{member.name}</td>
                    <td className="px-6 py-4 text-foreground">{member.email}</td>
                    <td className="px-6 py-4 text-foreground text-sm">{member.joinDate}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDelete(member.id)}
                        className="p-2 hover:bg-error/20 rounded-lg transition-smooth text-error"
                        title="Delete member"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      <AddMemberModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={fetchTeamMembers} />
    </div>
  )
}
