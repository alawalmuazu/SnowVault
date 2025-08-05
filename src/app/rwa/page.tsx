'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Eye, EyeOff, Shield, Building, TrendingUp, DollarSign, FileText, Upload, Download, Plus, MapPin, Calendar, Users } from 'lucide-react';

interface RWAAsset {
  id: string;
  name: string;
  type: 'real-estate' | 'commodity' | 'art' | 'bonds' | 'equity';
  value: number;
  tokenSupply: number;
  pricePerToken: number;
  location: string;
  status: 'active' | 'pending' | 'sold' | 'verified';
  privacy: boolean;
  yield: number;
  maturity?: string;
  description: string;
  documents: string[];
}

interface Investment {
  id: string;
  assetId: string;
  assetName: string;
  tokensOwned: number;
  investmentValue: number;
  currentValue: number;
  yield: number;
  purchaseDate: string;
  privacy: boolean;
}

export default function RWAPage() {
  const [privacyMode, setPrivacyMode] = useState(true);
  const [assets] = useState<RWAAsset[]>([
    {
      id: 'rwa-001',
      name: 'Manhattan Office Building',
      type: 'real-estate',
      value: 5000000,
      tokenSupply: 5000,
      pricePerToken: 1000,
      location: 'New York, NY',
      status: 'active',
      privacy: true,
      yield: 8.5,
      description: 'Premium office building in Manhattan financial district with long-term tenants.',
      documents: ['Property Deed', 'Valuation Report', 'Rental Agreements']
    },
    {
      id: 'rwa-002',
      name: 'Gold Bullion Reserve',
      type: 'commodity',
      value: 2500000,
      tokenSupply: 2500,
      pricePerToken: 1000,
      location: 'Swiss Vault',
      status: 'active',
      privacy: true,
      yield: 3.2,
      description: 'Physical gold bullion stored in secure Swiss vault facility.',
      documents: ['Assay Certificate', 'Storage Agreement', 'Insurance Policy']
    },
    {
      id: 'rwa-003',
      name: 'Renaissance Art Collection',
      type: 'art',
      value: 1800000,
      tokenSupply: 1800,
      pricePerToken: 1000,
      location: 'Private Gallery',
      status: 'verified',
      privacy: false,
      yield: 12.3,
      description: 'Curated collection of authenticated Renaissance paintings.',
      documents: ['Authentication Certificate', 'Provenance Records', 'Appraisal Report']
    },
    {
      id: 'rwa-004',
      name: 'Corporate Green Bonds',
      type: 'bonds',
      value: 10000000,
      tokenSupply: 10000,
      pricePerToken: 1000,
      location: 'Global',
      status: 'active',
      privacy: true,
      yield: 6.8,
      maturity: '2029-12-31',
      description: 'Investment-grade corporate bonds focused on sustainable energy projects.',
      documents: ['Bond Prospectus', 'Credit Rating', 'ESG Report']
    }
  ]);

  const [investments] = useState<Investment[]>([
    {
      id: 'inv-001',
      assetId: 'rwa-001',
      assetName: 'Manhattan Office Building',
      tokensOwned: 50,
      investmentValue: 50000,
      currentValue: 52500,
      yield: 8.5,
      purchaseDate: '2024-01-15',
      privacy: true
    },
    {
      id: 'inv-002',
      assetId: 'rwa-002',
      assetName: 'Gold Bullion Reserve',
      tokensOwned: 25,
      investmentValue: 25000,
      currentValue: 26200,
      yield: 3.2,
      purchaseDate: '2024-01-20',
      privacy: true
    }
  ]);

  const [newAsset, setNewAsset] = useState({
    name: '',
    type: 'real-estate',
    value: '',
    tokenSupply: '',
    location: '',
    description: '',
    privacy: true
  });

  const formatValue = (value: number | string, isPrivate: boolean = false) => {
    if (privacyMode && isPrivate) {
      return '••••••';
    }
    if (typeof value === 'number') {
      return value.toLocaleString();
    }
    return value;
  };

  const formatCurrency = (value: number, isPrivate: boolean = false) => {
    if (privacyMode && isPrivate) {
      return '$••••••';
    }
    return `$${value.toLocaleString()}`;
  };

  const getAssetTypeIcon = (type: string) => {
    switch (type) {
      case 'real-estate':
        return <Building className="h-4 w-4" />;
      case 'commodity':
        return <TrendingUp className="h-4 w-4" />;
      case 'art':
        return <FileText className="h-4 w-4" />;
      case 'bonds':
        return <DollarSign className="h-4 w-4" />;
      default:
        return <Building className="h-4 w-4" />;
    }
  };

  const getAssetTypeColor = (type: string) => {
    switch (type) {
      case 'real-estate':
        return 'bg-blue-100 text-blue-800';
      case 'commodity':
        return 'bg-yellow-100 text-yellow-800';
      case 'art':
        return 'bg-purple-100 text-purple-800';
      case 'bonds':
        return 'bg-green-100 text-green-800';
      case 'equity':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-600';
      case 'pending':
        return 'bg-yellow-600';
      case 'verified':
        return 'bg-blue-600';
      case 'sold':
        return 'bg-gray-600';
      default:
        return 'bg-gray-600';
    }
  };

  const totalPortfolioValue = investments.reduce((sum, inv) => sum + inv.currentValue, 0);
  const totalInvestment = investments.reduce((sum, inv) => sum + inv.investmentValue, 0);
  const portfolioGain = totalPortfolioValue - totalInvestment;
  const portfolioGainPercent = totalInvestment > 0 ? (portfolioGain / totalInvestment) * 100 : 0;
  const averageYield = investments.length > 0 ? investments.reduce((sum, inv) => sum + inv.yield, 0) / investments.length : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <Building className="h-8 w-8 text-indigo-600" />
              RWA Tokenization
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Privacy-preserving real world asset tokenization and investment platform
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant={privacyMode ? "default" : "outline"}
              onClick={() => setPrivacyMode(!privacyMode)}
              className="flex items-center gap-2"
            >
              {privacyMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {privacyMode ? 'Privacy Mode' : 'Visible Mode'}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-100">Portfolio Value</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(totalPortfolioValue, true)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-indigo-200" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-r from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Total Gain/Loss</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(portfolioGain, true)}
                </p>
                <p className="text-sm text-green-100">
                  {portfolioGainPercent >= 0 ? '+' : ''}{portfolioGainPercent.toFixed(2)}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-200" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">Average Yield</p>
                <p className="text-2xl font-bold">{averageYield.toFixed(1)}%</p>
              </div>
              <Shield className="h-8 w-8 text-purple-200" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100">Active Assets</p>
                <p className="text-2xl font-bold">{assets.filter(a => a.status === 'active').length}</p>
              </div>
              <Building className="h-8 w-8 text-orange-200" />
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="marketplace" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="marketplace">Asset Marketplace</TabsTrigger>
            <TabsTrigger value="portfolio">My Portfolio</TabsTrigger>
            <TabsTrigger value="tokenize">Tokenize Asset</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Asset Marketplace */}
          <TabsContent value="marketplace" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {assets.map((asset) => (
                <Card key={asset.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{asset.name}</h3>
                        <Badge className={getStatusColor(asset.status)}>
                          {asset.status}
                        </Badge>
                        {asset.privacy && (
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            <Shield className="h-3 w-3 mr-1" />
                            Private
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className={getAssetTypeColor(asset.type)}>
                          <div className="flex items-center gap-1">
                            {getAssetTypeIcon(asset.type)}
                            {asset.type.replace('-', ' ')}
                          </div>
                        </Badge>
                        <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400">
                          <MapPin className="h-3 w-3" />
                          {asset.location}
                        </div>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 text-sm mb-3">
                        {asset.description}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Total Value</p>
                      <p className="font-semibold">{formatCurrency(asset.value, asset.privacy)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Price per Token</p>
                      <p className="font-semibold">{formatCurrency(asset.pricePerToken, asset.privacy)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Annual Yield</p>
                      <p className="font-semibold text-green-600">{asset.yield}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Available Tokens</p>
                      <p className="font-semibold">{formatValue(asset.tokenSupply, asset.privacy)}</p>
                    </div>
                  </div>

                  {asset.maturity && (
                    <div className="mb-4">
                      <p className="text-sm text-slate-600 dark:text-slate-400">Maturity Date</p>
                      <p className="font-semibold flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {asset.maturity}
                      </p>
                    </div>
                  )}

                  <div className="mb-4">
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Documents</p>
                    <div className="flex flex-wrap gap-2">
                      {asset.documents.map((doc, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          <FileText className="h-3 w-3 mr-1" />
                          {doc}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {asset.status === 'active' && (
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <Input placeholder="Number of tokens" type="number" className="flex-1" />
                        <Button className="bg-indigo-600 hover:bg-indigo-700">
                          Invest
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* My Portfolio */}
          <TabsContent value="portfolio" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Investment Portfolio</h3>
              <div className="space-y-4">
                {investments.map((investment) => (
                  <div key={investment.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium">{investment.assetName}</h4>
                        {investment.privacy && (
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            <Shield className="h-3 w-3 mr-1" />
                            Private
                          </Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-slate-600 dark:text-slate-400">Tokens Owned</p>
                          <p className="font-medium">{formatValue(investment.tokensOwned, investment.privacy)}</p>
                        </div>
                        <div>
                          <p className="text-slate-600 dark:text-slate-400">Investment</p>
                          <p className="font-medium">{formatCurrency(investment.investmentValue, investment.privacy)}</p>
                        </div>
                        <div>
                          <p className="text-slate-600 dark:text-slate-400">Current Value</p>
                          <p className="font-medium">{formatCurrency(investment.currentValue, investment.privacy)}</p>
                        </div>
                        <div>
                          <p className="text-slate-600 dark:text-slate-400">Yield</p>
                          <p className="font-medium text-green-600">{investment.yield}%</p>
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-xs text-slate-500">
                          Purchased on {investment.purchaseDate}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Sell
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Tokenize Asset */}
          <TabsContent value="tokenize" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Tokenize New Asset
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="assetName">Asset Name</Label>
                    <Input
                      id="assetName"
                      value={newAsset.name}
                      onChange={(e) => setNewAsset({...newAsset, name: e.target.value})}
                      placeholder="Enter asset name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="assetType">Asset Type</Label>
                    <select 
                      id="assetType"
                      value={newAsset.type}
                      onChange={(e) => setNewAsset({...newAsset, type: e.target.value})}
                      className="w-full p-2 border rounded-md bg-white dark:bg-slate-800"
                    >
                      <option value="real-estate">Real Estate</option>
                      <option value="commodity">Commodity</option>
                      <option value="art">Art & Collectibles</option>
                      <option value="bonds">Bonds</option>
                      <option value="equity">Equity</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="assetValue">Total Asset Value (USD)</Label>
                    <Input
                      id="assetValue"
                      type="number"
                      value={newAsset.value}
                      onChange={(e) => setNewAsset({...newAsset, value: e.target.value})}
                      placeholder="1000000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="tokenSupply">Token Supply</Label>
                    <Input
                      id="tokenSupply"
                      type="number"
                      value={newAsset.tokenSupply}
                      onChange={(e) => setNewAsset({...newAsset, tokenSupply: e.target.value})}
                      placeholder="1000"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={newAsset.location}
                      onChange={(e) => setNewAsset({...newAsset, location: e.target.value})}
                      placeholder="New York, NY"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <textarea
                      id="description"
                      value={newAsset.description}
                      onChange={(e) => setNewAsset({...newAsset, description: e.target.value})}
                      placeholder="Describe the asset..."
                      className="w-full p-3 border rounded-md bg-white dark:bg-slate-800 min-h-[100px]"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="assetPrivacy"
                      checked={newAsset.privacy}
                      onChange={(e) => setNewAsset({...newAsset, privacy: e.target.checked})}
                      className="rounded"
                    />
                    <Label htmlFor="assetPrivacy" className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Enable Privacy Mode
                    </Label>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-4">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                    Required Documents
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm text-blue-800 dark:text-blue-200">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Ownership Certificate
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Valuation Report
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Legal Documentation
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Insurance Policy
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Upload Documents
                  </Button>
                  <Button className="bg-indigo-600 hover:bg-indigo-700">
                    Submit for Verification
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Market Overview</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total Market Cap</span>
                    <span className="font-medium">{formatCurrency(19300000, true)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>24h Volume</span>
                    <span className="font-medium">{formatCurrency(1250000, true)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Assets</span>
                    <span className="font-medium">24</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Investors</span>
                    <span className="font-medium flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      1,847
                    </span>
                  </div>
                  <div className="pt-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Market Growth</span>
                      <span className="text-green-600">+12.5%</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Asset Distribution</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-blue-600" />
                      <span>Real Estate</span>
                    </div>
                    <span className="font-medium">45%</span>
                  </div>
                  <Progress value={45} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-yellow-600" />
                      <span>Commodities</span>
                    </div>
                    <span className="font-medium">25%</span>
                  </div>
                  <Progress value={25} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span>Bonds</span>
                    </div>
                    <span className="font-medium">20%</span>
                  </div>
                  <Progress value={20} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-purple-600" />
                      <span>Art & Collectibles</span>
                    </div>
                    <span className="font-medium">10%</span>
                  </div>
                  <Progress value={10} className="h-2" />
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}