'use client';

import { useEffect } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { useEERC } from '@/contexts/EERCContext';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { ModuleGrid } from '@/components/dashboard/ModuleGrid';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { WalletConnect } from '@/components/wallet/WalletConnect';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Shield, Lock, Eye, EyeOff, Zap, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  const { isConnected, account, network, isConnecting } = useWallet();
  const { isPrivacyEnabled, isInitialized, initializeEERC, togglePrivacy } = useEERC();

  useEffect(() => {
    if (isConnected && !isInitialized) {
      initializeEERC();
    }
  }, [isConnected, isInitialized, initializeEERC]);

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Hero Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-2 mb-6">
                <Shield className="h-12 w-12 text-privacy-500" />
                <h1 className="text-4xl font-bold bg-gradient-to-r from-privacy-600 to-secure-600 bg-clip-text text-transparent">
                  eERC Dashboard
                </h1>
              </div>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Experience the future of private DeFi with encrypted ERC-20 tokens on Avalanche
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-6 my-12">
              <Card className="border-privacy-200 hover:border-privacy-300 transition-colors">
                <CardHeader className="text-center">
                  <Lock className="h-8 w-8 text-privacy-500 mx-auto mb-2" />
                  <CardTitle className="text-lg">Private Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Keep your transaction amounts and balances completely private
                  </p>
                </CardContent>
              </Card>

              <Card className="border-secure-200 hover:border-secure-300 transition-colors">
                <CardHeader className="text-center">
                  <Zap className="h-8 w-8 text-secure-500 mx-auto mb-2" />
                  <CardTitle className="text-lg">Lightning Fast</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Built on Avalanche for instant finality and low fees
                  </p>
                </CardContent>
              </Card>

              <Card className="border-primary/20 hover:border-primary/30 transition-colors">
                <CardHeader className="text-center">
                  <TrendingUp className="h-8 w-8 text-primary mx-auto mb-2" />
                  <CardTitle className="text-lg">DeFi Modules</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Access lending, payroll, DAO, and RWA modules with privacy
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Connection Section */}
            <div className="max-w-md mx-auto">
              <WalletConnect />
            </div>

            {/* Network Status */}
            <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
              <Badge variant="outline" className="border-privacy-200">
                <Shield className="h-3 w-3 mr-1" />
                Privacy-First
              </Badge>
              <Badge variant="outline" className="border-secure-200">
                <Lock className="h-3 w-3 mr-1" />
                End-to-End Encrypted
              </Badge>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isConnecting || !isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" variant="privacy" />
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Initializing Privacy Layer</h2>
            <p className="text-muted-foreground">
              Setting up your encrypted environment...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome back
            </h1>
            <p className="text-muted-foreground">
              Manage your private DeFi portfolio
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Privacy Toggle */}
            <Button
              variant={isPrivacyEnabled ? "privacy" : "outline"}
              size="sm"
              onClick={togglePrivacy}
              className="flex items-center space-x-2"
            >
              {isPrivacyEnabled ? (
                <>
                  <EyeOff className="h-4 w-4" />
                  <span>Private Mode</span>
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" />
                  <span>Public Mode</span>
                </>
              )}
            </Button>

            {/* Network Badge */}
            <Badge 
              variant={network?.name === 'Avalanche Mainnet' ? 'success' : 'warning'}
              className="flex items-center space-x-1"
            >
              <div className="h-2 w-2 rounded-full bg-current animate-pulse" />
              <span>{network?.name || 'Unknown Network'}</span>
            </Badge>
          </div>
        </div>

        {/* Stats Section */}
        <DashboardStats />

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Modules - Takes 2 columns */}
          <div className="lg:col-span-2">
            <ModuleGrid />
          </div>

          {/* Recent Activity - Takes 1 column */}
          <div className="lg:col-span-1">
            <RecentActivity />
          </div>
        </div>

        {/* Privacy Notice */}
        {isPrivacyEnabled && (
          <Card className="border-privacy-200 bg-privacy-50/50 dark:bg-privacy-950/20">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <Shield className="h-5 w-5 text-privacy-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-privacy-900 dark:text-privacy-100">
                    Privacy Mode Active
                  </p>
                  <p className="text-xs text-privacy-700 dark:text-privacy-300">
                    Your balances and transaction amounts are encrypted and only visible to you.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}