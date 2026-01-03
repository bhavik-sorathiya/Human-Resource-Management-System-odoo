import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, User, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const employeesSeed = [
  { id: '1', name: 'Alex Morgan', role: 'Software Engineer', status: 'Active', isPresent: true },
  { id: '2', name: 'Sarah Connor', role: 'Product Manager', status: 'Active', isPresent: true },
  { id: '3', name: 'James Wilson', role: 'UX Designer', status: 'On Leave', isPresent: false },
  { id: '4', name: 'Emily Chen', role: 'HR Specialist', status: 'Active', isPresent: true },
  { id: '5', name: 'John Doe', role: 'Backend Dev', status: 'Active', isPresent: true },
  { id: '6', name: 'Maria Garcia', role: 'Marketing Lead', status: 'Terminated', isPresent: false },
  { id: '7', name: 'David Kim', role: 'Intern', status: 'Active', isPresent: false },
  { id: '8', name: 'Lisa Brown', role: 'Data Scientist', status: 'Active', isPresent: true },
];

export default function Employees() {
  const { user, token } = useAuth();
  const isAdmin = user?.role?.toUpperCase() === 'ADMIN';
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState(employeesSeed);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', position: '' });
  const [submitting, setSubmitting] = useState(false);

  const filteredEmployees = useMemo(() => items.filter(emp =>
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.role.toLowerCase().includes(searchQuery.toLowerCase())
  ), [items, searchQuery]);

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'On Leave':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'Terminated':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        {isAdmin && (
          <Button onClick={() => setShowAdd(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Employee
          </Button>
        )}
        <div className="relative w-72 ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search employees..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Employee Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredEmployees.map((employee) => (
          <Link key={employee.id} to={`/employees/${employee.id}`}>
            <Card className="hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer group relative">
              <CardContent className="p-6 text-center">
                {/* Presence Indicator */}
                <div className="absolute top-3 right-3">
                  <div 
                    className={cn(
                      'h-4 w-4 rounded-full border-2 border-card',
                      employee.isPresent 
                        ? 'bg-success shadow-[0_0_8px_hsl(var(--success))]' 
                        : 'bg-muted-foreground/30'
                    )}
                    title={employee.isPresent ? 'Present (Checked In)' : 'Not Present'}
                  />
                </div>

                {/* Avatar Placeholder */}
                <div className="w-24 h-24 mx-auto mb-4 rounded-lg bg-info/10 flex items-center justify-center">
                  <User className="h-12 w-12 text-info" />
                </div>

                {/* Name & Role */}
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  {employee.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-3">{employee.role}</p>

                {/* Status Badge */}
                <Badge 
                  variant="outline"
                  className={cn('rounded-full', getStatusStyle(employee.status))}
                >
                  {employee.status}
                </Badge>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Settings Footer */}
      <div className="fixed bottom-6 left-6">
        <Button variant="ghost" className="text-muted-foreground">
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
      </div>

      {isAdmin && (
        <AddEmployeeModal
          open={showAdd}
          onOpenChange={setShowAdd}
          form={form}
          setForm={setForm}
          onCreated={(emp) => setItems((prev) => [...prev, emp])}
          submitting={submitting}
          setSubmitting={setSubmitting}
          token={token}
          toast={toast}
        />
      )}
    </div>
  );
}

function AddEmployeeModal({ open, onOpenChange, form, setForm, onCreated, submitting, setSubmitting, token, toast }) {
  const onField = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.password) {
      toast({ title: 'Missing fields', description: 'Name, email, and password are required.', variant: 'destructive' });
      return;
    }
    try {
      setSubmitting(true);
      const created = await api.adminCreateUser(token, {
        name: form.name,
        email: form.email,
        password: form.password,
        position: form.position || 'Employee',
      });
      onCreated({
        id: created.id,
        name: created.name,
        role: created.position || 'Employee',
        status: 'Active',
        isPresent: false,
      });
      toast({ title: 'Employee added' });
      onOpenChange(false);
      setForm({ name: '', email: '', password: '', position: '' });
    } catch (err) {
      toast({ title: 'Add failed', description: err.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Employee</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={form.name} onChange={onField('name')} placeholder="Full name" />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" value={form.email} onChange={onField('email')} placeholder="name@company.com" />
          </div>
          <div className="space-y-2">
            <Label>Password</Label>
            <Input type="password" value={form.password} onChange={onField('password')} placeholder="Temporary password" />
          </div>
          <div className="space-y-2">
            <Label>Position</Label>
            <Input value={form.position} onChange={onField('position')} placeholder="e.g., Frontend Engineer" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Adding...' : 'Add Employee'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
