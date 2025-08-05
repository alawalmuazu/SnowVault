'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { useWallet } from '@/contexts/WalletContext'
import { useEERC } from '@/contexts/EERCContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { WalletConnect } from '@/components/wallet/WalletConnect'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Shield,
  Moon,
  Sun,
  Menu,
  Settings,
  LogOut,
  User,
  ChevronDown,
  Home,
  CreditCard,
  Users,
  Vote,
  Building2,
  BookOpen,
  Github,
  ExternalLink
} from 'lucide-react'
import { cn, truncateAddress } from '@/lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Lending', href: '/lending', icon: CreditCard },
  { name: 'Payroll', href: '/payroll', icon: Users },
  { name: 'DAO', href: '/dao', icon: Vote },
  { name: 'RWA', href: '/rwa', icon: Building2 },
  { name: 'Docs', href: '/docs', icon: BookOpen },
]

export function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const { isConnected, address, chainId, balance, ensName, disconnect } = useWallet()
  const { isPrivacyEnabled, togglePrivacy, isLoading: eercLoading } = useEERC()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleDisconnect = () => {
    disconnect()
    router.push('/')
  }

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  const getChainName = (chainId: number | null) => {
    switch (chainId) {
      case 43114:
        return 'Avalanche'
      case 43113:
        return 'Fuji'
      case 31337:
        return 'Local'
      default:
        return 'Unknown'
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-privacy-600">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <span className="hidden font-bold sm:inline-block">
                Privacy Platform
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary",
                      isActive
                        ? "text-primary"
                        : "text-muted-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            {/* Privacy Toggle */}
            {isConnected && (
              <Button
                variant="outline"
                size="sm"
                onClick={togglePrivacy}
                disabled={eercLoading}
                className={cn(
                  "hidden sm:flex",
                  isPrivacyEnabled
                    ? "border-privacy-500 text-privacy-600 hover:bg-privacy-50 dark:hover:bg-privacy-950"
                    : "border-gray-300 text-gray-600"
                )}
              >
                {eercLoading ? (
                  <LoadingSpinner size="sm" className="mr-2" />
                ) : (
                  <Shield className={cn(
                    "h-4 w-4 mr-2",
                    isPrivacyEnabled ? "text-privacy-600" : "text-gray-400"
                  )} />
                )}
                {isPrivacyEnabled ? 'Private' : 'Public'}
              </Button>
            )}

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="hidden sm:flex"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            {/* Wallet Connection */}
            {!isConnected ? (
              <WalletConnect />
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <span className="hidden sm:inline">
                        {ensName || truncateAddress(address || '')}
                      </span>
                      <ChevronDown className="h-4 w-4" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {ensName || 'Wallet'}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {truncateAddress(address || '')}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  <div className="px-2 py-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Network:</span>
                      <Badge variant="outline" className="text-xs">
                        {getChainName(chainId)}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs mt-1">
                      <span className="text-muted-foreground">Balance:</span>
                      <span className="font-mono">
                        {balance ? `${parseFloat(balance).toFixed(4)} AVAX` : '0 AVAX'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs mt-1">
                      <span className="text-muted-foreground">Privacy:</span>
                      <Badge 
                        variant={isPrivacyEnabled ? "privacy" : "outline"}
                        className="text-xs"
                      >
                        {isPrivacyEnabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                  </div>
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem onClick={() => router.push('/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem onClick={() => router.push('/settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem onClick={handleDisconnect}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Disconnect</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-privacy-600" />
                    Privacy Platform
                  </SheetTitle>
                  <SheetDescription>
                    Modular privacy-preserving financial platform
                  </SheetDescription>
                </SheetHeader>
                
                <div className="mt-6 space-y-4">
                  {/* Mobile Navigation */}
                  <nav className="space-y-2">
                    {navigation.map((item) => {
                      const Icon = item.icon
                      const isActive = pathname === item.href
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                            isActive
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                          )}
                        >
                          <Icon className="h-4 w-4" />
                          {item.name}
                        </Link>
                      )
                    })}
                  </nav>

                  {/* Mobile Actions */}
                  <div className="space-y-2 pt-4 border-t">
                    {isConnected && (
                      <Button
                        variant="outline"
                        onClick={togglePrivacy}
                        disabled={eercLoading}
                        className="w-full justify-start"
                      >
                        {eercLoading ? (
                          <LoadingSpinner size="sm" className="mr-2" />
                        ) : (
                          <Shield className="h-4 w-4 mr-2" />
                        )}
                        Privacy: {isPrivacyEnabled ? 'Enabled' : 'Disabled'}
                      </Button>
                    )}
                    
                    <Button
                      variant="outline"
                      onClick={toggleTheme}
                      className="w-full justify-start"
                    >
                      {theme === 'dark' ? (
                        <Sun className="h-4 w-4 mr-2" />
                      ) : (
                        <Moon className="h-4 w-4 mr-2" />
                      )}
                      {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                    </Button>
                  </div>

                  {/* External Links */}
                  <div className="space-y-2 pt-4 border-t">
                    <Link
                      href="https://github.com/avalanche-foundation/eerc-sdk"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      <Github className="h-4 w-4" />
                      GitHub
                      <ExternalLink className="h-3 w-3 ml-auto" />
                    </Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}