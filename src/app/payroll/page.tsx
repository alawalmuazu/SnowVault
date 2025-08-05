'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Eye, EyeOff, Shield, Users, DollarSign, Calendar, Clock, Download, Upload, Plus, Trash2 } from 'lucide-react';

interface Employee {
  id: string;
  name: string;
  address: string;
  salary: number;
  department: string;
  status: 'active' | 'inactive';
  lastPaid: string;
}

interface PayrollBatch {
  id: string;
  date: string;
  totalAmount: number;
  employeeCount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  privacy: boolean;
}

export default function PayrollPage() {
  const [privacyMode, setPrivacyMode] = useState(true);
  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: '1',
      name: 'Alice Johnson',
      address: '0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4',
      salary: 5000,
      department: 'Engineering',
      status: 'active',
      lastPaid: '2024-01-15'
    },
    {
      id: '2',
      name: 'Bob Smith',
      address: '0x8ba1f109551bD432803012645Hac136c0532925a',
      salary: 4500,
      department: 'Marketing',
      status: 'active',
      lastPaid: '2024-01-15'
    },
    {
      id: '3',
      name: 'Carol Davis',
      address: '0x9cd2f109551bD432803012645Hac136c0532925b',
      salary: 5500,
      department: 'Design',
      status: 'inactive',
      lastPaid: '2024-01-15'
    }
  ]);

  const [payrollBatches] = useState<PayrollBatch[]>([
    {
      id: 'batch-001',
      date: '2024-01-15',
      totalAmount: 15000,
      employeeCount: 3,
      status: 'completed',
      privacy: true
    },
    {
      id: 'batch-002',
      date: '2024-01-01',
      totalAmount: 15000,
      employeeCount: 3,
      status: 'completed',
      privacy: true
    },
    {
      id: 'batch-003',
      date: '2023-12-15',
      totalAmount: 14500,
      employeeCount: 3,
      status: 'completed',
      privacy: false
    }
  ]);

  const [newEmployee, setNewEmployee] = useState({
    name: '',
    address: '',
    salary: '',
    department: ''
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

  const addEmployee = () => {
    if (newEmployee.name && newEmployee.address && newEmployee.salary && newEmployee.department) {
      const employee: Employee = {
        id: Date.now().toString(),
        name: newEmployee.name,
        address: newEmployee.address,
        salary: parseFloat(newEmployee.salary),
        department: newEmployee.department,
        status: 'active',
        lastPaid: 'Never'
      };
      setEmployees([...employees, employee]);
      setNewEmployee({ name: '', address: '', salary: '', department: '' });
    }
  };

  const removeEmployee = (id: string) => {
    setEmployees(employees.filter(emp => emp.id !== id));
  };

  const totalMonthlyPayroll = employees
    .filter(emp => emp.status === 'active')
    .reduce((sum, emp) => sum + emp.salary, 0);

  const activeEmployees = employees.filter(emp => emp.status === 'active').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-600" />
              Confidential Payroll
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Privacy-preserving payroll management with EERC technology
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
          <Card className="p-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Total Monthly Payroll</p>
                <p className="text-2xl font-bold">
                  ${formatValue(totalMonthlyPayroll, true)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-200" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-r from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Active Employees</p>
                <p className="text-2xl font-bold">{activeEmployees}</p>
              </div>
              <Users className="h-8 w-8 text-green-200" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">Privacy Level</p>
                <p className="text-2xl font-bold">100%</p>
              </div>
              <Shield className="h-8 w-8 text-purple-200" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100">Next Payroll</p>
                <p className="text-2xl font-bold">5 days</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-200" />
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="employees" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="employees">Employee Management</TabsTrigger>
            <TabsTrigger value="payroll">Run Payroll</TabsTrigger>
            <TabsTrigger value="history">Payroll History</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Employee Management */}
          <TabsContent value="employees" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Add Employee */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Add New Employee
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={newEmployee.name}
                      onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
                      placeholder="Enter employee name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="address">Wallet Address</Label>
                    <Input
                      id="address"
                      value={newEmployee.address}
                      onChange={(e) => setNewEmployee({...newEmployee, address: e.target.value})}
                      placeholder="0x..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="salary">Monthly Salary (USD)</Label>
                    <Input
                      id="salary"
                      type="number"
                      value={newEmployee.salary}
                      onChange={(e) => setNewEmployee({...newEmployee, salary: e.target.value})}
                      placeholder="5000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      value={newEmployee.department}
                      onChange={(e) => setNewEmployee({...newEmployee, department: e.target.value})}
                      placeholder="Engineering"
                    />
                  </div>
                  <Button onClick={addEmployee} className="w-full">
                    Add Employee
                  </Button>
                </div>
              </Card>

              {/* Employee List */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Employee Directory</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {employees.map((employee) => (
                    <div key={employee.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{employee.name}</p>
                          <Badge variant={employee.status === 'active' ? 'default' : 'secondary'}>
                            {employee.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {formatAddress(employee.address)}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          ${formatValue(employee.salary, true)}/month • {employee.department}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeEmployee(employee.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Run Payroll */}
          <TabsContent value="payroll" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Process Payroll
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                      Payroll Summary
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Active Employees:</span>
                        <span>{activeEmployees}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Amount:</span>
                        <span>${formatValue(totalMonthlyPayroll, true)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Privacy Mode:</span>
                        <Badge variant="default" className="bg-green-600">
                          <Shield className="h-3 w-3 mr-1" />
                          Enabled
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <Label>Payment Token</Label>
                    <select className="w-full p-2 border rounded-md bg-white dark:bg-slate-800">
                      <option>USDC (Avalanche)</option>
                      <option>USDT (Avalanche)</option>
                      <option>AVAX</option>
                    </select>
                  </div>

                  <div className="space-y-3">
                    <Label>Payment Date</Label>
                    <Input type="date" defaultValue="2024-02-01" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">
                      Privacy Features
                    </h4>
                    <div className="space-y-2 text-sm text-yellow-800 dark:text-yellow-200">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Zero-knowledge salary proofs
                      </div>
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Encrypted payment amounts
                      </div>
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Anonymous batch processing
                      </div>
                    </div>
                  </div>

                  <Button className="w-full" size="lg">
                    <Clock className="h-4 w-4 mr-2" />
                    Process Confidential Payroll
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Payroll History */}
          <TabsContent value="history" className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Payroll History</h3>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
              <div className="space-y-3">
                {payrollBatches.map((batch) => (
                  <div key={batch.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <p className="font-medium">Batch {batch.id}</p>
                        <Badge 
                          variant={batch.status === 'completed' ? 'default' : 
                                 batch.status === 'processing' ? 'secondary' : 'destructive'}
                        >
                          {batch.status}
                        </Badge>
                        {batch.privacy && (
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            <Shield className="h-3 w-3 mr-1" />
                            Private
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400 mt-1">
                        <span>{batch.date}</span>
                        <span>{batch.employeeCount} employees</span>
                        <span>${formatValue(batch.totalAmount, batch.privacy)}</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      View Details
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Settings */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Privacy Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Default Privacy Mode</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Enable privacy by default for new payrolls
                      </p>
                    </div>
                    <input type="checkbox" defaultChecked className="toggle" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Encrypted Storage</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Store employee data with encryption
                      </p>
                    </div>
                    <input type="checkbox" defaultChecked className="toggle" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Anonymous Reporting</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Generate reports without revealing identities
                      </p>
                    </div>
                    <input type="checkbox" defaultChecked className="toggle" />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Automation Settings</h3>
                <div className="space-y-4">
                  <div>
                    <Label>Payroll Frequency</Label>
                    <select className="w-full p-2 border rounded-md bg-white dark:bg-slate-800 mt-1">
                      <option>Monthly</option>
                      <option>Bi-weekly</option>
                      <option>Weekly</option>
                    </select>
                  </div>
                  <div>
                    <Label>Auto-process Date</Label>
                    <Input type="number" placeholder="15" className="mt-1" />
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      Day of month to automatically process payroll
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Send encrypted notifications to employees
                      </p>
                    </div>
                    <input type="checkbox" defaultChecked className="toggle" />
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