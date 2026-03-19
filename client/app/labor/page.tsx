"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Users, Search, Calendar, Clock, CheckCircle, XCircle, Download, UserPlus, DollarSign, Trash2,
} from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import api from "@/lib/api"
import { toast } from "sonner"

export default function LaborPage() {
  const { loading: authLoading, isAuthenticated } = useAuth()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [workers, setWorkers] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const [formData, setFormData] = useState({ name: "", phone: "", role: "", hourly_rate: "", project_id: "" })

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login')
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated) fetchData()
  }, [isAuthenticated])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [laborRes, projectsRes] = await Promise.all([
        api.get<{ labor: any[] }>('/labor'),
        api.get<{ projects: any[] }>('/projects'),
      ])
      setWorkers(laborRes.labor || [])
      setProjects(projectsRes.projects || [])
    } catch (error: any) {
      toast.error("Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  const filteredWorkers = workers.filter(
    (w) =>
      w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.role.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const presentWorkers = workers.filter((w) => w.is_present).length
  const totalWorkers = workers.length
  const attendanceRate = totalWorkers > 0 ? Math.round((presentWorkers / totalWorkers) * 100) : 0

  const toggleAttendance = async (worker: any) => {
    const currentTime = new Date().toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit" })
    try {
      if (worker.is_present) {
        await api.put(`/labor/${worker.id}`, { is_present: false, check_out_time: currentTime })
      } else {
        await api.put(`/labor/${worker.id}`, { is_present: true, check_in_time: currentTime, check_out_time: null })
      }
      toast.success(worker.is_present ? "Checked out" : "Checked in")
      fetchData()
    } catch (error: any) {
      toast.error("Failed to update attendance")
    }
  }

  const handleCreateWorker = async () => {
    if (!formData.name || !formData.phone || !formData.role || !formData.hourly_rate || !formData.project_id) {
      toast.error("Please fill in all required fields")
      return
    }
    try {
      await api.post('/labor', {
        name: formData.name,
        phone: formData.phone,
        role: formData.role,
        hourly_rate: parseFloat(formData.hourly_rate),
        project_id: formData.project_id,
      })
      toast.success("Worker added successfully")
      setFormData({ name: "", phone: "", role: "", hourly_rate: "", project_id: "" })
      setIsDialogOpen(false)
      fetchData()
    } catch (error: any) {
      toast.error(error.message || "Failed to add worker")
    }
  }

  const handleDeleteWorker = async () => {
    if (!deleteId) return
    try {
      await api.delete(`/labor/${deleteId}`)
      toast.success("Worker removed successfully")
      setDeleteId(null)
      fetchData()
    } catch (error: any) {
      toast.error(error.message || "Failed to remove worker")
    }
  }

  const exportReport = () => {
    const reportData = {
      date: selectedDate, totalWorkers, presentWorkers, attendanceRate,
      workers: filteredWorkers.map((w) => ({
        name: w.name, role: w.role, status: w.is_present ? "Present" : "Absent",
        checkIn: w.check_in_time || "N/A", checkOut: w.check_out_time || "N/A",
      })),
    }
    const dataStr = JSON.stringify(reportData, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)
    const link = document.createElement("a")
    link.setAttribute("href", dataUri)
    link.setAttribute("download", `attendance-report-${selectedDate}.json`)
    link.click()
    toast.success("Report exported")
  }

  if (authLoading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
  if (!isAuthenticated) return null

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center gap-4 px-6">
          <SidebarTrigger />
          <div className="flex-1">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Labor Management</h1>
            <p className="text-sm text-muted-foreground">Track worker attendance and manage labor resources</p>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          {[
            { title: "Total Workers", value: totalWorkers, icon: Users, color: "text-blue-600", sub: "Active employees" },
            { title: "Present Today", value: presentWorkers, icon: CheckCircle, color: "text-green-600", sub: "Currently on site", valColor: "text-green-600" },
            { title: "Attendance Rate", value: `${attendanceRate}%`, icon: Clock, color: "text-purple-600", sub: "Today's rate" },
            { title: "Daily Labor Cost", value: `$${workers.filter((w) => w.is_present).reduce((s, w) => s + (w.hourly_rate || 0) * 8, 0).toFixed(0)}`, icon: DollarSign, color: "text-green-600", sub: "Estimated 8hrs" },
          ].map((s, i) => (
            <Card key={i} className="border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{s.title}</CardTitle><s.icon className={`h-4 w-4 ${s.color}`} />
              </CardHeader>
              <CardContent>{loading ? <Skeleton className="h-7 w-16" /> : <><div className={`text-2xl font-bold ${s.valColor || ""}`}>{s.value}</div><p className="text-xs text-muted-foreground">{s.sub}</p></>}</CardContent>
            </Card>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input placeholder="Search workers..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 w-64" />
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-40" />
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportReport} className="rounded-xl"><Download className="h-4 w-4 mr-2" />Export Report</Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 rounded-xl"><UserPlus className="h-4 w-4 mr-2" />Add Worker</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border border-white/20 shadow-2xl rounded-2xl">
                <DialogHeader><DialogTitle>Add New Worker</DialogTitle><DialogDescription>Add a new worker to your labor force</DialogDescription></DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Full Name *</Label><Input placeholder="Enter worker name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></div>
                    <div className="space-y-2"><Label>Phone Number *</Label><Input placeholder="+1-555-0000" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Role/Trade *</Label>
                      <Select value={formData.role} onValueChange={(v) => setFormData({ ...formData, role: v })}>
                        <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                        <SelectContent>
                          {["Mason", "Electrician", "Carpenter", "Plumber", "Laborer", "Equipment Operator"].map((r) => <SelectItem key={r} value={r.toLowerCase()}>{r}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2"><Label>Hourly Rate ($) *</Label><Input type="number" step="0.01" placeholder="0.00" value={formData.hourly_rate} onChange={(e) => setFormData({ ...formData, hourly_rate: e.target.value })} /></div>
                  </div>
                  <div className="space-y-2"><Label>Assigned Project *</Label>
                    <Select value={formData.project_id} onValueChange={(v) => setFormData({ ...formData, project_id: v })}>
                      <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
                      <SelectContent>{projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button><Button onClick={handleCreateWorker}>Add Worker</Button></div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="backdrop-blur-xl bg-white/60 dark:bg-slate-900/60 border border-white/20 shadow-xl rounded-2xl">
                <CardContent className="p-6">
                  <Skeleton className="h-12 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : workers.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No workers found</h3>
            <p className="text-muted-foreground mb-4">Get started by adding your first worker</p>
            <Button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 rounded-xl" onClick={() => setIsDialogOpen(true)}>
              <UserPlus className="h-4 w-4 mr-2" />Add Worker
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredWorkers.map((w) => (
              <Card key={w.id} className="backdrop-blur-xl bg-white/60 dark:bg-slate-900/60 border border-white/20 shadow-xl rounded-2xl transition-all hover:shadow-2xl hover:-translate-y-1">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-xl font-bold">{w.name}</CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <Users className="h-3 w-3" />{w.role}
                      </CardDescription>
                    </div>
                    <Badge variant={w.is_present ? "default" : "secondary"} className={w.is_present ? "bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20" : ""}>
                      {w.is_present ? <><CheckCircle className="h-3 w-3 mr-1" />Present</> : <><XCircle className="h-3 w-3 mr-1" />Absent</>}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {w.phone && <p className="text-sm text-muted-foreground">Contact: {w.phone}</p>}
                  
                  <div className="grid grid-cols-2 gap-4 text-sm mt-4">
                    <div className="p-3 rounded-lg bg-white/50 dark:bg-slate-800/50 border border-white/10 dark:border-slate-700/50">
                      <span className="text-muted-foreground flex items-center gap-1 mb-1"><Clock className="h-3 w-3" /> Check In</span>
                      <span className="font-medium text-green-600 dark:text-green-400">{w.check_in_time || "Not checked in"}</span>
                    </div>
                    <div className="p-3 rounded-lg bg-white/50 dark:bg-slate-800/50 border border-white/10 dark:border-slate-700/50">
                      <span className="text-muted-foreground flex items-center gap-1 mb-1"><Clock className="h-3 w-3" /> Check Out</span>
                      <span className="font-medium text-red-600 dark:text-red-400">{w.check_out_time || "-"}</span>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant={w.is_present ? "destructive" : "default"} size="sm" onClick={() => toggleAttendance(w)} className="rounded-xl">
                      {w.is_present ? "Check Out" : "Check In"}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setDeleteId(w.id)} className="rounded-xl">
                      <Trash2 className="h-4 w-4 mr-2" /> Remove
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border border-white/20 shadow-2xl rounded-2xl">
          <AlertDialogHeader><AlertDialogTitle>Remove Worker</AlertDialogTitle><AlertDialogDescription>Are you sure? This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDeleteWorker} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl">Remove</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
