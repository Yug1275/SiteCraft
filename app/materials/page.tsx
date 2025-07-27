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
import { Package, Plus, Search, AlertTriangle, TrendingUp, TrendingDown, Edit, Trash2, Filter } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function MaterialsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [materials, setMaterials] = useState([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    currentStock: "",
    minimumStock: "",
    unit: "",
    unitPrice: "",
    supplier: "",
  })

  const categories = ["all", "Cement", "Steel", "Blocks", "Aggregates", "Tools", "Equipment"]

  useEffect(() => {
    const savedMaterials = localStorage.getItem("sitecraft-materials")
    if (savedMaterials) setMaterials(JSON.parse(savedMaterials))
  }, [])

  const filteredMaterials = materials.filter((material) => {
    const matchesSearch =
      material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.supplier.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === "all" || material.category === filterCategory
    return matchesSearch && matchesCategory
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Low Stock":
        return "destructive"
      case "In Stock":
        return "default"
      case "Well Stocked":
        return "secondary"
      default:
        return "default"
    }
  }

  const getStatusIcon = (current: number, minimum: number) => {
    if (current < minimum) return <TrendingDown className="h-4 w-4 text-red-500" />
    if (current > minimum * 1.5) return <TrendingUp className="h-4 w-4 text-green-500" />
    return <Package className="h-4 w-4 text-blue-500" />
  }

  const getStatus = (current: number, minimum: number) => {
    if (current < minimum) return "Low Stock"
    if (current > minimum * 1.5) return "Well Stocked"
    return "In Stock"
  }

  const handleCreateMaterial = () => {
    if (
      !formData.name ||
      !formData.category ||
      !formData.currentStock ||
      !formData.minimumStock ||
      !formData.unit ||
      !formData.unitPrice
    ) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    const currentStock = Number.parseInt(formData.currentStock)
    const minimumStock = Number.parseInt(formData.minimumStock)

    const newMaterial = {
      id: Date.now(),
      name: formData.name,
      category: formData.category,
      currentStock,
      minimumStock,
      unit: formData.unit,
      unitPrice: Number.parseFloat(formData.unitPrice),
      supplier: formData.supplier || "Not specified",
      status: getStatus(currentStock, minimumStock),
      lastUpdated: new Date().toISOString().split("T")[0],
    }

    const updatedMaterials = [...materials, newMaterial]
    setMaterials(updatedMaterials)
    localStorage.setItem("sitecraft-materials", JSON.stringify(updatedMaterials))

    toast({
      title: "Success",
      description: "Material added successfully",
    })

    setFormData({
      name: "",
      category: "",
      currentStock: "",
      minimumStock: "",
      unit: "",
      unitPrice: "",
      supplier: "",
    })
    setIsDialogOpen(false)
  }

  const handleDeleteMaterial = (id: number) => {
    if (materials.length <= 1) {
      toast({
        title: "Error",
        description: "Cannot remove the last material. At least one material must remain.",
        variant: "destructive",
      })
      return
    }

    const updatedMaterials = materials.filter((m) => m.id !== id)
    setMaterials(updatedMaterials)
    localStorage.setItem("sitecraft-materials", JSON.stringify(updatedMaterials))

    toast({
      title: "Success",
      description: "Material deleted successfully",
    })
  }

  const lowStockCount = materials.filter((m) => m.currentStock < m.minimumStock).length
  const totalValue = materials.reduce((sum, m) => sum + m.currentStock * m.unitPrice, 0)

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center gap-4 px-6">
          <SidebarTrigger />
          <div className="flex-1">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Materials Inventory
            </h1>
            <p className="text-sm text-muted-foreground">Track and manage construction materials across all sites</p>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Materials</CardTitle>
              <Package className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{materials.length}</div>
              <p className="text-xs text-muted-foreground">Active items</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{lowStockCount}</div>
              <p className="text-xs text-muted-foreground">Need attention</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalValue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Current inventory</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
              <Filter className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{categories.length - 1}</div>
              <p className="text-xs text-muted-foreground">Material types</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search materials..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
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
              <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800">
                <Plus className="h-4 w-4 mr-2" />
                Add Material
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Material</DialogTitle>
                <DialogDescription>Add a new material to your inventory</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="material-name">Material Name *</Label>
                    <Input
                      id="material-name"
                      placeholder="Enter material name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
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
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-stock">Current Stock *</Label>
                    <Input
                      id="current-stock"
                      type="number"
                      placeholder="0"
                      value={formData.currentStock}
                      onChange={(e) => setFormData({ ...formData, currentStock: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="minimum-stock">Minimum Stock *</Label>
                    <Input
                      id="minimum-stock"
                      type="number"
                      placeholder="0"
                      value={formData.minimumStock}
                      onChange={(e) => setFormData({ ...formData, minimumStock: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unit">Unit *</Label>
                    <Input
                      id="unit"
                      placeholder="e.g., bags, tons"
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="unit-price">Unit Price ($) *</Label>
                    <Input
                      id="unit-price"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.unitPrice}
                      onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="supplier">Supplier</Label>
                    <Input
                      id="supplier"
                      placeholder="Supplier name"
                      value={formData.supplier}
                      onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateMaterial}>Add Material</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Materials Table */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Materials Inventory</CardTitle>
            <CardDescription>Complete list of all materials with stock levels and pricing</CardDescription>
          </CardHeader>
          <CardContent>
            {materials.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No materials found</h3>
                <p className="text-muted-foreground mb-4">Get started by adding your first material</p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Material
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Material</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Stock Level</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead>Total Value</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMaterials.map((material) => (
                    <TableRow key={material.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{material.name}</div>
                          <div className="text-sm text-muted-foreground">{material.supplier}</div>
                        </div>
                      </TableCell>
                      <TableCell>{material.category}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(material.currentStock, material.minimumStock)}
                          <span>
                            {material.currentStock} {material.unit}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Min: {material.minimumStock} {material.unit}
                        </div>
                      </TableCell>
                      <TableCell>${material.unitPrice.toFixed(2)}</TableCell>
                      <TableCell>${(material.currentStock * material.unitPrice).toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(material.status)}>{material.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDeleteMaterial(material.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
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
