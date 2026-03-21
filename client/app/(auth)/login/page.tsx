"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { HardHat, Mail, Lock, Loader2, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error("Please fill in all fields")
      return
    }

    setLoading(true)
    try {
      await login(email, password)
      toast.success("Welcome back!")
    } catch (error: any) {
      toast.error(error.message || "Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">

      <Card className="relative overflow-hidden border border-white/40 dark:border-white/10 bg-gradient-to-br from-slate-100/75 via-white/50 to-slate-200/65 dark:from-slate-800/70 dark:via-slate-800/45 dark:to-slate-900/70 backdrop-blur-2xl shadow-[0_24px_80px_-28px_rgba(15,23,42,0.9)]">
        {/* Logo */}
      <div className="mt-4 flex flex-col items-center space-y-2">
        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/25">
          <HardHat className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">SiteCraft</h1>
        <p className="text-sm text-muted-foreground">
          Construction Management Platform
        </p>
      </div>
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.55),rgba(255,255,255,0.12)_44%,rgba(148,163,184,0.2)_72%,rgba(30,41,59,0.26))] dark:bg-[linear-gradient(120deg,rgba(255,255,255,0.16),rgba(255,255,255,0.05)_45%,rgba(148,163,184,0.12)_70%,rgba(2,6,23,0.32))]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/80 dark:bg-white/30" />
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-xl">Sign in</CardTitle>
          <CardDescription>
            Enter your credentials to access your dashboard
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 flex flex-col items-center pb-8 pt-4">
          <form onSubmit={handleSubmit} className="space-y-4 w-full">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-11 rounded-xl"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-11 rounded-xl"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <Button
               type="submit"
               className="w-full h-11 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 shadow-md shadow-blue-500/20"
               disabled={loading}
             >
               {loading ? (
                 <>
                   <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                   Signing in...
                 </>
               ) : (
                 "Sign in"
               )}
             </Button>
          </form>

          {/* Signup */}
          <p className="text-center text-sm text-muted-foreground mt-4">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}