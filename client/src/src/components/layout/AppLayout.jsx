import { Outlet, Navigate } from 'react-router-dom';
import { Header } from './Header';
import { useAuth } from '@/lib/auth';

export function AppLayout() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
}
