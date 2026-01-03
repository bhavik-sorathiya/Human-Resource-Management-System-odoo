import { Link, useLocation } from 'react-router-dom';
import { Bell, ChevronDown, Moon, Sun, LogIn, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

const navItems = [
  { label: 'Employees', href: '/employees' },
  { label: 'Attendance', href: '/attendance' },
  { label: 'Time Off', href: '/time-off' },
];

export function Header() {
  const { user, token, logout } = useAuth();
  const location = useLocation();
  const { toast } = useToast();
  const [isDark, setIsDark] = useState(false);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [showCheckoutAlert, setShowCheckoutAlert] = useState(false);
  const [checkInTime, setCheckInTime] = useState(null);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  const handleCheckIn = async () => {
    if (!token) {
      toast({ title: "Please log in", description: "Authentication required", variant: "destructive" });
      return;
    }
    try {
      await api.checkIn(token);
      const now = new Date();
      setIsCheckedIn(true);
      setCheckInTime(now);
      window.dispatchEvent(new Event('attendance-updated'));
      toast({
        title: "Checked In",
        description: `You checked in at ${now.toLocaleTimeString()}`,
      });
    } catch (err) {
      toast({ title: "Check-in failed", description: err.message, variant: "destructive" });
    }
  };

  const handleCheckOutClick = () => {
    setShowCheckoutAlert(true);
  };

  const confirmCheckOut = async () => {
    if (!token) {
      toast({ title: "Please log in", description: "Authentication required", variant: "destructive" });
      return;
    }
    try {
      await api.checkOut(token);
      const now = new Date();
      const duration = checkInTime 
        ? Math.round((now.getTime() - checkInTime.getTime()) / (1000 * 60 * 60) * 100) / 100
        : 0;
      setIsCheckedIn(false);
      setCheckInTime(null);
      setShowCheckoutAlert(false);
      window.dispatchEvent(new Event('attendance-updated'));
      toast({
        title: "Checked Out",
        description: `Worked ${duration.toFixed(2)} hours. Check-out at ${now.toLocaleTimeString()}`,
      });
    } catch (err) {
      setShowCheckoutAlert(false);
      toast({ title: "Check-out failed", description: err.message, variant: "destructive" });
    }
  };

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || 'U';

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-card">
        <div className="flex h-14 items-center px-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 mr-8">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
              H
            </div>
            <span className="font-semibold text-foreground">HR Nexus</span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="ml-auto flex items-center gap-3">
            {/* Check In/Out Button */}
            <Button
              variant={isCheckedIn ? "outline" : "default"}
              size="sm"
              onClick={isCheckedIn ? handleCheckOutClick : handleCheckIn}
              className={cn(
                "gap-2 transition-all",
                isCheckedIn 
                  ? "border-destructive text-destructive hover:bg-destructive/10" 
                  : "bg-success hover:bg-success/90"
              )}
            >
              {isCheckedIn ? (
                <>
                  <LogOut className="h-4 w-4" />
                  Check Out
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  Check In
                </>
              )}
            </Button>

            {/* Status indicator */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className={cn(
                "h-2 w-2 rounded-full transition-colors",
                isCheckedIn ? "bg-success animate-pulse" : "bg-destructive"
              )} />
              {isCheckedIn ? 'Checked In' : 'Checked Out'}
            </div>

            {/* Theme toggle */}
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive" />
            </Button>

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.position}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile">My Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/attendance">My Attendance</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-destructive">
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Check Out Confirmation Dialog */}
      <AlertDialog open={showCheckoutAlert} onOpenChange={setShowCheckoutAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Check Out</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to check out? 
              {checkInTime && (
                <span className="block mt-2 font-medium text-foreground">
                  You have been working since {checkInTime.toLocaleTimeString()}.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCheckOut} className="bg-destructive hover:bg-destructive/90">
              Yes, Check Out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
