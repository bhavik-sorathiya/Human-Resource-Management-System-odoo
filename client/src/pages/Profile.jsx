import { useState } from 'react';
import { FileText, Lock, DollarSign, Shield, Pencil, Plus, CheckCircle } from 'lucide-react';
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

const skills = ['JavaScript', 'React.js', 'Node.js', 'Python', 'AWS', 'UI/UX Design', 'Agile'];

const certifications = [
  { name: 'AWS Certified Solutions Architect', date: 'Jan 2023' },
  { name: 'Certified Scrum Master (CSM)', date: 'Aug 2022' },
  { name: 'Google Data Analytics Certificate', date: 'Mar 2021' },
];

const loginActivity = [
  { device: 'Chrome on MacOS', ip: '192.168.1.1', location: 'San Francisco, CA', time: 'Just now', status: 'Current' },
  { device: 'Safari on iPhone 13', ip: '10.0.0.42', location: 'San Francisco, CA', time: 'Yesterday', status: 'Signed out' },
  { device: 'Edge on Windows 10', ip: '172.16.0.23', location: 'San Jose, CA', time: '3 days ago', status: 'Signed out' },
];

export default function Profile() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('resume');

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || 'U';

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold">My Profile</h1>

      {/* Profile Header Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar */}
            <div className="relative">
              <Avatar className="h-32 w-32">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback className="bg-gradient-to-br from-orange-200 to-orange-100 text-2xl">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <button className="absolute bottom-2 right-2 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors">
                <Pencil className="h-4 w-4" />
              </button>
            </div>

            {/* Info Grid */}
            <div className="flex-1 grid md:grid-cols-2 gap-x-12 gap-y-4">
              <div>
                <h2 className="text-2xl font-bold">{user?.name}</h2>
                <p className="text-muted-foreground">{user?.position}</p>
                
                <div className="mt-4 space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Login ID</p>
                    <p className="font-medium">{user?.loginId || 'alex.morgan01'}</p>
                  </div>
                  <div className="border-t pt-3">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Email</p>
                    <p className="font-medium">{user?.email}</p>
                  </div>
                  <div className="border-t pt-3">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Mobile</p>
                    <p className="font-medium">{user?.phone || '+1 (555) 123-4567'}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Company</p>
                  <p className="font-medium">{user?.company || 'TechFlow Solutions'}</p>
                </div>
                <div className="border-t pt-3">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Department</p>
                  <p className="font-medium">{user?.department || 'Engineering'}</p>
                </div>
                <div className="border-t pt-3">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Manager</p>
                  <p className="font-medium">{user?.manager || 'Sarah Connor'}</p>
                </div>
                <div className="border-t pt-3">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Location</p>
                  <p className="font-medium">{user?.location || 'San Francisco, CA'}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {tabs.map((tab) => {
          const Icon = tab.icon;
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
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="animate-fade-in">
        {activeTab === 'resume' && <ResumeTab />}
        {activeTab === 'private' && <PrivateInfoTab />}
        {activeTab === 'salary' && <SalaryTab />}
        {activeTab === 'security' && <SecurityTab />}
      </div>
    </div>
  );
}

function ResumeTab() {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-6">
        {/* About */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-lg">About</CardTitle>
            <Button variant="ghost" size="icon">
              <Pencil className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Experienced Software Engineer with a demonstrated history of working in the computer software industry. 
              Skilled in React, Node.js, Python, and Cloud Computing. Strong engineering professional with a Bachelor's 
              degree focused in Computer Science from State University. I am passionate about building scalable web 
              applications and solving complex problems through code.
            </p>
          </CardContent>
        </Card>

        {/* What I love about my job */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-lg">What I love about my job</CardTitle>
            <Button variant="ghost" size="icon">
              <Pencil className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              I love the collaborative environment and the opportunity to work on cutting-edge technologies. The team 
              culture is incredibly supportive, fostering both personal and professional growth. I appreciate the 
              autonomy I'm given to explore new solutions and the impact my work has on the final product. Every day 
              brings a new challenge which keeps the work exciting and engaging.
            </p>
          </CardContent>
        </Card>

        {/* Interests and hobbies */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-lg">My interests and hobbies</CardTitle>
            <Button variant="ghost" size="icon">
              <Pencil className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Outside of work, I am an avid hiker and love exploring national parks. I enjoy photography, particularly 
              landscape and street photography. I also volunteer at a local animal shelter on weekends. Recently, I've 
              started learning to play the guitar and enjoy attending live music concerts.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        {/* Skills */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-lg">Skills</CardTitle>
            <Button variant="link" className="text-primary p-0 h-auto">
              <Plus className="h-4 w-4 mr-1" />
              add skills
            </Button>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <Badge key={skill} variant="secondary" className="rounded-full">
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Certification */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-lg">Certification</CardTitle>
            <Button variant="link" className="text-primary p-0 h-auto">
              <Plus className="h-4 w-4 mr-1" />
              add
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
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
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="bg-info/10 border-l-4 border-info p-4 rounded-r-lg">
        <p className="text-info">
          This information is confidential and visible only to you and authorized HR personnel. 
          To update any of these fields, please submit a change request.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Personal Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Personal Details
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Date of Birth</p>
              <p className="font-medium">August 15, 1990</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Gender</p>
              <p className="font-medium">Female</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Marital Status</p>
              <p className="font-medium">Single</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Nationality</p>
              <p className="font-medium">🇺🇸 United States</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Passport Number</p>
              <p className="font-medium">A12******9 👁</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">SSN / National ID</p>
              <p className="font-medium">***-**-6789 👁</p>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-warning" />
              Emergency Contact
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Primary Contact Name</p>
                <p className="font-medium">Michael Morgan</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Relationship</p>
                <p className="font-medium">Father</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Phone Number</p>
                <p className="font-medium">+1 (555) 987-6543</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Email</p>
                <p className="font-medium">michael.m@email.com</p>
              </div>
            </div>
            <div className="border-t pt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Secondary Contact Name</p>
                <p className="font-medium">Jane Morgan</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Relationship</p>
                <p className="font-medium">Sister</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Phone Number</p>
                <p className="font-medium">+1 (555) 234-5678</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Address Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-destructive" />
            Address Information
          </CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Street Address</p>
            <p className="font-medium">123 Innovation Drive, Apt 4B</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Type</p>
            <Badge className="bg-success/10 text-success hover:bg-success/20">Permanent Residence</Badge>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">City</p>
            <p className="font-medium">San Francisco</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">State / Province</p>
            <p className="font-medium">California</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Zip / Postal Code</p>
            <p className="font-medium">94105</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SalaryTab() {
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
            <DollarSign className="h-5 w-5 text-primary" />
            Salary Configuration
          </CardTitle>
          <Badge variant="outline" className="text-primary border-primary">
            View Only
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
                  <Input defaultValue="50000" className="rounded-l-none" disabled />
                  <span className="inline-flex items-center px-3 bg-muted border border-l-0 rounded-r-md text-muted-foreground">/mo</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Yearly Wage</Label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 bg-muted border border-r-0 rounded-l-md text-muted-foreground">$</span>
                  <Input defaultValue="600000" className="rounded-l-none" disabled />
                  <span className="inline-flex items-center px-3 bg-muted border border-l-0 rounded-r-md text-muted-foreground">/yr</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Work Days / Week</Label>
                <Input defaultValue="5" disabled />
              </div>
              <div className="space-y-2">
                <Label>Break Time (hrs)</Label>
                <Input defaultValue="1" disabled />
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
                        disabled
                      />
                      <span className="inline-flex items-center px-2 bg-muted border border-l-0 rounded-r-md text-muted-foreground text-sm">%</span>
                    </div>
                  </div>
                ))}
              </div>
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
                        <Input value="12.00" className="rounded-r-none w-14 text-sm" disabled />
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
                        <Input value="12.00" className="rounded-r-none w-14 text-sm" disabled />
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
                      <Input value="200.00" className="rounded-none w-24 text-sm" disabled />
                      <span className="inline-flex items-center px-2 bg-muted border border-l-0 rounded-r-md text-muted-foreground text-sm">/mo</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Fixed deduction from gross salary.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Info Note */}
          <div className="bg-info/10 border-l-4 border-info p-4 rounded-r-lg">
            <p className="text-info text-sm">
              For any salary-related changes or inquiries, please contact your HR representative.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SecurityTab() {
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-6">
        {/* Change Password */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Change Password
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Current Password</Label>
              <Input type="password" placeholder="••••••••" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>New Password</Label>
                <Input type="password" placeholder="••••••••" />
              </div>
              <div className="space-y-2">
                <Label>Confirm New Password</Label>
                <Input type="password" placeholder="••••••••" />
              </div>
            </div>

            <div className="bg-info/10 p-4 rounded-lg">
              <p className="text-sm font-medium text-info mb-2">Password must meet the following requirements:</p>
              <ul className="text-sm text-info space-y-1 list-disc list-inside">
                <li>Minimum 8 characters long</li>
                <li>At least one uppercase character</li>
                <li>At least one number or symbol</li>
              </ul>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline">Cancel</Button>
              <Button>Update Password</Button>
            </div>
          </CardContent>
        </Card>

        {/* Right Column */}
        <div className="space-y-6">
          {/* 2FA */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="h-12 w-12 rounded-lg bg-warning/10 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-warning" />
                </div>
                <Badge variant="secondary">Disabled</Badge>
              </div>
              <h3 className="font-semibold mb-2">Two-Factor Authentication</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Add an extra layer of security to your account by requiring more than just a password to log in.
              </p>
              <Button className="w-full bg-primary">Enable 2FA</Button>
            </CardContent>
          </Card>

          {/* Recovery Options */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recovery Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded bg-muted flex items-center justify-center">
                    📧
                  </div>
                  <div>
                    <p className="font-medium text-sm">Recovery Email</p>
                    <p className="text-xs text-muted-foreground">a***@gmail.com</p>
                  </div>
                </div>
                <Button variant="link" className="text-primary p-0 h-auto">Update</Button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded bg-muted flex items-center justify-center">
                    📱
                  </div>
                  <div>
                    <p className="font-medium text-sm">Recovery Phone</p>
                    <p className="text-xs text-muted-foreground">Not configured</p>
                  </div>
                </div>
                <Button variant="link" className="text-primary p-0 h-auto">Add</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Login Activity */}
        <Card className="md:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Login Activity
            </CardTitle>
            <Button variant="link" className="text-primary">Log out all other sessions</Button>
          </CardHeader>
          <CardContent>
            <table className="w-full">
              <thead>
                <tr className="text-xs text-muted-foreground uppercase tracking-wider">
                  <th className="text-left py-2">Device</th>
                  <th className="text-left py-2">Location</th>
                  <th className="text-left py-2">Time</th>
                  <th className="text-left py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {loginActivity.map((activity, idx) => (
                  <tr key={idx} className="border-t">
                    <td className="py-3">
                      <p className="font-medium">{activity.device}</p>
                      <p className="text-xs text-muted-foreground">{activity.ip}</p>
                    </td>
                    <td className="py-3 text-sm">{activity.location}</td>
                    <td className="py-3 text-sm text-muted-foreground">{activity.time}</td>
                    <td className="py-3">
                      {activity.status === 'Current' ? (
                        <Badge className="bg-success/10 text-success">Current</Badge>
                      ) : (
                        <span className="text-sm text-muted-foreground">Signed out</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Security Tip */}
        <Card className="bg-warning/10 border-warning/30">
          <CardContent className="p-6">
            <p className="text-sm">
              <span className="font-semibold text-warning">Security Tip:</span>{' '}
              <span className="text-foreground">
                Avoid using the same password across multiple sites. Use a password manager to generate unique, strong passwords.
              </span>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
