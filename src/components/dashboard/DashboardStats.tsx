'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '@/contexts/WalletContext'
import { useEERC } from '@/contexts/EERCContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Wallet,
  Shield,
  TrendingUp,
  TrendingDown,
  Eye,
  EyeOff,
  DollarSign,
  Activity,
  Users,
  Lock,
  Unlock,
  AlertCircle,
  CheckCircle,
  Clock,
} from 'lucide-react'
import { cn, formatCurrency, formatNumber, formatPercentageChange } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  change?: number
  changeLabel?: string
  icon: React.ElementType
  description?: string
  isPrivate?: boolean
  isLoading?: boolean
  variant?: 'default' | 'privacy' | 'success' | 'warning' | 'danger'
  className?: string
}

function StatCard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  description,
  isPrivate = false,
  isLoading = false,
  variant = 'default',
  className,
}: StatCardProps) {
  const [showValue, setShowValue] = useState(!isPrivate)

  const variantStyles = {
    default: 'border-border',
    privacy: 'border-privacy-300 bg-privacy-50 dark:border-privacy-700 dark:bg-privacy-950',
    success: 'border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-950',
    warning: 'border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950',
    danger: 'border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-950',
  }

  const iconStyles = {
    default: 'text-muted-foreground',
    privacy: 'text-privacy-600 dark:text-privacy-400',
    success: 'text-green-600 dark:text-green-400',
    warning: 'text-amber-600 dark:text-amber-400',
    danger: 'text-red-600 dark:text-red-400',
  }

  return (
    <Card className={cn(variantStyles[variant], className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="flex items-center gap-2">
          {isPrivate && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setShowValue(!showValue)}
                    className="p-1 rounded hover:bg-muted transition-colors"
                  >
                    {showValue ? (
                      <Eye className="h-3 w-3 text-muted-foreground" />
                    ) : (
                      <EyeOff className="h-3 w-3 text-muted-foreground" />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{showValue ? 'Hide value' : 'Show value'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          <Icon className={cn('h-4 w-4', iconStyles[variant])} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <div className="text-2xl font-bold">
            {isLoading ? (
              <LoadingSpinner size="sm" />
            ) : isPrivate && !showValue ? (
              <span className="text-muted-foreground">••••••</span>
            ) : (
              value
            )}
          </div>
          {change !== undefined && changeLabel && (
            <div className="flex items-center gap-1 text-xs">
              {change > 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500" />
              ) : change < 0 ? (
                <TrendingDown className="h-3 w-3 text-red-500" />
              ) : null}
              <span
                className={cn(
                  change > 0 && 'text-green-600 dark:text-green-400',
                  change < 0 && 'text-red-600 dark:text-red-400',
                  change === 0 && 'text-muted-foreground'
                )}
              >
                {formatPercentageChange(change)} {changeLabel}
              </span>
            </div>
          )}
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function DashboardStats() {
  const { account, network } = useWallet()
  const { privacyEnabled, encryptedBalance, isInitialized } = useEERC()
  const [stats, setStats] = useState({
    totalBalance: 0,
    privateBalance: 0,
    publicBalance: 0,
    totalTransactions: 0,
    privateTransactions: 0,
    activeLoans: 0,
    daoProposals: 0,
    rwaAssets: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [networkStats, setNetworkStats] = useState({
    totalUsers: 12543,
    totalVolume: 2847392,
    privacyAdoption: 68.5,
  })

  useEffect(() => {
    const fetchStats = async () => {
      if (!account || !isInitialized) return

      setIsLoading(true)
      try {
        // Simulate API calls to fetch user stats
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Mock data - in real implementation, fetch from contracts
        setStats({
          totalBalance: 15420.50,
          privateBalance: encryptedBalance || 8750.25,
          publicBalance: 6670.25,
          totalTransactions: 127,
          privateTransactions: 89,
          activeLoans: 3,
          daoProposals: 5,
          rwaAssets: 2,
        })
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [account, isInitialized, encryptedBalance])

  if (!account) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="opacity-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Connect Wallet</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-muted-foreground">--</div>
              <p className="text-xs text-muted-foreground">
                Connect your wallet to view stats
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* User Portfolio Stats */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-lg font-semibold">Portfolio Overview</h2>
          <Badge variant={privacyEnabled ? 'privacy' : 'secondary'}>
            {privacyEnabled ? (
              <>
                <Lock className="w-3 h-3 mr-1" />
                Private Mode
              </>
            ) : (
              <>
                <Unlock className="w-3 h-3 mr-1" />
                Public Mode
              </>
            )}
          </Badge>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Balance"
            value={formatCurrency(stats.totalBalance)}
            change={12.5}
            changeLabel="from last month"
            icon={DollarSign}
            isPrivate={privacyEnabled}
            isLoading={isLoading}
            variant="privacy"
          />
          
          <StatCard
            title="Private Balance"
            value={formatCurrency(stats.privateBalance)}
            change={8.3}
            changeLabel="from last week"
            icon={Shield}
            description="Encrypted balance"
            isPrivate={true}
            isLoading={isLoading}
            variant="privacy"
          />
          
          <StatCard
            title="Total Transactions"
            value={formatNumber(stats.totalTransactions)}
            change={5.2}
            changeLabel="this month"
            icon={Activity}
            description={`${stats.privateTransactions} private`}
            isLoading={isLoading}
          />
          
          <StatCard
            title="Active Loans"
            value={stats.activeLoans}
            icon={TrendingUp}
            description="Confidential lending"
            isLoading={isLoading}
            variant={stats.activeLoans > 0 ? 'warning' : 'default'}
          />
        </div>
      </div>

      {/* Platform Activity */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-lg font-semibold">Platform Activity</h2>
          <Badge variant="outline">
            <Activity className="w-3 h-3 mr-1" />
            Live
          </Badge>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="DAO Proposals"
            value={stats.daoProposals}
            icon={Users}
            description="Active governance"
            isLoading={isLoading}
            variant={stats.daoProposals > 0 ? 'success' : 'default'}
          />
          
          <StatCard
            title="RWA Assets"
            value={stats.rwaAssets}
            icon={CheckCircle}
            description="Tokenized assets"
            isLoading={isLoading}
          />
          
          <StatCard
            title="Network Users"
            value={formatNumber(networkStats.totalUsers)}
            change={3.1}
            changeLabel="growth rate"
            icon={Users}
            description="Total platform users"
            variant="success"
          />
          
          <StatCard
            title="Privacy Adoption"
            value={`${networkStats.privacyAdoption}%`}
            change={2.4}
            changeLabel="this quarter"
            icon={Shield}
            description="Users using privacy features"
            variant="privacy"
          />
        </div>
      </div>

      {/* Network Status */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-lg font-semibold">Network Status</h2>
          <Badge variant="success">
            <CheckCircle className="w-3 h-3 mr-1" />
            Operational
          </Badge>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Current Network"
            value={network?.name || 'Unknown'}
            icon={Activity}
            description={`Chain ID: ${network?.chainId || 'N/A'}`}
            variant="success"
          />
          
          <StatCard
            title="Total Volume"
            value={formatCurrency(networkStats.totalVolume)}
            change={15.7}
            changeLabel="24h volume"
            icon={TrendingUp}
            description="Platform trading volume"
            variant="success"
          />
          
          <StatCard
            title="Privacy Score"
            value="A+"
            icon={Shield}
            description="Security rating"
            variant="privacy"
          />
        </div>
      </div>
    </div>
  )
}