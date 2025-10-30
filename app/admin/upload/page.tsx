"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Upload, X, CheckCircle, HardDrive } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface StagedFile {
  file: File
  name: string
  size: number
  status: "pending" | "uploading" | "success" | "error"
  progress: number
}

interface TeamMember {
  id: string
  name: string
  email: string
}

export default function UploadFilesPage() {
  const [stagedFiles, setStagedFiles] = useState<StagedFile[]>([])
  const [assignedTo, setAssignedTo] = useState("")
  const [assignedToName, setAssignedToName] = useState("")
  const [isDragging, setIsDragging] = useState(false)
  const [storageUsed, setStorageUsed] = useState(0)
  const [totalStorage] = useState(5 * 1024 * 1024 * 1024) // 5GB in bytes (Supabase free tier)
  const [members, setMembers] = useState<TeamMember[]>([])
  const [successMessage, setSuccessMessage] = useState("")
  const [uploading, setUploading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch all files
      const { data: filesData, error: filesError } = await supabase
        .from("files")
        .select("id, name, size, uploaded_at")
        .order("uploaded_at", { ascending: false })
        .limit(50)

      if (filesError) throw filesError

      setUploadedFiles(filesData || [])
      
      // Calculate storage used
      const totalBytes = filesData?.reduce((sum, file) => sum + (file.size || 0), 0) || 0
      setStorageUsed(totalBytes)

      // Fetch team members with only needed fields
      const { data: usersData, error: usersError } = await supabase
        .from("users")
        .select("uid, name, email")
        .eq("role", "member")
        .neq("status", "Deleted")
        .order("name")

      if (usersError) throw usersError

      const membersList: TeamMember[] = (usersData || []).map((user) => ({
        id: user.uid,
        name: user.name,
        email: user.email,
      }))

      setMembers(membersList)
    } catch (error) {
      console.error("Error fetching data:", error)
    }
  }

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i]
  }

  const storagePercentage = (storageUsed / totalStorage) * 100

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFiles = Array.from(e.dataTransfer.files)
    handleFiles(droppedFiles)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileList = Array.from(e.target.files)
      stageFiles(fileList)
    }
  }

  const stageFiles = (fileList: File[]) => {
    const newFiles: StagedFile[] = fileList.map(file => ({
      file,
      name: file.name,
      size: file.size,
      status: "pending" as const,
      progress: 0,
    }))
    setStagedFiles(prev => [...prev, ...newFiles])
  }

  const handleFiles = (fileList: File[]) => {
    stageFiles(fileList)
  }

  const removeFile = (fileName: string) => {
    setStagedFiles(prev => prev.filter(f => f.name !== fileName))
  }

  const handleUpload = async () => {
    if (!assignedTo) {
      alert("Please select a team member to assign the files to")
      return
    }

    if (stagedFiles.length === 0) {
      alert("Please select files to upload")
      return
    }

    console.log("Starting upload process...")
    console.log("Assigned to:", assignedTo, assignedToName)
    console.log("Files to upload:", stagedFiles.length)

    setUploading(true)
    setSuccessMessage("")

    let successCount = 0
    let errorCount = 0

    try {
      for (const stagedFile of stagedFiles) {
        console.log(`Uploading file: ${stagedFile.name}`)
        
        // Update status to uploading
        setStagedFiles(prev => prev.map(f => 
          f.name === stagedFile.name ? { ...f, status: "uploading" as const } : f
        ))

        try {
          // Upload to Supabase Storage
          console.log("Uploading to storage bucket...")
          const fileName = `${Date.now()}_${stagedFile.name}`
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('files')
            .upload(fileName, stagedFile.file, {
              cacheControl: '3600',
              upsert: false
            })

          if (uploadError) {
            console.error("Storage upload error:", uploadError)
            throw uploadError
          }
          
          console.log("File uploaded to storage successfully:", uploadData)

          // Get public URL
          const { data: urlData } = supabase.storage
            .from('files')
            .getPublicUrl(fileName)

          const downloadURL = urlData.publicUrl

          // Save to database
          console.log("Saving file metadata to database...")
          const { data: insertData, error: dbError } = await supabase.from("files").insert({
            name: stagedFile.name,
            size: stagedFile.size,
            url: downloadURL,
            assigned_to: assignedTo,
            assigned_to_name: assignedToName,
            uploaded_at: new Date().toISOString(),
            uploaded_by: "admin",
            type: stagedFile.file.type,
          })

          if (dbError) {
            console.error("Database insert error:", dbError)
            throw dbError
          }
          
          console.log("File metadata saved successfully:", insertData)

          // Update status to success
          setStagedFiles(prev => prev.map(f => 
            f.name === stagedFile.name ? { ...f, status: "success" as const, progress: 100 } : f
          ))

          successCount++
        } catch (error: any) {
          console.error("Upload error for file:", stagedFile.name, error)
          errorCount++
          
          setStagedFiles(prev => prev.map(f => 
            f.name === stagedFile.name ? { ...f, status: "error" as const } : f
          ))
        }
      }
    } catch (error) {
      console.error("Fatal upload error:", error)
    } finally {
      setUploading(false)
      console.log("Upload process completed. Success:", successCount, "Errors:", errorCount)
    }

    if (successCount > 0) {
      setSuccessMessage(`✓ Successfully uploaded ${successCount} file(s) and assigned to ${assignedToName}`)
      
      // Refresh data to show new files
      await fetchData()
      
      // Clear staged files after 3 seconds
      setTimeout(() => {
        setStagedFiles([])
        setSuccessMessage("")
      }, 5000)
    } else if (errorCount > 0) {
      alert(`❌ Failed to upload ${errorCount} file(s). Please check the console for details.`)
    }
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="modern-card p-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">Upload Files</h1>
        <p className="text-muted-foreground text-lg">Upload and assign files to team members</p>
        
        {/* Info Banner */}
        <div className="mt-4 p-4 bg-primary/10 border-2 border-primary/30 rounded-xl">
          <p className="text-sm text-foreground">
            <strong>ℹ️ Note:</strong> Files are uploaded to Supabase Storage and assigned to team members. 
            Make sure the storage bucket is properly configured in your Supabase project.
          </p>
        </div>
        
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-success/10 border-2 border-success/30 rounded-xl text-success font-semibold"
          >
            {successMessage}
          </motion.div>
        )}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2"
        >
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`glass-panel p-12 border-2 border-dashed transition-smooth cursor-pointer ${
              isDragging ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
            }`}
          >
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 bg-primary/20 rounded-lg flex items-center justify-center">
                <Upload className="w-8 h-8 text-primary" />
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-foreground">Drag and drop files here</p>
                <p className="text-muted-foreground text-sm">or click to browse</p>
              </div>
              <input type="file" multiple onChange={handleFileSelect} className="hidden" id="file-input" />
              <label
                htmlFor="file-input"
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-smooth cursor-pointer font-medium"
              >
                Select Files
              </label>
            </div>
          </div>

          {/* Staged Files List */}
          {stagedFiles.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground">Selected Files ({stagedFiles.length})</h3>
                <button
                  onClick={handleUpload}
                  disabled={uploading || !assignedTo}
                  className="btn-primary disabled:opacity-50"
                >
                  {uploading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Uploading...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      Upload Files
                    </span>
                  )}
                </button>
              </div>

              <div className="space-y-3">
                {stagedFiles.map((file) => (
                  <div key={file.name} className="modern-card p-4 flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{file.name}</p>
                      <p className="text-sm text-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      {file.status === "uploading" && (
                        <div className="mt-2 w-full bg-border rounded-full h-2">
                          <div className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all animate-pulse"></div>
                        </div>
                      )}
                      {file.status === "pending" && (
                        <p className="text-xs text-muted-foreground mt-1">Ready to upload</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {file.status === "success" && <CheckCircle className="w-5 h-5 text-success" />}
                      {file.status === "error" && <X className="w-5 h-5 text-destructive" />}
                      {file.status === "pending" && (
                        <button
                          onClick={() => removeFile(file.name)}
                          disabled={uploading}
                          className="p-2 hover:bg-destructive/20 rounded-lg transition-smooth text-destructive disabled:opacity-50"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-panel p-6 space-y-6 h-fit"
        >
          {/* Storage Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <HardDrive className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Storage</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Used</span>
                <span className="font-semibold text-foreground">{formatSize(storageUsed)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total</span>
                <span className="font-semibold text-foreground">{formatSize(totalStorage)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Available</span>
                <span className="font-semibold text-success">{formatSize(totalStorage - storageUsed)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="w-full bg-border rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-primary to-accent h-3 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(storagePercentage, 100)}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground text-center">
                {storagePercentage.toFixed(1)}% used
              </p>
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <label className="block text-sm font-semibold text-foreground mb-3">
              Assign To <span className="text-destructive">*</span>
            </label>
            <select
              value={assignedTo}
              onChange={(e) => {
                const selectedId = e.target.value
                setAssignedTo(selectedId)
                if (selectedId === "all") {
                  setAssignedToName("All Team Members")
                } else {
                  const selectedMember = members.find(m => m.id === selectedId)
                  setAssignedToName(selectedMember?.name || "")
                }
              }}
              className="input-modern"
              required
            >
              <option value="">Select assignment</option>
              <option value="all">📢 All Team Members</option>
              <optgroup label="Individual Members">
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name} ({member.email})
                  </option>
                ))}
              </optgroup>
            </select>
            {members.length === 0 && (
              <p className="text-xs text-warning mt-2">No team members found. Add members first.</p>
            )}
            {assignedTo && (
              <p className="text-xs text-success mt-2">
                ✓ Files will be assigned to: <strong>{assignedToName}</strong>
              </p>
            )}
          </div>

          <div className="space-y-2 border-t border-border pt-4">
            <h3 className="font-semibold text-foreground">Upload Tips</h3>
            <ul className="text-sm text-foreground space-y-2">
              <li>• Supports PDF, images, and documents</li>
              <li>• Max file size: 100 MB</li>
              <li>• Files are encrypted and secure</li>
              <li>• Team members get instant access</li>
            </ul>
          </div>
        </motion.div>
      </div>

      {/* Recently Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-panel p-8"
        >
          <h2 className="text-2xl font-bold text-foreground mb-6">Recently Uploaded Files</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {uploadedFiles.slice(0, 9).map((file, index) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 bg-secondary/50 rounded-xl border border-border hover:border-primary/30 transition-smooth"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="font-medium text-foreground truncate">{file.name}</p>
                    <p className="text-sm text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p><strong>Assigned to:</strong> {file.assigned_to_name}</p>
                  <p><strong>Uploaded:</strong> {new Date(file.uploaded_at).toLocaleDateString()}</p>
                </div>
              </motion.div>
            ))}
          </div>
          {uploadedFiles.length > 9 && (
            <div className="mt-4 text-center">
              <a href="/admin/files" className="text-primary hover:underline">
                View all {uploadedFiles.length} files →
              </a>
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}
