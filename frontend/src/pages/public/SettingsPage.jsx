import React, { useEffect, useState } from 'react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Settings, Moon, Sun } from 'lucide-react'

function SettingsPage() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    // Check initial preference
    const isDarkMode = document.documentElement.classList.contains('dark')
    setIsDark(isDarkMode)
  }, [])

  const toggleTheme = (checked) => {
    setIsDark(checked)
    if (checked) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6 md:p-12 min-h-[80vh]">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-primary/10 rounded-xl">
            <Settings className="w-8 h-8 text-primary" />
        </div>
        <div>
            <h1
                style={{ fontFamily: 'Bebas Neue' }}
                className="text-4xl font-bold"
            >
                Settings
            </h1>
            <p className="text-muted-foreground">Manage your preferences</p>
        </div>
      </div>

      <Card className="border-primary/20 bg-gradient-to-br from-card to-muted/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isDark ? <Moon className="w-5 h-5 text-primary" /> : <Sun className="w-5 h-5 text-primary" />}
            Appearance
          </CardTitle>
          <CardDescription>Customize how the application looks.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-background/50 border border-primary/10">
            <Label htmlFor="dark-mode" className="flex flex-col space-y-1 cursor-pointer">
              <span className="font-semibold text-base">Dark Mode</span>
              <span className="font-normal text-sm text-muted-foreground">
                Switch between light and dark themes.
              </span>
            </Label>
            <Switch id="dark-mode" checked={isDark} onCheckedChange={toggleTheme} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default SettingsPage
