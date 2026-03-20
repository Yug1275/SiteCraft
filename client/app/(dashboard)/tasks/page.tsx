"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
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
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ClipboardList, Plus, Search, Calendar, CheckCircle, Clock, AlertTriangle, Edit, Trash2,
} from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import api from "@/lib/api"
import { toast } from "sonner"

export default function TasksPage() {
  const { loading: authLoading, isAuthenticated, user } = useAuth()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [tasks, setTasks] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editingTask, setEditingTask] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const [formData, setFormData] = useState({
    title: "", description: "", status: "Pending", priority: "Medium", assignee: "", due_date: "", project_id: "",
  })

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login')
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated) fetchData()
  }, [isAuthenticated])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [tasksRes, projectsRes] = await Promise.all([
        api.get<{ tasks: any[] }>('/tasks'),
        api.get<{ projects: any[] }>('/projects'),
      ])
      setTasks(tasksRes.tasks || [])
      setProjects(projectsRes.projects || [])
    } catch (error: any) {
      toast.error("Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.assignee || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || task.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const taskCounts = {
    all: tasks.length,
    Pending: tasks.filter((t) => t.status === "Pending").length,
    "In Progress": tasks.filter((t) => t.status === "In Progress").length,
    Completed: tasks.filter((t) => t.status === "Completed").length,
  }

  const getPriorityColor = (p: string) => {
    switch (p) { case "High": return "destructive"; case "Medium": return "default"; case "Low": return "secondary"; default: return "default" }
  }
  const getStatusIcon = (s: string) => {
    switch (s) { case "Completed": return <CheckCircle className="h-4 w-4 text-green-500" />; case "In Progress": return <Clock className="h-4 w-4 text-blue-500" />; default: return <AlertTriangle className="h-4 w-4 text-yellow-500" /> }
  }

  const resetForm = () => setFormData({ title: "", description: "", status: "Pending", priority: "Medium", assignee: "", due_date: "", project_id: "" })

  const handleCreateTask = async () => {
    if (!formData.title) { toast.error("Title is required"); return }
    try {
      await api.post('/tasks', {
        ...formData,
        user_id: user?.id,
        user_email: user?.email,
        user_name: user?.name,
      })
      toast.success("Task created"); resetForm(); setIsDialogOpen(false); fetchData()
    } catch (error: any) { toast.error(error.message || "Failed to create task") }
  }

  const handleEditTask = (task: any) => {
    setEditingTask(task)
    setFormData({
      title: task.title, description: task.description || "", status: task.status, priority: task.priority,
      assignee: task.assignee || "", due_date: task.due_date || "", project_id: task.project_id || "",
    })
    setEditDialogOpen(true)
  }

  const handleUpdateTask = async () => {
    if (!formData.title) { toast.error("Title is required"); return }
    try {
      await api.put(`/tasks/${editingTask.id}`, formData)
      toast.success("Task updated"); resetForm(); setEditDialogOpen(false); setEditingTask(null); fetchData()
    } catch (error: any) { toast.error(error.message || "Failed to update task") }
  }

  const handleDeleteTask = async () => {
    if (!deleteId) return
    try { await api.delete(`/tasks/${deleteId}`); toast.success("Task deleted"); setDeleteId(null); fetchData() }
    catch (error: any) { toast.error(error.message || "Failed to delete task") }
  }

  const handleStatusChange = async (task: any, newStatus: string) => {
    try { await api.put(`/tasks/${task.id}`, { status: newStatus }); toast.success(`Task marked as ${newStatus}`); fetchData() }
    catch (error: any) { toast.error("Failed to update status") }
  }

  if (authLoading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
  if (!isAuthenticated) return null

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <header className="sticky top-0 z-40 border-b bg-white/10 dark:bg-slate-900/30 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center gap-4 px-6">
          <div className="flex-1">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">Task Management</h1>
            <p className="text-sm text-muted-foreground">Create, assign, and track construction tasks</p>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          {[
            { title: "Total Tasks", value: taskCounts.all, icon: ClipboardList, color: "text-blue-600" },
            { title: "Pending", value: taskCounts.Pending, icon: AlertTriangle, color: "text-yellow-600" },
            { title: "In Progress", value: taskCounts["In Progress"], icon: Clock, color: "text-blue-600" },
            { title: "Completed", value: taskCounts.Completed, icon: CheckCircle, color: "text-green-600" },
          ].map((s, i) => (
            <Card key={i} className="backdrop-blur-xl bg-white/60 dark:bg-slate-900/60 border border-white/20 shadow-xl rounded-2xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">{s.title}</CardTitle><s.icon className={`h-4 w-4 ${s.color}`} /></CardHeader>
              <CardContent>{loading ? <Skeleton className="h-7 w-16" /> : <div className="text-2xl font-bold">{s.value}</div>}</CardContent>
            </Card>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" /><Input placeholder="Search tasks..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 w-64" /></div>
          <div className="flex gap-2">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild><Button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg"><Plus className="h-4 w-4 mr-2" />New Task</Button></DialogTrigger>
              <DialogContent className="max-w-2xl backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border border-white/20 shadow-2xl rounded-2xl"><DialogHeader><DialogTitle>Create New Task</DialogTitle><DialogDescription>Add a new task to your project</DialogDescription></DialogHeader>
                <TaskForm formData={formData} setFormData={setFormData} projects={projects} onSubmit={handleCreateTask} onCancel={() => { resetForm(); setIsDialogOpen(false); setEditDialogOpen(false) }} label="Create Task" />
              </DialogContent>
            </Dialog>
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
              <DialogContent className="max-w-2xl backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border border-white/20 shadow-2xl rounded-2xl"><DialogHeader><DialogTitle>Edit Task</DialogTitle><DialogDescription>Update task details</DialogDescription></DialogHeader>
                <TaskForm formData={formData} setFormData={setFormData} projects={projects} onSubmit={handleUpdateTask} onCancel={() => { resetForm(); setIsDialogOpen(false); setEditDialogOpen(false) }} label="Update Task" />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Tabs value={filterStatus} onValueChange={setFilterStatus}>
          <TabsList><TabsTrigger value="all">All ({taskCounts.all})</TabsTrigger><TabsTrigger value="Pending">Pending ({taskCounts.Pending})</TabsTrigger><TabsTrigger value="In Progress">In Progress ({taskCounts["In Progress"]})</TabsTrigger><TabsTrigger value="Completed">Completed ({taskCounts.Completed})</TabsTrigger></TabsList>
          <TabsContent value={filterStatus} className="mt-6">
            {loading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{[1,2,3].map((i) => <Card key={i} className="border-0 shadow-lg"><CardHeader><Skeleton className="h-5 w-48" /></CardHeader><CardContent><Skeleton className="h-20 w-full" /></CardContent></Card>)}</div>
            ) : filteredTasks.length === 0 ? (
              <div className="text-center py-12"><ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-4" /><h3 className="text-lg font-semibold mb-2">No tasks found</h3><p className="text-muted-foreground mb-4">Create your first task to get started</p><Button onClick={() => setIsDialogOpen(true)}><Plus className="h-4 w-4 mr-2" />New Task</Button></div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredTasks.map((task) => (
                  <Card key={task.id} className="backdrop-blur-xl bg-white/60 dark:bg-slate-900/60 border border-white/20 shadow-xl rounded-2xl transition-all hover:shadow-2xl hover:-translate-y-1">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">{getStatusIcon(task.status)}<CardTitle className="text-base">{task.title}</CardTitle></div>
                        <Badge variant={getPriorityColor(task.priority) as any}>{task.priority}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {task.description && <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>}
                      <div className="space-y-2"><div className="flex justify-between text-sm"><span>Progress</span><span>{task.progress || 0}%</span></div><Progress value={task.progress || 0} className="h-2" /></div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {task.assignee && <div className="flex items-center gap-1 text-muted-foreground"><span className="font-medium">{task.assignee}</span></div>}
                        {task.due_date && <div className="flex items-center gap-1 text-muted-foreground"><Calendar className="h-3 w-3" />{new Date(task.due_date).toLocaleDateString()}</div>}
                      </div>
                      <div className="flex gap-1">
                        <Select value={task.status} onValueChange={(v) => handleStatusChange(task, v)}>
                          <SelectTrigger className="h-8 text-xs flex-1"><SelectValue /></SelectTrigger>
                          <SelectContent>{["Pending", "In Progress", "Completed"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                        </Select>
                        <Button variant="outline" size="sm" className="h-8 px-2" onClick={() => handleEditTask(task)}><Edit className="h-3 w-3" /></Button>
                        <Button variant="destructive" size="sm" className="h-8 px-2" onClick={() => setDeleteId(task.id)}><Trash2 className="h-3 w-3" /></Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete Task</AlertDialogTitle><AlertDialogDescription>Are you sure? This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
        <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDeleteTask} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

const TaskForm = ({ formData, setFormData, projects, onSubmit, onCancel, label }: { 
  formData: any; 
  setFormData: (data: any) => void;
  projects: any[];
  onSubmit: () => void; 
  onCancel: () => void;
  label: string;
}) => (
  <div className="grid gap-4 py-4">
    <div className="space-y-2"><Label>Title *</Label><Input placeholder="Task title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="bg-white/50 dark:bg-slate-950/50" /></div>
    <div className="space-y-2"><Label>Description</Label><Textarea placeholder="Task description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="bg-white/50 dark:bg-slate-950/50" /></div>
    <div className="grid grid-cols-3 gap-4">
      <div className="space-y-2"><Label>Status</Label><Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
        <SelectTrigger className="bg-white/50 dark:bg-slate-950/50"><SelectValue /></SelectTrigger><SelectContent>{["Pending", "In Progress", "Completed"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
      </Select></div>
      <div className="space-y-2"><Label>Priority</Label><Select value={formData.priority} onValueChange={(v) => setFormData({ ...formData, priority: v })}>
        <SelectTrigger className="bg-white/50 dark:bg-slate-950/50"><SelectValue /></SelectTrigger><SelectContent>{["Low", "Medium", "High"].map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
      </Select></div>
      <div className="space-y-2"><Label>Due Date</Label><Input type="date" value={formData.due_date} onChange={(e) => setFormData({ ...formData, due_date: e.target.value })} className="bg-white/50 dark:bg-slate-950/50" /></div>
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2"><Label>Assignee</Label><Input placeholder="Assigned to" value={formData.assignee} onChange={(e) => setFormData({ ...formData, assignee: e.target.value })} className="bg-white/50 dark:bg-slate-950/50" /></div>
      <div className="space-y-2"><Label>Project</Label><Select value={formData.project_id} onValueChange={(v) => setFormData({ ...formData, project_id: v })}>
        <SelectTrigger className="bg-white/50 dark:bg-slate-950/50"><SelectValue placeholder="Select project" /></SelectTrigger><SelectContent>{projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
      </Select></div>
    </div>
    <div className="flex justify-end gap-2 pt-4"><Button variant="outline" onClick={onCancel} className="bg-white/50 dark:bg-slate-800/50">Cancel</Button><Button onClick={onSubmit} className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg">{label}</Button></div>
  </div>
)
