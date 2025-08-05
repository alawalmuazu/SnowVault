'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Eye, EyeOff, Shield, Vote, Users, Clock, CheckCircle, XCircle, AlertCircle, Plus, MessageSquare, TrendingUp } from 'lucide-react';

interface Proposal {
  id: string;
  title: string;
  description: string;
  proposer: string;
  status: 'active' | 'passed' | 'rejected' | 'pending';
  votesFor: number;
  votesAgainst: number;
  totalVotes: number;
  endDate: string;
  category: 'governance' | 'treasury' | 'technical' | 'community';
  privacy: boolean;
}

interface Vote {
  proposalId: string;
  voter: string;
  choice: 'for' | 'against' | 'abstain';
  weight: number;
  timestamp: string;
  private: boolean;
}

export default function DAOPage() {
  const [privacyMode, setPrivacyMode] = useState(true);
  const [proposals] = useState<Proposal[]>([
    {
      id: 'prop-001',
      title: 'Increase Privacy Pool Rewards',
      description: 'Proposal to increase rewards for privacy pool participants by 25% to incentivize more confidential transactions.',
      proposer: '0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4',
      status: 'active',
      votesFor: 1250000,
      votesAgainst: 350000,
      totalVotes: 1600000,
      endDate: '2024-02-15',
      category: 'treasury',
      privacy: true
    },
    {
      id: 'prop-002',
      title: 'Implement Zero-Knowledge Voting',
      description: 'Upgrade the DAO voting mechanism to use zero-knowledge proofs for completely private governance.',
      proposer: '0x8ba1f109551bD432803012645Hac136c0532925a',
      status: 'active',
      votesFor: 890000,
      votesAgainst: 120000,
      totalVotes: 1010000,
      endDate: '2024-02-20',
      category: 'technical',
      privacy: true
    },
    {
      id: 'prop-003',
      title: 'Community Grant Program',
      description: 'Establish a 500,000 EERC grant program for privacy-focused DeFi projects building on our platform.',
      proposer: '0x9cd2f109551bD432803012645Hac136c0532925b',
      status: 'passed',
      votesFor: 2100000,
      votesAgainst: 400000,
      totalVotes: 2500000,
      endDate: '2024-01-30',
      category: 'community',
      privacy: false
    }
  ]);

  const [userVotes] = useState<Vote[]>([
    {
      proposalId: 'prop-001',
      voter: '0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4',
      choice: 'for',
      weight: 50000,
      timestamp: '2024-02-01T10:30:00Z',
      private: true
    },
    {
      proposalId: 'prop-003',
      voter: '0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4',
      choice: 'for',
      weight: 50000,
      timestamp: '2024-01-25T14:20:00Z',
      private: false
    }
  ]);

  const [newProposal, setNewProposal] = useState({
    title: '',
    description: '',
    category: 'governance',
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

  const formatAddress = (address: string) => {
    if (privacyMode) {
      return `${address.slice(0, 6)}...${address.slice(-4)}`;
    }
    return address;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Clock className="h-4 w-4" />;
      case 'passed':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-blue-600';
      case 'passed':
        return 'bg-green-600';
      case 'rejected':
        return 'bg-red-600';
      default:
        return 'bg-gray-600';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'governance':
        return 'bg-purple-100 text-purple-800';
      case 'treasury':
        return 'bg-green-100 text-green-800';
      case 'technical':
        return 'bg-blue-100 text-blue-800';
      case 'community':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalVotingPower = 5000000;
  const userVotingPower = 50000;
  const activeProposals = proposals.filter(p => p.status === 'active').length;
  const participationRate = 68.5;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <Vote className="h-8 w-8 text-purple-600" />
              Confidential DAO
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Privacy-preserving decentralized governance with zero-knowledge voting
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
          <Card className="p-6 bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">Total Voting Power</p>
                <p className="text-2xl font-bold">
                  {formatValue(totalVotingPower, true)}
                </p>
              </div>
              <Vote className="h-8 w-8 text-purple-200" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Your Voting Power</p>
                <p className="text-2xl font-bold">
                  {formatValue(userVotingPower, true)}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-200" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-r from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Active Proposals</p>
                <p className="text-2xl font-bold">{activeProposals}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-green-200" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100">Participation Rate</p>
                <p className="text-2xl font-bold">{participationRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-200" />
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="proposals" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="proposals">Active Proposals</TabsTrigger>
            <TabsTrigger value="create">Create Proposal</TabsTrigger>
            <TabsTrigger value="history">Voting History</TabsTrigger>
            <TabsTrigger value="governance">Governance</TabsTrigger>
          </TabsList>

          {/* Active Proposals */}
          <TabsContent value="proposals" className="space-y-6">
            <div className="space-y-4">
              {proposals.map((proposal) => (
                <Card key={proposal.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{proposal.title}</h3>
                        <Badge className={getStatusColor(proposal.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(proposal.status)}
                            {proposal.status}
                          </div>
                        </Badge>
                        <Badge variant="outline" className={getCategoryColor(proposal.category)}>
                          {proposal.category}
                        </Badge>
                        {proposal.privacy && (
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            <Shield className="h-3 w-3 mr-1" />
                            Private
                          </Badge>
                        )}
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 mb-3">
                        {proposal.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span>Proposed by {formatAddress(proposal.proposer)}</span>
                        <span>Ends {proposal.endDate}</span>
                        <span>{formatValue(proposal.totalVotes, proposal.privacy)} votes</span>
                      </div>
                    </div>
                  </div>

                  {proposal.status === 'active' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>For ({formatValue(proposal.votesFor, proposal.privacy)})</span>
                            <span>{((proposal.votesFor / proposal.totalVotes) * 100).toFixed(1)}%</span>
                          </div>
                          <Progress value={(proposal.votesFor / proposal.totalVotes) * 100} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Against ({formatValue(proposal.votesAgainst, proposal.privacy)})</span>
                            <span>{((proposal.votesAgainst / proposal.totalVotes) * 100).toFixed(1)}%</span>
                          </div>
                          <Progress value={(proposal.votesAgainst / proposal.totalVotes) * 100} className="h-2 bg-red-200" />
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <Button className="bg-green-600 hover:bg-green-700">
                          Vote For
                        </Button>
                        <Button variant="outline" className="border-red-600 text-red-600 hover:bg-red-50">
                          Vote Against
                        </Button>
                        <Button variant="outline">
                          Abstain
                        </Button>
                      </div>
                    </div>
                  )}

                  {proposal.status !== 'active' && (
                    <div className="mt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>For ({formatValue(proposal.votesFor, proposal.privacy)})</span>
                            <span>{((proposal.votesFor / proposal.totalVotes) * 100).toFixed(1)}%</span>
                          </div>
                          <Progress value={(proposal.votesFor / proposal.totalVotes) * 100} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Against ({formatValue(proposal.votesAgainst, proposal.privacy)})</span>
                            <span>{((proposal.votesAgainst / proposal.totalVotes) * 100).toFixed(1)}%</span>
                          </div>
                          <Progress value={(proposal.votesAgainst / proposal.totalVotes) * 100} className="h-2 bg-red-200" />
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Create Proposal */}
          <TabsContent value="create" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Create New Proposal
              </h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Proposal Title</Label>
                  <Input
                    id="title"
                    value={newProposal.title}
                    onChange={(e) => setNewProposal({...newProposal, title: e.target.value})}
                    placeholder="Enter proposal title"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    value={newProposal.description}
                    onChange={(e) => setNewProposal({...newProposal, description: e.target.value})}
                    placeholder="Describe your proposal in detail..."
                    className="w-full p-3 border rounded-md bg-white dark:bg-slate-800 min-h-[120px]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <select 
                      id="category"
                      value={newProposal.category}
                      onChange={(e) => setNewProposal({...newProposal, category: e.target.value})}
                      className="w-full p-2 border rounded-md bg-white dark:bg-slate-800"
                    >
                      <option value="governance">Governance</option>
                      <option value="treasury">Treasury</option>
                      <option value="technical">Technical</option>
                      <option value="community">Community</option>
                    </select>
                  </div>
                  <div className="flex items-center space-x-2 pt-6">
                    <input
                      type="checkbox"
                      id="privacy"
                      checked={newProposal.privacy}
                      onChange={(e) => setNewProposal({...newProposal, privacy: e.target.checked})}
                      className="rounded"
                    />
                    <Label htmlFor="privacy" className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Enable Privacy Mode
                    </Label>
                  </div>
                </div>
                
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                    Proposal Requirements
                  </h4>
                  <div className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Minimum 10,000 EERC voting power required
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      7-day voting period
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Quorum: 20% of total voting power
                    </div>
                  </div>
                </div>

                <Button className="w-full" size="lg">
                  Submit Proposal
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* Voting History */}
          <TabsContent value="history" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Your Voting History</h3>
              <div className="space-y-3">
                {userVotes.map((vote, index) => {
                  const proposal = proposals.find(p => p.id === vote.proposalId);
                  return (
                    <div key={index} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <p className="font-medium">{proposal?.title}</p>
                          <Badge 
                            variant={vote.choice === 'for' ? 'default' : 
                                   vote.choice === 'against' ? 'destructive' : 'secondary'}
                          >
                            {vote.choice}
                          </Badge>
                          {vote.private && (
                            <Badge variant="outline" className="bg-green-50 text-green-700">
                              <Shield className="h-3 w-3 mr-1" />
                              Private
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400 mt-1">
                          <span>Weight: {formatValue(vote.weight, vote.private)}</span>
                          <span>{new Date(vote.timestamp).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </TabsContent>

          {/* Governance */}
          <TabsContent value="governance" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Governance Parameters</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Proposal Threshold</span>
                    <span className="font-medium">10,000 EERC</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Voting Period</span>
                    <span className="font-medium">7 days</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Quorum</span>
                    <span className="font-medium">20%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Execution Delay</span>
                    <span className="font-medium">2 days</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Privacy Mode</span>
                    <Badge variant="default" className="bg-green-600">
                      <Shield className="h-3 w-3 mr-1" />
                      Enabled
                    </Badge>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Treasury Overview</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total Treasury</span>
                    <span className="font-medium">{formatValue(2500000, true)} EERC</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Available for Grants</span>
                    <span className="font-medium">{formatValue(500000, true)} EERC</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Staked Rewards</span>
                    <span className="font-medium">{formatValue(1000000, true)} EERC</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Development Fund</span>
                    <span className="font-medium">{formatValue(1000000, true)} EERC</span>
                  </div>
                  <div className="pt-2">
                    <Progress value={75} className="h-2" />
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      75% allocated
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}