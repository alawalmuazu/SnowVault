'use client'

import { useState } from 'react'
import { useWallet } from '@/contexts/WalletContext'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Badge } from '@/components/ui/badge'
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
  Wallet,
  Shield,
  AlertTriangle,
  ExternalLink,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface WalletOption {
  id: string
  name: string
  description: string
  icon: string
  installed: boolean
  downloadUrl?: string
}

const walletOptions: WalletOption[] = [
  {
    id: 'metamask',
    name: 'MetaMask',
    description: 'Connect using MetaMask wallet',
    icon: '🦊',
    installed: typeof window !== 'undefined' && !!window.ethereum?.isMetaMask,
    downloadUrl: 'https://metamask.io/download/',
  },
  {
    id: 'coinbase',
    name: 'Coinbase Wallet',
    description: 'Connect using Coinbase Wallet',
    icon: '🔵',
    installed: typeof window !== 'undefined' && !!window.ethereum?.isCoinbaseWallet,
    downloadUrl: 'https://www.coinbase.com/wallet',
  },
  {
    id: 'walletconnect',
    name: 'WalletConnect',
    description: 'Connect using WalletConnect protocol',
    icon: '🔗',
    installed: true, // WalletConnect is always available
  },
]

const networkRequirements = [
  'Avalanche C-Chain support',
  'EIP-1559 transaction support',
  'Custom network addition',
  'dApp interaction capabilities',
]

export function WalletConnect() {
  const { connect, isConnecting } = useWallet()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null)

  const handleConnect = async (walletId: string) => {
    const wallet = walletOptions.find(w => w.id === walletId)
    if (!wallet) return

    if (!wallet.installed && wallet.downloadUrl) {
      window.open(wallet.downloadUrl, '_blank')
      return
    }

    setSelectedWallet(walletId)
    try {
      await connect()
      setDialogOpen(false)
    } catch (error) {
      console.error('Failed to connect wallet:', error)
    } finally {
      setSelectedWallet(null)
    }
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="privacy" 
          size="lg"
          disabled={isConnecting}
          className="relative"
        >
          {isConnecting ? (
            <>
              <LoadingSpinner size="sm" variant="white" className="mr-2" />
              Connecting...
            </>
          ) : (
            <>
              <Wallet className="w-4 h-4 mr-2" />
              Connect Wallet
            </>
          )}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-privacy-600" />
            Connect Your Wallet
          </DialogTitle>
          <DialogDescription>
            Choose a wallet to connect to the Privacy Platform. Make sure your wallet supports Avalanche network.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Wallet Options */}
          <div className="space-y-3">
            {walletOptions.map((wallet) => {
              const isLoading = selectedWallet === wallet.id && isConnecting
              
              return (
                <Card 
                  key={wallet.id}
                  className={cn(
                    "cursor-pointer transition-all duration-200 hover:shadow-md",
                    wallet.installed 
                      ? "hover:border-privacy-300 dark:hover:border-privacy-700" 
                      : "opacity-60"
                  )}
                  onClick={() => handleConnect(wallet.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{wallet.icon}</div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{wallet.name}</h3>
                            {wallet.installed ? (
                              <Badge variant="success" className="text-xs">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Installed
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs">
                                <XCircle className="w-3 h-3 mr-1" />
                                Not Installed
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {wallet.description}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {isLoading && (
                          <LoadingSpinner size="sm" />
                        )}
                        {!wallet.installed && wallet.downloadUrl && (
                          <ExternalLink className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Network Requirements */}
          <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                <AlertTriangle className="w-4 h-4" />
                Network Requirements
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-amber-700 dark:text-amber-300 mb-3">
                Your wallet must support the following features:
              </p>
              <ul className="space-y-1">
                {networkRequirements.map((requirement, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-300">
                    <CheckCircle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                    {requirement}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Privacy Notice */}
          <Card className="border-privacy-200 bg-privacy-50 dark:border-privacy-800 dark:bg-privacy-950">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-privacy-600 dark:text-privacy-400 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-privacy-800 dark:text-privacy-200 mb-1">
                    Privacy & Security
                  </h4>
                  <p className="text-sm text-privacy-700 dark:text-privacy-300">
                    This platform uses encrypted ERC tokens (eERC) to ensure your financial data remains private. 
                    Your wallet will be used to sign transactions and manage your privacy keys.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Help Text */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              New to crypto wallets?{' '}
              <a 
                href="https://ethereum.org/en/wallets/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-privacy-600 hover:text-privacy-700 underline"
              >
                Learn more about wallets
              </a>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}