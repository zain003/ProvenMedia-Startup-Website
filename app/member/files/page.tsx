"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Download, FileText, Search } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/auth-context"

interface FileItem {
  id: string
  name: string
  size: number
  uploadedAt: string
  url: string
}

export default function MyFilesPage() {
  const { userProfile } = useAuth()
  const [files, setFiles] = useState<FileItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFiles()
  }, [userProfile])

  const fetchFiles = async () => {
    if (!userProfile) return

    try {
      // Fetch files assigned to this user OR assigned to "all"
      const { data, error } = await supabase
        .from("files")
        .select("id, name, size, url, uploaded_at, uploaded_by")
        .or(`assigned_to.eq.${userProfile.uid},assigned_to.eq.all`)
        .order("uploaded_at", { ascending: false })

      if (error) throw error

      const filesList: FileItem[] = (data || []).map((file) => ({
        id: file.id,
        name: file.name,
        size: file.size,
        uploadedAt: file.uploaded_at ? new Date(file.uploaded_at).toLocaleDateString() : "N/A",
        url: file.url,
      }))

      setFiles(filesList)
    } catch (error) {
      console.error("Error fetching files:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredFiles = files.filter((file) => file.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase()
    return <FileText className="w-6 h-6 text-primary" />
  }

  const handleDownload = async (url: string, fileName: string) => {
    try {
      // Fetch the file
      const response = await fetch(url)
      const blob = await response.blob()
      
      // Create a download link
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      
      // Cleanup
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
    } catch (error) {
      console.error('Download error:', error)
      // Fallback to opening in new tab
      window.open(url, '_blank')
    }
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="modern-card p-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">My Files</h1>
        <p className="text-muted-foreground text-lg">Download files assigned to you by admin</p>
      </motion.div>

      {/* Search */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
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
          <div className="col-span-full text-center py-12 text-foreground">
            {files.length === 0 ? "No files assigned to you yet" : "No files match your search"}
          </div>
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
                  {getFileIcon(file.name)}
                </div>
                <button
                  onClick={() => handleDownload(file.url, file.name)}
                  className="p-3 bg-primary/10 hover:bg-primary/20 rounded-lg transition-smooth text-primary"
                  title="Download file"
                >
                  <Download className="w-5 h-5" />
                </button>
              </div>
              <div>
                <p className="font-medium text-foreground truncate">{file.name}</p>
                <p className="text-sm text-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <div className="pt-2 border-t border-border">
                <p className="text-xs text-foreground">Uploaded: {file.uploadedAt}</p>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>
    </div>
  )
}
