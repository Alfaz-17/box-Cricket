import React, { useEffect, useState } from 'react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

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
    <div className="max-w-2xl mx-auto p-6">
      <h1
        className="text-3xl font-bold mb-6 text-center"
      >
        ⚙️ Settings
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Customize how the application looks.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="dark-mode" className="flex flex-col space-y-1">
              <span>Dark Mode</span>
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
