"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Send, CheckCircle, AlertCircle } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase"

export default function SupportPage() {
  const { userProfile } = useAuth()
  const [formData, setFormData] = useState({
    name: userProfile?.name || "",
    email: userProfile?.email || "",
    subject: "",
    message: "",
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // Send to Formspree
      const formspreeResponse = await fetch('https://formspree.io/f/xpwyeeoe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
          userId: userProfile?.uid,
        }),
      })

      if (!formspreeResponse.ok) {
        throw new Error('Failed to send email via Formspree')
      }

      // Also save to Supabase for admin tracking
      const { error: dbError } = await supabase.from("support_tickets").insert({
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
        user_id: userProfile?.uid,
        status: "open",
        created_at: new Date().toISOString(),
      })

      if (dbError) throw dbError

      setSubmitted(true)
      setFormData({
        name: userProfile?.name || "",
        email: userProfile?.email || "",
        subject: "",
        message: "",
      })
      setTimeout(() => setSubmitted(false), 5000)
    } catch (err: any) {
      setError(err.message || "Failed to submit ticket")
      console.error("Error submitting form:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="modern-card p-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">Support</h1>
        <p className="text-muted-foreground text-lg">Submit a support ticket and we'll get back to you soon</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2"
        >
          <div className="modern-card p-8 space-y-6">
            {submitted && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-success/10 border border-success/30 rounded-lg p-4 flex items-center gap-3"
              >
                <CheckCircle className="w-5 h-5 text-success" />
                <div>
                  <p className="font-medium text-success">Ticket submitted successfully!</p>
                  <p className="text-sm text-success/80">We'll review your request and get back to you soon.</p>
                </div>
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-error/10 border border-error/30 rounded-lg p-4 flex items-center gap-3"
              >
                <AlertCircle className="w-5 h-5 text-error" />
                <div>
                  <p className="font-medium text-error">Error submitting ticket</p>
                  <p className="text-sm text-error/80">{error}</p>
                </div>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-foreground">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="input-modern"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-foreground">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="input-modern"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-foreground">Subject</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="What is this about?"
                  className="input-modern"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-foreground">Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Describe your issue or question..."
                  rows={6}
                  className="input-modern resize-none"
                  required
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <Send className="w-5 h-5" />
                {loading ? "Submitting..." : "Submit Ticket"}
              </motion.button>
            </form>
          </div>
        </motion.div>

        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <div className="modern-card p-6 space-y-4">
            <h3 className="font-semibold text-foreground text-lg">FAQ</h3>
            <div className="space-y-4 text-sm">
              <div className="p-3 bg-secondary/50 rounded-lg">
                <p className="font-semibold text-foreground mb-1">How long does it take to get a response?</p>
                <p className="text-foreground">Usually within 24 hours</p>
              </div>
              <div className="p-3 bg-secondary/50 rounded-lg">
                <p className="font-semibold text-foreground mb-1">Can I track my ticket?</p>
                <p className="text-foreground">You'll receive updates via email</p>
              </div>
              <div className="p-3 bg-secondary/50 rounded-lg">
                <p className="font-semibold text-foreground mb-1">What if it's urgent?</p>
                <p className="text-foreground">Mark it as high priority in the subject</p>
              </div>
            </div>
          </div>

          <div className="modern-card p-6 space-y-4">
            <h3 className="font-semibold text-foreground text-lg">Contact Info</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <span className="font-semibold text-foreground">Email:</span>
                <a href="mailto:support@provenmedia.com" className="text-primary hover:underline">
                  support@provenmedia.com
                </a>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold text-foreground">Phone:</span>
                <a href="tel:+15551234567" className="text-primary hover:underline">
                  +1 (555) 123-4567
                </a>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold text-foreground">Hours:</span>
                <span className="text-foreground">Mon-Fri, 9AM-6PM EST</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
