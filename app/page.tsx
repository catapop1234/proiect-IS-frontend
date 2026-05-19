"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import BlobBackground from "@/components/BlobBackground";
import { useAuth } from "@/app/providers";
import { api } from "@/lib/api";
import PlaceCard from "@/components/PlaceCard";

type PlaceType = "hotels" | "restaurants" | "attractions";

const PLACE_TYPES: { value: PlaceType; label: string; icon: string }[] = [
  { value: "hotels", label: "Hotels", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10.658V19.5a2 2 0 012-2h6a2 2 0 012 2v2.158" },
  { value: "restaurants", label: "Restaurants", icon: "M12 6v6m0 0v6m0-6h6m-6 0H6M3 12a9 9 0 1118 0 9 9 0 01-18 0z" },
  { value: "attractions", label: "Attractions", icon: "M15 5v2m0-2v2m0-2v2M5 15h2m-2 0h-2m0-2H3m2 2h2m-2-4h2m-2 0h-2m0 2h2m4-2h2m-2 0h-2m0-2h2m-2 4h2m-2 0h-2m6 6h2m-2 0h-2m0-2h2M5 21h2m-2 0H3" },
];

export default function SearchPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [city, setCity] = useState("");
  const [placeType, setPlaceType] = useState<PlaceType>("hotels");
  const [radius, setRadius] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [historyItems, setHistoryItems] = useState<{ city: string; type: string }[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [recBasedOn, setRecBasedOn] = useState<{ city: string; type: string } | null>(null);
  const historyRef = useRef<HTMLDivElement>(null);
  const cityRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      api.getHistory().then((data) => {
        const items = (data.items || []).map((i: any) => ({ city: i.city, type: i.type }));
        const seen = new Set<string>();
        setHistoryItems(items.filter((i: any) => {
          const key = `${i.city}|${i.type}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        }));
      });
      api.recommendations().then((data) => {
        if (data.results?.length) {
          setRecommendations(data.results.slice(0, 6));
          setRecBasedOn(data.based_on || null);
        }
      });
    }
  }, [user]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (historyRef.current && !historyRef.current.contains(e.target as Node) &&
          cityRef.current && !cityRef.current.contains(e.target as Node)) {
        setShowHistory(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSearch = useCallback((searchCity?: string, searchType?: string) => {
    const c = searchCity || city.trim();
    const t = searchType || placeType;
    if (!c) return;
    setIsLoading(true);
    if (user) {
      api.saveHistory({ city: c, type: t, radius });
    }
    router.push(`/results?city=${encodeURIComponent(c)}&type=${t}&radius=${radius}`);
  }, [city, placeType, radius, router, user]);

  return (
    <main className="min-h-screen relative overflow-hidden">
      <BlobBackground />
      <Navbar />

      <div className="pt-32 px-6 pb-16">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              <span className="gradient-text">Discover</span> Your Next
              <br />
              Adventure
            </h1>
            <p className="text-xl text-[var(--text-secondary)]">
              Find the best hotels, restaurants, and attractions near you
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="card p-8"
          >
            <div className="space-y-6">
              <div className="relative">
                <label className="block text-sm font-medium mb-2 text-[var(--text-secondary)]">Where do you want to go?</label>
                <input
                  ref={cityRef}
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  onFocus={() => user && historyItems.length > 0 && setShowHistory(true)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="Enter a city..."
                  className="input-field w-full text-lg"
                />
                {showHistory && historyItems.length > 0 && (
                  <motion.div
                    ref={historyRef}
                    className="absolute z-20 mt-1 w-full card p-2 max-h-48 overflow-y-auto"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <p className="text-xs text-[var(--text-muted)] px-3 py-1">Recent searches</p>
                    {historyItems.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => { setCity(item.city); setPlaceType(item.type as PlaceType); setShowHistory(false); handleSearch(item.city, item.type); }}
                        className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-[var(--bg-tertiary)] transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <svg className="w-4 h-4 text-[var(--text-muted)] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-[var(--text-primary)]">{item.city}</span>
                        <span className="text-[var(--text-muted)] text-xs capitalize">({item.type})</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-3 text-[var(--text-secondary)]">What are you looking for?</label>
                <div className="grid grid-cols-3 gap-3">
                  {PLACE_TYPES.map((type) => (
                    <motion.button
                      key={type.value}
                      onClick={() => setPlaceType(type.value)}
                      className={`p-4 rounded-xl border transition-all duration-300 ${
                        placeType === type.value
                          ? "border-[var(--accent-primary)] bg-[var(--accent-primary)]/10"
                          : "border-[var(--border-color)] hover:border-[var(--accent-primary)]/50"
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <svg className={`w-6 h-6 mx-auto mb-2 ${placeType === type.value ? "text-[var(--accent-primary)]" : "text-[var(--text-muted)]"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={type.icon} />
                      </svg>
                      <span className={`text-sm font-medium block ${placeType === type.value ? "text-[var(--accent-primary)]" : "text-[var(--text-secondary)]"}`}>{type.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3 text-[var(--text-secondary)]">
                  Search radius: <span className="text-[var(--accent-primary)] font-bold">{radius} km</span>
                </label>
                <input type="range" min="1" max="50" value={radius} onChange={(e) => setRadius(Number(e.target.value))} className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-[var(--bg-tertiary)] accent-[var(--accent-primary)]" />
                <div className="flex justify-between text-xs text-[var(--text-muted)] mt-1"><span>1 km</span><span>25 km</span><span>50 km</span></div>
              </div>

              <motion.button
                onClick={() => handleSearch()}
                disabled={!city.trim() || isLoading}
                className="btn-primary w-full py-4 text-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Searching...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Search
                  </span>
                )}
              </motion.button>
            </div>
          </motion.div>

          {user && recommendations.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-12 p-8 rounded-2xl relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(236,72,153,0.15) 100%)",
                border: "1px solid rgba(99,102,241,0.2)",
              }}
            >
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold gradient-text">Recommended for You</h2>
                    {recBasedOn && (
                      <p className="text-sm text-[var(--text-secondary)] mt-1">
                        Based on your search for {recBasedOn.type} in {recBasedOn.city}
                      </p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recommendations.map((place: any, idx: number) => (
                    <Link key={place.place_id} href={`/place/${place.place_id}`}>
                      <motion.div
                        className="card overflow-hidden cursor-pointer group"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        whileHover={{ y: -4, transition: { duration: 0.2 } }}
                      >
                        <div className="relative h-32 bg-[var(--bg-tertiary)] overflow-hidden">
                          {place.photos?.[0]?.photo_reference ? (
                            <img
                              src={api.photo(place.photos[0].photo_reference, 300)}
                              alt={place.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <svg className="w-10 h-10 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-sm mb-1 line-clamp-1">{place.name}</h3>
                          {place.rating && (
                            <div className="flex items-center gap-1">
                              <svg className="w-3.5 h-3.5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              <span className="text-xs font-medium">{place.rating.toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </main>
  );
}