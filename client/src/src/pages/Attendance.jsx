import { useState } from 'react';
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight, Download, Calendar as CalendarIcon, Check, X, Search, Folder } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
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

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Mock attendance data
const employeeAttendance = [
  { date: '28 Oct, 2025', day: 'Tuesday', checkIn: '10:00 AM', checkOut: '07:00 PM', hours: '09:00', extra: '01:00', late: false },
  { date: '29 Oct, 2025', day: 'Wednesday', checkIn: '10:00 AM', checkOut: '07:00 PM', hours: '09:00', extra: '01:00', late: false },
  { date: '30 Oct, 2025', day: 'Thursday', checkIn: '10:30 AM', checkOut: '07:30 PM', hours: '09:00', extra: '--:--', late: true },
  { date: '31 Oct, 2025', day: 'Friday', checkIn: null, checkOut: null, hours: null, extra: null, late: false, dayOff: true },
];

const adminAttendance = [
  { name: 'Sarah Connor', role: 'Product Designer', avatar: '', checkIn: '10:00', checkOut: '19:00', hours: '09:00', extra: '+01:00', status: 'Present' },
  { name: 'John Reese', role: 'Senior Developer', avatar: '', checkIn: '10:00', checkOut: '19:00', hours: '09:00', extra: '+01:00', status: 'Present' },
  { name: 'Harold Finch', role: 'System Analyst', avatar: '', checkIn: '10:45', checkOut: '--:--', hours: '--:--', extra: '--', status: 'Late' },
  { name: 'Sameen Shaw', role: 'Operations', avatar: '', checkIn: '--:--', checkOut: '--:--', hours: '00:00', extra: '--', status: 'Absent' },
  { name: 'Lionel Fusco', role: 'Detective', avatar: '', checkIn: '09:55', checkOut: '18:55', hours: '09:00', extra: '--', status: 'Present' },
];

