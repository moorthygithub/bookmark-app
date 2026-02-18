'use client';

import { useState } from 'react';
import { useBookmarkStore } from '@/store/useBookmarkStore';
import { Bookmark, LogOut, User as UserIcon, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function Navbar() {
  const { user, signOut } = useBookmarkStore();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
      setShowLogoutConfirm(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign out');
    }
  };

  if (!user) return null;

  return (
    <>
      <nav className="sticky top-0 z-50 w-full glass-morphism-heavy border-b border-white/5">
        <div className="mx-auto max-max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <Bookmark className="h-6 w-6 text-indigo-400" />
              <span className="text-xl font-bold tracking-tight text-white">Smart Bookmark</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 px-3 py-1.5 rounded-full bg-white/5 ring-1 ring-inset ring-white/10">
                {user.user_metadata.avatar_url ? (
                  <img 
                    src={user.user_metadata.avatar_url} 
                    alt={user.user_metadata.full_name} 
                    className="h-6 w-6 rounded-full" 
                  />
                ) : (
                  <UserIcon className="h-4 w-4 text-slate-400" />
                )}
                <span className="text-sm font-medium text-slate-200 hidden sm:block">
                  {user.user_metadata.full_name || user.email}
                </span>
              </div>
              
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-all"
                title="Sign out"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl glass-morphism-heavy p-6 shadow-2xl ring-1 ring-white/10 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="h-10 w-10 rounded-full bg-indigo-400/10 flex items-center justify-center">
                <LogOut className="h-5 w-5 text-indigo-400" />
              </div>
              <button 
                onClick={() => setShowLogoutConfirm(false)}
                className="p-1 text-slate-500 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <h3 className="text-lg font-semibold text-white mb-2">Sign Out?</h3>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              Are you sure you want to sign out of your account?
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 px-4 py-2 rounded-lg bg-white/5 text-slate-300 font-medium hover:bg-white/10 hover:text-white transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSignOut}
                className="flex-1 px-4 py-2 rounded-lg bg-indigo-500 text-white font-medium hover:bg-indigo-400 active:scale-95 transition-all shadow-lg shadow-indigo-500/20"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
