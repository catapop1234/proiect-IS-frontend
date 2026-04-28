"use client";

import { use } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import BlobBackground from "@/components/BlobBackground";
import { Place } from "@/types";

const API_BASE = "http://127.0.0.1:3099";

const PRICE_LEVELS = ["$", "$$", "$$$", "$$$$", "$$$$$"];

export default function DetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  
  const [place, setPlace] = useState<Place | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchPlace = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE}/api/place/${id}`);
        const data = await response.json();

        if (data.error) {
          setError(data.error);
        } else {
          setPlace(data);
        }
      } catch (err) {
        setError("Failed to connect to server.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlace();
  }, [id]);

  const handleImageError = (photoRef: string) => {
    setImageErrors((prev) => new Set(prev).add(photoRef));
  };

  const photos = place?.photos || [];
  const currentPhoto = photos[selectedPhotoIndex];
  const currentPhotoUrl = currentPhoto && !imageErrors.has(currentPhoto.photo_reference)
    ? `/api/photo?reference=${currentPhoto.photo_reference}&max_width=800`
    : null;

  return (
    <main className="min-h-screen relative overflow-hidden">
      <BlobBackground />
      <Navbar />

      <div className="pt-24 px-6 pb-12">
        <div className="max-w-5xl mx-auto">
          <motion.button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-6 transition-colors"
            whileHover={{ x: -4 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to results
          </motion.button>

          {loading ? (
            <div className="card p-8 space-y-6">
              <div className="h-8 bg-[var(--bg-tertiary)] rounded w-1/3 animate-pulse" />
              <div className="h-64 bg-[var(--bg-tertiary)] rounded animate-pulse" />
              <div className="space-y-3">
                <div className="h-4 bg-[var(--bg-tertiary)] rounded animate-pulse" />
                <div className="h-4 bg-[var(--bg-tertiary)] rounded w-3/4 animate-pulse" />
              </div>
            </div>
          ) : error ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="card p-8 text-center"
            >
              <svg
                className="w-16 h-16 mx-auto mb-4 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-xl font-semibold mb-2">Oops! Something went wrong</h2>
              <p className="text-[var(--text-secondary)]">{error}</p>
              <Link href="/" className="btn-primary inline-block mt-4">
                Go Home
              </Link>
            </motion.div>
          ) : place ? (
            <>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card overflow-hidden"
              >
                <div className="relative h-80 md:h-96 bg-[var(--bg-tertiary)]">
                  <AnimatePresence mode="wait">
                    {currentPhotoUrl ? (
                      <motion.img
                        key={currentPhoto.photo_reference}
                        src={currentPhotoUrl}
                        alt={place.name}
                        className="w-full h-full object-cover"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        onError={() => handleImageError(currentPhoto.photo_reference)}
                      />
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="w-full h-full flex items-center justify-center"
                      >
                        <svg
                          className="w-24 h-24 text-[var(--text-muted)]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {place.price_level && (
                    <div className="absolute bottom-4 left-4 px-4 py-2 rounded-xl bg-black/70 backdrop-blur-sm text-white text-lg font-medium">
                      {PRICE_LEVELS[place.price_level - 1] || "$"}
                    </div>
                  )}
                </div>

                {photos.length > 1 && (
                  <div className="flex gap-3 p-4 overflow-x-auto border-t border-[var(--border-color)]">
                    {photos.map((photo, index) => (
                      <button
                        key={photo.photo_reference}
                        onClick={() => setSelectedPhotoIndex(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                          index === selectedPhotoIndex
                            ? "border-[var(--accent-primary)]"
                            : "border-transparent opacity-60 hover:opacity-100"
                        }`}
                      >
                        <img
                          src={`/api/photo?reference=${photo.photo_reference}&max_width=100`}
                          alt={`Photo ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={() => handleImageError(photo.photo_reference)}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mt-8 space-y-6"
              >
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold mb-3">{place.name}</h1>
                  
                  {place.address && (
                    <p className="text-lg text-[var(--text-secondary)] flex items-start gap-2">
                      <svg className="w-5 h-5 mt-1 flex-shrink-0 text-[var(--accent-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {place.address}
                    </p>
                  )}
                </div>

                {place.rating && (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <span className="text-2xl font-bold">{place.rating.toFixed(1)}</span>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-5 h-5 ${
                              i < Math.round(place.rating || 0)
                                ? "text-yellow-500"
                                : "text-[var(--text-muted)]"
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    <span className="text-[var(--text-secondary)]">
                      ({place.user_ratings_total} reviews)
                    </span>
                  </div>
                )}

                {place.opening_hours_weekday_text && place.opening_hours_weekday_text.length > 0 && (
                  <div className="card p-6">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-[var(--accent-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Opening Hours
                    </h2>
                    <ul className="space-y-2">
                      {place.opening_hours_weekday_text.map((hours, index) => (
                        <li key={index} className="text-[var(--text-secondary)]">
                          {hours}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {place.formatted_phone_number && (
                    <a
                      href={`tel:${place.formatted_phone_number}`}
                      className="card p-5 flex items-center gap-4 hover:border-[var(--accent-primary)] transition-colors"
                    >
                      <div className="w-12 h-12 rounded-xl bg-[var(--accent-primary)]/10 flex items-center justify-center">
                        <svg className="w-6 h-6 text-[var(--accent-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-[var(--text-muted)]">Phone</p>
                        <p className="font-medium">{place.formatted_phone_number}</p>
                      </div>
                    </a>
                  )}

                  {place.website && (
                    <a
                      href={place.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="card p-5 flex items-center gap-4 hover:border-[var(--accent-primary)] transition-colors"
                    >
                      <div className="w-12 h-12 rounded-xl bg-[var(--accent-primary)]/10 flex items-center justify-center">
                        <svg className="w-6 h-6 text-[var(--accent-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-[var(--text-muted)]">Website</p>
                        <p className="font-medium truncate max-w-[200px]">Visit Website</p>
                      </div>
                    </a>
                  )}

                  {place.url && (
                    <a
                      href={place.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="card p-5 flex items-center gap-4 hover:border-[var(--accent-primary)] transition-colors"
                    >
                      <div className="w-12 h-12 rounded-xl bg-[var(--accent-primary)]/10 flex items-center justify-center">
                        <svg className="w-6 h-6 text-[var(--accent-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-[var(--text-muted)]">Google Maps</p>
                        <p className="font-medium">View on Maps</p>
                      </div>
                    </a>
                  )}
                </div>
              </motion.div>
            </>
          ) : null}
        </div>
      </div>
    </main>
  );
}