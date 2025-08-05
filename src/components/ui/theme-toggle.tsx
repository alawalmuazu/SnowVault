'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Sun,
  Moon,
  Monitor,
  Palette,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ThemeToggleProps {
  className?: string
  variant?: 'button' | 'dropdown'
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

const themes = [
  {
    name: 'light',
    label: 'Light',
    icon: Sun,
    description: 'Light theme for better visibility',
  },
  {
    name: 'dark',
    label: 'Dark',
    icon: Moon,
    description: 'Dark theme for reduced eye strain',
  },
  {
    name: 'system',
    label: 'System',
    icon: Monitor,
    description: 'Follow system preference',
  },
]

export function ThemeToggle({ 
  className, 
  variant = 'button', 
  size = 'md',
  showLabel = false 
}: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size={size}
        className={cn('h-9 w-9', className)}
        disabled
      >
        <Palette className="h-4 w-4" />
      </Button>
    )
  }

  const currentTheme = themes.find(t => t.name === theme) || themes[0]
  const CurrentIcon = currentTheme.icon

  const buttonSizes = {
    sm: 'h-8 w-8',
    md: 'h-9 w-9',
    lg: 'h-10 w-10',
  }

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  }

  if (variant === 'dropdown') {
    return (
      <DropdownMenu>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size={size}
                  className={cn(
                    showLabel ? 'px-3' : buttonSizes[size],
                    className
                  )}
                >
                  <CurrentIcon className={cn(
                    iconSizes[size],
                    showLabel && 'mr-2'
                  )} />
                  {showLabel && (
                    <span className="hidden sm:inline">
                      {currentTheme.label}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>Change theme</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <DropdownMenuContent align="end" className="w-48">
          {themes.map((themeOption) => {
            const ThemeIcon = themeOption.icon
            const isActive = theme === themeOption.name
            
            return (
              <DropdownMenuItem
                key={themeOption.name}
                onClick={() => setTheme(themeOption.name)}
                className={cn(
                  'flex items-center gap-3 cursor-pointer',
                  isActive && 'bg-accent text-accent-foreground'
                )}
              >
                <ThemeIcon className="h-4 w-4" />
                <div className="flex-1">
                  <div className="font-medium">{themeOption.label}</div>
                  <div className="text-xs text-muted-foreground">
                    {themeOption.description}
                  </div>
                </div>
                {isActive && (
                  <div className="h-2 w-2 rounded-full bg-primary" />
                )}
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  // Simple button variant - cycles through themes
  const handleToggle = () => {
    const currentIndex = themes.findIndex(t => t.name === theme)
    const nextIndex = (currentIndex + 1) % themes.length
    setTheme(themes[nextIndex].name)
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size={size}
            onClick={handleToggle}
            className={cn(
              showLabel ? 'px-3' : buttonSizes[size],
              'transition-all duration-200',
              className
            )}
          >
            <CurrentIcon className={cn(
              iconSizes[size],
              showLabel && 'mr-2',
              'transition-transform duration-200 hover:scale-110'
            )} />
            {showLabel && (
              <span className="hidden sm:inline">
                {currentTheme.label}
              </span>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Switch to {themes[(themes.findIndex(t => t.name === theme) + 1) % themes.length].label.toLowerCase()} theme</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// Hook for theme-aware styling
export function useThemeAware() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return {
    isDark: mounted ? resolvedTheme === 'dark' : false,
    isLight: mounted ? resolvedTheme === 'light' : false,
    theme: mounted ? resolvedTheme : 'light',
    mounted,
  }
}