import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

export interface Bookmark {
  id: string;
  user_id: string;
  url: string;
  title: string;
  description?: string;
  tags?: string[];
  favicon_url?: string;
  preview_image?: string;
  created_at: string;
  updated_at: string;
}

interface BookmarkState {
  bookmarks: Bookmark[];
  user: User | null;
  loading: boolean;
  error: string | null;

  // Auth Actions
  setUser: (user: User | null) => void;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;

  // Bookmark Actions
  fetchBookmarks: () => Promise<void>;
  addBookmark: (
    bookmark: Omit<Bookmark, "id" | "user_id" | "created_at" | "updated_at">
  ) => Promise<void>;
  updateBookmark: (id: string, updates: Partial<Bookmark>) => Promise<void>;
  deleteBookmark: (id: string) => Promise<void>;

  // Real-time updates
  setBookmarks: (bookmarks: Bookmark[]) => void;
  addOrUpdateBookmarkLocal: (bookmark: Bookmark) => void;
  removeBookmarkLocal: (id: string) => void;
}

export const useBookmarkStore = create<BookmarkState>((set, get) => ({
  bookmarks: [],
  user: null,
  loading: false,
  error: null,

  setUser: (user) => set({ user }),

  signInWithGoogle: async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ user: null, bookmarks: [] });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  fetchBookmarks: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("bookmarks")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      set({ bookmarks: data || [], loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  addBookmark: async (bookmark) => {
    const { user, bookmarks } = get();
    if (!user) return;

    // Check for duplicate URL locally first
    const isDuplicate = bookmarks.find(
      (b) => b.url.toLowerCase().trim() === bookmark.url.toLowerCase().trim()
    );
    if (isDuplicate) {
      throw new Error("You have already bookmarked this URL");
    }

    // Optimistic Update
    const tempId = Math.random().toString(36).substring(7);
    const newBookmark: Bookmark = {
      ...bookmark,
      id: tempId,
      user_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    set((state) => ({
      bookmarks: [newBookmark, ...state.bookmarks],
    }));

    try {
      const { data, error } = await supabase
        .from("bookmarks")
        .insert([{ ...bookmark, user_id: user.id }])
        .select()
        .single();

      if (error) {
        if (error.code === "23505") {
          // Postgres error code for unique violation
          throw new Error("You have already bookmarked this URL");
        }
        throw error;
      }

      // Update with real data, but ensure no duplicates if real-time listener already added it
      set((state) => {
        const otherBookmarks = state.bookmarks.filter(
          (b) => b.id !== tempId && b.id !== data.id
        );
        return {
          bookmarks: [data, ...otherBookmarks],
        };
      });
    } catch (error: any) {
      // Revert on error
      set((state) => ({
        bookmarks: state.bookmarks.filter((b) => b.id !== tempId),
        error: error.message,
      }));
      throw error; // Re-throw to be handled by the UI
    }
  },

  updateBookmark: async (id, updates) => {
    set((state) => ({
      bookmarks: state.bookmarks.map((b) =>
        b.id === id ? { ...b, ...updates } : b
      ),
    }));

    try {
      const { error } = await supabase
        .from("bookmarks")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
    } catch (error: any) {
      // Potentially fetch again for consistency on error
      get().fetchBookmarks();
      set({ error: error.message });
    }
  },

  deleteBookmark: async (id) => {
    // Optimistic delete
    const previousBookmarks = get().bookmarks;
    set((state) => ({
      bookmarks: state.bookmarks.filter((b) => b.id !== id),
    }));

    try {
      const { error } = await supabase.from("bookmarks").delete().eq("id", id);

      if (error) throw error;
    } catch (error: any) {
      // Revert on error
      set({ bookmarks: previousBookmarks, error: error.message });
    }
  },

  setBookmarks: (bookmarks) => set({ bookmarks }),

  addOrUpdateBookmarkLocal: (bookmark) => {
    set((state) => {
      const exists = state.bookmarks.find((b) => b.id === bookmark.id);
      if (exists) {
        return {
          bookmarks: state.bookmarks.map((b) =>
            b.id === bookmark.id ? bookmark : b
          ),
        };
      }
      return {
        bookmarks: [bookmark, ...state.bookmarks],
      };
    });
  },

  removeBookmarkLocal: (id) => {
    set((state) => ({
      bookmarks: state.bookmarks.filter((b) => b.id !== id),
    }));
  },
}));
