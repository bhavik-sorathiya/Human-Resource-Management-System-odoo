import { useState } from 'react';
import { format } from 'date-fns';
import { Plus, Search, Calendar as CalendarIcon, Plane, Heart, ChevronLeft, ChevronRight, X, Check, Upload, Send, CirclePlus, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';

const tabs = [
  { id: 'timeoff', label: 'Time Off', icon: CalendarIcon },
  { id: 'allocation', label: 'Allocation', icon: CirclePlus },
];

// Employee's own time off history
const employeeTimeOff = [
  { name: 'Alex Morgan', avatar: '', startDate: '28/10/2025', endDate: '28/10/2025', type: 'Paid time Off', status: 'Pending' },
  { name: 'Alex Morgan', avatar: '', startDate: '15/09/2025', endDate: '16/09/2025', type: 'Sick time Off', status: 'Approved' },
  { name: 'Alex Morgan', avatar: '', startDate: '01/08/2025', endDate: '05/08/2025', type: 'Paid time Off', status: 'Rejected' },
];

// Admin view of all time off requests
const adminTimeOff = [
  { name: 'John Doe', avatar: '', startDate: '28/10/2025', endDate: '28/10/2025', type: 'Paid time Off', status: 'Pending', actionable: true },
  { name: 'Alice Smith', avatar: '', startDate: '01/11/2025', endDate: '03/11/2025', type: 'Sick time off', status: 'Pending', actionable: true },
  { name: 'Michael Brown', avatar: '', startDate: '15/10/2025', endDate: '20/10/2025', type: 'Paid time Off', status: 'Approved', actionable: false },
  { name: 'Emma Wilson', avatar: '', startDate: '10/12/2025', endDate: '10/12/2025', type: 'Unpaid Leave', status: 'Rejected', actionable: false },
];

// Allocation data
const allocationData = [
  { name: 'Alex Morgan', role: 'Software Engineer', paidLeave: 24, sickLeave: 7, usedPaid: 5, usedSick: 2 },
  { name: 'Sarah Connor', role: 'Product Manager', paidLeave: 24, sickLeave: 7, usedPaid: 10, usedSick: 1 },
  { name: 'John Doe', role: 'Backend Dev', paidLeave: 20, sickLeave: 7, usedPaid: 3, usedSick: 0 },
  { name: 'Emily Chen', role: 'HR Specialist', paidLeave: 24, sickLeave: 7, usedPaid: 8, usedSick: 3 },
  { name: 'James Wilson', role: 'UX Designer', paidLeave: 24, sickLeave: 7, usedPaid: 15, usedSick: 5 },
];

export default function TimeOff() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [activeTab, setActiveTab] = useState('timeoff');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Header for Admin */}
      {isAdmin && (
        <div>
          <h1 className="text-2xl font-bold">Time Off Management</h1>
          <p className="text-muted-foreground">Review and manage employee leave requests.</p>
        </div>
      )}

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
      {activeTab === 'timeoff' ? (
        <TimeOffContent 
          isAdmin={isAdmin} 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery}
          onNewRequest={() => setShowRequestModal(true)}
        />
      ) : (
        <AllocationContent isAdmin={isAdmin} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      )}

      {/* Request Modal */}
      <TimeOffRequestModal open={showRequestModal} onOpenChange={setShowRequestModal} />
    </div>
  );
}

