"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Building2, Package, Users, AlertTriangle, TrendingUp, Calendar, DollarSign, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

type Material = {
  name: string
  currentStock: number
  minimumStock: number
  unit: string
}

type Worker = {
  isPresent: boolean
  // add other properties as needed
}

type Project = {
  name: string
  status: string
  budget: number
  endDate: string
  progress: number
  // add other properties as needed
}

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([])
  const [materials, setMaterials] = useState<Material[]>([])
  const [workers, setWorkers] = useState<Worker[]>([])

  useEffect(() => {
    // Load data from localStorage
    const savedProjects = localStorage.getItem("sitecraft-projects")
    const savedMaterials = localStorage.getItem("sitecraft-materials")
    const savedWorkers = localStorage.getItem("sitecraft-workers")

    if (savedProjects) setProjects(JSON.parse(savedProjects))
    if (savedMaterials) setMaterials(JSON.parse(savedMaterials))
    if (savedWorkers) setWorkers(JSON.parse(savedWorkers))
  }, [])

  const lowStockItems = materials.filter((m) => m.currentStock < m.minimumStock)
  const presentWorkers = workers.filter((w) => w.isPresent).length

  const stats = [
    {
      title: "Active Projects",
      value: projects.length.toString(),
      change: projects.length === 0 ? "No projects yet" : `${projects.length} active`,
      icon: Building2,
      color: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "Total Materials",
      value: materials.length.toString(),
      change: materials.length === 0 ? "No materials added" : `${materials.length} items`,
      icon: Package,
      color: "text-green-600 dark:text-green-400",
    },
    {
      title: "Active Workers",
      value: workers.length.toString(),
      change: workers.length === 0 ? "No workers registered" : `${presentWorkers} present today`,
      icon: Users,
      color: "text-purple-600 dark:text-purple-400",
    },
    {
      title: "Low Stock Alerts",
      value: lowStockItems.length.toString(),
      change: lowStockItems.length === 0 ? "No alerts" : "Need attention",
      icon: AlertTriangle,
      color: "text-red-600 dark:text-red-400",
    },
  ]

  const recentProjects = projects.slice(0, 3)

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center gap-4 px-6">
          <SidebarTrigger />
          <div className="flex-1">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Construction Dashboard
            </h1>
            <p className="text-sm text-muted-foreground">Welcome back! Here's what's happening on your sites today.</p>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <Card
              key={index}
              className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
              </CardContent>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-slate-100/20 dark:to-slate-800/20" />
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent Projects */}
          <Card className="lg:col-span-2 border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-blue-600" />
                    Recent Projects
                  </CardTitle>
                  <CardDescription>Track progress of your active construction projects</CardDescription>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link href="/projects">View All</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentProjects.length === 0 ? (
                <div className="text-center py-8">
                  <Building2 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No projects yet</p>
                  <Button asChild variant="outline" size="sm" className="mt-2 bg-transparent">
                    <Link href="/projects">Create Your First Project</Link>
                  </Button>
                </div>
              ) : (
                recentProjects.map((project, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg border bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-900"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{project.name}</h4>
                      <Badge
                        variant={
                          project.status === "On Track"
                            ? "default"
                            : project.status === "Ahead"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {project.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />${(project.budget / 1000000).toFixed(1)}M
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(project.endDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {project.progress}% Complete
                      </div>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Low Stock Alerts */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertTriangle className="h-5 w-5" />
                Low Stock Alerts
              </CardTitle>
              <CardDescription>Materials running low on inventory</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {lowStockItems.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No low stock alerts</p>
                  <Button asChild variant="outline" size="sm" className="mt-2 bg-transparent">
                    <Link href="/materials">Manage Inventory</Link>
                  </Button>
                </div>
              ) : (
                lowStockItems.map((item, index) => (
                  <div key={index} className="p-3 rounded-lg border-l-4 border-l-red-500 bg-red-50 dark:bg-red-950/20">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-sm">{item.name}</h4>
                      <Badge variant="destructive" className="text-xs">
                        Low
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Current: {item.currentStock} {item.unit} / Min: {item.minimumStock} {item.unit}
                    </div>
                    <Progress value={(item.currentStock / item.minimumStock) * 100} className="h-1 mt-2" />
                  </div>
                ))
              )}
              <Button asChild variant="outline" size="sm" className="w-full bg-transparent">
                <Link href="/materials">Manage Inventory</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Frequently used actions for daily operations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Button
                asChild
                className="h-20 flex-col gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              >
                <Link href="/projects">
                  <Building2 className="h-6 w-6" />
                  New Project
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-20 flex-col gap-2 bg-transparent">
                <Link href="/labor">
                  <Users className="h-6 w-6" />
                  Mark Attendance
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-20 flex-col gap-2 bg-transparent">
                <Link href="/materials">
                  <Package className="h-6 w-6" />
                  Add Materials
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-20 flex-col gap-2 bg-transparent">
                <Link href="/reports">
                  <TrendingUp className="h-6 w-6" />
                  Generate Report
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
