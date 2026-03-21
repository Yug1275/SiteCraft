"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  BarChart3,
  Upload,
  FileJson,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Download,
  Search,
  Code
} from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"

export default function ReportsViewerPage() {
  const { loading: authLoading, isAuthenticated } = useAuth()
  const router = useRouter()
  const [jsonInput, setJsonInput] = useState("")
  const [parsedData, setParsedData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [exportingPdf, setExportingPdf] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const viewerExportRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [authLoading, isAuthenticated, router])

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (!isAuthenticated) return null

  const handleParse = () => {
    if (!jsonInput.trim()) {
      setError("Please paste or upload JSON content.")
      setParsedData(null)
      return
    }
    try {
      const data = JSON.parse(jsonInput)
      setParsedData(data)
      setError(null)
      toast.success("JSON parsed successfully")
    } catch (err: any) {
      setError(err.message || "Invalid JSON format")
      setParsedData(null)
      toast.error("Failed to parse JSON")
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      setJsonInput(content)
      try {
        const data = JSON.parse(content)
        setParsedData(data)
        setError(null)
        toast.success("File loaded and parsed successfully")
      } catch (err: any) {
        setError(err.message || "Invalid JSON format in file")
        setParsedData(null)
        toast.error("Failed to parse uploaded file")
      }
    }
    reader.onerror = () => {
      toast.error("Error reading file")
    }
    reader.readAsText(file)
  }

  const handleExportPdf = async () => {
    if (!viewerExportRef.current || !parsedData) {
      toast.error("No viewer content to export")
      return
    }

    try {
      setExportingPdf(true)
      const exportElement = viewerExportRef.current

      const canvas = await html2canvas(exportElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: null,
        width: exportElement.scrollWidth,
        height: exportElement.scrollHeight,
        windowWidth: exportElement.scrollWidth,
        windowHeight: exportElement.scrollHeight,
      })

      const pdf = new jsPDF({ unit: "pt", format: "a4", orientation: "portrait" })
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()

      const pxPerPt = canvas.width / pageWidth
      const pageCanvasHeight = Math.floor(pageHeight * pxPerPt)
      let renderedHeight = 0
      let pageIndex = 0

      while (renderedHeight < canvas.height) {
        const sliceHeight = Math.min(pageCanvasHeight, canvas.height - renderedHeight)
        const pageCanvas = document.createElement("canvas")
        pageCanvas.width = canvas.width
        pageCanvas.height = sliceHeight

        const pageCtx = pageCanvas.getContext("2d")
        if (!pageCtx) break

        pageCtx.drawImage(
          canvas,
          0,
          renderedHeight,
          canvas.width,
          sliceHeight,
          0,
          0,
          canvas.width,
          sliceHeight,
        )

        const pageImg = pageCanvas.toDataURL("image/png")
        const imgHeightOnPdf = (sliceHeight * pageWidth) / canvas.width

        if (pageIndex > 0) {
          pdf.addPage()
        }
        pdf.addImage(pageImg, "PNG", 0, 0, pageWidth, imgHeightOnPdf)

        renderedHeight += sliceHeight
        pageIndex += 1
      }

      const fileDate = new Date().toISOString().split("T")[0]
      pdf.save(`viewer-report-${fileDate}.pdf`)
      toast.success("Viewer PDF exported successfully")
    } catch (err) {
      toast.error("Failed to export PDF")
    } finally {
      setExportingPdf(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <header className="sticky top-0 z-40 border-b border-white/20 bg-white/10 dark:bg-slate-900/30 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center gap-4 px-6">
          <div className="flex-1">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">
              Reports Viewer
            </h1>
            <p className="text-sm text-muted-foreground">Visualize your JSON reports securely</p>
          </div>
          {parsedData && (
            <Button
              onClick={handleExportPdf}
              disabled={exportingPdf}
              variant="outline"
              className="bg-white/50 dark:bg-slate-800/50 hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all rounded-xl shadow-sm"
            >
              <Download className="w-4 h-4 mr-2" />
              {exportingPdf ? "Exporting..." : "Export PDF"}
            </Button>
          )}
        </div>
      </header>

      <main className="flex-1 p-6 space-y-6">
        <div className="grid lg:grid-cols-12 gap-6 h-[calc(100vh-8rem)]">
          {/* Input Section */}
          <div className="lg:col-span-4 flex flex-col gap-4 h-full">
            <Card className="flex-1 flex flex-col border border-white/20 backdrop-blur-xl bg-white/60 dark:bg-slate-900/60 shadow-xl rounded-2xl transition-all duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileJson className="w-5 h-5 text-blue-500" />
                  JSON Input
                </CardTitle>
                <CardDescription>Paste JSON directly or upload a file</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept=".json"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                  />
                  <Button
                    variant="secondary"
                    className="w-full bg-white/50 dark:bg-slate-800/50 hover:bg-white/80 dark:hover:bg-slate-800/80 rounded-xl"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload .json File
                  </Button>
                </div>
                <Textarea
                  placeholder="Paste your JSON report here..."
                  className="flex-1 font-mono text-xs bg-white/40 dark:bg-slate-950/40 rounded-xl resize-none"
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                />
                <Button
                  onClick={handleParse}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg rounded-xl transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
                >
                  <Code className="w-4 h-4 mr-2" />
                  Format & Visualize
                </Button>
                {error && (
                  <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-950/30 rounded-xl border border-red-200 dark:border-red-900/50 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span className="break-all">{error}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Visualization Section */}
          <div className="lg:col-span-8 flex flex-col gap-4 h-full overflow-hidden">
            <Card className="flex-1 flex flex-col border border-white/20 backdrop-blur-xl bg-white/60 dark:bg-slate-900/60 shadow-xl rounded-2xl transition-all duration-300 overflow-hidden">
              <CardHeader className="pb-3 border-b border-white/20 dark:border-slate-800 bg-white/30 dark:bg-slate-900/40">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-indigo-500" />
                    Viewer
                  </CardTitle>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search attributes..."
                      className="pl-9 h-9 bg-white/50 dark:bg-slate-800/50 rounded-lg text-sm"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden p-0">
                <ScrollArea className="h-full w-full p-4">
                  {!parsedData ? (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-60 m-auto mt-32">
                      <FileJson className="w-16 h-16 mb-4 text-slate-400" />
                      <p>Valid JSON will be visualized here.</p>
                      <p className="text-sm">Arrays as tables, objects as cards.</p>
                    </div>
                  ) : (
                    <div ref={viewerExportRef} className="pr-2">
                      <JsonViewer data={parsedData} searchTerm={searchTerm} />
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

// Helper components for JSON Visualization
function isArrayOfObjects(val: any) {
  return Array.isArray(val) && val.length > 0 && typeof val[0] === 'object' && val[0] !== null && !Array.isArray(val[0]);
}

function JsonViewer({ data, searchTerm, name = "Root" }: { data: any, searchTerm: string, name?: string }) {
  if (data === null) return <span className="text-slate-500 italic">null</span>
  if (data === undefined) return <span className="text-slate-500 italic">undefined</span>
  
  if (typeof data === 'boolean') return <span className="text-blue-600 dark:text-blue-400 font-mono">{data ? 'true' : 'false'}</span>
  if (typeof data === 'number') return <span className="text-emerald-600 dark:text-emerald-400 font-mono">{data}</span>
  if (typeof data === 'string') {
    const isMatched = searchTerm && data.toLowerCase().includes(searchTerm.toLowerCase());
    return (
      <span className={`text-orange-600 dark:text-orange-400 font-mono ${isMatched ? 'bg-yellow-200 dark:bg-yellow-900/50' : ''}`}>
        "{data}"
      </span>
    )
  }

  if (isArrayOfObjects(data)) {
    return <JsonTable data={data} searchTerm={searchTerm} name={name} />
  }

  if (Array.isArray(data)) {
    return <JsonArray data={data} searchTerm={searchTerm} name={name} />
  }

  if (typeof data === 'object') {
    return <JsonObject data={data} searchTerm={searchTerm} name={name} />
  }

  return <span>{String(data)}</span>
}

function JsonTable({ data, searchTerm, name }: { data: any[], searchTerm: string, name: string }) {
  const [expanded, setExpanded] = useState(true)
  const columns = Array.from(new Set(data.flatMap(Object.keys)))

  return (
    <div className="mb-4">
      <button 
        onClick={() => setExpanded(!expanded)} 
        className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-600 transition-colors mb-2"
      >
        {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        <span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-md">
          {name} [{data.length}]
        </span>
      </button>
      
      {expanded && (
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm ml-6">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-600 dark:text-slate-400 uppercase bg-slate-100 dark:bg-slate-800/80">
              <tr>
                {columns.map((col, idx) => (
                  <th key={idx} className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 font-semibold">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i} className="bg-white/50 dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 last:border-0 transition-colors">
                  {columns.map((col, j) => (
                    <td key={j} className="px-4 py-2 whitespace-nowrap">
                      <JsonViewer data={row[col]} searchTerm={searchTerm} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function JsonObject({ data, searchTerm, name }: { data: Record<string, any>, searchTerm: string, name: string }) {
  const [expanded, setExpanded] = useState(true)
  const keys = Object.keys(data)
  
  // Filter by search term if applicable
  const hasMatch = searchTerm && (
    name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    keys.some(k => k.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="mb-2">
      <button 
        onClick={() => setExpanded(!expanded)} 
        className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 transition-colors"
      >
        {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        <span className={`px-2 py-0.5 rounded-md ${hasMatch ? 'bg-yellow-200 dark:bg-yellow-900/50' : 'bg-slate-200 dark:bg-slate-800'} ${name === 'Root' ? 'font-bold text-base bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300' : ''}`}>
          {name} {'{...}'}
        </span>
      </button>
      
      {expanded && (
        <div className="ml-5 pl-3 border-l-2 border-slate-200 dark:border-slate-800 mt-1 mb-3 space-y-1">
          {keys.map(key => (
            <div key={key} className="flex flex-col sm:flex-row sm:items-baseline pt-1">
              <span className={`text-sm font-medium text-purple-700 dark:text-purple-400 mr-2 shrink-0 ${searchTerm && key.toLowerCase().includes(searchTerm.toLowerCase()) ? 'bg-yellow-200 dark:bg-yellow-900/50' : ''}`}>
                {key}:
              </span>
              <div className="flex-1 overflow-x-auto">
                <JsonViewer data={data[key]} searchTerm={searchTerm} name={key} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function JsonArray({ data, searchTerm, name }: { data: any[], searchTerm: string, name: string }) {
  const [expanded, setExpanded] = useState(true)

  return (
    <div className="mb-2">
      <button 
        onClick={() => setExpanded(!expanded)} 
        className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-emerald-600 transition-colors"
      >
        {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        <span className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-md">
          {name} [{data.length}]
        </span>
      </button>
      
      {expanded && (
        <div className="ml-5 pl-3 border-l-2 border-slate-200 dark:border-slate-800 mt-1 mb-3 space-y-1">
          {data.map((item, i) => (
            <div key={i} className="flex flex-col sm:flex-row sm:items-baseline pt-1">
              <span className="text-xs text-slate-400 mr-2 mt-1 shrink-0 px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">
                {i}
              </span>
              <div className="flex-1 overflow-x-auto">
                <JsonViewer data={item} searchTerm={searchTerm} name={`${name}[${i}]`} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
