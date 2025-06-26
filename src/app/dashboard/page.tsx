
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      // If not loading and no user, send to login
      router.replace('/login');
    } else if (!loading && user) {
      // If user is available, redirect to a default dashboard.
      // In a real app, you'd check their role here.
      router.replace('/dashboard/employee');
    }
  }, [user, loading, router]);

  // You can show a loading spinner here while auth state is being determined
  return null;
}
