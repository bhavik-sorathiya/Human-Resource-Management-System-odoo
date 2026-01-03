import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Mail, Lock, Building2, User, Phone, Upload, Globe, Shield, Headphones } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/lib/auth';
import officeHero from '@/assets/office-hero.jpg';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

const registerSchema = z.object({
  companyName: z.string().min(2, 'Company name is required'),
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().optional(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  agreeTerms: z.boolean().refine(val => val === true, 'You must agree to the terms'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export default function Auth() {
  const [activeTab, setActiveTab] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { login, register: registerUser, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  const loginForm = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', rememberMe: false },
  });

  const registerForm = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      companyName: '',
      fullName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      agreeTerms: false,
    },
  });

  if (isAuthenticated) {
    return <Navigate to="/profile" replace />;
  }

  const onLogin = async (data) => {
    await login(data.email, data.password);
    navigate('/profile');
  };

  const onRegister = async (data) => {
    await registerUser({
      name: data.fullName,
      email: data.email,
      password: data.password,
      companyName: data.companyName,
      phone: data.phone,
    });
    navigate('/profile');
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Panel - Hero */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-hero-overlay">
        <img
          src={officeHero}
          alt="Modern office"
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-60"
        />
        <div className="relative z-10 flex flex-col justify-between p-12 text-primary-foreground">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-foreground/20 backdrop-blur">
              <div className="grid grid-cols-2 gap-0.5">
                <div className="h-2 w-2 bg-primary-foreground rounded-sm" />
                <div className="h-2 w-2 bg-primary-foreground rounded-sm" />
                <div className="h-2 w-2 bg-primary-foreground rounded-sm" />
                <div className="h-2 w-2 bg-primary-foreground rounded-sm" />
              </div>
            </div>
            <span className="text-xl font-semibold">Nexus HR</span>
          </div>

          {/* Tagline */}
          <div className="space-y-4">
            <h1 className="text-4xl font-bold leading-tight">
              Empowering your workforce,
              <br />
              simplifying your day.
            </h1>
            <p className="text-lg opacity-90 max-w-md">
              Access your employee profile, manage leave, and connect
              with your team all in one secure place.
            </p>
          </div>

          {/* Footer */}
          <p className="text-sm opacity-70">
            © 2026 Nexus HR Systems. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex flex-col">
        {/* Contact Support */}
        <div className="flex justify-end p-4">
          <Button variant="outline" size="sm">
            Contact Support
          </Button>
        </div>

        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md space-y-8 animate-fade-in">
            {/* Tabs */}
            <div className="flex border-b">
              <button
                onClick={() => setActiveTab('login')}
                className={`flex-1 pb-3 text-center font-medium transition-colors ${
                  activeTab === 'login'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Log In
              </button>
              <button
                onClick={() => setActiveTab('signup')}
                className={`flex-1 pb-3 text-center font-medium transition-colors ${
                  activeTab === 'signup'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Login Form */}
            {activeTab === 'login' && (
              <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold">Welcome Back</h2>
                  <p className="text-muted-foreground">Please enter your details to sign in.</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Username or Work Email</Label>
                    <div className="relative">
                      <Input
                        id="email"
                        type="email"
                        placeholder="jane.doe@company.com"
                        {...loginForm.register('email')}
                        className="pr-10"
                      />
                      <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    </div>
                    {loginForm.formState.errors.email && (
                      <p className="text-sm text-destructive">{loginForm.formState.errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        {...loginForm.register('password')}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {loginForm.formState.errors.password && (
                      <p className="text-sm text-destructive">{loginForm.formState.errors.password.message}</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox id="remember" {...loginForm.register('rememberMe')} />
                      <Label htmlFor="remember" className="text-sm font-normal">Remember me</Label>
                    </div>
                    <Button variant="link" className="p-0 h-auto text-primary">
                      Forgot password?
                    </Button>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Signing in...' : 'Log In'}
                </Button>

                <div className="text-center space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Protected by enterprise grade security
                  </p>
                  <div className="flex justify-center gap-4">
                    <Lock className="h-5 w-5 text-muted-foreground" />
                    <Globe className="h-5 w-5 text-muted-foreground" />
                    <Headphones className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
              </form>
            )}

            {/* Signup Form */}
            {activeTab === 'signup' && (
              <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-6">
                <div className="space-y-2 text-center">
                  <h2 className="text-2xl font-bold">Create your account</h2>
                  <p className="text-muted-foreground">
                    Start streamlining your HR processes today.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Company Logo Upload */}
                  <div className="space-y-2">
                    <Label>Company Logo</Label>
                    <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm">
                        <span className="text-primary font-medium">Upload a file</span>
                        {' '}or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">PNG, JPG, SVG up to 5MB</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Company Name</Label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="companyName"
                          placeholder="e.g. Acme Corp"
                          {...registerForm.register('companyName')}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="fullName"
                          placeholder="e.g. John Doe"
                          {...registerForm.register('fullName')}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="signupEmail">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signupEmail"
                          type="email"
                          placeholder="name@company.com"
                          {...registerForm.register('email')}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          placeholder="+1 (555) 000-0000"
                          {...registerForm.register('phone')}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="signupPassword">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signupPassword"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Create a strong password"
                          {...registerForm.register('password')}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <div className="relative">
                        <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Re-enter your password"
                          {...registerForm.register('confirmPassword')}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Checkbox id="terms" {...registerForm.register('agreeTerms')} />
                    <Label htmlFor="terms" className="text-sm font-normal">
                      I agree to the{' '}
                      <Button variant="link" className="p-0 h-auto">Terms of Service</Button>
                      {' '}and{' '}
                      <Button variant="link" className="p-0 h-auto">Privacy Policy</Button>
                    </Label>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Creating account...' : 'Create Account'}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  Trusted by modern HR teams worldwide
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
