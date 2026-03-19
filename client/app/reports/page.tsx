"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart3, Building2, Calendar, CheckCircle, Clock, DollarSign, Package, TrendingUp, Users, AlertTriangle, Download,
} from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import api from "@/lib/api"
import { toast } from "sonner"

export default function ReportsPage() {
  const { loading: authLoading, isAuthenticated } = useAuth()
  const router = useRouter()
  const [projects, setProjects] = useState<any[]>([])
  const [materials, setMaterials] = useState<any[]>([])
  const [workers, setWorkers] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login')
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated) fetchData()
  }, [isAuthenticated])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [pRes, mRes, lRes, tRes] = await Promise.all([
        api.get<{ projects: any[] }>('/projects'),
        api.get<{ materials: any[] }>('/materials'),
        api.get<{ labor: any[] }>('/labor'),
        api.get<{ tasks: any[] }>('/tasks'),
      ])
      setProjects(pRes.projects || [])
      setMaterials(mRes.materials || [])
      setWorkers(lRes.labor || [])
      setTasks(tRes.tasks || [])
    } catch (error: any) {
      toast.error("Failed to load report data")
    } finally {
      setLoading(false)
    }
  }

  const exportReport = () => {
    const report = {
      generated_at: new Date().toISOString(),
      summary: {
        projects: projects.length,
        materials: materials.length,
        workers: workers.length,
        tasks: tasks.length,
        totalBudget: projects.reduce((s, p) => s + (p.budget || 0), 0),
        inventoryValue: materials.reduce((s, m) => s + (m.current_stock || 0) * (m.unit_price || 0), 0),
      },
      projects, materials, workers: workers.map(({ id, name, role, is_present }) => ({ id, name, role, is_present })), tasks,
    }
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url; a.download = `sitecraft-report-${new Date().toISOString().split("T")[0]}.json`; a.click()
    URL.revokeObjectURL(url)
    toast.success("Report exported successfully")
  }

  const totalBudget = projects.reduce((s, p) => s + (p.budget || 0), 0)
  const avgProgress = projects.length > 0 ? Math.round(projects.reduce((s, p) => s + (p.progress || 0), 0) / projects.length) : 0
  const inventoryValue = materials.reduce((s, m) => s + (m.current_stock || 0) * (m.unit_price || 0), 0)
  const lowStockCount = materials.filter((m) => m.current_stock < m.minimum_stock).length
  const presentWorkers = workers.filter((w) => w.is_present).length
  const tasksDone = tasks.filter((t) => t.status === "Completed").length
  const tasksInProgress = tasks.filter((t) => t.status === "In Progress").length

  if (authLoading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
  if (!isAuthenticated) return null

  const StatCard = ({ title, value, icon: Icon, color, description }: any) => (
    <Card className="border-0 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent>
        {loading ? <Skeleton className="h-7 w-20" /> : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-xs text-muted-foreground">{description}</p>
          </>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center gap-4 px-6">
          <SidebarTrigger />
          <div className="flex-1">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Reports & Analytics</h1>
            <p className="text-sm text-muted-foreground">Comprehensive insights into your construction operations</p>
          </div>
          <Button variant="outline" onClick={exportReport} disabled={loading}>
            <Download className="h-4 w-4 mr-2" />Export All
          </Button>
        </div>
      </header>

      <main className="flex-1 p-6 space-y-6">
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="materials">Materials</TabsTrigger>
            <TabsTrigger value="labor">Labor</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6 space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatCard title="Total Projects" value={projects.length} icon={Building2} color="text-blue-600" description={`Avg. ${avgProgress}% complete`} />
              <StatCard title="Total Budget" value={`$${(totalBudget / 1000000).toFixed(1)}M`} icon={DollarSign} color="text-green-600" description="Across all projects" />
              <StatCard title="Workforce" value={workers.length} icon={Users} color="text-purple-600" description={`${presentWorkers} present today`} />
              <StatCard title="Task Completion" value={`${tasks.length > 0 ? Math.round((tasksDone / tasks.length) * 100) : 0}%`} icon={CheckCircle} color="text-green-600" description={`${tasksDone}/${tasks.length} completed`} />
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="border-0 shadow-lg">
                <CardHeader><CardTitle>Key Metrics</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: "Active Projects", val: projects.filter(p => p.status === "On Track").length, total: projects.length, color: "bg-blue-600" },
                    { label: "Tasks Completed", val: tasksDone, total: tasks.length, color: "bg-green-600" },
                    { label: "Workers Present", val: presentWorkers, total: workers.length, color: "bg-purple-600" },
                    { label: "Materials In Stock", val: materials.length - lowStockCount, total: materials.length, color: "bg-orange-600" },
                  ].map((m, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between text-sm"><span>{m.label}</span><span className="font-medium">{m.val}/{m.total}</span></div>
                      <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700"><div className={`h-2 rounded-full ${m.color} transition-all`} style={{ width: `${m.total > 0 ? (m.val / m.total) * 100 : 0}%` }} /></div>
                    </div>
                  ))}
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg">
                <CardHeader><CardTitle>Quick Summary</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { icon: Building2, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/30", label: "Projects", desc: `${projects.length} total, avg ${avgProgress}% progress` },
                    { icon: Package, color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-950/30", label: "Inventory", desc: `$${inventoryValue.toLocaleString()} total value, ${lowStockCount} low stock` },
                    { icon: Users, color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-950/30", label: "Labor", desc: `${workers.length} workers, ${presentWorkers} present today` },
                    { icon: BarChart3, color: "text-green-600", bg: "bg-green-50 dark:bg-green-950/30", label: "Tasks", desc: `${tasksDone} done, ${tasksInProgress} in progress, ${tasks.filter(t => t.status === "Pending").length} pending` },
                  ].map((item, i) => (
                    <div key={i} className={`flex items-center gap-4 p-3 rounded-lg ${item.bg}`}>
                      <item.icon className={`h-5 w-5 ${item.color}`} />
                      <div><p className="font-medium text-sm">{item.label}</p><p className="text-xs text-muted-foreground">{item.desc}</p></div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="projects" className="mt-6 space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <StatCard title="Total Projects" value={projects.length} icon={Building2} color="text-blue-600" description="Active" />
              <StatCard title="Total Budget" value={`$${(totalBudget / 1000000).toFixed(1)}M`} icon={DollarSign} color="text-green-600" description="Sum" />
              <StatCard title="Avg Progress" value={`${avgProgress}%`} icon={TrendingUp} color="text-purple-600" description="Completion" />
            </div>
            {loading ? <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full" />)}</div> : projects.length === 0 ? (
              <div className="text-center py-12"><Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" /><p className="text-muted-foreground">No projects to report on</p></div>
            ) : (
              <Card className="border-0 shadow-lg">
                <CardHeader><CardTitle>Project Breakdown</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {projects.map(p => (
                    <div key={p.id} className="p-4 rounded-lg border hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <div className="flex justify-between items-center mb-2"><h4 className="font-semibold">{p.name}</h4><span className="text-sm font-medium">{p.progress}%</span></div>
                      <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700 mb-2"><div className="h-2 rounded-full bg-blue-600 transition-all" style={{ width: `${p.progress}%` }} /></div>
                      <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
                        <span>Budget: ${((p.budget || 0) / 1000000).toFixed(1)}M</span><span>Status: {p.status}</span><span>Manager: {p.manager || "Unassigned"}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="materials" className="mt-6 space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <StatCard title="Total Items" value={materials.length} icon={Package} color="text-blue-600" description="In inventory" />
              <StatCard title="Inventory Value" value={`$${inventoryValue.toLocaleString()}`} icon={DollarSign} color="text-green-600" description="Total" />
              <StatCard title="Low Stock" value={lowStockCount} icon={AlertTriangle} color="text-red-600" description="Needs reorder" />
            </div>
            {loading ? <div className="space-y-3">{[1,2].map(i => <Skeleton key={i} className="h-16 w-full" />)}</div> : materials.length === 0 ? (
              <div className="text-center py-12"><Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" /><p className="text-muted-foreground">No materials to report on</p></div>
            ) : (
              <Card className="border-0 shadow-lg">
                <CardHeader><CardTitle>Inventory by Category</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(materials.reduce<Record<string, { count: number; value: number; lowStock: number }>>((acc, m) => {
                    const cat = m.category || "General"
                    if (!acc[cat]) acc[cat] = { count: 0, value: 0, lowStock: 0 }
                    acc[cat].count++
                    acc[cat].value += (m.current_stock || 0) * (m.unit_price || 0)
                    if (m.current_stock < m.minimum_stock) acc[cat].lowStock++
                    return acc
                  }, {})).map(([cat, data]) => (
                    <div key={cat} className="flex items-center justify-between p-3 rounded-lg border">
                      <div><p className="font-medium">{cat}</p><p className="text-xs text-muted-foreground">{data.count} items</p></div>
                      <div className="text-right"><p className="font-medium">${data.value.toLocaleString()}</p>{data.lowStock > 0 && <p className="text-xs text-red-500">{data.lowStock} low stock</p>}</div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="labor" className="mt-6 space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <StatCard title="Total Workers" value={workers.length} icon={Users} color="text-blue-600" description="Registered" />
              <StatCard title="Present Today" value={presentWorkers} icon={CheckCircle} color="text-green-600" description={`${workers.length > 0 ? Math.round((presentWorkers / workers.length) * 100) : 0}% attendance`} />
              <StatCard title="Daily Cost" value={`$${workers.filter(w => w.is_present).reduce((s, w) => s + (w.hourly_rate || 0) * 8, 0).toFixed(0)}`} icon={DollarSign} color="text-green-600" description="Est. 8hrs" />
            </div>
            {loading ? <div className="space-y-3">{[1,2].map(i => <Skeleton key={i} className="h-16 w-full" />)}</div> : workers.length === 0 ? (
              <div className="text-center py-12"><Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" /><p className="text-muted-foreground">No workers to report on</p></div>
            ) : (
              <Card className="border-0 shadow-lg">
                <CardHeader><CardTitle>Workforce by Role</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(workers.reduce<Record<string, { count: number; present: number; cost: number }>>((acc, w) => {
                    const role = w.role || "General"
                    if (!acc[role]) acc[role] = { count: 0, present: 0, cost: 0 }
                    acc[role].count++
                    if (w.is_present) { acc[role].present++; acc[role].cost += (w.hourly_rate || 0) * 8 }
                    return acc
                  }, {})).map(([role, data]) => (
                    <div key={role} className="flex items-center justify-between p-3 rounded-lg border">
                      <div><p className="font-medium capitalize">{role}</p><p className="text-xs text-muted-foreground">{data.present}/{data.count} present</p></div>
                      <div className="text-right"><p className="font-medium">${data.cost.toFixed(0)}/day</p></div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
