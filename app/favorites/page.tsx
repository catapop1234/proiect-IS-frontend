"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import BlobBackground from "@/components/BlobBackground";
import { useAuth } from "@/app/providers";
import { api } from "@/lib/api";

type ViewMode = "grid" | "timeline";
type FilterType = "all" | "hotels" | "restaurants" | "tourist_attractions";

interface FavoriteItem {
  id: string;
  place_id: string;
  name: string;
  address?: string;
  rating?: number;
  price_level?: number;
  photo_reference?: string;
  place_type?: string;
  website?: string;
  phone?: string;
  lat?: number;
  lng?: number;
  created?: string;
}

const FILTERS: { value: FilterType; label: string }[] = [
  { value: "all", label: "All" },
  { value: "hotels", label: "Hotels" },
  { value: "restaurants", label: "Restaurants" },
  { value: "tourist_attractions", label: "Attractions" },
];

export default function FavoritesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [filter, setFilter] = useState<FilterType>("all");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  const fetchFavorites = useCallback(async () => {
    setLoading(true);
    const data = await api.getFavorites();
    setFavorites(data.items || []);
    setLoading(false);
  }, []);

  const filteredFavorites = filter === "all"
    ? favorites
    : favorites.filter((f) => f.place_type === filter);

  useEffect(() => {
    if (user) fetchFavorites();
  }, [user, fetchFavorites]);

  const removeFav = async (placeId: string) => {
    await api.removeFavorite(placeId);
    setFavorites((prev) => prev.filter((f) => f.place_id !== placeId));
  };

  if (authLoading || !user) return null;

  const timelineGroups: Record<string, FavoriteItem[]> = {};
  filteredFavorites.forEach((fav) => {
    const date = fav.created ? new Date(fav.created).toLocaleDateString("en-US", {
      year: "numeric", month: "long", day: "numeric",
    }) : "Unknown";
    if (!timelineGroups[date]) timelineGroups[date] = [];
    timelineGroups[date].push(fav);
  });

  return (
    <main className="min-h-screen relative overflow-hidden">
      <BlobBackground />
      <Navbar />
      <div className="pt-24 px-6 pb-12">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
          >
            <div>
              <h1 className="text-3xl font-bold mb-1">
                <span className="gradient-text">My Favorites</span>
              </h1>
              <p className="text-[var(--text-secondary)] text-sm">{favorites.length} saved places</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex rounded-xl border border-[var(--border-color)] overflow-hidden">
                {FILTERS.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setFilter(f.value)}
                    className={`px-4 py-2 text-xs font-medium transition-all cursor-pointer ${
                      filter === f.value
                        ? "bg-[var(--accent-primary)] text-white"
                        : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="flex rounded-xl border border-[var(--border-color)] overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2.5 cursor-pointer ${
                    viewMode === "grid"
                      ? "bg-[var(--accent-primary)] text-white"
                      : "bg-[var(--bg-secondary)] text-[var(--text-muted)]"
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode("timeline")}
                  className={`p-2.5 cursor-pointer ${
                    viewMode === "timeline"
                      ? "bg-[var(--accent-primary)] text-white"
                      : "bg-[var(--bg-secondary)] text-[var(--text-muted)]"
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card p-0 overflow-hidden">
                  <div className="h-40 bg-[var(--bg-tertiary)] animate-pulse" />
                  <div className="p-4 space-y-2">
                    <div className="h-5 bg-[var(--bg-tertiary)] rounded animate-pulse w-3/4" />
                    <div className="h-4 bg-[var(--bg-tertiary)] rounded animate-pulse w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredFavorites.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-12 text-center">
              <svg className="w-16 h-16 mx-auto mb-4 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <h2 className="text-xl font-semibold mb-2">No favorites yet</h2>
              <p className="text-[var(--text-secondary)] mb-6">Start exploring and save places you love!</p>
              <Link href="/" className="btn-primary inline-block">Explore Now</Link>
            </motion.div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {filteredFavorites.map((fav, idx) => (
                  <motion.div
                    key={fav.place_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: idx * 0.03 }}
                    layout
                  >
                    <div className="card overflow-hidden group relative">
                      <Link href={`/place/${fav.place_id}`}>
                        <div className="relative h-40 bg-[var(--bg-tertiary)]">
                          {fav.photo_reference ? (
                            <img src={api.photo(fav.photo_reference, 300)} alt={fav.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <svg className="w-12 h-12 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold line-clamp-1">{fav.name}</h3>
                          {fav.rating && (
                            <div className="flex items-center gap-1 mt-1">
                              <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              <span className="text-sm font-medium">{fav.rating.toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                      </Link>
                      <button
                        onClick={() => removeFav(fav.place_id)}
                        className="absolute top-2 right-2 w-8 h-8 rounded-lg bg-black/50 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(timelineGroups).reverse().map(([date, items]) => (
                <div key={date}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-3 h-3 rounded-full bg-[var(--accent-primary)]" />
                    <h3 className="font-semibold text-[var(--text-secondary)]">{date}</h3>
                    <div className="flex-1 h-px bg-[var(--border-color)]" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map((fav) => (
                      <motion.div key={fav.place_id} layout className="card overflow-hidden group">
                        <Link href={`/place/${fav.place_id}`}>
                          <div className="flex items-center gap-4 p-4">
                            <div className="w-16 h-16 rounded-xl bg-[var(--bg-tertiary)] flex-shrink-0 overflow-hidden">
                              {fav.photo_reference ? (
                                <img src={api.photo(fav.photo_reference, 100)} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <svg className="w-6 h-6 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-sm truncate">{fav.name}</h3>
                              {fav.rating && (
                                <div className="flex items-center gap-1 mt-0.5">
                                  <svg className="w-3.5 h-3.5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                  <span className="text-xs">{fav.rating.toFixed(1)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}