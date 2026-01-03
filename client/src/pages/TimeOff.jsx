import { useEffect, useState, useMemo, useCallback } from 'react';
import { format } from 'date-fns';
import { Plus, Search, Calendar as CalendarIcon, Plane, Heart, X, Check, Upload, Send, CirclePlus, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/lib/auth';
import { api, API_BASE } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const tabs = [
  { id: 'timeoff', label: 'Time Off', icon: CalendarIcon },
  { id: 'allocation', label: 'Allocation', icon: CirclePlus },
];

// Static allocation demo data
const allocationData = [
  { name: 'Alex Morgan', role: 'Software Engineer', paidLeave: 24, sickLeave: 7, usedPaid: 5, usedSick: 2 },
  { name: 'Sarah Connor', role: 'Product Manager', paidLeave: 24, sickLeave: 7, usedPaid: 10, usedSick: 1 },
  { name: 'John Doe', role: 'Backend Dev', paidLeave: 20, sickLeave: 7, usedPaid: 3, usedSick: 0 },
  { name: 'Emily Chen', role: 'HR Specialist', paidLeave: 24, sickLeave: 7, usedPaid: 8, usedSick: 3 },
  { name: 'James Wilson', role: 'UX Designer', paidLeave: 24, sickLeave: 7, usedPaid: 15, usedSick: 5 },
];

export default function TimeOff() {
  const { user, token } = useAuth();
  const isAdmin = user?.role?.toUpperCase() === 'ADMIN';
  const [activeTab, setActiveTab] = useState('timeoff');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();

  const loadLeaves = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const data = isAdmin ? await api.leavesAll(token) : await api.leavesMine(token);
      setLeaves(Array.isArray(data) ? data : []);
    } catch (err) {
      toast({ title: 'Failed to load leaves', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [token, isAdmin, toast]);

  useEffect(() => {
    loadLeaves();
  }, [loadLeaves]);

  const handleCreateRequest = async (payload) => {
    if (!token) return;
    try {
      setCreating(true);
      await api.leaveCreate(token, payload);
      toast({ title: 'Request submitted' });
      setShowRequestModal(false);
      loadLeaves();
    } catch (err) {
      toast({ title: 'Submit failed', description: err.message, variant: 'destructive' });
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      {isAdmin && (
        <div>
          <h1 className="text-2xl font-bold">Time Off Management</h1>
          <p className="text-muted-foreground">Review and manage employee leave requests.</p>
        </div>
      )}

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

      {activeTab === 'timeoff' ? (
        <TimeOffContent
          isAdmin={isAdmin}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onNewRequest={() => setShowRequestModal(true)}
          leaves={leaves}
          loading={loading}
          onApprove={async (id) => {
            try {
              await api.leaveApprove(token, id);
              toast({ title: 'Leave approved' });
              loadLeaves();
            } catch (err) {
              toast({ title: 'Approve failed', description: err.message, variant: 'destructive' });
            }
          }}
          onReject={async (id) => {
            try {
              await api.leaveReject(token, id);
              toast({ title: 'Leave rejected' });
              loadLeaves();
            } catch (err) {
              toast({ title: 'Reject failed', description: err.message, variant: 'destructive' });
            }
          }}
        />
      ) : (
        <AllocationContent isAdmin={isAdmin} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      )}

      <TimeOffRequestModal
        open={showRequestModal}
        onOpenChange={setShowRequestModal}
        onSubmit={handleCreateRequest}
        submitting={creating}
      />
    </div>
  );
}

function TimeOffContent({ isAdmin, searchQuery, setSearchQuery, onNewRequest, leaves, loading, onApprove, onReject }) {
  const attachmentBase = useMemo(() => API_BASE.replace(/\/$/, '').replace(/\/api$/, ''), []);
  const filtered = useMemo(() => {
    return leaves.filter((record) => {
      if (!searchQuery) return true;
      const target = `${record.user?.name || ''} ${record.type}`.toLowerCase();
      return target.includes(searchQuery.toLowerCase());
    });
  }, [leaves, searchQuery]);

  return (
    <>
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
                <th className="text-left py-3">Reason</th>
                <th className="text-left py-3">Attachment</th>
                <th className="text-left py-3">Status</th>
                {isAdmin && <th className="text-left py-3">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td className="py-6 text-muted-foreground" colSpan={isAdmin ? 8 : 7}>Loading...</td></tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr><td className="py-6 text-muted-foreground" colSpan={isAdmin ? 8 : 7}>No records found.</td></tr>
              )}
              {!loading && filtered.map((record, idx) => {
                const badgeVariant = record.type.toLowerCase().includes('sick')
                  ? 'destructive'
                  : record.type.toLowerCase().includes('unpaid')
                    ? 'outline'
                    : 'default';
                return (
                  <tr key={record.id || idx} className="border-b last:border-0">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={record.user?.avatar} />
                          <AvatarFallback className={cn(
                            'text-sm',
                            idx % 4 === 0 && 'bg-primary/10 text-primary',
                            idx % 4 === 1 && 'bg-success/10 text-success',
                            idx % 4 === 2 && 'bg-warning/10 text-warning',
                            idx % 4 === 3 && 'bg-info/10 text-info'
                          )}>
                            {(record.user?.name || 'N/A').split(' ').map((n) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{record.user?.name || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="py-4 text-muted-foreground">{record.startDate}</td>
                    <td className="py-4 text-muted-foreground">{record.endDate}</td>
                    <td className="py-4">
                      <Badge variant={badgeVariant} className="rounded-full">
                        {record.type}
                      </Badge>
                    </td>
                    <td className="py-4 text-muted-foreground max-w-xs">
                      <span className="line-clamp-2">{record.reason || '—'}</span>
                    </td>
                    <td className="py-4">
                      {record.attachmentUrl ? (
                        <a
                          className="text-primary text-sm hover:underline"
                          href={`${attachmentBase}${record.attachmentUrl}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          View
                        </a>
                      ) : (
                        <span className="text-sm text-muted-foreground">None</span>
                      )}
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          'h-2 w-2 rounded-full',
                          record.status === 'PENDING' && 'bg-warning',
                          record.status === 'APPROVED' && 'bg-success',
                          record.status === 'REJECTED' && 'bg-destructive'
                        )} />
                        <span className={cn(
                          record.status === 'PENDING' && 'text-warning',
                          record.status === 'APPROVED' && 'text-success',
                          record.status === 'REJECTED' && 'text-destructive'
                        )}>
                          {record.status}
                        </span>
                      </div>
                    </td>
                    {isAdmin && (
                      <td className="py-4">
                        {record.status === 'PENDING' ? (
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => onReject(record.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-success hover:text-success hover:bg-success/10"
                              onClick={() => onApprove(record.id)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground italic">Action taken</span>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </>
  );
}

function AllocationContent({ isAdmin, searchQuery, setSearchQuery }) {
  const filtered = useMemo(() => {
    return allocationData.filter((emp) => {
      if (!searchQuery) return true;
      return `${emp.name} ${emp.role}`.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [searchQuery]);

  return (
    <>
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
              {filtered.map((employee, idx) => {
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
                            {employee.name.split(' ').map((n) => n[0]).join('')}
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
                    <td className="py-4 text-muted-foreground">{employee.usedSick} days
                    </td>
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
                        <Button variant="ghost" size="sm">Adjust</Button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </>
  );
}

function TimeOffRequestModal({ open, onOpenChange, onSubmit, submitting }) {
  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();
  const [type, setType] = useState('paid');
  const [reason, setReason] = useState('');
  const [attachment, setAttachment] = useState(null);
  const fileInputId = 'timeoff-attachment';

  useEffect(() => {
    if (!open) {
      setStartDate(undefined);
      setEndDate(undefined);
      setType('paid');
      setReason('');
      setAttachment(null);
    }
  }, [open]);

  const typeLabels = {
    paid: 'Paid Time Off',
    sick: 'Sick Leave',
    unpaid: 'Unpaid Leave',
  };

  const canSubmit = startDate && endDate && type;

  const handleSubmit = async () => {
    if (!canSubmit || !onSubmit) return;
    const formData = new FormData();
    formData.append('startDate', format(startDate, 'yyyy-MM-dd'));
    formData.append('endDate', format(endDate, 'yyyy-MM-dd'));
    formData.append('type', typeLabels[type] || type);
    formData.append('reason', reason.trim());
    if (attachment) {
      formData.append('attachment', attachment);
    }
    await onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Request Time Off</DialogTitle>
          <p className="text-sm text-muted-foreground">Submit a leave request for manager/HR approval.</p>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Label className="w-24 text-muted-foreground">Time Off Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paid">Paid Time Off</SelectItem>
                <SelectItem value="sick">Sick Time Off</SelectItem>
                <SelectItem value="unpaid">Unpaid Leave</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-4">
            <Label className="w-24 text-muted-foreground">Validity Period</Label>
            <div className="flex-1 flex items-center gap-2">
              <div className="flex-1">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !startDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, 'dd/MM/yyyy') : 'Start Date'}
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

              <div className="flex-1">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !endDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, 'dd/MM/yyyy') : 'End Date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      disabled={(date) => (startDate ? date < startDate : false)}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <p className="text-xs text-muted-foreground mt-1">End Date</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Label className="w-24 text-muted-foreground">Allocation</Label>
            <div className="flex items-center gap-2">
              <Input type="number" defaultValue="1.00" className="w-20" step="0.5" />
              <span className="text-muted-foreground">Days</span>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <Label className="w-24 text-muted-foreground pt-2">Attachment</Label>
            <div className="flex-1 space-y-2">
              <input
                id={fileInputId}
                type="file"
                className="hidden"
                onChange={(e) => setAttachment(e.target.files?.[0] || null)}
              />
              <label
                htmlFor={fileInputId}
                className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer block"
              >
                <Upload className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm">
                  <span className="text-primary font-medium">{attachment ? 'Replace attachment' : 'Click to upload'}</span> or drag and drop
                </p>
                {attachment && (
                  <p className="text-xs text-muted-foreground mt-2">Selected: {attachment.name}</p>
                )}
              </label>
              {attachment && (
                <Button variant="ghost" size="sm" className="px-2" onClick={() => setAttachment(null)}>
                  Remove file
                </Button>
              )}
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                <span className="text-info">ℹ</span>
                Required for sick leave exceeding 2 days.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <Label className="w-24 text-muted-foreground pt-2">Reason</Label>
            <div className="flex-1">
              <textarea
                className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Add a short note for approvers"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">Optional but recommended.</p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Discard
            </Button>
            <Button className="bg-primary" disabled={!canSubmit || submitting} onClick={handleSubmit}>
              Submit Request
              <Send className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>

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
