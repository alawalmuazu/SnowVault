'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useWallet } from '@/contexts/WalletContext'
import { useEERC } from '@/contexts/EERCContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
  Banknote,
  Users,
  Vote,
  Building,
  Shield,
  Lock,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  ArrowRight,
  Zap,
  Globe,
  Eye,
  EyeOff,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ModuleData {
  id: string
  title: string
  description: string
  icon: React.ElementType
  status: 'active' | 'beta' | 'coming-soon' | 'maintenance'
  features: string[]
  stats?: {
    label: string
    value: string | number
    trend?: 'up' | 'down' | 'stable'
  }[]
  requiresPrivacy?: boolean
  comingSoonDate?: string
  route?: string
  external?: boolean
}

const modules: ModuleData[] = [
  {
    id: 'lending',
    title: 'Confidential Lending',
    description: 'Borrow and lend with complete privacy. Your financial activities remain confidential.',
    icon: Banknote,
    status: 'active',
    features: [
      'Private loan amounts',
      'Encrypted credit scores',
      'Anonymous lending pools',
      'Zero-knowledge proofs',
    ],
    stats: [
      { label: 'Active Loans', value: 1247, trend: 'up' },
      { label: 'Total Volume', value: '$2.4M', trend: 'up' },
      { label: 'Avg APY', value: '8.5%', trend: 'stable' },
    ],
    requiresPrivacy: true,
    route: '/lending',
  },
  {
    id: 'payroll',
    title: 'Private Payroll',
    description: 'Manage employee salaries with complete confidentiality and compliance.',
    icon: Users,
    status: 'active',
    features: [
      'Encrypted salary data',
      'Batch payments',
      'Compliance reporting',
      'Multi-role access',
    ],
    stats: [
      { label: 'Companies', value: 89, trend: 'up' },
      { label: 'Employees', value: 3421, trend: 'up' },
      { label: 'Monthly Volume', value: '$890K', trend: 'up' },
    ],
    requiresPrivacy: true,
    route: '/payroll',
  },
  {
    id: 'dao',
    title: 'Confidential DAO',
    description: 'Participate in governance with private voting and encrypted proposals.',
    icon: Vote,
    status: 'beta',
    features: [
      'Anonymous voting',
      'Encrypted proposals',
      'Delegation privacy',
      'Quadratic voting',
    ],
    stats: [
      { label: 'Active Proposals', value: 12, trend: 'stable' },
      { label: 'Voters', value: 2156, trend: 'up' },
      { label: 'Participation', value: '67%', trend: 'up' },
    ],
    requiresPrivacy: true,
    route: '/dao',
  },
  {
    id: 'rwa',
    title: 'RWA Tokenization',
    description: 'Tokenize real-world assets with privacy-preserving ownership records.',
    icon: Building,
    status: 'active',
    features: [
      'Private ownership',
      'Encrypted valuations',
      'Compliance integration',
      'Fractional ownership',
    ],
    stats: [
      { label: 'Assets', value: 156, trend: 'up' },
      { label: 'Total Value', value: '$12.8M', trend: 'up' },
      { label: 'Investors', value: 892, trend: 'up' },
    ],
    requiresPrivacy: true,
    route: '/rwa',
  },
  {
    id: 'analytics',
    title: 'Privacy Analytics',
    description: 'Advanced analytics while preserving user privacy and data confidentiality.',
    icon: TrendingUp,
    status: 'coming-soon',
    features: [
      'Zero-knowledge analytics',
      'Aggregated insights',
      'Privacy-preserving metrics',
      'Compliance reporting',
    ],
    comingSoonDate: 'Q2 2024',
    requiresPrivacy: true,
  },
  {
    id: 'bridge',
    title: 'Cross-Chain Bridge',
    description: 'Bridge assets across chains while maintaining privacy and security.',
    icon: Globe,
    status: 'coming-soon',
    features: [
      'Private cross-chain transfers',
      'Multi-chain support',
      'Encrypted routing',
      'Low fees',
    ],
    comingSoonDate: 'Q3 2024',
    requiresPrivacy: true,
  },
]

interface ModuleCardProps {
  module: ModuleData
  onSelect: (module: ModuleData) => void
}

