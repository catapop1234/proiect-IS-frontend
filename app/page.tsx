"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import BlobBackground from "@/components/BlobBackground";

type PlaceType = "hotels" | "restaurants" | "attractions";

const PLACE_TYPES: { value: PlaceType; label: string; icon: string }[] = [
  { value: "hotels", label: "Hotels", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10.658V19.5a2 2 0 012-2h6a2 2 0 012 2v2.158" },
  { value: "restaurants", label: "Restaurants", icon: "M12 6v6m0 0v6m0-6h6m-6 0H6M3 12a9 9 0 1118 0 9 9 0 01-18 0z" },
  { value: "attractions", label: "Attractions", icon: "M15 5v2m0-2v2m0-2v2M5 15h2m-2 0h-2m0-2H3m2 2h2m-2-4h2m-2 0h-2m0 2h2m4-2h2m-2 0h-2m0-2h2m-2 4h2m-2 0h-2m6 6h2m-2 0h-2m0-2h2M5 21h2m-2 0H3" },
];

export default function SearchPage() {
  const router = useRouter();
  const [city, setCity] = useState("");
  const [placeType, setPlaceType] = useState<PlaceType>("hotels");
  const [radius, setRadius] = useState(10);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    if (!city.trim()) return;
    
    setIsLoading(true);
    const params = new URLSearchParams({
      city: city.trim(),
      type: placeType,
      radius: radius.toString(),
    });
    
    router.push(`/results?${params.toString()}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <main className="min-h-screen relative overflow-hidden">
      <BlobBackground />
      <Navbar />
      
      <div className="pt-32 px-6">
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
              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--text-secondary)]">
                  Where do you want to go?
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter a city..."
                  className="input-field w-full text-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-3 text-[var(--text-secondary)]">
                  What are you looking for?
                </label>
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
                      <svg
                        className={`w-6 h-6 mx-auto mb-2 ${
                          placeType === type.value
                            ? "text-[var(--accent-primary)]"
                            : "text-[var(--text-muted)]"
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d={type.icon}
                        />
                      </svg>
                      <span
                        className={`text-sm font-medium block ${
                          placeType === type.value
                            ? "text-[var(--accent-primary)]"
                            : "text-[var(--text-secondary)]"
                        }`}
                      >
                        {type.label}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3 text-[var(--text-secondary)]">
                  Search radius: <span className="text-[var(--accent-primary)] font-bold">{radius} km</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={radius}
                  onChange={(e) => setRadius(Number(e.target.value))}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-[var(--bg-tertiary)] accent-[var(--accent-primary)]"
                />
                <div className="flex justify-between text-xs text-[var(--text-muted)] mt-1">
                  <span>1 km</span>
                  <span>25 km</span>
                  <span>50 km</span>
                </div>
              </div>

              <motion.button
                onClick={handleSearch}
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
        </div>
      </div>
    </main>
  );
}