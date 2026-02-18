'use client';

import { useState } from 'react';
import { useBookmarkStore } from '@/store/useBookmarkStore';
import { Plus, Link as LinkIcon, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function BookmarkForm() {
  const { addBookmark } = useBookmarkStore();
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url || !title) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      new URL(url);
    } catch {
      toast.error('Please enter a valid URL');
      return;
    }

    setIsSubmitting(true);
    try {
      await addBookmark({ url, title });
      setUrl('');
      setTitle('');
      toast.success('Bookmark added!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to add bookmark');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl glass-morphism p-6 ring-1 ring-inset ring-white/10">
      <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-6">
        <Plus className="h-5 w-5 text-indigo-400" />
        Add Bookmark
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-slate-300 mb-1">
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
            placeholder="Awesome Website"
            maxLength={255}
          />
        </div>

        <div>
          <label htmlFor="url" className="block text-sm font-medium text-slate-300 mb-1">
            URL
          </label>
          <div className="relative">
            <LinkIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="url"
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full rounded-lg bg-white/5 border border-white/10 pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
              placeholder="https://example.com"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
          ) : (
            <>
              <Plus className="h-4 w-4" />
              Add Bookmark
            </>
          )}
        </button>
      </form>
    </div>
  );
}
