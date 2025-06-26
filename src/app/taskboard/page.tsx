"use client";

import { redirect } from 'next/navigation';
import { useEffect } from 'react';

export default function TaskboardRedirectPage() {
  useEffect(() => {
    redirect('/dashboard/taskboard');
  }, []);

  return null;
}
