'use client'

import { useState, useEffect } from 'react'
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  ArrowUpRight,
  ArrowDownLeft,
  Shield,
  Eye,
  EyeOff,
  ExternalLink,
  Filter,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Banknote,
  Users,
  Vote,
  Building,
  MoreHorizontal,
  Copy,
  Search,
} from 'lucide-react'
import { cn, formatCurrency, formatRelativeTime, truncateAddress, getExplorerUrl } from '@/lib/utils'

interface Activity {
  id: string
  type: 'transfer' | 'lending' | 'payroll' | 'dao' | 'rwa' | 'mint' | 'burn'
  action: string
  amount?: number
  token?: string
  from?: string
  to?: string
  timestamp: Date
  status: 'pending' | 'confirmed' | 'failed'
  isPrivate: boolean
  txHash?: string
  module: string
  description: string
  metadata?: Record<string, any>
}

const activityTypes = {
  transfer: {
    icon: ArrowUpRight,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900',
  },
  lending: {
    icon: Banknote,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900',
  },
  payroll: {
    icon: Users,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-100 dark:bg-purple-900',
  },
  dao: {
    icon: Vote,
    color: 'text-indigo-600 dark:text-indigo-400',
    bgColor: 'bg-indigo-100 dark:bg-indigo-900',
  },
  rwa: {
    icon: Building,
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-100 dark:bg-amber-900',
  },
  mint: {
    icon: ArrowDownLeft,
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-100 dark:bg-emerald-900',
  },
  burn: {
    icon: ArrowUpRight,
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-900',
  },
}

const statusConfig = {
  pending: {
    icon: Clock,
    color: 'text-amber-600 dark:text-amber-400',
    badge: 'warning' as const,
  },
  confirmed: {
    icon: CheckCircle,
    color: 'text-green-600 dark:text-green-400',
    badge: 'success' as const,
  },
  failed: {
    icon: XCircle,
    color: 'text-red-600 dark:text-red-400',
    badge: 'destructive' as const,
  },
}

// Mock data generator
const generateMockActivities = (count: number): Activity[] => {
  const activities: Activity[] = []
  const types = Object.keys(activityTypes) as Array<keyof typeof activityTypes>
  const statuses: Activity['status'][] = ['confirmed', 'pending', 'failed']
  const modules = ['Confidential Lending', 'Private Payroll', 'DAO Governance', 'RWA Tokenization', 'Privacy Token']
  
  for (let i = 0; i < count; i++) {
    const type = types[Math.floor(Math.random() * types.length)]
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    const isPrivate = Math.random() > 0.3 // 70% private
    
    activities.push({
      id: `activity-${i}`,
      type,
      action: getActionForType(type),
      amount: Math.random() * 10000,
      token: 'EERC',
      from: '0x1234...5678',
      to: '0x8765...4321',
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Last 7 days
      status,
      isPrivate,
      txHash: `0x${Math.random().toString(16).substr(2, 64)}`,
      module: modules[Math.floor(Math.random() * modules.length)],
      description: getDescriptionForType(type),
      metadata: {
        gasUsed: Math.floor(Math.random() * 100000),
        gasPrice: Math.floor(Math.random() * 50) + 10,
      },
    })
  }
  
  return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
}

function getActionForType(type: Activity['type']): string {
  const actions = {
    transfer: 'Transfer',
    lending: 'Loan Created',
    payroll: 'Salary Payment',
    dao: 'Vote Cast',
    rwa: 'Asset Tokenized',
    mint: 'Tokens Minted',
    burn: 'Tokens Burned',
  }
  return actions[type]
}

function getDescriptionForType(type: Activity['type']): string {
  const descriptions = {
    transfer: 'Transferred tokens to another address',
    lending: 'Created a new confidential loan',
    payroll: 'Processed employee salary payment',
    dao: 'Participated in governance voting',
    rwa: 'Tokenized real-world asset',
    mint: 'Minted new privacy tokens',
    burn: 'Burned privacy tokens',
  }
  return descriptions[type]
}

interface ActivityItemProps {
  activity: Activity
  showPrivateData: boolean
}

