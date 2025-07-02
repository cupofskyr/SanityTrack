
'use client';
import { useEffect } from 'react';
import { redirect } from 'next/navigation';

export default function DeprecatedDocumentsPage() {
  useEffect(() => {
    // Redirect to the manager's knowledge base page, which is the new home for documents
    redirect('/dashboard/manager/knowledge');
  }, []);
  
  return null;
}
