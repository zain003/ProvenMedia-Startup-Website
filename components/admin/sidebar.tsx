"use client"

import { useState, useMemo, memo, useCallback } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Users, Upload, FileText, Settings, LogOut, Menu, X, CheckCircle, Mail } from "lucide-react"
import { motion } from "framer-motion"

const AdminSidebar = memo(function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(true)
  const pathname = usePathname()
  const router = useRouter()
  const { signOut } = useAuth()

  const menuItems = useMemo(() => [
    { href: "/admin", label: "Dashboard", icon: FileText },
    { href: "/admin/team", label: "Manage Team", icon: Users },
    { href: "/admin/tasks", label: "Manage Tasks", icon: CheckCircle },
    { href: "/admin/upload", label: "Upload Files", icon: Upload },
    { href: "/admin/files", label: "All Files", icon: FileText },
    { href: "/admin/tickets", label: "Support Tickets", icon: Mail },
    { href: "/profile", label: "Profile", icon: Settings },
  ], [])

  const handleLogout = useCallback(async () => {
    await signOut()
    router.push("/login")
  }, [signOut, router])

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 md:hidden p-3 bg-card hover:bg-secondary rounded-xl transition-all duration-200 shadow-lg border border-border"
      >
        {isOpen ? <X className="w-6 h-6 text-foreground" /> : <Menu className="w-6 h-6 text-foreground" />}
      </button>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: isOpen ? 0 : -280 }}
        transition={{ duration: 0.3 }}
        className="fixed md:relative w-64 h-screen bg-card border-r border-border flex flex-col p-6 z-40 shadow-xl"
      >
        {/* Logo */}
        <div className="mb-8 pt-12 md:pt-0">
          <Link href="/admin" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">PM</span>
            </div>
            <span className="text-xl font-bold text-foreground">Proven Media</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-semibold ${
                  isActive
                    ? "bg-primary text-white shadow-lg shadow-primary/30"
                    : "text-foreground hover:bg-secondary hover:text-foreground hover:shadow-md"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-200 w-full font-semibold hover:shadow-md"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </motion.aside>

      {/* Mobile overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/50 md:hidden z-30" onClick={() => setIsOpen(false)} />}
    </>
  )
})

export default AdminSidebar
