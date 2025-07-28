"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  BarChart3,
  Download,
  Calendar,
  TrendingUp,
  DollarSign,
  Users,
  Package,
  Building2,
  PieChart,
  AlertTriangle,
  CheckCircle,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function ReportsPage() {
  const [reportType, setReportType] = useState("overview")
  const [timeRange, setTimeRange] = useState("month")
  const [projects, setProjects] = useState([])
  const [materials, setMaterials] = useState([])
  const [workers, setWorkers] = useState([])
  const { toast } = useToast()
  const [notification, setNotification] = useState({ type: "", message: "" })

  const showNotification = (type, message) => {
    setNotification({ type, message })
    setTimeout(() => setNotification({ type: "", message: "" }), 5000)
  }

  useEffect(() => {
    const savedProjects = localStorage.getItem("sitecraft-projects")
    const savedMaterials = localStorage.getItem("sitecraft-materials")
    const savedWorkers = localStorage.getItem("sitecraft-workers")

    if (savedProjects) setProjects(JSON.parse(savedProjects))
    if (savedMaterials) setMaterials(JSON.parse(savedMaterials))
    if (savedWorkers) setWorkers(JSON.parse(savedWorkers))
  }, [])

  const projectReports = projects.map((project) => ({
    ...project,
    spent: (project.budget * project.progress) / 100,
    efficiency: Math.min(100, Math.max(50, 90 + Math.random() * 20)),
  }))

  const materialUsage = materials.map((material) => ({
    material: material.name,
    used: Math.floor(material.currentStock * 0.3),
    unit: material.unit,
    cost: material.currentStock * material.unitPrice * 0.3,
  }))

  const laborStats = {
    totalWorkers: workers.length,
    averageAttendance:
      workers.length > 0 ? Math.round((workers.filter((w) => w.isPresent).length / workers.length) * 100) : 0,
    totalHours: workers.filter((w) => w.isPresent).length * 8,
    laborCost: workers.filter((w) => w.isPresent).reduce((sum, w) => sum + w.hourlyRate * 8, 0),
    overtime: Math.random() * 15,
  }

  const totalRevenue = projects.reduce((sum, p) => sum + p.budget, 0)
  const materialCosts = materials.reduce((sum, m) => sum + m.currentStock * m.unitPrice, 0)

  const exportReport = () => {
    const reportData = {
      type: reportType,
      timeRange,
      generatedAt: new Date().toISOString(),
      data: {
        projects: projectReports,
        materials: materialUsage,
        labor: laborStats,
        summary: {
          totalRevenue,
          materialCosts,
          activeProjects: projects.length,
          totalWorkers: workers.length,
        },
      },
    }

    const dataStr = JSON.stringify(reportData, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)

    const exportFileDefaultName = `sitecraft-report-${reportType}-${new Date().toISOString().split("T")[0]}.json`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()

    showNotification("success", "Report exported successfully")
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center gap-4 px-6">
          <SidebarTrigger />
          <div className="flex-1">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Reports & Analytics
            </h1>
            <p className="text-sm text-muted-foreground">
              Comprehensive insights and reports for your construction projects
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 space-y-6">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex gap-4">
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Report Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="overview">Overview Report</SelectItem>
                <SelectItem value="projects">Project Reports</SelectItem>
                <SelectItem value="materials">Material Usage</SelectItem>
                <SelectItem value="labor">Labor Analytics</SelectItem>
                <SelectItem value="financial">Financial Summary</SelectItem>
              </SelectContent>
            </Select>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Custom Range
            </Button>
            <Button
              onClick={exportReport}
              className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800"
            >
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Overview Stats */}
        {reportType === "overview" && (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="border-0 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${(totalRevenue / 1000000).toFixed(1)}M</div>
                  <div className="flex items-center text-xs text-green-600">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    From {projects.length} projects
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                  <Building2 className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{projects.length}</div>
                  <div className="flex items-center text-xs text-blue-600">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Currently active
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Labor Efficiency</CardTitle>
                  <Users className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{laborStats.averageAttendance}%</div>
                  <div className="flex items-center text-xs text-green-600">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Attendance rate
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Material Costs</CardTitle>
                  <Package className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${(materialCosts / 1000).toFixed(0)}K</div>
                  <div className="flex items-center text-xs text-muted-foreground">Current inventory value</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    Project Progress Overview
                  </CardTitle>
                  <CardDescription>Current status of all active projects</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {projectReports.length === 0 ? (
                    <div className="text-center py-8">
                      <Building2 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No projects to display</p>
                    </div>
                  ) : (
                    projectReports.map((project, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-sm">{project.name}</span>
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
                        <Progress value={project.progress} className="h-2" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{project.progress}% Complete</span>
                          <span>
                            ${(project.spent / 1000000).toFixed(1)}M / ${(project.budget / 1000000).toFixed(1)}M
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-green-600" />
                    Resource Allocation
                  </CardTitle>
                  <CardDescription>Distribution of resources across projects</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Labor Costs</span>
                      <span className="text-sm">45%</span>
                    </div>
                    <Progress value={45} className="h-2" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Materials</span>
                      <span className="text-sm">35%</span>
                    </div>
                    <Progress value={35} className="h-2" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Equipment</span>
                      <span className="text-sm">15%</span>
                    </div>
                    <Progress value={15} className="h-2" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Other Expenses</span>
                      <span className="text-sm">5%</span>
                    </div>
                    <Progress value={5} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* Project Reports */}
        {reportType === "projects" && (
          <div className="grid gap-6">
            {projectReports.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No project data available</h3>
                <p className="text-muted-foreground">Create some projects to see reports here</p>
              </div>
            ) : (
              projectReports.map((project, index) => (
                <Card key={index} className="border-0 shadow-lg">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{project.name}</CardTitle>
                        <CardDescription>Detailed project performance metrics</CardDescription>
                      </div>
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
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-6 md:grid-cols-3">
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm">Progress</h4>
                        <div className="text-2xl font-bold">{project.progress}%</div>
                        <Progress value={project.progress} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm">Budget Utilization</h4>
                        <div className="text-2xl font-bold">{Math.round((project.spent / project.budget) * 100)}%</div>
                        <div className="text-xs text-muted-foreground">
                          ${(project.spent / 1000000).toFixed(1)}M / ${(project.budget / 1000000).toFixed(1)}M
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm">Team Efficiency</h4>
                        <div className="text-2xl font-bold">{Math.round(project.efficiency)}%</div>
                        <div className="text-xs text-muted-foreground">{project.workers} active workers</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Material Usage Reports */}
        {reportType === "materials" && (
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-green-600" />
                Material Usage Report
              </CardTitle>
              <CardDescription>Consumption and cost analysis of construction materials</CardDescription>
            </CardHeader>
            <CardContent>
              {materialUsage.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No material data available</h3>
                  <p className="text-muted-foreground">Add some materials to see usage reports here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {materialUsage.map((material, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-semibold">{material.material}</h4>
                        <p className="text-sm text-muted-foreground">
                          {material.used} {material.unit} consumed
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">${material.cost.toFixed(2)}</div>
                        <div className="text-sm text-muted-foreground">
                          ${(material.cost / material.used).toFixed(2)} per {material.unit}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center font-semibold">
                      <span>Total Material Costs</span>
                      <span>${materialUsage.reduce((sum, m) => sum + m.cost, 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Labor Analytics */}
        {reportType === "labor" && (
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-600" />
                  Labor Statistics
                </CardTitle>
                <CardDescription>Workforce performance and attendance metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold">{laborStats.totalWorkers}</div>
                    <div className="text-sm text-muted-foreground">Total Workers</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{laborStats.averageAttendance}%</div>
                    <div className="text-sm text-muted-foreground">Avg Attendance</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold">{laborStats.totalHours.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Total Hours</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold">${(laborStats.laborCost / 1000).toFixed(0)}K</div>
                    <div className="text-sm text-muted-foreground">Labor Cost</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Overtime Analysis</CardTitle>
                <CardDescription>Overtime hours and cost breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Overtime Rate</span>
                    <span className="font-semibold">{laborStats.overtime.toFixed(1)}%</span>
                  </div>
                  <Progress value={laborStats.overtime} className="h-2" />
                  <div className="text-sm text-muted-foreground">
                    Overtime costs: ${((laborStats.laborCost * laborStats.overtime) / 100).toFixed(0)}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
      {/* Notification */}
      {notification.message && (
        <Alert
          className={
            notification.type === "error"
              ? "border-red-500 bg-red-50 dark:bg-red-950/20"
              : "border-green-500 bg-green-50 dark:bg-green-950/20"
          }
        >
          {notification.type === "error" ? (
            <AlertTriangle className="h-4 w-4 text-red-600" />
          ) : (
            <CheckCircle className="h-4 w-4 text-green-600" />
          )}
          <AlertDescription
            className={
              notification.type === "error" ? "text-red-800 dark:text-red-200" : "text-green-800 dark:text-green-200"
            }
          >
            {notification.message}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
