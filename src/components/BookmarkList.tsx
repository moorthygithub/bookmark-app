'use client';

import { useState } from 'react';
import { useBookmarkStore, Bookmark } from '@/store/useBookmarkStore';
import { Trash2, ExternalLink, Globe, Calendar, AlertCircle, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function BookmarkList() {
  const { bookmarks, deleteBookmark, loading, error } = useBookmarkStore();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (error) {
    return (
      <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3">
        <AlertCircle className="h-5 w-5" />
        <p>Error: {error}</p>
      </div>
    );
  }

  if (loading && bookmarks.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 rounded-2xl bg-white/5 animate-pulse" />
        ))}
      </div>
    );
  }

  if (bookmarks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 rounded-2xl glass-morphism border-dashed border-2 border-white/5">
        <Globe className="h-12 w-12 text-slate-600 mb-4" />
        <h3 className="text-xl font-semibold text-slate-300">No bookmarks yet</h3>
        <p className="text-slate-500 mt-1">Start by adding your first favorite website!</p>
      </div>
    );
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteBookmark(id);
      toast.success('Bookmark deleted');
      setDeletingId(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete bookmark');
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {bookmarks.map((bookmark) => (
          <div
            key={bookmark.id}
            className="group relative flex flex-col justify-between rounded-2xl glass-morphism p-5 ring-1 ring-inset ring-white/10 hover:bg-white/5 hover:ring-white/20 transition-all"
          >
            <div>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-white truncate group-hover:text-indigo-400 transition-colors">
                    {bookmark.title}
                  </h3>
                  <p className="text-sm text-slate-500 truncate mt-1">
                    {new URL(bookmark.url).hostname}
                  </p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <a
                    href={bookmark.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                    title="Open Link"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                  <button
                    onClick={() => setDeletingId(bookmark.id)}
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="mt-4 flex items-center justify-between text-xs text-slate-600">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3 w-3" />
                {new Date(bookmark.created_at).toLocaleDateString()}
              </div>
              {bookmark.tags && bookmark.tags.length > 0 && (
                <div className="flex gap-1">
                  {bookmark.tags.slice(0, 2).map((tag) => (
                    <span key={tag} className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl glass-morphism-heavy p-6 shadow-2xl ring-1 ring-white/10 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="h-10 w-10 rounded-full bg-red-400/10 flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-red-400" />
              </div>
              <button 
                onClick={() => setDeletingId(null)}
                className="p-1 text-slate-500 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <h3 className="text-lg font-semibold text-white mb-2">Delete Bookmark?</h3>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              Are you sure you want to remove this bookmark? This action cannot be undone.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setDeletingId(null)}
                className="flex-1 px-4 py-2 rounded-lg bg-white/5 text-slate-300 font-medium hover:bg-white/10 hover:text-white transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deletingId)}
                className="flex-1 px-4 py-2 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 active:scale-95 transition-all shadow-lg shadow-red-500/20"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
