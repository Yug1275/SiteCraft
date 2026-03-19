import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Toaster } from "@/components/ui/sonner"
import { Footer } from "@/components/footer"
import { AuthProvider } from "@/contexts/AuthContext"
import { GoogleOAuthProvider } from '@react-oauth/google'

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SiteCraft - Construction Management Dashboard",
  description: "Unified construction management platform for contractors and civil engineers",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>

          {/* 🔥 ADD THIS */}
          <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
            
            <AuthProvider>
              <SidebarProvider>
                <div className="flex min-h-screen w-full flex-col">
                  <div className="flex flex-1">
                    <AppSidebar />
                    <main className="flex-1 overflow-hidden">{children}</main>
                  </div>
                  <Footer />
                </div>
                <Toaster richColors position="top-right" />
              </SidebarProvider>
            </AuthProvider>

          </GoogleOAuthProvider>

        </ThemeProvider>
      </body>
    </html>
  )
}