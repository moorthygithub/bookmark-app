'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useBookmarkStore } from '@/store/useBookmarkStore';
import { useRouter } from 'next/navigation';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const { setUser, fetchBookmarks, addOrUpdateBookmarkLocal, removeBookmarkLocal } = useBookmarkStore();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('Supabase environment variables are missing');
      return;
    }

    // Initial Session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchBookmarks();
      }
    });

    // Auth Subscription
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const isInitialOrFocus = event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED';
      setUser(session?.user ?? null);
      
      if (session?.user) {
        if (!isInitialOrFocus) {
          fetchBookmarks();
        }
        if (event === 'SIGNED_IN') {
          router.refresh();
        }
      } else {
        if (event === 'SIGNED_OUT') {
          router.push('/');
        }
      }
    });

    // Real-time Subscription
    const channel = supabase
      .channel('bookmarks-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookmarks',
        },
        (payload) => {
          console.log('Real-time update:', payload);
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            addOrUpdateBookmarkLocal(payload.new as any);
          } else if (payload.eventType === 'DELETE') {
            removeBookmarkLocal(payload.old.id);
          }
        }
      )
      .subscribe();

    return () => {
      authSubscription.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, [setUser, fetchBookmarks, addOrUpdateBookmarkLocal, removeBookmarkLocal, router]);

  if (!mounted) {
    return (
      <div className="bg-slate-950 min-h-screen text-slate-100 antialiased">
        {children}
      </div>
    );
  }

  return <>{children}</>;
}
