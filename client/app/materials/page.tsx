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
import { Progress } from "@/components/ui/progress"
import {
  Package, Plus, Search, AlertTriangle, TrendingUp, TrendingDown, Trash2, Filter,
} from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import api from "@/lib/api"
import { toast } from "sonner"

export default function MaterialsPage() {
  const { loading: authLoading, isAuthenticated } = useAuth()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [materials, setMaterials] = useState<any[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const [formData, setFormData] = useState({
    name: "", category: "", current_stock: "", minimum_stock: "", unit: "", unit_price: "", supplier: "",
  })

  const categories = ["all", "Cement", "Steel", "Blocks", "Aggregates", "Tools", "Equipment"]

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login')
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated) fetchMaterials()
  }, [isAuthenticated])

  const fetchMaterials = async () => {
    try {
      setLoading(true)
      const data = await api.get<{ materials: any[] }>('/materials')
      setMaterials(data.materials || [])
    } catch (error: any) {
      toast.error("Failed to load materials")
    } finally {
      setLoading(false)
    }
  }

  const filteredMaterials = materials.filter((material) => {
    const matchesSearch =
      material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (material.supplier || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === "all" || material.category === filterCategory
    return matchesSearch && matchesCategory
  })

  const getStatusColor = (current: number, minimum: number) => {
    if (current < minimum) return "destructive"
    if (current > minimum * 1.5) return "secondary"
    return "default"
  }

  const getStatusLabel = (current: number, minimum: number) => {
    if (current < minimum) return "Low Stock"
    if (current > minimum * 1.5) return "Well Stocked"
    return "In Stock"
  }

  const getStatusIcon = (current: number, minimum: number) => {
    if (current < minimum) return <TrendingDown className="h-4 w-4 text-red-500" />
    if (current > minimum * 1.5) return <TrendingUp className="h-4 w-4 text-green-500" />
    return <Package className="h-4 w-4 text-blue-500" />
  }

  const handleCreateMaterial = async () => {
    if (!formData.name || !formData.category || !formData.current_stock || !formData.minimum_stock || !formData.unit || !formData.unit_price) {
      toast.error("Please fill in all required fields")
      return
    }
    try {
      await api.post('/materials', {
        name: formData.name,
        category: formData.category,
        current_stock: parseInt(formData.current_stock),
        minimum_stock: parseInt(formData.minimum_stock),
        unit: formData.unit,
        unit_price: parseFloat(formData.unit_price),
        supplier: formData.supplier || '',
      })
      toast.success("Material added successfully")
      setFormData({ name: "", category: "", current_stock: "", minimum_stock: "", unit: "", unit_price: "", supplier: "" })
      setIsDialogOpen(false)
      fetchMaterials()
    } catch (error: any) {
      toast.error(error.message || "Failed to add material")
    }
  }

  const handleDeleteMaterial = async () => {
    if (!deleteId) return
    try {
      await api.delete(`/materials/${deleteId}`)
      toast.success("Material deleted successfully")
      setDeleteId(null)
      fetchMaterials()
    } catch (error: any) {
      toast.error(error.message || "Failed to delete material")
    }
  }

  const lowStockCount = materials.filter((m) => m.current_stock < m.minimum_stock).length
  const totalValue = materials.reduce((sum, m) => sum + (m.current_stock || 0) * (m.unit_price || 0), 0)

  if (authLoading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
  if (!isAuthenticated) return null

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center gap-4 px-6">
          <SidebarTrigger />
          <div className="flex-1">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">Materials Inventory</h1>
            <p className="text-sm text-muted-foreground">Track and manage construction materials across all sites</p>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          {[
            { title: "Total Materials", value: materials.length, icon: Package, color: "text-blue-600", sub: "Active items" },
            { title: "Low Stock Alerts", value: lowStockCount, icon: AlertTriangle, color: "text-red-600", sub: "Need attention" },
            { title: "Total Value", value: `$${totalValue.toLocaleString()}`, icon: TrendingUp, color: "text-green-600", sub: "Current inventory" },
            { title: "Categories", value: categories.length - 1, icon: Filter, color: "text-purple-600", sub: "Material types" },
          ].map((stat, i) => (
            <Card key={i} className="border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                {loading ? <Skeleton className="h-7 w-16" /> : <><div className={`text-2xl font-bold ${stat.title === "Low Stock Alerts" ? "text-red-600" : ""}`}>{stat.value}</div><p className="text-xs text-muted-foreground">{stat.sub}</p></>}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input placeholder="Search materials..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 w-64" />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                {categories.map((c) => <SelectItem key={c} value={c}>{c === "all" ? "All Categories" : c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"><Plus className="h-4 w-4 mr-2" />Add Material</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border border-white/20 shadow-2xl rounded-2xl">
              <DialogHeader><DialogTitle>Add New Material</DialogTitle><DialogDescription>Add a new material to your inventory</DialogDescription></DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Material Name *</Label><Input placeholder="Enter material name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Category *</Label>
                    <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                      <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                      <SelectContent>{categories.slice(1).map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2"><Label>Current Stock *</Label><Input type="number" placeholder="0" value={formData.current_stock} onChange={(e) => setFormData({ ...formData, current_stock: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Minimum Stock *</Label><Input type="number" placeholder="0" value={formData.minimum_stock} onChange={(e) => setFormData({ ...formData, minimum_stock: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Unit *</Label><Input placeholder="e.g., bags" value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value })} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Unit Price ($) *</Label><Input type="number" step="0.01" placeholder="0.00" value={formData.unit_price} onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Supplier</Label><Input placeholder="Supplier name" value={formData.supplier} onChange={(e) => setFormData({ ...formData, supplier: e.target.value })} /></div>
                </div>
              </div>
              <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button><Button onClick={handleCreateMaterial}>Add Material</Button></div>
            </DialogContent>
          </Dialog>
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
        ) : materials.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No materials found</h3>
            <p className="text-muted-foreground mb-4">Get started by adding your first material</p>
            <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800" onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />Add Material
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredMaterials.map((m) => (
              <Card key={m.id} className="backdrop-blur-xl bg-white/60 dark:bg-slate-900/60 border border-white/20 shadow-xl rounded-2xl transition-all hover:shadow-2xl hover:-translate-y-1">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-xl font-bold">{m.name}</CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <Package className="h-3 w-3" />{m.category}
                      </CardDescription>
                    </div>
                    <Badge variant={getStatusColor(m.current_stock, m.minimum_stock) as any}>
                      {getStatusLabel(m.current_stock, m.minimum_stock)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {m.supplier && <p className="text-sm text-muted-foreground line-clamp-1">Supplier: {m.supplier}</p>}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-1">
                        {getStatusIcon(m.current_stock, m.minimum_stock)}
                        Stock Level
                      </span>
                      <span className="font-medium">{m.current_stock} / {m.minimum_stock} {m.unit}</span>
                    </div>
                    <Progress value={Math.min(100, (m.current_stock / Math.max(1, m.minimum_stock)) * 100)} className={`h-2 ${m.current_stock < m.minimum_stock ? "bg-red-200" : ""}`} />
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="p-3 rounded-lg bg-white/50 dark:bg-slate-800/50 border border-white/10 dark:border-slate-700/50">
                      <span className="text-muted-foreground block mb-1">Unit Price</span>
                      <span className="font-semibold">${(m.unit_price || 0).toFixed(2)}</span>
                    </div>
                    <div className="p-3 rounded-lg bg-white/50 dark:bg-slate-800/50 border border-white/10 dark:border-slate-700/50">
                      <span className="text-muted-foreground block mb-1">Total Value</span>
                      <span className="font-semibold">${((m.current_stock || 0) * (m.unit_price || 0)).toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" size="sm" onClick={() => setDeleteId(m.id)}>
                      <Trash2 className="h-4 w-4 mr-2" /> Delete
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
          <AlertDialogHeader><AlertDialogTitle>Delete Material</AlertDialogTitle><AlertDialogDescription>Are you sure? This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDeleteMaterial} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl">Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
