
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/login');
      } else {
        const role = sessionStorage.getItem('userRole');
        switch (role) {
          case 'Owner':
            router.replace('/dashboard/owner');
            break;
          case 'Manager':
            router.replace('/dashboard/manager');
            break;
          case 'Health Department':
            router.replace('/dashboard/health-department');
            break;
          case 'Employee':
          default:
            router.replace('/dashboard/employee');
            break;
        }
      }
    }
  }, [user, loading, router]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

    