function ModuleCard({ module, onSelect }: ModuleCardProps) {
  const { privacyEnabled } = useEERC()
  const router = useRouter()
  
  const statusConfig = {
    active: {
      badge: { variant: 'success' as const, label: 'Active' },
      icon: CheckCircle,
      color: 'text-green-600 dark:text-green-400',
    },
    beta: {
      badge: { variant: 'warning' as const, label: 'Beta' },
      icon: Zap,
      color: 'text-amber-600 dark:text-amber-400',
    },
    'coming-soon': {
      badge: { variant: 'outline' as const, label: 'Coming Soon' },
      icon: Clock,
      color: 'text-muted-foreground',
    },
    maintenance: {
      badge: { variant: 'destructive' as const, label: 'Maintenance' },
      icon: AlertCircle,
      color: 'text-red-600 dark:text-red-400',
    },
  }

  const config = statusConfig[module.status]
  const StatusIcon = config.icon
  const ModuleIcon = module.icon
  
  const isDisabled = module.status === 'coming-soon' || module.status === 'maintenance'
  const requiresPrivacySetup = module.requiresPrivacy && !privacyEnabled

  const handleClick = () => {
    if (isDisabled) {
      onSelect(module)
      return
    }
    
    if (requiresPrivacySetup) {
      onSelect(module)
      return
    }
    
    if (module.route) {
      if (module.external) {
        window.open(module.route, '_blank')
      } else {
        router.push(module.route)
      }
    } else {
      onSelect(module)
    }
  }

  return (
    <Card 
      className={cn(
        'cursor-pointer transition-all duration-200 hover:shadow-lg group',
        isDisabled && 'opacity-60 cursor-not-allowed',
        requiresPrivacySetup && 'border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950',
        !isDisabled && !requiresPrivacySetup && 'hover:border-privacy-300 dark:hover:border-privacy-700'
      )}
      onClick={handleClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              'p-2 rounded-lg transition-colors',
              module.status === 'active' && 'bg-privacy-100 dark:bg-privacy-900',
              module.status === 'beta' && 'bg-amber-100 dark:bg-amber-900',
              module.status === 'coming-soon' && 'bg-gray-100 dark:bg-gray-900',
              module.status === 'maintenance' && 'bg-red-100 dark:bg-red-900'
            )}>
              <ModuleIcon className={cn(
                'w-6 h-6',
                module.status === 'active' && 'text-privacy-600 dark:text-privacy-400',
                module.status === 'beta' && 'text-amber-600 dark:text-amber-400',
                module.status === 'coming-soon' && 'text-gray-600 dark:text-gray-400',
                module.status === 'maintenance' && 'text-red-600 dark:text-red-400'
              )} />
            </div>
            <div>
              <CardTitle className="text-lg group-hover:text-privacy-600 dark:group-hover:text-privacy-400 transition-colors">
                {module.title}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge {...config.badge}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {config.badge.label}
                </Badge>
                {module.requiresPrivacy && (
                  <Badge variant="privacy" className="text-xs">
                    <Shield className="w-3 h-3 mr-1" />
                    Privacy
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            {requiresPrivacySetup && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Enable privacy mode to access this module</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {!isDisabled && (
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-privacy-600 dark:group-hover:text-privacy-400 transition-colors" />
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <CardDescription className="text-sm">
          {module.description}
        </CardDescription>
        
        {/* Features */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Key Features</h4>
          <ul className="space-y-1">
            {module.features.slice(0, 3).map((feature, index) => (
              <li key={index} className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-3 h-3 text-green-500" />
                {feature}
              </li>
            ))}
            {module.features.length > 3 && (
              <li className="text-sm text-muted-foreground">
                +{module.features.length - 3} more features
              </li>
            )}
          </ul>
        </div>
        
        {/* Stats */}
        {module.stats && module.status === 'active' && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Live Stats</h4>
            <div className="grid grid-cols-3 gap-2">
              {module.stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-sm font-semibold">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Coming Soon Date */}
        {module.comingSoonDate && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            Expected: {module.comingSoonDate}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function ModuleGrid() {
  const { account } = useWallet()
  const { privacyEnabled } = useEERC()
  const [selectedModule, setSelectedModule] = useState<ModuleData | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleModuleSelect = (module: ModuleData) => {
    setSelectedModule(module)
    setDialogOpen(true)
  }

  if (!account) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
            <Lock className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">Connect Your Wallet</h3>
          <p className="text-muted-foreground">
            Connect your wallet to access privacy-preserving DeFi modules and start using encrypted financial services.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Platform Modules</h2>
          <p className="text-muted-foreground">
            Explore privacy-preserving financial services and tools
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant={privacyEnabled ? 'privacy' : 'outline'}>
            {privacyEnabled ? (
              <>
                <EyeOff className="w-3 h-3 mr-1" />
                Privacy Enabled
              </>
            ) : (
              <>
                <Eye className="w-3 h-3 mr-1" />
                Privacy Disabled
              </>
            )}
          </Badge>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {modules.map((module) => (
          <ModuleCard
            key={module.id}
            module={module}
            onSelect={handleModuleSelect}
          />
        ))}
      </div>

      {/* Module Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          {selectedModule && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <selectedModule.icon className="w-6 h-6 text-privacy-600" />
                  {selectedModule.title}
                </DialogTitle>
                <DialogDescription>
                  {selectedModule.description}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                {/* Status and Requirements */}
                <div className="flex items-center gap-4">
                  <Badge {...statusConfig[selectedModule.status].badge}>
                    {statusConfig[selectedModule.status].badge.label}
                  </Badge>
                  {selectedModule.requiresPrivacy && (
                    <Badge variant="privacy">
                      <Shield className="w-3 h-3 mr-1" />
                      Requires Privacy
                    </Badge>
                  )}
                </div>
                
                {/* All Features */}
                <div>
                  <h4 className="font-semibold mb-2">Features</h4>
                  <ul className="space-y-2">
                    {selectedModule.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Stats */}
                {selectedModule.stats && (
                  <div>
                    <h4 className="font-semibold mb-2">Statistics</h4>
                    <div className="grid grid-cols-3 gap-4">
                      {selectedModule.stats.map((stat, index) => (
                        <div key={index} className="text-center p-3 bg-muted rounded-lg">
                          <div className="text-lg font-semibold">{stat.value}</div>
                          <div className="text-sm text-muted-foreground">{stat.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  {selectedModule.status === 'coming-soon' ? (
                    <Button disabled className="flex-1">
                      <Clock className="w-4 h-4 mr-2" />
                      Coming {selectedModule.comingSoonDate}
                    </Button>
                  ) : selectedModule.requiresPrivacy && !privacyEnabled ? (
                    <Button variant="outline" className="flex-1">
                      <Shield className="w-4 h-4 mr-2" />
                      Enable Privacy First
                    </Button>
                  ) : (
                    <Button 
                      variant="privacy" 
                      className="flex-1"
                      onClick={() => {
                        if (selectedModule.route) {
                          window.open(selectedModule.route, '_blank')
                        }
                        setDialogOpen(false)
                      }}
                    >
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Launch Module
                    </Button>
                  )}
                  
                  <Button 
                    variant="outline" 
                    onClick={() => setDialogOpen(false)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}