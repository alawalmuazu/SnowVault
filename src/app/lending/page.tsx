'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Shield, Lock, Eye, EyeOff, TrendingUp, TrendingDown, DollarSign, Percent } from 'lucide-react'
import { formatCurrency, formatPercentage } from '@/lib/utils'

interface LoanPosition {
  id: string
  collateralAmount: number
  collateralToken: string
  borrowedAmount: number
  borrowedToken: string
  interestRate: number
  healthFactor: number
  isPrivate: boolean
}

interface LendingPool {
  id: string
  token: string
  totalSupplied: number
  totalBorrowed: number
  supplyAPY: number
  borrowAPY: number
  utilizationRate: number
  isPrivate: boolean
}

const mockLoanPositions: LoanPosition[] = [
  {
    id: '1',
    collateralAmount: 10.5,
    collateralToken: 'AVAX',
    borrowedAmount: 5000,
    borrowedToken: 'USDC',
    interestRate: 5.2,
    healthFactor: 2.1,
    isPrivate: true
  },
  {
    id: '2',
    collateralAmount: 2.8,
    collateralToken: 'ETH',
    borrowedAmount: 3200,
    borrowedToken: 'USDT',
    interestRate: 4.8,
    healthFactor: 1.8,
    isPrivate: false
  }
]

const mockLendingPools: LendingPool[] = [
  {
    id: '1',
    token: 'USDC',
    totalSupplied: 1250000,
    totalBorrowed: 875000,
    supplyAPY: 3.2,
    borrowAPY: 5.8,
    utilizationRate: 70,
    isPrivate: true
  },
  {
    id: '2',
    token: 'USDT',
    totalSupplied: 980000,
    totalBorrowed: 686000,
    supplyAPY: 2.9,
    borrowAPY: 5.5,
    utilizationRate: 70,
    isPrivate: true
  },
  {
    id: '3',
    token: 'AVAX',
    totalSupplied: 45000,
    totalBorrowed: 27000,
    supplyAPY: 4.1,
    borrowAPY: 6.2,
    utilizationRate: 60,
    isPrivate: false
  }
]

export default function LendingPage() {
  const [activeTab, setActiveTab] = useState('supply')
  const [privacyMode, setPrivacyMode] = useState(true)
  const [supplyAmount, setSupplyAmount] = useState('')
  const [borrowAmount, setBorrowAmount] = useState('')
  const [selectedToken, setSelectedToken] = useState('USDC')

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Confidential Lending
          </h1>
          <p className="text-muted-foreground mt-2">
            Privacy-preserving lending and borrowing with zero-knowledge proofs
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant={privacyMode ? 'default' : 'outline'}
            onClick={() => setPrivacyMode(!privacyMode)}
            className="flex items-center gap-2"
          >
            {privacyMode ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            {privacyMode ? 'Privacy On' : 'Privacy Off'}
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="privacy-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Supplied</p>
                <p className="text-2xl font-bold">
                  {privacyMode ? '••••••••' : formatCurrency(2230000)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="privacy-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Borrowed</p>
                <p className="text-2xl font-bold">
                  {privacyMode ? '••••••••' : formatCurrency(1588000)}
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="privacy-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Supply APY</p>
                <p className="text-2xl font-bold text-green-500">
                  {privacyMode ? '•••%' : '3.4%'}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="privacy-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Your Health Factor</p>
                <p className="text-2xl font-bold text-yellow-500">
                  {privacyMode ? '•••' : '1.95'}
                </p>
              </div>
              <Percent className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Supply/Borrow Interface */}
        <div className="lg:col-span-2">
          <Card className="privacy-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-500" />
                Lending Operations
              </CardTitle>
              <CardDescription>
                Supply assets to earn yield or borrow against your collateral
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="supply">Supply</TabsTrigger>
                  <TabsTrigger value="borrow">Borrow</TabsTrigger>
                </TabsList>

                <TabsContent value="supply" className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="supply-token">Select Token</Label>
                      <select
                        id="supply-token"
                        value={selectedToken}
                        onChange={(e) => setSelectedToken(e.target.value)}
                        className="w-full mt-1 p-2 border rounded-md bg-background"
                      >
                        <option value="USDC">USDC</option>
                        <option value="USDT">USDT</option>
                        <option value="AVAX">AVAX</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="supply-amount">Amount</Label>
                      <Input
                        id="supply-amount"
                        type="number"
                        placeholder="0.00"
                        value={supplyAmount}
                        onChange={(e) => setSupplyAmount(e.target.value)}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-blue-500" />
                      <span className="text-sm text-muted-foreground">
                        Transaction will be encrypted using zero-knowledge proofs
                      </span>
                    </div>
                    <Button className="w-full" size="lg">
                      Supply {selectedToken}
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="borrow" className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="borrow-token">Select Token</Label>
                      <select
                        id="borrow-token"
                        value={selectedToken}
                        onChange={(e) => setSelectedToken(e.target.value)}
                        className="w-full mt-1 p-2 border rounded-md bg-background"
                      >
                        <option value="USDC">USDC</option>
                        <option value="USDT">USDT</option>
                        <option value="AVAX">AVAX</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="borrow-amount">Amount</Label>
                      <Input
                        id="borrow-amount"
                        type="number"
                        placeholder="0.00"
                        value={borrowAmount}
                        onChange={(e) => setBorrowAmount(e.target.value)}
                      />
                    </div>
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        ⚠️ Ensure your health factor stays above 1.0 to avoid liquidation
                      </p>
                    </div>
                    <Button className="w-full" size="lg">
                      Borrow {selectedToken}
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Lending Pools */}
        <div>
          <Card className="privacy-card">
            <CardHeader>
              <CardTitle>Lending Pools</CardTitle>
              <CardDescription>
                Available pools for lending and borrowing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockLendingPools.map((pool) => (
                <div key={pool.id} className="p-4 border rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{pool.token}</span>
                      {pool.isPrivate && (
                        <Badge variant="secondary" className="text-xs">
                          <Lock className="h-3 w-3 mr-1" />
                          Private
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Supply APY</p>
                      <p className="font-medium text-green-500">
                        {formatPercentage(pool.supplyAPY)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Borrow APY</p>
                      <p className="font-medium text-red-500">
                        {formatPercentage(pool.borrowAPY)}
                      </p>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Utilization</span>
                      <span>{formatPercentage(pool.utilizationRate)}</span>
                    </div>
                    <Progress value={pool.utilizationRate} className="h-2" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Your Positions */}
      <Card className="privacy-card">
        <CardHeader>
          <CardTitle>Your Loan Positions</CardTitle>
          <CardDescription>
            Manage your active lending and borrowing positions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockLoanPositions.map((position) => (
              <div key={position.id} className="p-4 border rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Collateral</p>
                    <p className="font-medium">
                      {privacyMode ? '••••' : position.collateralAmount} {position.collateralToken}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Borrowed</p>
                    <p className="font-medium">
                      {privacyMode ? '••••' : formatCurrency(position.borrowedAmount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Interest Rate</p>
                    <p className="font-medium">
                      {formatPercentage(position.interestRate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Health Factor</p>
                    <p className={`font-medium ${
                      position.healthFactor > 1.5 ? 'text-green-500' :
                      position.healthFactor > 1.2 ? 'text-yellow-500' : 'text-red-500'
                    }`}>
                      {privacyMode ? '•••' : position.healthFactor.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    {position.isPrivate && (
                      <Badge variant="secondary" className="text-xs">
                        <Lock className="h-3 w-3 mr-1" />
                        Private
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Repay
                    </Button>
                    <Button variant="outline" size="sm">
                      Add Collateral
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}