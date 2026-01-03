import { useCallback, useEffect, useMemo, useState } from 'react';
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
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const formatTime = (iso) => {
  if (!iso) return '--:--';
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatDateLabel = (iso) => format(new Date(iso), 'dd MMM, yyyy');

const hoursWorked = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return '--';
  const diffMs = new Date(checkOut) - new Date(checkIn);
  if (diffMs <= 0) return '--';
  const hours = diffMs / (1000 * 60 * 60);
  return hours.toFixed(2);
};

const extraHours = (checkIn, checkOut) => {
  const worked = parseFloat(hoursWorked(checkIn, checkOut));
  if (Number.isNaN(worked)) return '--';
  const extra = worked - 8;
  if (extra <= 0) return '0.00';
  return extra.toFixed(2);
};

export default function Attendance() {
  const { user, token } = useAuth();
  const { toast } = useToast();
  const isAdmin = user?.role?.toUpperCase() === 'ADMIN';

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('Day');
  const [searchQuery, setSearchQuery] = useState('');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const data = isAdmin ? await api.attendanceAll(token) : await api.attendanceMine(token);
      setRecords(Array.isArray(data) ? data : []);
    } catch (err) {
      toast({ title: 'Attendance load failed', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [token, isAdmin, toast]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const handler = () => load();
    window.addEventListener('attendance-updated', handler);
    return () => window.removeEventListener('attendance-updated', handler);
  }, [load]);

  const currentMonth = selectedDate.getMonth();
  const currentYear = selectedDate.getFullYear();

  const monthRecords = useMemo(() => {
    return records
      .filter((r) => {
        const d = new Date(r.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [records, currentMonth, currentYear]);

  const monthDaysPresent = useMemo(() => new Set(monthRecords.map((r) => r.date)).size, [monthRecords]);

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
        records={records}
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
            <p className="text-3xl font-bold">{monthDaysPresent}</p>
            <Check className="h-6 w-6 text-success" />
          </div>
        </Card>

        <Card className="p-4">
          <p className="text-sm text-muted-foreground uppercase tracking-wider">Leaves Taken</p>
          <div className="flex items-center justify-between mt-2">
            <p className="text-3xl font-bold">0</p>
            <X className="h-6 w-6 text-destructive" />
          </div>
        </Card>

        <Card className="p-4">
          <p className="text-sm text-muted-foreground uppercase tracking-wider">Total Working Days</p>
          <div className="flex items-center justify-between mt-2">
            <p className="text-3xl font-bold">{monthRecords.length}</p>
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
              {loading && (
                <tr>
                  <td className="py-6 text-muted-foreground" colSpan={5}>Loading attendance...</td>
                </tr>
              )}
              {!loading && monthRecords.length === 0 && (
                <tr>
                  <td className="py-6 text-muted-foreground" colSpan={5}>No records for this month.</td>
                </tr>
              )}
              {!loading && monthRecords.map((record, idx) => {
                const dateObj = new Date(record.date);
                const dayLabel = format(dateObj, 'EEEE');
                const worked = hoursWorked(record.checkInTime, record.checkOutTime);
                const extra = extraHours(record.checkInTime, record.checkOutTime);
                const checkInLabel = formatTime(record.checkInTime);
                const checkOutLabel = formatTime(record.checkOutTime);
                const late = record.checkInTime ? new Date(record.checkInTime).getHours() >= 10 : false;
                return (
                <tr key={idx} className="border-b last:border-0">
                  <td className="py-4">
                    <p className="font-medium">{formatDateLabel(record.date)}</p>
                    <p className="text-sm text-muted-foreground">{dayLabel}</p>
                  </td>
                  <td className="py-4">
                    <Badge variant={late ? 'destructive' : 'default'} className={cn(
                      'rounded-full',
                      !late && 'bg-success hover:bg-success/80'
                    )}>
                      {checkInLabel}
                    </Badge>
                  </td>
                  <td className="py-4">
                    {record.checkOutTime && (
                      <Badge variant="outline" className="rounded-full border-primary text-primary">
                        {checkOutLabel}
                      </Badge>
                    )}
                  </td>
                  <td className="py-4 font-mono">{worked}</td>
                  <td className="py-4 font-mono">{extra}</td>
                </tr>
              );})}
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
      <footer className="text-center text-sm text-muted-foreground py-6">
        © 2025 Acme Human Resources. All rights reserved.
      </footer>
    </div>
  );
}

function AdminAttendanceView({
  records,
  selectedDate,
  setSelectedDate,
  viewMode,
  setViewMode,
  searchQuery,
  setSearchQuery,
  prevDay,
  nextDay,
}) {
  const startOfWeek = useCallback((date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = (day + 6) % 7; // Monday as start
    d.setDate(d.getDate() - diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const endOfWeek = useCallback((date) => {
    const start = startOfWeek(date);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return end;
  }, [startOfWeek]);

  const filtered = useMemo(() => {
    if (viewMode === 'Day') {
      const target = format(selectedDate, 'yyyy-MM-dd');
      return records.filter((r) => r.date === target);
    }
    if (viewMode === 'Week') {
      const start = startOfWeek(selectedDate);
      const end = endOfWeek(selectedDate);
      return records.filter((r) => {
        const d = new Date(r.date);
        return d >= start && d <= end;
      });
    }
    // Month
    const month = selectedDate.getMonth();
    const year = selectedDate.getFullYear();
    return records.filter((r) => {
      const d = new Date(r.date);
      return d.getMonth() === month && d.getFullYear() === year;
    });
  }, [records, selectedDate, viewMode, startOfWeek, endOfWeek]);

  const aggregated = useMemo(() => {
    if (viewMode === 'Day') return [];
    const map = new Map();
    filtered.forEach((r) => {
      const key = r.user?.id || r.userId || r.id;
      if (!map.has(key)) {
        map.set(key, {
          id: key,
          name: r.user?.name || 'Unknown',
          role: r.user?.position || r.user?.role || 'Employee',
          days: new Set(),
          hours: 0,
          extra: 0,
        });
      }
      const entry = map.get(key);
      entry.days.add(r.date);
      const workedNum = parseFloat(hoursWorked(r.checkInTime, r.checkOutTime));
      const extraNum = parseFloat(extraHours(r.checkInTime, r.checkOutTime));
      if (!Number.isNaN(workedNum)) entry.hours += workedNum;
      if (!Number.isNaN(extraNum)) entry.extra += extraNum;
    });
    return Array.from(map.values()).map((e) => ({
      ...e,
      daysPresent: e.days.size,
      hours: e.hours.toFixed(2),
      extra: e.extra.toFixed(2),
    }));
  }, [filtered, viewMode]);

  const dayRecords = useMemo(() => {
    const target = format(selectedDate, 'yyyy-MM-dd');
    return filtered
      .filter((r) => r.date === target)
      .filter((r) => {
        if (!searchQuery) return true;
        const name = r.user?.name || '';
        return name.toLowerCase().includes(searchQuery.toLowerCase());
      });
  }, [filtered, selectedDate, searchQuery]);

  const filteredAgg = useMemo(() => {
    if (viewMode === 'Day') return [];
    return aggregated.filter((e) => {
      if (!searchQuery) return true;
      return e.name.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [aggregated, searchQuery, viewMode]);

  const rangeLabel = useMemo(() => {
    if (viewMode === 'Day') return format(selectedDate, "EEEE, dd MMMM yyyy");
    if (viewMode === 'Week') {
      const start = startOfWeek(selectedDate);
      const end = endOfWeek(selectedDate);
      return `${format(start, 'dd MMM')} - ${format(end, 'dd MMM yyyy')}`;
    }
    return format(selectedDate, 'MMMM yyyy');
  }, [selectedDate, viewMode, startOfWeek, endOfWeek]);

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
            <h2 className="text-lg font-semibold">{rangeLabel}</h2>
            <p className="text-muted-foreground">{viewMode} Attendance Overview</p>
          </div>

          {/* Admin Table */}
          {viewMode === 'Day' ? (
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
                {dayRecords.length === 0 && (
                  <tr>
                    <td className="py-6 text-muted-foreground" colSpan={6}>No records for this date.</td>
                  </tr>
                )}
                {dayRecords.map((record, idx) => {
                  const name = record.user?.name || 'Unknown';
                  const role = record.user?.position || record.user?.role || '';
                  const checkInLabel = formatTime(record.checkInTime);
                  const checkOutLabel = formatTime(record.checkOutTime);
                  const worked = hoursWorked(record.checkInTime, record.checkOutTime);
                  const extra = extraHours(record.checkInTime, record.checkOutTime);
                  const status = record.checkOutTime ? 'Present' : record.checkInTime ? 'Late' : 'Absent';
                  return (
                    <tr key={idx} className="border-b last:border-0">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={record.user?.avatar} />
                            <AvatarFallback className="bg-primary/10 text-primary text-sm">
                              {name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{name}</p>
                            <p className="text-sm text-muted-foreground">{role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <Badge 
                          variant={status === 'Late' ? 'destructive' : 'default'}
                          className={cn(
                            'rounded-full',
                            status === 'Present' && record.checkInTime && 'bg-success hover:bg-success/80',
                            !record.checkInTime && 'bg-muted text-muted-foreground'
                          )}
                        >
                          {checkInLabel}
                        </Badge>
                      </td>
                      <td className="py-4">
                        {record.checkOutTime ? (
                          <Badge variant="outline" className="rounded-full border-primary text-primary">
                            {checkOutLabel}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="rounded-full">--:--</Badge>
                        )}
                      </td>
                      <td className="py-4 font-mono">{worked}</td>
                      <td className="py-4 font-mono">{extra}</td>
                      <td className="py-4">
                        <Badge 
                          className={cn(
                            'rounded-full',
                            status === 'Present' && 'bg-success/10 text-success hover:bg-success/20',
                            status === 'Late' && 'bg-warning/10 text-warning hover:bg-warning/20',
                            status === 'Absent' && 'bg-destructive/10 text-destructive hover:bg-destructive/20'
                          )}
                        >
                          {status}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="text-xs text-muted-foreground uppercase tracking-wider border-b">
                  <th className="text-left py-3">Employee</th>
                  <th className="text-left py-3">Role</th>
                  <th className="text-left py-3">Days Present</th>
                  <th className="text-left py-3">Total Hours</th>
                  <th className="text-left py-3">Extra Hours</th>
                </tr>
              </thead>
              <tbody>
                {filteredAgg.length === 0 && (
                  <tr>
                    <td className="py-6 text-muted-foreground" colSpan={5}>No records for this range.</td>
                  </tr>
                )}
                {filteredAgg.map((row) => (
                  <tr key={row.id} className="border-b last:border-0">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary text-sm">
                            {row.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <p className="font-medium">{row.name}</p>
                      </div>
                    </td>
                    <td className="py-4 text-muted-foreground">{row.role}</td>
                    <td className="py-4 font-semibold">{row.daysPresent}</td>
                    <td className="py-4 font-mono">{row.hours}</td>
                    <td className="py-4 font-mono text-success">{row.extra}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

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
