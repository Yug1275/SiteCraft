"use client"

import React, { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { useAuth } from '@/contexts/AuthContext'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { LogOut, Image as ImageIcon, Camera, Sun, Moon } from 'lucide-react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'sonner'

export function ProfileDropdown() {
  const { user, logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const [viewImageOpen, setViewImageOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '')

  useEffect(() => {
    setAvatarUrl(user?.avatar_url || '')
  }, [user?.avatar_url])

  const getInitials = (name: string) => {
    return (name || 'User')
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)
      if (!user?.id) {
        throw new Error('You must be logged in to upload an image.')
      }

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.')
      }

      const file = event.target.files[0]
      if (!file.type.startsWith('image/')) {
        throw new Error('Please upload a valid image file.')
      }

      const fileExt = file.name.split('.').pop()
      const fileName = `avatar-${Date.now()}.${fileExt}`
      const filePath = `${user.id}/${fileName}`

      let { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true, contentType: file.type })

      if (uploadError) {
        throw uploadError
      }

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)
      const publicUrl = data.publicUrl
      
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      })

      if (updateError) {
        throw updateError
      }

      setAvatarUrl(publicUrl)
      toast.success('Profile image updated successfully!')
      
    } catch (error: any) {
      console.error("Upload error:", error)
      const message = error?.message || 'Upload failed'
      if (message.toLowerCase().includes('row-level security')) {
        toast.error('Upload failed: storage policy is blocking uploads.')
      } else {
        toast.error(message)
      }
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }

  if (!user) return null

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full border-2 border-white/20 shadow-sm hover:ring-2 hover:ring-blue-500/50 transition-all p-0">
            <Avatar className="h-full w-full">
              <AvatarImage src={avatarUrl} alt={user.name} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-medium text-xs">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64 rounded-xl backdrop-blur-xl bg-white/90 dark:bg-slate-900/90 border border-white/20 shadow-xl p-2" align="end" forceMount>
          <div className="flex flex-col items-center justify-center p-4 gap-3 bg-slate-50/50 dark:bg-slate-800/30 rounded-lg mb-2">
            <div className="relative group">
              <Avatar className="h-20 w-20 border-4 border-white dark:border-slate-800 shadow-md">
                <AvatarImage src={avatarUrl} alt={user.name} />
                <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 p-1.5 bg-blue-600 text-white rounded-full shadow-lg cursor-pointer hover:bg-blue-700 transition-colors pointer-events-auto z-10">
                <Camera className="w-4 h-4" />
                <input 
                  type="file" 
                  id="avatar-upload" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleImageUpload} 
                  disabled={uploading}
                />
              </label>
            </div>
            <div className="text-center w-full px-2">
              <p className="text-sm font-semibold leading-none truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground mt-1 truncate">{user.email}</p>
            </div>
          </div>
          <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-700 mx-2" />
          <DropdownMenuItem onClick={() => setViewImageOpen(true)} className="cursor-pointer py-2 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <ImageIcon className="mr-2 h-4 w-4 text-slate-600 dark:text-slate-400" />
            <span>View Profile Image</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-700 mx-2" />
          <div className="py-2 px-3">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">Theme</p>
            <div className="flex gap-2">
              <Button
                variant={theme === "light" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("light")}
                className="flex-1 text-xs h-8"
              >
                <Sun className="h-3.5 w-3.5 mr-1" />
                Light
              </Button>
              <Button
                variant={theme === "dark" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("dark")}
                className="flex-1 text-xs h-8"
              >
                <Moon className="h-3.5 w-3.5 mr-1" />
                Dark
              </Button>
            </div>
          </div>
          <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-700 mx-2" />
          <DropdownMenuItem onClick={logout} className="cursor-pointer py-2 px-3 rounded-lg text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={viewImageOpen} onOpenChange={setViewImageOpen}>
        <DialogContent className="sm:max-w-md backdrop-blur-3xl bg-white/40 dark:bg-slate-900/40 border-white/20 shadow-2xl rounded-3xl p-0 overflow-hidden border-0">
          <div className="p-8 flex items-center justify-center bg-gradient-to-br from-slate-100/50 to-slate-200/50 dark:from-slate-800/50 dark:to-slate-900/50">
            <Avatar className="h-64 w-64 border-8 border-white/20 shadow-2xl">
              <AvatarImage src={avatarUrl} alt={user.name} className="object-cover" />
              <AvatarFallback className="text-6xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