export default function Attendance() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [selectedDate, setSelectedDate] = useState(new Date(2025, 9, 22)); // October 22, 2025
  const [viewMode, setViewMode] = useState('Day');
  const [searchQuery, setSearchQuery] = useState('');

  const currentMonth = selectedDate.getMonth();
  const currentYear = selectedDate.getFullYear();

  const prevMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setSelectedDate(newDate);
  };

  const nextMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setSelectedDate(newDate);
  };

  const prevDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const nextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  if (isAdmin) {
    return (
      <AdminAttendanceView 
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        viewMode={viewMode}
        setViewMode={setViewMode}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        prevDay={prevDay}
        nextDay={nextDay}
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">My Attendance</h1>
        <p className="text-muted-foreground">View and track your monthly work hours and attendance records.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        {/* Month Picker with Calendar */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <Button variant="ghost" size="icon" onClick={prevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" className="font-semibold">
                  {months[currentMonth]}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="center">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            <Button variant="ghost" size="icon" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="text-center">
            <Select value={currentYear.toString()} onValueChange={(v) => {
              const newDate = new Date(selectedDate);
              newDate.setFullYear(parseInt(v));
              setSelectedDate(newDate);
            }}>
              <SelectTrigger className="w-24 mx-auto">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
                <SelectItem value="2026">2026</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        <Card className="p-4">
          <p className="text-sm text-muted-foreground uppercase tracking-wider">Days Present</p>
          <div className="flex items-center justify-between mt-2">
            <p className="text-3xl font-bold">22</p>
            <Check className="h-6 w-6 text-success" />
          </div>
        </Card>

        <Card className="p-4">
          <p className="text-sm text-muted-foreground uppercase tracking-wider">Leaves Taken</p>
          <div className="flex items-center justify-between mt-2">
            <p className="text-3xl font-bold">1</p>
            <X className="h-6 w-6 text-destructive" />
          </div>
        </Card>

        <Card className="p-4">
          <p className="text-sm text-muted-foreground uppercase tracking-wider">Total Working Days</p>
          <div className="flex items-center justify-between mt-2">
            <p className="text-3xl font-bold">23</p>
            <CalendarIcon className="h-6 w-6 text-primary" />
          </div>
        </Card>
      </div>

      {/* Attendance Table */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Folder className="h-5 w-5" />
            {months[currentMonth]} {currentYear} Details
          </CardTitle>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </CardHeader>
        <CardContent>
          <table className="w-full">
            <thead>
              <tr className="text-xs text-muted-foreground uppercase tracking-wider border-b">
                <th className="text-left py-3">Date</th>
                <th className="text-left py-3">Check In</th>
                <th className="text-left py-3">Check Out</th>
                <th className="text-left py-3">Work Hours</th>
                <th className="text-left py-3">Extra Hours</th>
              </tr>
            </thead>
            <tbody>
              {employeeAttendance.map((record, idx) => (
                <tr key={idx} className="border-b last:border-0">
                  <td className="py-4">
                    <p className="font-medium">{record.date}</p>
                    <p className="text-sm text-muted-foreground">{record.day}</p>
                  </td>
                  <td className="py-4">
                    {record.dayOff ? (
                      <span className="text-muted-foreground italic">Day Off / Leave</span>
                    ) : (
                      <Badge variant={record.late ? 'destructive' : 'default'} className={cn(
                        'rounded-full',
                        !record.late && 'bg-success hover:bg-success/80'
                      )}>
                        {record.checkIn}
                      </Badge>
                    )}
                  </td>
                  <td className="py-4">
                    {!record.dayOff && record.checkOut && (
                      <Badge variant="outline" className="rounded-full border-primary text-primary">
                        {record.checkOut}
                      </Badge>
                    )}
                  </td>
                  <td className="py-4 font-mono">{record.hours || ''}</td>
                  <td className="py-4">
                    {record.extra && record.extra !== '--:--' ? (
                      <span className="text-warning font-medium">⚡ {record.extra}</span>
                    ) : (
                      <span className="text-muted-foreground">{record.extra}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <p className="text-sm text-muted-foreground">Showing 1 to 4 of 31 days</p>
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

      {/* Policy Note */}
      <div className="bg-info/10 border-l-4 border-info p-4 rounded-r-lg">
        <p className="font-semibold text-info">Attendance Policy Note</p>
        <p className="text-foreground">
          Attendance data serves as the basis for payslip generation. Any unpaid leave or missing attendance 
          days will automatically reduce the number of payable days during payslip computation.
        </p>
      </div>

      {/* Footer */}
      <footer className="text-center text-sm text-muted-foreground py-6">
        © 2025 Acme Human Resources. All rights reserved.
      </footer>
    </div>
  );
}

function AdminAttendanceView({
  selectedDate,
  setSelectedDate,
  viewMode,
  setViewMode,
  searchQuery,
  setSearchQuery,
  prevDay,
  nextDay,
}) {
  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Folder className="h-6 w-6" />
              Attendance
            </h1>
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search employee..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Date Controls with Calendar */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={prevDay}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={nextDay}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              
              {/* Date Picker */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    {format(selectedDate, "dd MMMM yyyy")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex bg-muted rounded-lg p-1">
              {['Day', 'Week', 'Month'].map((mode) => (
                <Button
                  key={mode}
                  variant={viewMode === mode ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode(mode)}
                >
                  {mode}
                </Button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <h2 className="text-lg font-semibold">{format(selectedDate, "EEEE, dd MMMM yyyy")}</h2>
            <p className="text-muted-foreground">Daily Attendance Overview</p>
          </div>

          {/* Admin Table */}
          <table className="w-full">
            <thead>
              <tr className="text-xs text-muted-foreground uppercase tracking-wider border-b">
                <th className="text-left py-3">Employee</th>
                <th className="text-left py-3">Check In</th>
                <th className="text-left py-3">Check Out</th>
                <th className="text-left py-3">Work Hours</th>
                <th className="text-left py-3">Extra Hours</th>
                <th className="text-left py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {adminAttendance.map((record, idx) => (
                <tr key={idx} className="border-b last:border-0">
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={record.avatar} />
                        <AvatarFallback className="bg-primary/10 text-primary text-sm">
                          {record.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{record.name}</p>
                        <p className="text-sm text-muted-foreground">{record.role}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4">
                    <Badge 
                      variant={record.status === 'Late' ? 'destructive' : 'default'}
                      className={cn(
                        'rounded-full',
                        record.status === 'Present' && record.checkIn !== '--:--' && 'bg-success hover:bg-success/80',
                        record.checkIn === '--:--' && 'bg-muted text-muted-foreground'
                      )}
                    >
                      {record.checkIn}
                    </Badge>
                  </td>
                  <td className="py-4">
                    {record.checkOut !== '--:--' ? (
                      <Badge variant="outline" className="rounded-full border-primary text-primary">
                        {record.checkOut}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="rounded-full">--:--</Badge>
                    )}
                  </td>
                  <td className="py-4 font-mono">{record.hours}</td>
                  <td className="py-4">
                    {record.extra.startsWith('+') ? (
                      <span className="text-success font-medium">{record.extra}</span>
                    ) : (
                      <span className="text-muted-foreground">{record.extra}</span>
                    )}
                  </td>
                  <td className="py-4">
                    <Badge 
                      className={cn(
                        'rounded-full',
                        record.status === 'Present' && 'bg-success/10 text-success hover:bg-success/20',
                        record.status === 'Late' && 'bg-warning/10 text-warning hover:bg-warning/20',
                        record.status === 'Absent' && 'bg-destructive/10 text-destructive hover:bg-destructive/20'
                      )}
                    >
                      {record.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <p className="text-sm text-muted-foreground">Showing 1 to 5 of 42 results</p>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" className="h-8 w-8">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="default" size="sm" className="h-8 w-8">1</Button>
              <Button variant="outline" size="sm" className="h-8 w-8">2</Button>
              <Button variant="outline" size="sm" className="h-8 w-8">3</Button>
              <Button variant="outline" size="sm" className="h-8 w-8">...</Button>
              <Button variant="outline" size="icon" className="h-8 w-8">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
