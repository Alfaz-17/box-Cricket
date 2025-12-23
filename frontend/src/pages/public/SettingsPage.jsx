import React, { useEffect, useState } from 'react'
import { Switch } from '@/components/ui/Switch'
import { Label } from '@/components/ui/Label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
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
    <div className="max-w-3xl mx-auto p-4 sm:p-6 md:p-12 min-h-[80vh]">
      <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="p-2 sm:p-3 bg-primary/10 rounded-xl">
            <Settings className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
        </div>
        <div>
            <h1
                className="text-3xl sm:text-4xl font-bold font-display tracking-tight"
            >
                Settings
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">Manage your preferences</p>
        </div>
      </div>

      <Card className="border-primary/20 bg-gradient-to-br from-card to-muted/20 shadow-lg">
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            {isDark ? <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" /> : <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />}
            Appearance
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">Customize how the application looks.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-background/50 border border-primary/10 transition-colors hover:border-primary/30">
            <Label htmlFor="dark-mode" className="flex flex-col space-y-1 cursor-pointer flex-1 mr-4">
              <span className="font-semibold text-sm sm:text-base">Dark Mode</span>
              <span className="font-normal text-xs sm:text-sm text-muted-foreground">
                Switch between light and dark themes.
              </span>
            </Label>
            <Switch id="dark-mode" checked={isDark} onCheckedChange={toggleTheme} className="data-[state=checked]:bg-primary" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default SettingsPage
