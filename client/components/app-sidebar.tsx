"use client"

import type * as React from "react"
import { Building2, FileText, Home, Package, Users, BarChart3, ClipboardList, HardHat, LogOut, ChevronUp } from "lucide-react"
import { usePathname } from "next/navigation"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: Home,
    },
    {
      title: "Projects",
      url: "/projects",
      icon: Building2,
    },
    {
      title: "Materials",
      url: "/materials",
      icon: Package,
    },
    {
      title: "Labor",
      url: "/labor",
      icon: Users,
    },
    {
      title: "Tasks",
      url: "/tasks",
      icon: ClipboardList,
    },
    {
      title: "Documents",
      url: "/documents",
      icon: FileText,
    },
    {
      title: "Reports Viewer",
      url: "/reports",
      icon: BarChart3,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const { user, logout, isAuthenticated } = useAuth()
  const { state } = useSidebar()

  // Don't show sidebar on auth pages
  if (pathname === '/login' || pathname === '/signup') {
    return null
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <Sidebar collapsible="icon" className="border-r border-white/20 bg-white/10 dark:bg-slate-900/30 backdrop-blur-xl shadow-xl transition-all duration-300 flex flex-col h-[100dvh]" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="hover:bg-white/10 dark:hover:bg-slate-800/50 transition-colors">
              <Link href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25">
                  <HardHat className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold text-slate-800 dark:text-slate-100">SiteCraft</span>
                  <span className="truncate text-xs text-muted-foreground">Construction Mgmt</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-none">
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground font-medium">Platform</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.navMain.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url} className="hover:bg-white/20 dark:hover:bg-slate-800/60 transition-colors data-[active=true]:bg-white/30 dark:data-[active=true]:bg-slate-800/80 data-[active=true]:shadow-sm">
                    <Link href={item.url}>
                      <item.icon className="text-slate-700 dark:text-slate-300" />
                      <span className="text-slate-800 dark:text-slate-200">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="mt-auto border-t border-white/10 dark:border-slate-800/50 bg-white/5 dark:bg-slate-900/20 pb-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className={`flex items-center p-2 rounded-lg hover:bg-white/10 dark:hover:bg-slate-800/50 transition-colors ${state === "collapsed" ? "justify-center" : "justify-between"}`}>
              {state !== "collapsed" && <span className="text-sm font-medium text-slate-800 dark:text-slate-200">Theme</span>}
              <ThemeToggle />
            </div>
          </SidebarMenuItem>
          {isAuthenticated && user && (
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton size="lg" className="w-full hover:bg-white/10 dark:hover:bg-slate-800/50 transition-colors">
                    <Avatar className="h-8 w-8 rounded-lg border border-white/20 shadow-sm">
                      <AvatarFallback className="rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold text-slate-800 dark:text-slate-100">{user.name}</span>
                      <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                    </div>
                    {state !== "collapsed" && <ChevronUp className="ml-auto size-4" />}
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-2xl backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border border-white/20 shadow-xl"
                  side="top"
                  align="end"
                  sideOffset={4}
                >
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator className="bg-white/20" />
                  <DropdownMenuItem onClick={logout} className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 focus:bg-red-50 dark:focus:bg-red-950/30 cursor-pointer transition-colors rounded-xl">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
