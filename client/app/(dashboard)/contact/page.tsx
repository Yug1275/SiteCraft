"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Mail, CheckCircle, AlertCircle } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import api from "@/lib/api"

export default function ContactPage() {
  const { loading: authLoading, isAuthenticated, user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    message: "",
  })

  if (!authLoading && !isAuthenticated) {
    router.push('/login')
    return null
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill in all fields")
      return
    }

    try {
      setLoading(true)
      
      // Send data to backend API
      const response = await api.post('/contact', {
        name: formData.name,
        email: formData.email,
        message: formData.message,
      })

      if (response) {
        setSubmitted(true)
        setFormData({ name: user?.name || "", email: user?.email || "", message: "" })
        toast.success("Message sent successfully!")

        // Reset the submitted state after 3 seconds
        setTimeout(() => setSubmitted(false), 3000)
      }
    } catch (error: any) {
      console.error("Submit error:", error)
      toast.error(error.message || "Failed to send message")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
              Get in Touch
            </h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            Have a question or feedback? We'd love to hear from you.
          </p>
        </div>

        {/* Successfully Submitted Message */}
        {submitted && (
          <Card className="mb-8 border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
            <CardContent className="flex items-center gap-3 pt-6">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0" />
              <div>
                <p className="font-semibold text-green-900 dark:text-green-100">Message sent successfully!</p>
                <p className="text-sm text-green-700 dark:text-green-200">
                  Thank you for reaching out. We'll get back to you soon.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Contact Form Card */}
        <Card className="shadow-lg border-0 bg-white dark:bg-slate-900">
          <CardHeader>
            <CardTitle>Send us a Message</CardTitle>
            <CardDescription>
              Fill out the form below and we'll respond to your inquiry promptly.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-700 dark:text-slate-300 font-medium">
                  Full Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Your full name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={loading || authLoading}
                  className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                />
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700 dark:text-slate-300 font-medium">
                  Email Address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading || authLoading}
                  className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                />
              </div>

              {/* Message Field */}
              <div className="space-y-2">
                <Label htmlFor="message" className="text-slate-700 dark:text-slate-300 font-medium">
                  Message
                </Label>
                <Textarea
                  id="message"
                  name="message"
                  placeholder="Tell us what's on your mind..."
                  rows={6}
                  value={formData.message}
                  onChange={handleChange}
                  disabled={loading || authLoading}
                  className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 resize-none"
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading || authLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-2.5 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Sending...</span>
                  </div>
                ) : (
                  "Send Message"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Info Section */}
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <Card className="bg-white dark:bg-slate-900 border-0">
            <CardHeader>
              <CardTitle className="text-lg">Response Time</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 dark:text-slate-400">
                We typically respond to all inquiries within 24 hours during business days.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-900 border-0">
            <CardHeader>
              <CardTitle className="text-lg">Support Available</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 dark:text-slate-400">
                Our support team is here to help with any questions or issues you may encounter.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