function ActivityItem({ activity, showPrivateData }: ActivityItemProps) {
  const [copied, setCopied] = useState(false)
  
  const typeConfig = activityTypes[activity.type]
  const statusConf = statusConfig[activity.status]
  const TypeIcon = typeConfig.icon
  const StatusIcon = statusConf.icon
  
  const handleCopyTxHash = async () => {
    if (activity.txHash) {
      await navigator.clipboard.writeText(activity.txHash)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }
  
  const handleViewOnExplorer = () => {
    if (activity.txHash) {
      const url = getExplorerUrl(activity.txHash, 'tx')
      window.open(url, '_blank')
    }
  }
  
  return (
    <div className="flex items-start gap-4 p-4 border-b last:border-b-0 hover:bg-muted/50 transition-colors">
      {/* Activity Icon */}
      <div className={cn(
        'p-2 rounded-lg flex-shrink-0',
        typeConfig.bgColor
      )}>
        <TypeIcon className={cn('w-4 h-4', typeConfig.color)} />
      </div>
      
      {/* Activity Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-sm">{activity.action}</h4>
              <Badge variant={statusConf.badge} className="text-xs">
                <StatusIcon className="w-3 h-3 mr-1" />
                {activity.status}
              </Badge>
              {activity.isPrivate && (
                <Badge variant="privacy" className="text-xs">
                  <Shield className="w-3 h-3 mr-1" />
                  Private
                </Badge>
              )}
            </div>
            
            <p className="text-sm text-muted-foreground mb-2">
              {activity.description}
            </p>
            
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>{activity.module}</span>
              <span>•</span>
              <span>{formatRelativeTime(activity.timestamp)}</span>
              {activity.txHash && (
                <>
                  <span>•</span>
                  <button
                    onClick={handleCopyTxHash}
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                  >
                    <Copy className="w-3 h-3" />
                    {copied ? 'Copied!' : truncateAddress(activity.txHash)}
                  </button>
                </>
              )}
            </div>
          </div>
          
          {/* Amount and Actions */}
          <div className="flex items-center gap-2">
            {activity.amount && (
              <div className="text-right">
                <div className="font-medium text-sm">
                  {activity.isPrivate && !showPrivateData ? (
                    <span className="text-muted-foreground">••••••</span>
                  ) : (
                    `${formatCurrency(activity.amount)} ${activity.token}`
                  )}
                </div>
                {activity.from && activity.to && (
                  <div className="text-xs text-muted-foreground">
                    {activity.isPrivate && !showPrivateData ? (
                      <span>•••• → ••••</span>
                    ) : (
                      <span>{truncateAddress(activity.from)} → {truncateAddress(activity.to)}</span>
                    )}
                  </div>
                )}
              </div>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {activity.txHash && (
                  <>
                    <DropdownMenuItem onClick={handleCopyTxHash}>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Transaction Hash
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleViewOnExplorer}>
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View on Explorer
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuItem>
                  <Search className="w-4 h-4 mr-2" />
                  View Details
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  )
}

export function RecentActivity() {
  const { account } = useWallet()
  const { privacyEnabled } = useEERC()
  const [activities, setActivities] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showPrivateData, setShowPrivateData] = useState(false)
  const [filter, setFilter] = useState<'all' | Activity['type']>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | Activity['status']>('all')
  
  useEffect(() => {
    const fetchActivities = async () => {
      if (!account) return
      
      setIsLoading(true)
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        const mockActivities = generateMockActivities(20)
        setActivities(mockActivities)
      } catch (error) {
        console.error('Failed to fetch activities:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchActivities()
  }, [account])
  
  const filteredActivities = activities.filter(activity => {
    if (filter !== 'all' && activity.type !== filter) return false
    if (statusFilter !== 'all' && activity.status !== statusFilter) return false
    return true
  })
  
  const handleRefresh = () => {
    if (account) {
      setIsLoading(true)
      setTimeout(() => {
        const mockActivities = generateMockActivities(20)
        setActivities(mockActivities)
        setIsLoading(false)
      }, 1000)
    }
  }
  
  if (!account) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Connect your wallet to view transaction history
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-12 h-12 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">
              Your recent activities will appear here once you connect your wallet.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your latest transactions and platform interactions
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Privacy Toggle */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPrivateData(!showPrivateData)}
                    className="h-8 w-8 p-0"
                  >
                    {showPrivateData ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <EyeOff className="w-4 h-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{showPrivateData ? 'Hide' : 'Show'} private data</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            {/* Filters */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => setFilter('all')}>
                  All Activities
                </DropdownMenuItem>
                {Object.entries(activityTypes).map(([type, config]) => {
                  const Icon = config.icon
                  return (
                    <DropdownMenuItem 
                      key={type}
                      onClick={() => setFilter(type as Activity['type'])}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Refresh */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
              className="h-8 w-8 p-0"
            >
              <RefreshCw className={cn(
                'w-4 h-4',
                isLoading && 'animate-spin'
              )} />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">
              {filter === 'all' ? 'No activities found' : `No ${filter} activities found`}
            </p>
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {filteredActivities.map((activity) => (
              <ActivityItem
                key={activity.id}
                activity={activity}
                showPrivateData={showPrivateData}
              />
            ))}
          </div>
        )}
        
        {filteredActivities.length > 0 && (
          <div className="p-4 border-t">
            <Button variant="outline" className="w-full">
              View All Activities
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}