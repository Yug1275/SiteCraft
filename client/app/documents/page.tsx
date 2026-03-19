"use client"

import { useState, useEffect, useRef } from "react"
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
import {
  FileText, Upload, Search, Trash2, Download, File, Image, FileSpreadsheet,
} from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import api from "@/lib/api"
import { toast } from "sonner"

export default function DocumentsPage() {
  const { loading: authLoading, isAuthenticated } = useAuth()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [documents, setDocuments] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const [formData, setFormData] = useState({ name: "", category: "General", project_id: "" })
  const categories = ["all", "General", "Permits", "Blueprints", "Contracts", "Reports", "Invoices"]

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login')
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated) fetchData()
  }, [isAuthenticated])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [docsRes, projectsRes] = await Promise.all([
        api.get<{ documents: any[] }>('/documents'),
        api.get<{ projects: any[] }>('/projects'),
      ])
      setDocuments(docsRes.documents || [])
      setProjects(projectsRes.projects || [])
    } catch (error: any) {
      toast.error("Failed to load documents")
    } finally {
      setLoading(false)
    }
  }

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.file_name || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === "all" || doc.category === filterCategory
    return matchesSearch && matchesCategory
  })

  const getFileIcon = (type: string) => {
    switch (type) {
      case "pdf": return <FileText className="h-8 w-8 text-red-500" />
      case "image": return <Image className="h-8 w-8 text-blue-500" />
      case "spreadsheet": return <FileSpreadsheet className="h-8 w-8 text-green-500" />
      default: return <File className="h-8 w-8 text-gray-500" />
    }
  }

  const handleUpload = async () => {
    if (!formData.name || !selectedFile) {
      toast.error("Please provide a document name and select a file")
      return
    }
    try {
      setUploading(true)
      const uploadFormData = new FormData()
      uploadFormData.append("file", selectedFile)
      uploadFormData.append("name", formData.name)
      uploadFormData.append("category", formData.category)
      if (formData.project_id) uploadFormData.append("project_id", formData.project_id)

      await api.upload('/documents', uploadFormData)
      toast.success("Document uploaded successfully")
      setFormData({ name: "", category: "General", project_id: "" })
      setSelectedFile(null)
      setIsDialogOpen(false)
      fetchData()
    } catch (error: any) {
      toast.error(error.message || "Failed to upload document")
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteDocument = async () => {
    if (!deleteId) return
    try {
      await api.delete(`/documents/${deleteId}`)
      toast.success("Document deleted")
      setDeleteId(null)
      fetchData()
    } catch (error: any) {
      toast.error(error.message || "Failed to delete document")
    }
  }

  if (authLoading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
  if (!isAuthenticated) return null

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center gap-4 px-6">
          <SidebarTrigger />
          <div className="flex-1">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Document Management</h1>
            <p className="text-sm text-muted-foreground">Store, organize, and manage construction documents</p>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { title: "Total Documents", value: documents.length, icon: FileText, color: "text-blue-600" },
            { title: "Categories", value: categories.length - 1, icon: File, color: "text-purple-600" },
            { title: "Projects with Docs", value: new Set(documents.filter(d => d.project_id).map(d => d.project_id)).size, icon: FileSpreadsheet, color: "text-green-600" },
          ].map((s, i) => (
            <Card key={i} className="border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">{s.title}</CardTitle><s.icon className={`h-4 w-4 ${s.color}`} /></CardHeader>
              <CardContent>{loading ? <Skeleton className="h-7 w-16" /> : <div className="text-2xl font-bold">{s.value}</div>}</CardContent>
            </Card>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex gap-4">
            <div className="relative"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" /><Input placeholder="Search documents..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 w-64" /></div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>{categories.map((c) => <SelectItem key={c} value={c}>{c === "all" ? "All Categories" : c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild><Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"><Upload className="h-4 w-4 mr-2" />Upload Document</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Upload Document</DialogTitle><DialogDescription>Upload a document to your project</DialogDescription></DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2"><Label>Document Name *</Label><Input placeholder="Enter name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Category</Label>
                    <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{categories.slice(1).map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2"><Label>Project</Label>
                    <Select value={formData.project_id} onValueChange={(v) => setFormData({ ...formData, project_id: v })}>
                      <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger><SelectContent>{projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2"><Label>File *</Label>
                  <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition-colors" onClick={() => fileInputRef.current?.click()}>
                    {selectedFile ? (
                      <div className="flex items-center justify-center gap-2"><File className="h-6 w-6 text-blue-500" /><span>{selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</span></div>
                    ) : (
                      <div><Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" /><p className="text-sm text-muted-foreground">Click to select a file (max 10MB)</p></div>
                    )}
                    <input ref={fileInputRef} type="file" className="hidden" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif" />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button><Button onClick={handleUpload} disabled={uploading}>{uploading ? "Uploading..." : "Upload"}</Button></div>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{[1,2,3].map((i) => <Card key={i} className="border-0 shadow-lg"><CardHeader><Skeleton className="h-5 w-48" /></CardHeader><CardContent><Skeleton className="h-20 w-full" /></CardContent></Card>)}</div>
        ) : documents.length === 0 ? (
          <div className="text-center py-12"><FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" /><h3 className="text-lg font-semibold mb-2">No documents found</h3><p className="text-muted-foreground mb-4">Upload your first document</p><Button onClick={() => setIsDialogOpen(true)}><Upload className="h-4 w-4 mr-2" />Upload</Button></div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredDocuments.map((doc) => (
              <Card key={doc.id} className="border-0 shadow-lg hover:shadow-xl transition-all">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800">{getFileIcon(doc.file_type)}</div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold truncate">{doc.name}</h4>
                      <p className="text-sm text-muted-foreground truncate">{doc.file_name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">{doc.category}</Badge>
                        <span className="text-xs text-muted-foreground">{doc.file_size}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{new Date(doc.uploaded_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex flex-col gap-1">
                      {doc.file_url && <Button variant="ghost" size="sm" asChild><a href={doc.file_url} target="_blank" rel="noopener noreferrer"><Download className="h-4 w-4" /></a></Button>}
                      <Button variant="ghost" size="sm" onClick={() => setDeleteId(doc.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete Document</AlertDialogTitle><AlertDialogDescription>This will remove the document permanently.</AlertDialogDescription></AlertDialogHeader>
        <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDeleteDocument} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
