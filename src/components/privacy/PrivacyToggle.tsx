'use client'

import { useState } from 'react'
import { useEERC } from '@/contexts/EERCContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Eye,
  EyeOff,
  Shield,
  Lock,
  Unlock,
  Info,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface PrivacyToggleProps {
  className?: string
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const privacyModes = {
  private: {
    icon: EyeOff,
    label: 'Private Mode',
    description: 'All transactions and balances are encrypted',
    color: 'privacy',
    bgColor: 'bg-privacy-100 dark:bg-privacy-900',
    borderColor: 'border-privacy-300 dark:border-privacy-700',
  },
  public: {
    icon: Eye,
    label: 'Public Mode',
    description: 'Transactions and balances are visible on-chain',
    color: 'secondary',
    bgColor: 'bg-gray-100 dark:bg-gray-900',
    borderColor: 'border-gray-300 dark:border-gray-700',
  },
}

const privacyFeatures = [
  {
    title: 'Encrypted Balances',
    description: 'Your token balances are hidden from public view',
    icon: Lock,
    enabled: true,
  },
  {
    title: 'Private Transactions',
    description: 'Transaction amounts and recipients are encrypted',
    icon: Shield,
    enabled: true,
  },
  {
    title: 'Zero-Knowledge Proofs',
    description: 'Verify transactions without revealing sensitive data',
    icon: CheckCircle,
    enabled: true,
  },
  {
    title: 'Selective Disclosure',
    description: 'Share specific data with authorized parties only',
    icon: Unlock,
    enabled: false, // Coming soon
  },
]

export function PrivacyToggle({ 
  className, 
  showLabel = false, 
  size = 'md' 
}: PrivacyToggleProps) {
  const { privacyEnabled, togglePrivacy, isInitialized } = useEERC()
  const [isToggling, setIsToggling] = useState(false)
  const [showInfo, setShowInfo] = useState(false)

  const currentMode = privacyEnabled ? privacyModes.private : privacyModes.public
  const CurrentIcon = currentMode.icon

  const handleToggle = async () => {
    if (!isInitialized) return
    
    setIsToggling(true)
    try {
      await togglePrivacy()
    } catch (error) {
      console.error('Failed to toggle privacy:', error)
    } finally {
      setIsToggling(false)
    }
  }

  const buttonSizes = {
    sm: 'h-8 px-2',
    md: 'h-9 px-3',
    lg: 'h-10 px-4',
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }

  if (!isInitialized) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size={size}
              disabled
              className={cn(buttonSizes[size], className)}
            >
              <LoadingSpinner size="sm" className="mr-2" />
              {showLabel && 'Initializing...'}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Privacy features are initializing...</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={privacyEnabled ? 'privacy' : 'outline'}
              size={size}
              onClick={handleToggle}
              disabled={isToggling}
              className={cn(
                buttonSizes[size],
                'transition-all duration-200',
                className
              )}
            >
              {isToggling ? (
                <LoadingSpinner size="sm" variant="white" className="mr-2" />
              ) : (
                <CurrentIcon className={cn(iconSizes[size], showLabel && 'mr-2')} />
              )}
              {showLabel && (
                <span className="hidden sm:inline">
                  {isToggling ? 'Switching...' : currentMode.label}
                </span>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{currentMode.description}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Privacy Info Dialog */}
      <Dialog open={showInfo} onOpenChange={setShowInfo}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 opacity-60 hover:opacity-100"
          >
            <Info className="w-4 h-4" />
          </Button>
        </DialogTrigger>
        
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-privacy-600" />
              Privacy Features
            </DialogTitle>
            <DialogDescription>
              Learn about the privacy features available in this platform.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Current Mode Status */}
            <Card className={cn(
              "border-2",
              currentMode.bgColor,
              currentMode.borderColor
            )}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CurrentIcon className="w-6 h-6" />
                    <div>
                      <h3 className="font-semibold">{currentMode.label}</h3>
                      <p className="text-sm text-muted-foreground">
                        {currentMode.description}
                      </p>
                    </div>
                  </div>
                  <Badge 
                    variant={privacyEnabled ? 'privacy' : 'secondary'}
                    className="ml-2"
                  >
                    {privacyEnabled ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Privacy Features List */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Available Features
              </h4>
              {privacyFeatures.map((feature, index) => {
                const FeatureIcon = feature.icon
                return (
                  <div 
                    key={index}
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-lg border",
                      feature.enabled 
                        ? "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800" 
                        : "bg-gray-50 border-gray-200 dark:bg-gray-950 dark:border-gray-800"
                    )}
                  >
                    <FeatureIcon className={cn(
                      "w-5 h-5 mt-0.5",
                      feature.enabled 
                        ? "text-green-600 dark:text-green-400" 
                        : "text-gray-400 dark:text-gray-600"
                    )} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h5 className="font-medium">{feature.title}</h5>
                        {feature.enabled ? (
                          <Badge variant="success" className="text-xs">
                            Available
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            Coming Soon
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Warning Notice */}
            <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-1">
                      Important Notice
                    </h4>
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      Switching between privacy modes may affect your transaction history visibility. 
                      Private transactions cannot be made public retroactively, but public transactions 
                      remain visible even in private mode.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}