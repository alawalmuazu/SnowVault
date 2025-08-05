"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import {
  BookOpen,
  Code,
  Shield,
  Zap,
  Users,
  DollarSign,
  Building,
  Vote,
  Search,
  Download,
  ExternalLink,
  ChevronRight,
  Lock,
  Eye,
  Key,
  Globe
} from "lucide-react";

export default function DocsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSection, setActiveSection] = useState("overview");

  const docSections = [
    {
      id: "overview",
      title: "Overview",
      icon: BookOpen,
      description: "Introduction to EERC Privacy Platform"
    },
    {
      id: "privacy",
      title: "Privacy Features",
      icon: Shield,
      description: "Zero-knowledge proofs and confidential transactions"
    },
    {
      id: "lending",
      title: "Lending Protocol",
      icon: DollarSign,
      description: "Confidential lending and borrowing"
    },
    {
      id: "payroll",
      title: "Payroll System",
      icon: Users,
      description: "Private payroll management"
    },
    {
      id: "dao",
      title: "DAO Governance",
      icon: Vote,
      description: "Confidential voting and proposals"
    },
    {
      id: "rwa",
      title: "RWA Tokenization",
      icon: Building,
      description: "Real-world asset tokenization"
    },
    {
      id: "api",
      title: "API Reference",
      icon: Code,
      description: "Developer documentation and SDKs"
    }
  ];

  const quickLinks = [
    { title: "Getting Started", href: "#getting-started", icon: Zap },
    { title: "Smart Contracts", href: "#contracts", icon: Code },
    { title: "Privacy Guide", href: "#privacy-guide", icon: Lock },
    { title: "API Documentation", href: "#api-docs", icon: Globe }
  ];

  const tutorials = [
    {
      title: "Setting up Your First Private Transaction",
      difficulty: "Beginner",
      duration: "10 min",
      description: "Learn how to create confidential transactions using ZK-proofs"
    },
    {
      title: "Creating a Private Lending Pool",
      difficulty: "Intermediate",
      duration: "25 min",
      description: "Deploy and manage confidential lending protocols"
    },
    {
      title: "Implementing DAO Governance",
      difficulty: "Advanced",
      duration: "45 min",
      description: "Build privacy-preserving governance systems"
    },
    {
      title: "Tokenizing Real-World Assets",
      difficulty: "Intermediate",
      duration: "30 min",
      description: "Create and manage tokenized RWAs with privacy"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            EERC Documentation
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
            Comprehensive guide to building privacy-first applications on the EERC platform
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Search documentation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-3 text-lg"
            />
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {quickLinks.map((link, index) => {
            const Icon = link.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Icon className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                    {link.title}
                  </h3>
                  <ChevronRight className="h-4 w-4 text-slate-400 mx-auto" />
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Documentation</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <nav className="space-y-1">
                  {docSections.map((section) => {
                    const Icon = section.icon;
                    return (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`w-full text-left px-4 py-3 flex items-center space-x-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
                          activeSection === section.id
                            ? "bg-blue-50 dark:bg-blue-900/20 border-r-2 border-blue-600"
                            : ""
                        }`}
                      >
                        <Icon className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                        <span className="text-sm font-medium text-slate-900 dark:text-white">
                          {section.title}
                        </span>
                      </button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs value={activeSection} onValueChange={setActiveSection}>
              {/* Overview */}
              <TabsContent value="overview">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BookOpen className="h-5 w-5" />
                      <span>Platform Overview</span>
                    </CardTitle>
                    <CardDescription>
                      Learn about the EERC Privacy Platform and its core features
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3">What is EERC?</h3>
                      <p className="text-slate-600 dark:text-slate-300 mb-4">
                        EERC (Enhanced Encrypted Regulatory Compliant) is a privacy-first blockchain platform
                        that enables confidential transactions while maintaining regulatory compliance through
                        zero-knowledge proofs and advanced cryptographic techniques.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-3">Key Features</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-start space-x-3">
                          <Shield className="h-5 w-5 text-green-600 mt-1" />
                          <div>
                            <h4 className="font-medium">Privacy by Design</h4>
                            <p className="text-sm text-slate-600 dark:text-slate-300">
                              Zero-knowledge proofs ensure transaction privacy
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <Eye className="h-5 w-5 text-blue-600 mt-1" />
                          <div>
                            <h4 className="font-medium">Selective Disclosure</h4>
                            <p className="text-sm text-slate-600 dark:text-slate-300">
                              Control what information is revealed
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <Key className="h-5 w-5 text-purple-600 mt-1" />
                          <div>
                            <h4 className="font-medium">Regulatory Compliance</h4>
                            <p className="text-sm text-slate-600 dark:text-slate-300">
                              Built-in compliance mechanisms
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <Zap className="h-5 w-5 text-yellow-600 mt-1" />
                          <div>
                            <h4 className="font-medium">High Performance</h4>
                            <p className="text-sm text-slate-600 dark:text-slate-300">
                              Optimized for speed and scalability
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-3">Getting Started</h3>
                      <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                        <pre className="text-sm text-slate-800 dark:text-slate-200">
                          <code>
{`# Install EERC SDK
npm install @eerc/sdk

# Initialize your project
npx eerc init my-privacy-app

# Start building with privacy`}
                          </code>
                        </pre>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Privacy Features */}
              <TabsContent value="privacy">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Shield className="h-5 w-5" />
                      <span>Privacy Features</span>
                    </CardTitle>
                    <CardDescription>
                      Understanding zero-knowledge proofs and confidential transactions
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Zero-Knowledge Proofs</h3>
                      <p className="text-slate-600 dark:text-slate-300 mb-4">
                        EERC uses advanced ZK-SNARK technology to enable private transactions
                        while maintaining verifiability and regulatory compliance.
                      </p>
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                          How it works:
                        </h4>
                        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                          <li>• Transactions are encrypted using advanced cryptography</li>
                          <li>• ZK-proofs verify transaction validity without revealing details</li>
                          <li>• Selective disclosure allows controlled information sharing</li>
                          <li>• Regulatory compliance through auditable privacy</li>
                        </ul>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-3">Privacy Modes</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                          <CardContent className="p-4">
                            <h4 className="font-medium mb-2">Full Privacy</h4>
                            <p className="text-sm text-slate-600 dark:text-slate-300">
                              Complete transaction confidentiality with ZK-proofs
                            </p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4">
                            <h4 className="font-medium mb-2">Selective Disclosure</h4>
                            <p className="text-sm text-slate-600 dark:text-slate-300">
                              Choose what information to reveal to specific parties
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Other sections would follow similar patterns */}
              <TabsContent value="lending">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <DollarSign className="h-5 w-5" />
                      <span>Lending Protocol</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 dark:text-slate-300">
                      Documentation for confidential lending and borrowing protocols...
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="payroll">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Users className="h-5 w-5" />
                      <span>Payroll System</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 dark:text-slate-300">
                      Guide to implementing private payroll management systems...
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="dao">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Vote className="h-5 w-5" />
                      <span>DAO Governance</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 dark:text-slate-300">
                      Documentation for confidential voting and governance systems...
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="rwa">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Building className="h-5 w-5" />
                      <span>RWA Tokenization</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 dark:text-slate-300">
                      Guide to tokenizing real-world assets with privacy features...
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="api">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Code className="h-5 w-5" />
                      <span>API Reference</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 dark:text-slate-300">
                      Complete API documentation and SDK references...
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Tutorials Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
            Tutorials & Guides
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tutorials.map((tutorial, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{tutorial.title}</CardTitle>
                    <Badge variant={tutorial.difficulty === "Beginner" ? "default" : tutorial.difficulty === "Intermediate" ? "secondary" : "destructive"}>
                      {tutorial.difficulty}
                    </Badge>
                  </div>
                  <CardDescription>{tutorial.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-300">
                      {tutorial.duration}
                    </span>
                    <Button variant="outline" size="sm">
                      Start Tutorial
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Resources */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
            Additional Resources
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <Download className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">SDK Downloads</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                  Get the latest EERC SDKs and tools
                </p>
                <Button variant="outline" size="sm">
                  Download
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <ExternalLink className="h-8 w-8 text-green-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">GitHub Repository</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                  Explore the open-source codebase
                </p>
                <Button variant="outline" size="sm">
                  View on GitHub
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Users className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Community</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                  Join our developer community
                </p>
                <Button variant="outline" size="sm">
                  Join Discord
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}