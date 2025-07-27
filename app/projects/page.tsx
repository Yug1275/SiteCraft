"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
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
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Building2,
  Plus,
  Search,
  Calendar,
  DollarSign,
  MapPin,
  Users,
  Clock,
  Edit,
  Eye,
  UserPlus,
  Trash2,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function ProjectsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [projects, setProjects] = useState([])
  const [managers, setManagers] = useState([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isManagerDialogOpen, setIsManagerDialogOpen] = useState(false)
  const { toast } = useToast()

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    description: "",
    budget: "",
    startDate: "",
    endDate: "",
    manager: "",
  })

  const [managerData, setManagerData] = useState({
    name: "",
    email: "",
    phone: "",
    experience: "",
    specialization: "",
  })

  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingProject, setEditingProject] = useState(null)

  useEffect(() => {
    // Load data from localStorage
    const savedProjects = localStorage.getItem("sitecraft-projects")
    const savedManagers = localStorage.getItem("sitecraft-managers")

    if (savedProjects) setProjects(JSON.parse(savedProjects))
    if (savedManagers) setManagers(JSON.parse(savedManagers))
  }, [])

  const filteredProjects = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.location.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "On Track":
        return "default"
      case "Ahead":
        return "secondary"
      case "Delayed":
        return "destructive"
      default:
        return "default"
    }
  }

  const handleCreateProject = () => {
    if (!formData.name || !formData.location || !formData.budget || !formData.startDate || !formData.endDate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    const newProject = {
      id: Date.now(),
      ...formData,
      budget: Number.parseFloat(formData.budget),
      progress: 0,
      status: "On Track",
      workers: 0,
      createdDate: new Date().toISOString(),
    }

    const updatedProjects = [...projects, newProject]
    setProjects(updatedProjects)
    localStorage.setItem("sitecraft-projects", JSON.stringify(updatedProjects))

    toast({
      title: "Success",
      description: "Project created successfully",
    })

    setFormData({
      name: "",
      location: "",
      description: "",
      budget: "",
      startDate: "",
      endDate: "",
      manager: "",
    })
    setIsDialogOpen(false)
  }

  const handleCreateManager = () => {
    if (!managerData.name || !managerData.email || !managerData.phone) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    const newManager = {
      id: Date.now(),
      ...managerData,
      createdDate: new Date().toISOString(),
    }

    const updatedManagers = [...managers, newManager]
    setManagers(updatedManagers)
    localStorage.setItem("sitecraft-managers", JSON.stringify(updatedManagers))

    toast({
      title: "Success",
      description: "Project manager added successfully",
    })

    setManagerData({
      name: "",
      email: "",
      phone: "",
      experience: "",
      specialization: "",
    })
    setIsManagerDialogOpen(false)
  }

  const handleRemoveProject = (projectId) => {
    const updatedProjects = projects.filter((p) => p.id !== projectId)
    setProjects(updatedProjects)
    localStorage.setItem("sitecraft-projects", JSON.stringify(updatedProjects))

    toast({
      title: "Success",
      description: "Project removed successfully",
    })
  }

  const handleViewProject = (project) => {
    // Create detailed view logic
    toast({
      title: "Project Details",
      description: `Viewing details for ${project.name}`,
    })
  }

  const handleEditProject = (project) => {
    setEditingProject(project)
    setFormData({
      name: project.name,
      location: project.location,
      description: project.description || "",
      budget: project.budget.toString(),
      startDate: project.startDate,
      endDate: project.endDate,
      manager: project.manager || "",
    })
    setEditDialogOpen(true)
  }

  const handleUpdateProject = () => {
    if (!formData.name || !formData.location || !formData.budget || !formData.startDate || !formData.endDate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    const updatedProjects = projects.map((p) =>
      p.id === editingProject.id ? { ...p, ...formData, budget: Number.parseFloat(formData.budget) } : p,
    )

    setProjects(updatedProjects)
    localStorage.setItem("sitecraft-projects", JSON.stringify(updatedProjects))

    toast({
      title: "Success",
      description: "Project updated successfully",
    })

    setFormData({
      name: "",
      location: "",
      description: "",
      budget: "",
      startDate: "",
      endDate: "",
      manager: "",
    })
    setEditingProject(null)
    setEditDialogOpen(false)
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center gap-4 px-6">
          <SidebarTrigger />
          <div className="flex-1">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Project Management
            </h1>
            <p className="text-sm text-muted-foreground">Manage and track all your construction projects</p>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Dialog open={isManagerDialogOpen} onOpenChange={setIsManagerDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Manager
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Project Manager</DialogTitle>
                  <DialogDescription>Add a new project manager to your team</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="manager-name">Full Name *</Label>
                      <Input
                        id="manager-name"
                        placeholder="Enter manager name"
                        value={managerData.name}
                        onChange={(e) => setManagerData({ ...managerData, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="manager-email">Email *</Label>
                      <Input
                        id="manager-email"
                        type="email"
                        placeholder="manager@example.com"
                        value={managerData.email}
                        onChange={(e) => setManagerData({ ...managerData, email: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="manager-phone">Phone *</Label>
                      <Input
                        id="manager-phone"
                        placeholder="+1-555-0000"
                        value={managerData.phone}
                        onChange={(e) => setManagerData({ ...managerData, phone: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="manager-experience">Experience (Years)</Label>
                      <Input
                        id="manager-experience"
                        type="number"
                        placeholder="5"
                        value={managerData.experience}
                        onChange={(e) => setManagerData({ ...managerData, experience: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="manager-specialization">Specialization</Label>
                    <Input
                      id="manager-specialization"
                      placeholder="e.g., Commercial Construction, Residential"
                      value={managerData.specialization}
                      onChange={(e) => setManagerData({ ...managerData, specialization: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsManagerDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateManager}>Add Manager</Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                  <Plus className="h-4 w-4 mr-2" />
                  New Project
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Project</DialogTitle>
                  <DialogDescription>Add a new construction project to your portfolio</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Project Name *</Label>
                      <Input
                        id="name"
                        placeholder="Enter project name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location *</Label>
                      <Input
                        id="location"
                        placeholder="Project location"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Project description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="budget">Budget ($) *</Label>
                      <Input
                        id="budget"
                        type="number"
                        placeholder="0"
                        value={formData.budget}
                        onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="start-date">Start Date *</Label>
                      <Input
                        id="start-date"
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="end-date">End Date *</Label>
                      <Input
                        id="end-date"
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="manager">Project Manager</Label>
                    <Select
                      value={formData.manager}
                      onValueChange={(value) => setFormData({ ...formData, manager: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select manager" />
                      </SelectTrigger>
                      <SelectContent>
                        {managers.map((manager) => (
                          <SelectItem key={manager.id} value={manager.name}>
                            {manager.name} - {manager.specialization}
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
                  <Button onClick={handleCreateProject}>Create Project</Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Edit Project</DialogTitle>
                  <DialogDescription>Update project information</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  {/* Same form fields as create dialog */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-name">Project Name *</Label>
                      <Input
                        id="edit-name"
                        placeholder="Enter project name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-location">Location *</Label>
                      <Input
                        id="edit-location"
                        placeholder="Project location"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-description">Description</Label>
                    <Textarea
                      id="edit-description"
                      placeholder="Project description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-budget">Budget ($) *</Label>
                      <Input
                        id="edit-budget"
                        type="number"
                        placeholder="0"
                        value={formData.budget}
                        onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-start-date">Start Date *</Label>
                      <Input
                        id="edit-start-date"
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-end-date">End Date *</Label>
                      <Input
                        id="edit-end-date"
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-manager">Project Manager</Label>
                    <Select
                      value={formData.manager}
                      onValueChange={(value) => setFormData({ ...formData, manager: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select manager" />
                      </SelectTrigger>
                      <SelectContent>
                        {managers.map((manager) => (
                          <SelectItem key={manager.id} value={manager.name}>
                            {manager.name} - {manager.specialization}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleUpdateProject}>Update Project</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No projects found</h3>
            <p className="text-muted-foreground mb-4">Get started by creating your first project</p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Project
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => (
              <Card key={project.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{project.name}</CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {project.location}
                      </CardDescription>
                    </div>
                    <Badge variant={getStatusColor(project.status)}>{project.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span className="font-medium">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span>${(project.budget / 1000000).toFixed(1)}M</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-600" />
                      <span>{project.workers} workers</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-purple-600" />
                      <span>{new Date(project.startDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-orange-600" />
                      <span>{new Date(project.endDate).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {project.manager && (
                    <div className="text-sm">
                      <span className="font-medium">Manager: </span>
                      <span className="text-muted-foreground">{project.manager}</span>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-transparent"
                      onClick={() => handleViewProject(project)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-transparent"
                      onClick={() => handleEditProject(project)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleRemoveProject(project.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
