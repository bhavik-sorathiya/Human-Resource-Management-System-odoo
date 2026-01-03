import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, User, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';

const employees = [
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
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            NEW
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
    </div>
  );
}
