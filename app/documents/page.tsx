"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  FileText,
  Upload,
  Search,
  Download,
  Eye,
  Trash2,
  File,
  ImageIcon,
  FileSpreadsheet,
  Calendar,
  User,
  FolderOpen,
  CheckCircle,
  AlertTriangle,
} from "lucide-react"

export default function DocumentsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [documents, setDocuments] = useState([])
  const [projects, setProjects] = useState([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [notification, setNotification] = useState({ type: "", message: "" })

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    project: "",
    file: null,
  })

  const categories = ["all", "Blueprints", "Reports", "Financial", "Photos", "Legal", "Manuals", "Contracts"]

  useEffect(() => {
    const savedDocuments = localStorage.getItem("sitecraft-documents")
    const savedProjects = localStorage.getItem("sitecraft-projects")

    if (savedDocuments) setDocuments(JSON.parse(savedDocuments))
    if (savedProjects) setProjects(JSON.parse(savedProjects))
  }, [])

  const showNotification = (type, message) => {
    setNotification({ type, message })
    setTimeout(() => setNotification({ type: "", message: "" }), 5000)
  }

  const handleUploadDocument = () => {
    setNotification({ type: "", message: "" })

    if (!formData.name || !formData.category || !formData.project) {
      showNotification("error", "Please fill in all required fields")
      return
    }

    const fileInput = document.getElementById("file-upload")
    const file = fileInput?.files?.[0]

    if (!file) {
      showNotification("error", "Please select a file to upload")
      return
    }

    // Get file extension and size
    const fileName = file.name
    const fileExtension = fileName.split(".").pop()?.toLowerCase() || "unknown"
    const fileSize = (file.size / 1024 / 1024).toFixed(2) + " MB"

    // Determine file type for icon
    let fileType = "document"
    if (["jpg", "jpeg", "png", "gif", "bmp"].includes(fileExtension)) {
      fileType = "images"
    } else if (["xls", "xlsx", "csv"].includes(fileExtension)) {
      fileType = "excel"
    } else if (["pdf"].includes(fileExtension)) {
      fileType = "pdf"
    }

    const newDocument = {
      id: Date.now(),
      name: formData.name,
      category: formData.category,
      project: formData.project,
      type: fileType,
      size: fileSize,
      uploadedBy: "Current User", // You can make this dynamic
      uploadDate: new Date().toISOString(),
      fileName: fileName,
      extension: fileExtension,
    }

    const updatedDocuments = [...documents, newDocument]
    setDocuments(updatedDocuments)
    localStorage.setItem("sitecraft-documents", JSON.stringify(updatedDocuments))

    showNotification("success", "Document uploaded successfully")

    // Reset form
    setFormData({
      name: "",
      category: "",
      project: "",
      file: null,
    })
    if (fileInput) fileInput.value = ""
    setIsDialogOpen(false)
  }

  const handleRemoveDocument = (docId) => {
    const updatedDocuments = documents.filter((d) => d.id !== docId)
    setDocuments(updatedDocuments)
    localStorage.setItem("sitecraft-documents", JSON.stringify(updatedDocuments))

    showNotification("success", "Document removed successfully")
  }

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.uploadedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.project.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === "all" || doc.category === filterType
    return matchesSearch && matchesType
  })

  const getFileIcon = (type) => {
    switch (type.toLowerCase()) {
      case "pdf":
        return <FileText className="h-5 w-5 text-red-600" />
      case "excel":
        return <FileSpreadsheet className="h-5 w-5 text-green-600" />
      case "images":
        return <ImageIcon className="h-5 w-5 text-blue-600" />
      default:
        return <File className="h-5 w-5 text-gray-600" />
    }
  }

  const getCategoryColor = (category) => {
    switch (category) {
      case "Blueprints":
        return "default"
      case "Reports":
        return "secondary"
      case "Financial":
        return "outline"
      case "Photos":
        return "default"
      case "Legal":
        return "destructive"
      case "Manuals":
        return "secondary"
      default:
        return "outline"
    }
  }

  const documentStats = {
    total: documents.length,
    blueprints: documents.filter((d) => d.category === "Blueprints").length,
    reports: documents.filter((d) => d.category === "Reports").length,
    photos: documents.filter((d) => d.category === "Photos").length,
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center gap-4 px-6">
          <SidebarTrigger />
          <div className="flex-1">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
              Document Management
            </h1>
            <p className="text-sm text-muted-foreground">Store, organize, and manage all your construction documents</p>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 space-y-6">
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

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
              <FileText className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{documentStats.total}</div>
              <p className="text-xs text-muted-foreground">All files</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Blueprints</CardTitle>
              <FolderOpen className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{documentStats.blueprints}</div>
              <p className="text-xs text-muted-foreground">Design files</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reports</CardTitle>
              <FileSpreadsheet className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{documentStats.reports}</div>
              <p className="text-xs text-muted-foreground">Analysis docs</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Photos</CardTitle>
              <ImageIcon className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{documentStats.photos}</div>
              <p className="text-xs text-muted-foreground">Site images</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category === "all" ? "All Categories" : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800">
                <Upload className="h-4 w-4 mr-2" />
                Upload Document
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload New Document</DialogTitle>
                <DialogDescription>Add a new document to your project files</DialogDescription>
              </DialogHeader>

              {/* Dialog Notification */}
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
                      notification.type === "error"
                        ? "text-red-800 dark:text-red-200"
                        : "text-green-800 dark:text-green-200"
                    }
                  >
                    {notification.message}
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="file-upload">Select File *</Label>
                  <Input id="file-upload" type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doc-name">Document Name *</Label>
                  <Input
                    id="doc-name"
                    placeholder="Enter document name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.slice(1).map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="project-select">Project *</Label>
                    <Select
                      value={formData.project}
                      onValueChange={(value) => setFormData({ ...formData, project: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select project" />
                      </SelectTrigger>
                      <SelectContent>
                        {projects.length === 0 ? (
                          <SelectItem value="no-projects" disabled>
                            No projects available
                          </SelectItem>
                        ) : (
                          projects.map((project) => (
                            <SelectItem key={project.id} value={project.name}>
                              {project.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUploadDocument}>Upload Document</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Documents Grid */}
        <div className="grid gap-4">
          {filteredDocuments.map((doc) => (
            <Card key={doc.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">{getFileIcon(doc.type)}</div>
                    <div className="space-y-1 flex-1">
                      <h3 className="font-semibold text-lg">{doc.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {doc.uploadedBy}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(doc.uploadDate).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <File className="h-3 w-3" />
                          {doc.size}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={getCategoryColor(doc.category)}>{doc.category}</Badge>
                        <Badge variant="outline">{doc.project}</Badge>
                        <Badge variant="secondary">{doc.extension?.toUpperCase()}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleRemoveDocument(doc.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredDocuments.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No documents found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || filterType !== "all"
                ? "Try adjusting your search or filter criteria"
                : "Get started by uploading your first document"}
            </p>
            {projects.length === 0 ? (
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  You need to create a project first before uploading documents
                </p>
                <Button asChild variant="outline">
                  <a href="/projects">Go to Projects</a>
                </Button>
              </div>
            ) : (
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Document
                  </Button>
                </DialogTrigger>
              </Dialog>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
