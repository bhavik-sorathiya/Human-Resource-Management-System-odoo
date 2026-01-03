import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FileText, Lock, DollarSign, Shield, Pencil, Plus, CheckCircle, Home, ChevronRight, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';

const tabs = [
  { id: 'resume', label: 'Resume', icon: FileText },
  { id: 'private', label: 'Private Info', icon: Lock },
  { id: 'salary', label: 'Salary Info', icon: DollarSign },
  { id: 'security', label: 'Security', icon: Shield },
];

// Mock employee data
const employeeData = {
  '1': { name: 'Alex Morgan', role: 'Software Engineer', loginId: 'alex.m', email: 'alex.morgan@company.com', department: 'Engineering', manager: 'Sarah Connor' },
  '2': { name: 'Sarah Connor', role: 'Product Manager', loginId: 'sarah.c', email: 'sarah.connor@company.com', department: 'Product', manager: 'Michael Scott' },
  '3': { name: 'James Wilson', role: 'UX Designer', loginId: 'james.w', email: 'james.wilson@company.com', department: 'Design', manager: 'Sarah Connor' },
  '4': { name: 'Emily Chen', role: 'HR Specialist', loginId: 'emily.c', email: 'emily.chen@company.com', department: 'Human Resources', manager: 'Michael Scott' },
  '5': { name: 'John Doe', role: 'Backend Dev', loginId: 'john.d', email: 'john.doe@company.com', department: 'Engineering', manager: 'Alex Morgan' },
};

const skills = ['JavaScript', 'React.js', 'Node.js', 'Python', 'AWS', 'UI/UX Design', 'Agile'];

const certifications = [
  { name: 'AWS Certified Solutions Architect', date: 'Jan 2023' },
  { name: 'Certified Scrum Master (CSM)', date: 'Aug 2022' },
];

export default function EmployeeProfile() {
  const { id } = useParams();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [activeTab, setActiveTab] = useState('resume');

  const employee = employeeData[id || '1'] || employeeData['1'];
  const initials = employee.name.split(' ').map((n) => n[0]).join('').toUpperCase();

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/employees" className="hover:text-foreground flex items-center gap-1">
          <Home className="h-4 w-4" />
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link to="/employees" className="hover:text-foreground">Employees</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">Profile</span>
      </nav>

      {/* Profile Header Card */}
      <Card className="bg-muted/30">
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarImage src="" />
                <AvatarFallback className="bg-success/20 text-success text-xl">
                  <FileText className="h-8 w-8" />
                </AvatarFallback>
              </Avatar>
              <button className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors">
                <Pencil className="h-3 w-3" />
              </button>
            </div>

            {/* Info */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{employee.name}</h2>
              <p className="text-muted-foreground">{employee.role}</p>
              
              <div className="mt-4 grid grid-cols-4 gap-8">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Login ID</p>
                  <p className="font-medium">{employee.loginId}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Email</p>
                  <p className="font-medium">{employee.email}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Department</p>
                  <p className="font-medium">{employee.department}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Manager</p>
                  <p className="font-medium">{employee.manager}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors',
                isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="animate-fade-in">
        {activeTab === 'resume' && <ResumeTab />}
        {activeTab === 'private' && <PrivateInfoTab />}
        {activeTab === 'salary' && <SalaryTab isAdmin={isAdmin} />}
        {activeTab === 'security' && <SecurityTab />}
      </div>
    </div>
  );
}