function TimeOffContent({ isAdmin, searchQuery, setSearchQuery, onNewRequest }) {
  return (
    <>
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button onClick={onNewRequest}>
            <Plus className="h-4 w-4 mr-2" />
            NEW REQUEST
          </Button>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={isAdmin ? 'Search employee...' : 'Search records...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Balance Cards */}
        <div className="flex gap-4">
          <Card className="p-4 min-w-[140px]">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Plane className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase">Paid Time Off</p>
                <p className="text-2xl font-bold">24 Days</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">Available</p>
          </Card>

          <Card className="p-4 min-w-[140px]">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <Heart className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase">Sick Time Off</p>
                <p className="text-2xl font-bold">07 Days</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">Available</p>
          </Card>
        </div>
      </div>

      {/* Time Off Table */}
      <Card>
        {!isAdmin && (
          <CardHeader>
            <CardTitle>My Time Off History</CardTitle>
            <p className="text-muted-foreground">Recent leave requests and their current status.</p>
          </CardHeader>
        )}
        <CardContent className={isAdmin ? 'pt-6' : ''}>
          <table className="w-full">
            <thead>
              <tr className="text-xs text-muted-foreground uppercase tracking-wider border-b">
                <th className="text-left py-3">Name</th>
                <th className="text-left py-3">Start Date</th>
                <th className="text-left py-3">End Date</th>
                <th className="text-left py-3">Time Off Type</th>
                <th className="text-left py-3">Status</th>
                {isAdmin && <th className="text-left py-3">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {(isAdmin ? adminTimeOff : employeeTimeOff).map((record, idx) => (
                <tr key={idx} className="border-b last:border-0">
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={record.avatar} />
                        <AvatarFallback className={cn(
                          'text-sm',
                          idx % 4 === 0 && 'bg-primary/10 text-primary',
                          idx % 4 === 1 && 'bg-success/10 text-success',
                          idx % 4 === 2 && 'bg-warning/10 text-warning',
                          idx % 4 === 3 && 'bg-info/10 text-info'
                        )}>
                          {record.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{record.name}</span>
                    </div>
                  </td>
                  <td className="py-4 text-muted-foreground">{record.startDate}</td>
                  <td className="py-4 text-muted-foreground">{record.endDate}</td>
                  <td className="py-4">
                    <Badge 
                      variant="outline" 
                      className={cn(
                        'rounded-full',
                        record.type.toLowerCase().includes('paid') && 'border-primary text-primary',
                        record.type.toLowerCase().includes('sick') && 'border-destructive text-destructive',
                        record.type.toLowerCase().includes('unpaid') && 'border-muted-foreground text-muted-foreground'
                      )}
                    >
                      {record.type}
                    </Badge>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        'h-2 w-2 rounded-full',
                        record.status === 'Pending' && 'bg-warning',
                        record.status === 'Approved' && 'bg-success',
                        record.status === 'Rejected' && 'bg-destructive'
                      )} />
                      <span className={cn(
                        record.status === 'Pending' && 'text-warning',
                        record.status === 'Approved' && 'text-success',
                        record.status === 'Rejected' && 'text-destructive'
                      )}>
                        {record.status}
                      </span>
                    </div>
                  </td>
                  {isAdmin && (
                    <td className="py-4">
                      {record.actionable ? (
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10">
                            <X className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-success hover:text-success hover:bg-success/10">
                            <Check className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground italic">Action taken</span>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Showing 1 to {isAdmin ? '4 of 12' : '3 of 3'} results
            </p>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" className="h-8 w-8">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="default" size="sm" className="h-8 w-8">1</Button>
              {isAdmin && (
                <>
                  <Button variant="outline" size="sm" className="h-8 w-8">2</Button>
                  <Button variant="outline" size="sm" className="h-8 w-8">3</Button>
                </>
              )}
              <Button variant="outline" size="icon" className="h-8 w-8">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

function AllocationContent({ isAdmin, searchQuery, setSearchQuery }) {
  return (
    <>
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {isAdmin && (
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              ADD ALLOCATION
            </Button>
          )}
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search employees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Summary Cards */}
        <div className="flex gap-4">
          <Card className="p-4 min-w-[120px]">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Total Employees</p>
                <p className="text-xl font-bold">42</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 min-w-[120px]">
            <div className="flex items-center gap-3">
              <Plane className="h-5 w-5 text-success" />
              <div>
                <p className="text-xs text-muted-foreground">Total PTO Days</p>
                <p className="text-xl font-bold">1,008</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Allocation Table */}
      <Card>
        <CardHeader>
          <CardTitle>Leave Allocation</CardTitle>
          <p className="text-muted-foreground">Manage employee leave balances and allocations.</p>
        </CardHeader>
        <CardContent>
          <table className="w-full">
            <thead>
              <tr className="text-xs text-muted-foreground uppercase tracking-wider border-b">
                <th className="text-left py-3">Employee</th>
                <th className="text-left py-3">Paid Leave</th>
                <th className="text-left py-3">Used (Paid)</th>
                <th className="text-left py-3">Sick Leave</th>
                <th className="text-left py-3">Used (Sick)</th>
                <th className="text-left py-3">Balance</th>
                {isAdmin && <th className="text-left py-3">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {allocationData.map((employee, idx) => {
                const paidBalance = employee.paidLeave - employee.usedPaid;
                const sickBalance = employee.sickLeave - employee.usedSick;
                return (
                  <tr key={idx} className="border-b last:border-0">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className={cn(
                            'text-sm',
                            idx % 3 === 0 && 'bg-primary/10 text-primary',
                            idx % 3 === 1 && 'bg-success/10 text-success',
                            idx % 3 === 2 && 'bg-info/10 text-info'
                          )}>
                            {employee.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{employee.name}</p>
                          <p className="text-sm text-muted-foreground">{employee.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <Badge variant="outline" className="border-primary text-primary">
                        {employee.paidLeave} days
                      </Badge>
                    </td>
                    <td className="py-4 text-muted-foreground">{employee.usedPaid} days</td>
                    <td className="py-4">
                      <Badge variant="outline" className="border-destructive text-destructive">
                        {employee.sickLeave} days
                      </Badge>
                    </td>
                    <td className="py-4 text-muted-foreground">{employee.usedSick} days</td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          'font-semibold',
                          paidBalance + sickBalance > 15 ? 'text-success' : 
                          paidBalance + sickBalance > 5 ? 'text-warning' : 'text-destructive'
                        )}>
                          {paidBalance + sickBalance} days
                        </span>
                      </div>
                    </td>
                    {isAdmin && (
                      <td className="py-4">
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <p className="text-sm text-muted-foreground">Showing 1 to 5 of 42 employees</p>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" className="h-8 w-8">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="default" size="sm" className="h-8 w-8">1</Button>
              <Button variant="outline" size="sm" className="h-8 w-8">2</Button>
              <Button variant="outline" size="sm" className="h-8 w-8">3</Button>
              <Button variant="outline" size="icon" className="h-8 w-8">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info Note */}
      <div className="bg-info/10 border-l-4 border-info p-4 rounded-r-lg">
        <p className="font-semibold text-info">Allocation Policy</p>
        <p className="text-foreground">
          Leave allocations reset at the beginning of each fiscal year. Unused leave may be carried forward 
          up to a maximum of 5 days, subject to manager approval.
        </p>
      </div>
    </>
  );
}

function TimeOffRequestModal({ open, onOpenChange }) {
  const { user } = useAuth();
  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            Time Off Request
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Employee */}
          <div className="flex items-center gap-4">
            <Label className="w-24 text-muted-foreground">Employee</Label>
            <div className="flex-1 flex items-center gap-3 bg-muted rounded-lg p-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-warning/20 text-warning text-sm">
                  {user?.name?.split(' ').map(n => n[0]).join('') || 'JD'}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium">{user?.name || 'John Doe'}</span>
            </div>
          </div>

          {/* Time off Type */}
          <div className="flex items-center gap-4">
            <Label className="w-24 text-muted-foreground">Time off Type</Label>
            <Select defaultValue="paid">
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paid">Paid Time Off</SelectItem>
                <SelectItem value="sick">Sick Time Off</SelectItem>
                <SelectItem value="unpaid">Unpaid Leave</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Validity Period with Calendar Pickers */}
          <div className="flex items-center gap-4">
            <Label className="w-24 text-muted-foreground">Validity Period</Label>
            <div className="flex-1 flex items-center gap-2">
              {/* Start Date */}
              <div className="flex-1">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "dd/MM/yyyy") : "Start Date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <p className="text-xs text-muted-foreground mt-1">Start Date</p>
              </div>

              {/* End Date */}
              <div className="flex-1">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "dd/MM/yyyy") : "End Date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      disabled={(date) => startDate ? date < startDate : false}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <p className="text-xs text-muted-foreground mt-1">End Date</p>
              </div>
            </div>
          </div>

          {/* Allocation */}
          <div className="flex items-center gap-4">
            <Label className="w-24 text-muted-foreground">Allocation</Label>
            <div className="flex items-center gap-2">
              <Input type="number" defaultValue="1.00" className="w-20" step="0.5" />
              <span className="text-muted-foreground">Days</span>
            </div>
          </div>

          {/* Attachment */}
          <div className="flex items-start gap-4">
            <Label className="w-24 text-muted-foreground pt-2">Attachment</Label>
            <div className="flex-1">
              <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                <Upload className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm">
                  <span className="text-primary font-medium">Click to upload</span>
                  {' '}or drag and drop
                </p>
              </div>
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                <span className="text-info">ℹ</span>
                Required for sick leave exceeding 2 days.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Discard
            </Button>
            <Button className="bg-primary">
              Submit Request
              <Send className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>

        {/* Policy Note */}
        <div className="bg-warning/10 border-l-4 border-warning p-4 rounded-r-lg mt-4 -mx-6 -mb-6">
          <p className="font-semibold text-warning">Policy Note</p>
          <p className="text-sm text-foreground">
            Employees can view only their own time off records. Admins and HR Officers will review this request for approval.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
