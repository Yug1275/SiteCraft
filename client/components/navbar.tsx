"use client"

import React from 'react'
import Link from 'next/link'
import { Building2, Package, Users, ClipboardList, FileText, BarChart3, Home, HardHat, Mail, LayoutDashboard, PanelLeft } from 'lucide-react'
import { useSidebar } from '@/components/ui/sidebar'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'

const navLinks = [
  { title: "Home", url: "/", icon: Home },
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Projects", url: "/projects", icon: Building2 },
  { title: "Materials", url: "/materials", icon: Package },
  { title: "Labor", url: "/labor", icon: Users },
  { title: "Tasks", url: "/tasks", icon: ClipboardList },
  { title: "Documents", url: "/documents", icon: FileText },
  { title: "Reports", url: "/reports", icon: BarChart3 },
  { title: "Contact", url: "/contact", icon: Mail },
]

interface NavbarProps {
  publicMode?: boolean
}

export function Navbar({ publicMode = false }: NavbarProps) {
  const pathname = usePathname()
  const { isAuthenticated, loading } = useAuth()
  let toggleSidebar: (() => void) | undefined
  try {
    const sidebar = useSidebar()
    toggleSidebar = sidebar.toggleSidebar
  } catch {
    // Navbar can be rendered outside SidebarProvider (e.g. home page)
  }

  const showPublicActions = publicMode && !loading && !isAuthenticated
  const showAppNav = !publicMode

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/20 bg-white/10 dark:bg-slate-900/30 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 md:px-6 gap-4">
        {/* Left Side: Mobile Sidebar Toggle + Logo */}
        <div className="flex items-center gap-2">
          {/* Mobile Sidebar Toggle */}
          <div className="md:hidden">
            {toggleSidebar && !publicMode ? (
              <Button
                data-sidebar="trigger"
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={toggleSidebar}
              >
                <PanelLeft className="size-4" />
                <span className="sr-only">Toggle Sidebar</span>
              </Button>
            ) : null}
          </div>

          {/* Logo */}
          <div className="flex items-center gap-2">
            <Link href={publicMode ? "/" : "/dashboard"} className="flex items-center gap-2">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25">
                <HardHat className="size-4" />
              </div>
              <span className="truncate font-semibold text-slate-800 dark:text-slate-100">SiteCraft</span>
            </Link>
          </div>
        </div>

        {/* Right Side: Navigation Links + Profile */}
        <div className="flex items-center gap-1 md:gap-6 overflow-x-auto md:overflow-x-visible mask-edges">
          {/* Navigation Links - Hidden on mobile, visible on md+ */}
          {showAppNav ? (
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.url
                return (
                  <Link
                    key={link.title}
                    href={link.url}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all duration-300 whitespace-nowrap text-sm font-medium ${
                      isActive
                        ? "bg-white/30 dark:bg-slate-800/80 text-blue-600 shadow-sm"
                        : "text-slate-600 dark:text-slate-400 hover:bg-white/20 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100"
                    }`}
                  >
                    <link.icon className="size-4" />
                    <span>{link.title}</span>
                  </Link>
                )
              })}
            </nav>
          ) : null}

          {showPublicActions ? (
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
                Sign In
              </Link>
              <Button asChild className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 shadow-lg shadow-blue-500/25 rounded-full px-6">
                <Link href="/signup">Sign Up</Link>
              </Button>
            </div>
          ) : null}

          {/* Profile Dropdown */}
          {!publicMode ? (
            <div className="flex items-center gap-2 ml-auto md:ml-0">
              <ProfileDropdown />
            </div>
          ) : null}
        </div>
      </div>
    </header>
  )
}
