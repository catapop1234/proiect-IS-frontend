"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, use } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import BlobBackground from "@/components/BlobBackground";
import PlaceCard from "@/components/PlaceCard";
import { Place } from "@/types";
import { api } from "@/lib/api";
import { useAuth } from "@/app/providers";

const TYPE_LABELS: Record<string, string> = {
  hotels: "Hotels", restaurants: "Restaurants", attractions: "Attractions",
};

export default function ResultsPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const params = use(searchParams);
  const city = typeof params.city === "string" ? params.city : "";
  const type = typeof params.type === "string" ? params.type : "hotels";
  const radius = typeof params.radius === "string" ? parseInt(params.radius) : 10;
  const { user } = useAuth();

  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [displayCount, setDisplayCount] = useState(10);

  useEffect(() => {
    const fetchPlaces = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.search(type, { city, radius });
        if (data.error) {
          setError(data.error);
        } else {
          setPlaces(data.results || []);
          setNextPageToken(data.next_page_token || null);
        }
      } catch {
        setError("Failed to connect to server.");
      }
      setLoading(false);
    };
    if (city) fetchPlaces();
  }, [city, type, radius]);

  const loadMore = async () => {
    if (!nextPageToken || loadingMore) return;
    setLoadingMore(true);
    try {
      const data = await api.search(type, { city, radius, page_token: nextPageToken });
      if (data.results) {
        setPlaces((prev) => [...prev, ...data.results]);
        setNextPageToken(data.next_page_token || null);
      }
    } catch { /* ignore */ }
    setLoadingMore(false);
  };

  const displayedPlaces = places.slice(0, displayCount);
  const hasMore = places.length > displayCount || (nextPageToken && places.length > displayCount);

  return (
    <main className="min-h-screen relative overflow-hidden">
      <BlobBackground />
      <Navbar />
      <div className="pt-24 px-6 pb-12">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              {TYPE_LABELS[type] || "Places"} in <span className="gradient-text">{city}</span>
            </h1>
            <p className="text-[var(--text-secondary)]">{places.length} results found within {radius} km</p>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card p-0 overflow-hidden">
                  <div className="h-48 bg-[var(--bg-tertiary)] animate-pulse" />
                  <div className="p-5 space-y-3">
                    <div className="h-6 bg-[var(--bg-tertiary)] rounded animate-pulse" />
                    <div className="h-4 bg-[var(--bg-tertiary)] rounded w-3/4 animate-pulse" />
                    <div className="h-4 bg-[var(--bg-tertiary)] rounded w-1/2 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-8 text-center">
              <svg className="w-16 h-16 mx-auto mb-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-xl font-semibold mb-2">Oops! Something went wrong</h2>
              <p className="text-[var(--text-secondary)]">{error}</p>
            </motion.div>
          ) : places.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-8 text-center">
              <svg className="w-16 h-16 mx-auto mb-4 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h2 className="text-xl font-semibold mb-2">No results found</h2>
              <p className="text-[var(--text-secondary)]">Try searching for a different city or adjusting your filters</p>
            </motion.div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedPlaces.map((place, index) => (
                  <PlaceCard key={place.place_id} place={place} index={index} />
                ))}
              </div>
              {hasMore && (
                <div className="text-center mt-10">
                  <motion.button
                    onClick={() => {
                      setDisplayCount((prev) => prev + 10);
                      if (displayCount + 10 >= places.length && nextPageToken) loadMore();
                    }}
                    className="btn-primary px-8"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={loadingMore}
                  >
                    {loadingMore ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Loading...
                      </span>
                    ) : "Load More"}
                  </motion.button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}