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
import {
  Building2, Plus, Search, Calendar, DollarSign, MapPin, Users, Clock, Edit, Eye, Trash2,
} from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import api from "@/lib/api"
import { toast } from "sonner"

export default function ProjectsPage() {
  const { loading: authLoading, isAuthenticated } = useAuth()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [projects, setProjects] = useState<any[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editingProject, setEditingProject] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const [formData, setFormData] = useState({
    name: "", location: "", description: "", budget: "", start_date: "", end_date: "", manager: "",
  })

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login')
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated) fetchProjects()
  }, [isAuthenticated])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const data = await api.get<{ projects: any[] }>('/projects')
      setProjects(data.projects || [])
    } catch (error: any) {
      toast.error("Failed to load projects")
    } finally {
      setLoading(false)
    }
  }

  const filteredProjects = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.location.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "On Track": return "default"
      case "Ahead": return "secondary"
      case "Delayed": return "destructive"
      default: return "default"
    }
  }

  const resetForm = () => {
    setFormData({ name: "", location: "", description: "", budget: "", start_date: "", end_date: "", manager: "" })
  }

  const handleCreateProject = async () => {
    if (!formData.name || !formData.location) {
      toast.error("Name and location are required")
      return
    }
    try {
      await api.post('/projects', {
        ...formData,
        budget: formData.budget ? parseFloat(formData.budget) : 0,
      })
      toast.success("Project created successfully")
      resetForm()
      setIsDialogOpen(false)
      fetchProjects()
    } catch (error: any) {
      toast.error(error.message || "Failed to create project")
    }
  }

  const handleEditProject = (project: any) => {
    setEditingProject(project)
    setFormData({
      name: project.name,
      location: project.location,
      description: project.description || "",
      budget: project.budget?.toString() || "",
      start_date: project.start_date || "",
      end_date: project.end_date || "",
      manager: project.manager || "",
    })
    setEditDialogOpen(true)
  }

  const handleUpdateProject = async () => {
    if (!formData.name || !formData.location) {
      toast.error("Name and location are required")
      return
    }
    try {
      await api.put(`/projects/${editingProject.id}`, {
        ...formData,
        budget: formData.budget ? parseFloat(formData.budget) : 0,
      })
      toast.success("Project updated successfully")
      resetForm()
      setEditingProject(null)
      setEditDialogOpen(false)
      fetchProjects()
    } catch (error: any) {
      toast.error(error.message || "Failed to update project")
    }
  }

  const handleDeleteProject = async () => {
    if (!deleteId) return
    try {
      await api.delete(`/projects/${deleteId}`)
      toast.success("Project deleted successfully")
      setDeleteId(null)
      fetchProjects()
    } catch (error: any) {
      toast.error(error.message || "Failed to delete project")
    }
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (!isAuthenticated) return null

  const ProjectForm = ({ onSubmit, submitLabel }: { onSubmit: () => void; submitLabel: string }) => (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Project Name *</Label>
          <Input placeholder="Enter project name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Location *</Label>
          <Input placeholder="Project location" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea placeholder="Project description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Budget ($)</Label>
          <Input type="number" placeholder="0" value={formData.budget} onChange={(e) => setFormData({ ...formData, budget: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Start Date</Label>
          <Input type="date" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>End Date</Label>
          <Input type="date" value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Project Manager</Label>
        <Input placeholder="Manager name" value={formData.manager} onChange={(e) => setFormData({ ...formData, manager: e.target.value })} />
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => { resetForm(); setIsDialogOpen(false); setEditDialogOpen(false) }}>Cancel</Button>
        <Button onClick={onSubmit}>{submitLabel}</Button>
      </div>
    </div>
  )

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center gap-4 px-6">
          <SidebarTrigger />
          <div className="flex-1">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Project Management
            </h1>
            <p className="text-sm text-muted-foreground">Manage and track all your construction projects</p>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input placeholder="Search projects..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                <Plus className="h-4 w-4 mr-2" /> New Project
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
                <DialogDescription>Add a new construction project to your portfolio</DialogDescription>
              </DialogHeader>
              <ProjectForm onSubmit={handleCreateProject} submitLabel="Create Project" />
            </DialogContent>
          </Dialog>

          <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Edit Project</DialogTitle>
                <DialogDescription>Update project information</DialogDescription>
              </DialogHeader>
              <ProjectForm onSubmit={handleUpdateProject} submitLabel="Update Project" />
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border-0 shadow-lg">
                <CardHeader><Skeleton className="h-5 w-48" /><Skeleton className="h-3 w-32 mt-2" /></CardHeader>
                <CardContent><Skeleton className="h-2 w-full mb-4" /><Skeleton className="h-16 w-full" /></CardContent>
              </Card>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No projects found</h3>
            <p className="text-muted-foreground mb-4">Get started by creating your first project</p>
            <Button onClick={() => setIsDialogOpen(true)}><Plus className="h-4 w-4 mr-2" />Create Project</Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => (
              <Card key={project.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-200">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{project.name}</CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />{project.location}
                      </CardDescription>
                    </div>
                    <Badge variant={getStatusColor(project.status) as any}>{project.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {project.description && <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm"><span>Progress</span><span className="font-medium">{project.progress}%</span></div>
                    <Progress value={project.progress} className="h-2" />
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2"><DollarSign className="h-4 w-4 text-green-600" /><span>${((project.budget || 0) / 1000000).toFixed(1)}M</span></div>
                    <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-purple-600" /><span>{project.start_date ? new Date(project.start_date).toLocaleDateString() : "TBD"}</span></div>
                  </div>
                  {project.manager && <div className="text-sm"><span className="font-medium">Manager: </span><span className="text-muted-foreground">{project.manager}</span></div>}
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEditProject(project)}>
                      <Edit className="h-4 w-4 mr-1" />Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => setDeleteId(project.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete this project? This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProject} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
