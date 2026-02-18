'use client';

import { useEffect } from 'react';
import { useBookmarkStore } from '@/store/useBookmarkStore';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import BookmarkForm from '@/components/BookmarkForm';
import BookmarkList from '@/components/BookmarkList';

export const dynamic = 'force-dynamic';

export default function Dashboard() {
  const { user, loading } = useBookmarkStore();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading && !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1">
            <div className="sticky top-24">
              <BookmarkForm />
            </div>
          </aside>
          
          <div className="lg:col-span-3">
            <BookmarkList />
          </div>
        </div>
      </main>
    </div>
  );
}
