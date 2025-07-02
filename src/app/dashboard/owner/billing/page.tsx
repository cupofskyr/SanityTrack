
'use client';
import { useEffect } from 'react';
import { redirect } from 'next/navigation';

export default function DeprecatedBillingPage() {
  useEffect(() => {
    // Redirect to the new financials page which is the new home for billing info
    redirect('/dashboard/owner/financials');
  }, []);
  
  return null;
}
