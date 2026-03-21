"use client"

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { HardHat, Building2, Package, Users, ClipboardList, BarChart3, ArrowRight } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Navbar } from '@/components/navbar'

export default function LandingPage() {
  const { isAuthenticated, loading } = useAuth()
  const features = [
    { icon: Building2, title: "Project Management", desc: "Track and organize all your construction sites in one place." },
    { icon: Package, title: "Material Tracking", desc: "Monitor inventory levels and get alerts for low stock." },
    { icon: Users, title: "Labor Management", desc: "Manage workers, attendance, and payroll easily." },
    { icon: ClipboardList, title: "Task Tracking", desc: "Assign and monitor tasks across your entire team." },
    { icon: BarChart3, title: "Reports & Analytics", desc: "Generate insightful reports for better decision making." },
    { icon: HardHat, title: "Real-time Updates", desc: "Stay synced with your team on the field and in the office." },
  ]

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <Navbar publicMode={!isAuthenticated} />

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 pt-20 pb-32 bg-grid-slate-200 dark:bg-grid-slate-900 bg-[size:3rem_3rem]">
        <div className="absolute inset-0 bg-white/50 dark:bg-slate-950/50 backdrop-blur-3xl -z-10" />
        <div className="inline-flex items-center rounded-full border border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 text-sm font-medium text-blue-600 dark:text-blue-400 mb-8">
          <span className="flex h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400 mr-2 animate-pulse"></span>
          The Ultimate Construction CRM
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mb-6 leading-tight">
          Manage Construction Projects <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Efficiently</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mb-10 leading-relaxed">
          Streamline your workflow from planning to completion. SiteCraft brings your sites, labor, materials, and reports into a single, beautiful dashboard.
        </p>
        {!loading && !isAuthenticated && (
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Button asChild size="lg" className="h-14 px-8 text-base bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full shadow-xl shadow-blue-500/20">
              <Link href="/signup">
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-14 px-8 text-base rounded-full bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border-slate-200 dark:border-slate-800">
              <Link href="/login">
                Sign In
              </Link>
            </Button>
          </div>
        )}
      </main>

      {/* Features Section */}
      <section className="py-24 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">Everything you need to build</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Powerful tools designed specifically for modern construction teams and contractors.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <div key={i} className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="h-12 w-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-6">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <HardHat className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <span className="font-semibold text-slate-900 dark:text-white">SiteCraft</span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Developed with ❤️ by Yug Patel
          </p>
        </div>
      </footer>
    </div>
  )
}