function ResumeTab() {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-6">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-lg">About</CardTitle>
            <Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Experienced professional with a demonstrated history of working in the technology industry. 
              Strong skills in software development, project management, and team leadership.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-lg">Skills</CardTitle>
            <Button variant="link" className="text-primary p-0 h-auto">
              <Plus className="h-4 w-4 mr-1" />add
            </Button>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <Badge key={skill} variant="secondary" className="rounded-full">{skill}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-lg">Certifications</CardTitle>
            <Button variant="link" className="text-primary p-0 h-auto">
              <Plus className="h-4 w-4 mr-1" />add
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {certifications.map((cert, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-success mt-0.5" />
                <div>
                  <p className="font-medium">{cert.name}</p>
                  <p className="text-sm text-muted-foreground">Issued: {cert.date}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function PrivateInfoTab() {
  return (
    <div className="bg-info/10 border-l-4 border-info p-4 rounded-r-lg">
      <p className="text-info">
        This information is confidential and visible only to authorized HR personnel.
      </p>
    </div>
  );
}

function SalaryTab({ isAdmin }) {
  const salaryComponents = [
    { name: 'Basic Salary', amount: 25000, percentage: 50 },
    { name: 'House Rent Allowance', amount: 12500, percentage: 50 },
    { name: 'Standard Allowance', amount: 4167, percentage: 16.67 },
    { name: 'Performance Bonus', amount: 2082.5, percentage: 8.33 },
    { name: 'Leave Travel Allw.', amount: 2082.5, percentage: 8.33 },
    { name: 'Fixed Allowance', amount: 2917, percentage: 11.67 },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5 text-primary" />
            Salary Configuration
          </CardTitle>
          <Badge variant="outline" className="text-primary border-primary">
            Admin Access Only
          </Badge>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Base Wage Parameters */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Base Wage Parameters
            </h4>
            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Month Wage</Label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 bg-muted border border-r-0 rounded-l-md text-muted-foreground">$</span>
                  <Input defaultValue="50000" className="rounded-l-none" disabled={!isAdmin} />
                  <span className="inline-flex items-center px-3 bg-muted border border-l-0 rounded-r-md text-muted-foreground">/mo</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Yearly Wage</Label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 bg-muted border border-r-0 rounded-l-md text-muted-foreground">$</span>
                  <Input defaultValue="600000" className="rounded-l-none" disabled={!isAdmin} />
                  <span className="inline-flex items-center px-3 bg-muted border border-l-0 rounded-r-md text-muted-foreground">/yr</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Work Days / Week</Label>
                <Input defaultValue="5" disabled={!isAdmin} />
              </div>
              <div className="space-y-2">
                <Label>Break Time (hrs)</Label>
                <Input defaultValue="1" disabled={!isAdmin} />
              </div>
            </div>
          </div>

          {/* Salary Components & Tax Deductions */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Salary Components */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Salary Components</h4>
                <span className="text-sm text-muted-foreground italic">Values auto-calculated</span>
              </div>
              <div className="space-y-3">
                {salaryComponents.map((comp) => (
                  <div key={comp.name} className="flex items-center gap-3">
                    <span className="w-40 text-sm">{comp.name}</span>
                    <div className="flex flex-1">
                      <span className="inline-flex items-center px-2 bg-muted border border-r-0 rounded-l-md text-muted-foreground text-sm">₹</span>
                      <Input 
                        value={comp.amount.toFixed(2)} 
                        className="rounded-none w-24 text-sm" 
                        disabled 
                      />
                      <span className="inline-flex items-center px-2 bg-muted border border-l-0 text-muted-foreground text-sm">/mo</span>
                    </div>
                    <div className="flex">
                      <Input 
                        value={comp.percentage.toFixed(2)} 
                        className="rounded-r-none w-16 text-sm" 
                        disabled={!isAdmin}
                      />
                      <span className="inline-flex items-center px-2 bg-muted border border-l-0 rounded-r-md text-muted-foreground text-sm">%</span>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" disabled={!isAdmin}>
                <Plus className="h-4 w-4 mr-2" />
                Add Custom Component
              </Button>
            </div>

            {/* Tax Deductions */}
            <div className="space-y-4">
              <h4 className="font-semibold">Tax Deductions</h4>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-2">Provident Fund (PF) Contribution</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="w-32 text-sm text-muted-foreground">Employee Share</span>
                      <div className="flex">
                        <span className="inline-flex items-center px-2 bg-muted border border-r-0 rounded-l-md text-muted-foreground text-sm">₹</span>
                        <Input value="3000.00" className="rounded-none w-20 text-sm" disabled />
                        <span className="inline-flex items-center px-2 bg-muted border border-l-0 text-muted-foreground text-sm">/mo</span>
                      </div>
                      <div className="flex">
                        <Input value="12.00" className="rounded-r-none w-14 text-sm" disabled={!isAdmin} />
                        <span className="inline-flex items-center px-2 bg-muted border border-l-0 rounded-r-md text-muted-foreground text-sm">%</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="w-32 text-sm text-muted-foreground">Employer Share</span>
                      <div className="flex">
                        <span className="inline-flex items-center px-2 bg-muted border border-r-0 rounded-l-md text-muted-foreground text-sm">₹</span>
                        <Input value="3000.00" className="rounded-none w-20 text-sm" disabled />
                        <span className="inline-flex items-center px-2 bg-muted border border-l-0 text-muted-foreground text-sm">/mo</span>
                      </div>
                      <div className="flex">
                        <Input value="12.00" className="rounded-r-none w-14 text-sm" disabled={!isAdmin} />
                        <span className="inline-flex items-center px-2 bg-muted border border-l-0 rounded-r-md text-muted-foreground text-sm">%</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">PF is calculated based on the basic salary.</p>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm font-medium mb-2">Professional Tax</p>
                  <div className="flex items-center gap-3">
                    <div className="flex">
                      <span className="inline-flex items-center px-2 bg-muted border border-r-0 rounded-l-md text-muted-foreground text-sm">₹</span>
                      <Input value="200.00" className="rounded-none w-24 text-sm" disabled={!isAdmin} />
                      <span className="inline-flex items-center px-2 bg-muted border border-l-0 rounded-r-md text-muted-foreground text-sm">/mo</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Fixed deduction from gross salary.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          {isAdmin && (
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline">Cancel</Button>
              <Button>Save Changes</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SecurityTab() {
  return (
    <div className="text-center py-12">
      <Shield className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
      <h3 className="font-semibold">Security Settings</h3>
      <p className="text-muted-foreground">Employee security settings are managed by HR administrators.</p>
    </div>
  );
}
