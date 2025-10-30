"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Search, Download, Trash2, FileText } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface FileItem {
  id: string
  name: string
  size: number
  uploadedAt: string
  uploadedBy: string
  url: string
  assignedTo: string
  assignedToName: string
}

interface TeamMember {
  id: string
  name: string
  email: string
}

export default function AllFilesPage() {
  const [files, setFiles] = useState<FileItem[]>([])
  const [members, setMembers] = useState<TeamMember[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterUser, setFilterUser] = useState("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      // Fetch files and members in parallel with only needed fields
      const [filesResult, membersResult] = await Promise.all([
        supabase
          .from("files")
          .select("id, name, size, uploaded_at, uploaded_by, url, assigned_to, assigned_to_name")
          .order("uploaded_at", { ascending: false }),
        supabase
          .from("users")
          .select("id, uid, name, email")
          .eq("role", "member")
          .neq("status", "Deleted")
          .order("name")
      ])

      if (filesResult.error) throw filesResult.error
      if (membersResult.error) throw membersResult.error

      const filesList: FileItem[] = (filesResult.data || []).map((file) => ({
        id: file.id,
        name: file.name,
        size: file.size,
        uploadedAt: file.uploaded_at ? new Date(file.uploaded_at).toLocaleDateString() : "N/A",
        uploadedBy: file.uploaded_by,
        url: file.url,
        assignedTo: file.assigned_to,
        assignedToName: file.assigned_to_name || "Unknown",
      }))

      const membersList: TeamMember[] = (membersResult.data || []).map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
      }))

      setFiles(filesList)
      setMembers(membersList)
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (fileId: string) => {
    if (confirm("Are you sure you want to delete this file?")) {
      try {
        const { error } = await supabase.from("files").delete().eq("id", fileId)

        if (error) throw error

        setFiles(files.filter((f) => f.id !== fileId))
      } catch (error) {
        console.error("Error deleting file:", error)
      }
    }
  }

  const filteredFiles = files.filter(
    (file) =>
      file.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filterUser === "all" || file.assignedTo === filterUser),
  )

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="modern-card p-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">All Files</h1>
        <p className="text-muted-foreground text-lg">Manage and view all uploaded files</p>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <div className="relative">
          <Search className="absolute left-4 top-3 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-secondary/50 border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-smooth text-foreground placeholder-muted"
          />
        </div>
        <select
          value={filterUser}
          onChange={(e) => setFilterUser(e.target.value)}
          className="input-modern"
        >
          <option value="all">All Files</option>
          <option value="all">📢 Assigned to All Members</option>
          <optgroup label="Filter by Member">
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name} ({member.email})
              </option>
            ))}
          </optgroup>
        </select>
      </motion.div>

      {/* Files Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {loading ? (
          <div className="col-span-full text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="col-span-full text-center py-12 text-foreground">No files found</div>
        ) : (
          filteredFiles.map((file, index) => (
            <motion.div
              key={file.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass-panel p-6 space-y-4 hover:shadow-lg hover:shadow-primary/10 transition-smooth"
            >
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div className="flex gap-2">
                  <a
                    href={file.url}
                    download
                    className="p-2 hover:bg-accent/20 rounded-lg transition-smooth text-accent"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => handleDelete(file.id)}
                    className="p-2 hover:bg-error/20 rounded-lg transition-smooth text-error"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div>
                <p className="font-medium text-foreground truncate">{file.name}</p>
                <p className="text-sm text-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <div className="pt-2 border-t border-border space-y-1">
                <p className="text-xs text-foreground">
                  <strong>Assigned to:</strong> {file.assignedToName}
                </p>
                <p className="text-xs text-foreground">
                  <strong>Uploaded:</strong> {file.uploadedAt}
                </p>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>
    </div>
  )
}
