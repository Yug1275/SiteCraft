"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Users, Search, Calendar, Clock, CheckCircle, XCircle, Download, UserPlus, DollarSign } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function LaborPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [workers, setWorkers] = useState([])
  const [projects, setProjects] = useState([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    role: "",
    hourlyRate: "",
    project: "",
  })

  useEffect(() => {
    const savedWorkers = localStorage.getItem("sitecraft-workers")
    const savedProjects = localStorage.getItem("sitecraft-projects")

    if (savedWorkers) setWorkers(JSON.parse(savedWorkers))
    if (savedProjects) setProjects(JSON.parse(savedProjects))
  }, [])

  const filteredWorkers = workers.filter(
    (worker) =>
      worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worker.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worker.project.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const presentWorkers = workers.filter((w) => w.isPresent).length
  const totalWorkers = workers.length
  const attendanceRate = totalWorkers > 0 ? Math.round((presentWorkers / totalWorkers) * 100) : 0

  const toggleAttendance = (workerId: number) => {
    setWorkers(
      workers.map((worker) => {
        if (worker.id === workerId) {
          const currentTime = new Date().toLocaleTimeString("en-US", {
            hour12: false,
            hour: "2-digit",
            minute: "2-digit",
          })

          if (worker.isPresent) {
            // Checking out
            return {
              ...worker,
              isPresent: false,
              checkOutTime: currentTime,
            }
          } else {
            // Checking in
            return {
              ...worker,
              isPresent: true,
              checkInTime: currentTime,
              checkOutTime: null,
            }
          }
        }
        return worker
      }),
    )

    // Update localStorage
    const updatedWorkers = workers.map((worker) => {
      if (worker.id === workerId) {
        const currentTime = new Date().toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
        })

        if (worker.isPresent) {
          return { ...worker, isPresent: false, checkOutTime: currentTime }
        } else {
          return { ...worker, isPresent: true, checkInTime: currentTime, checkOutTime: null }
        }
      }
      return worker
    })

    localStorage.setItem("sitecraft-workers", JSON.stringify(updatedWorkers))
  }

  const handleCreateWorker = () => {
    if (!formData.name || !formData.phone || !formData.role || !formData.hourlyRate || !formData.project) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    const newWorker = {
      id: Date.now(),
      name: formData.name,
      phone: formData.phone,
      role: formData.role,
      hourlyRate: Number.parseFloat(formData.hourlyRate),
      project: formData.project,
      isPresent: false,
      checkInTime: null,
      checkOutTime: null,
      createdDate: new Date().toISOString(),
    }

    const updatedWorkers = [...workers, newWorker]
    setWorkers(updatedWorkers)
    localStorage.setItem("sitecraft-workers", JSON.stringify(updatedWorkers))

    toast({
      title: "Success",
      description: "Worker added successfully",
    })

    setFormData({
      name: "",
      phone: "",
      role: "",
      hourlyRate: "",
      project: "",
    })
    setIsDialogOpen(false)
  }

  const exportReport = () => {
    const reportData = {
      date: selectedDate,
      totalWorkers,
      presentWorkers,
      attendanceRate,
      workers: filteredWorkers.map((w) => ({
        name: w.name,
        role: w.role,
        project: w.project,
        status: w.isPresent ? "Present" : "Absent",
        checkIn: w.checkInTime || "N/A",
        checkOut: w.checkOutTime || "N/A",
      })),
    }

    const dataStr = JSON.stringify(reportData, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)

    const exportFileDefaultName = `attendance-report-${selectedDate}.json`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()

    toast({
      title: "Success",
      description: "Attendance report exported successfully",
    })
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center gap-4 px-6">
          <SidebarTrigger />
          <div className="flex-1">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Labor Management
            </h1>
            <p className="text-sm text-muted-foreground">Track worker attendance and manage labor resources</p>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Workers</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalWorkers}</div>
              <p className="text-xs text-muted-foreground">Active employees</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Present Today</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{presentWorkers}</div>
              <p className="text-xs text-muted-foreground">Currently on site</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
              <Clock className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{attendanceRate}%</div>
              <p className="text-xs text-muted-foreground">Today's rate</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Daily Labor Cost</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                $
                {workers
                  .filter((w) => w.isPresent)
                  .reduce((sum, w) => sum + w.hourlyRate * 8, 0)
                  .toFixed(0)}
              </div>
              <p className="text-xs text-muted-foreground">Estimated 8hrs</p>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search workers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-40"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportReport}>
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Worker
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Worker</DialogTitle>
                  <DialogDescription>Add a new worker to your labor force</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="worker-name">Full Name *</Label>
                      <Input
                        id="worker-name"
                        placeholder="Enter worker name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        placeholder="+1-555-0000"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="role">Role/Trade *</Label>
                      <Select
                        value={formData.role}
                        onValueChange={(value) => setFormData({ ...formData, role: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mason">Mason</SelectItem>
                          <SelectItem value="electrician">Electrician</SelectItem>
                          <SelectItem value="carpenter">Carpenter</SelectItem>
                          <SelectItem value="plumber">Plumber</SelectItem>
                          <SelectItem value="laborer">Laborer</SelectItem>
                          <SelectItem value="operator">Equipment Operator</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hourly-rate">Hourly Rate ($) *</Label>
                      <Input
                        id="hourly-rate"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.hourlyRate}
                        onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="project">Assigned Project *</Label>
                    <Select
                      value={formData.project}
                      onValueChange={(value) => setFormData({ ...formData, project: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select project" />
                      </SelectTrigger>
                      <SelectContent>
                        {projects.map((project) => (
                          <SelectItem key={project.id} value={project.name}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateWorker}>Add Worker</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Attendance Table */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Daily Attendance - {new Date(selectedDate).toLocaleDateString()}</CardTitle>
            <CardDescription>Mark attendance and track worker check-in/check-out times</CardDescription>
          </CardHeader>
          <CardContent>
            {workers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No workers found</h3>
                <p className="text-muted-foreground mb-4">Get started by adding your first worker</p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Worker
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Worker</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Check In</TableHead>
                    <TableHead>Check Out</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWorkers.map((worker) => (
                    <TableRow key={worker.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{worker.name}</div>
                          <div className="text-sm text-muted-foreground">{worker.phone}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{worker.role}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">{worker.project}</TableCell>
                      <TableCell>
                        {worker.checkInTime ? (
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-green-600" />
                            {worker.checkInTime}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Not checked in</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {worker.checkOutTime ? (
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-red-600" />
                            {worker.checkOutTime}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={worker.isPresent ? "default" : "secondary"}>
                          {worker.isPresent ? (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          ) : (
                            <XCircle className="h-3 w-3 mr-1" />
                          )}
                          {worker.isPresent ? "Present" : "Absent"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant={worker.isPresent ? "destructive" : "default"}
                          size="sm"
                          onClick={() => toggleAttendance(worker.id)}
                        >
                          {worker.isPresent ? "Check Out" : "Check In"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
