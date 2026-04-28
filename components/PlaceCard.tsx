"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Place, PlacePhoto } from "@/types";
import { useState } from "react";

const PRICE_LEVELS = ["$", "$$", "$$$", "$$$$", "$$$$$"];

interface PlaceCardProps {
  place: Place;
  index: number;
}

export default function PlaceCard({ place, index }: PlaceCardProps) {
  const [imageError, setImageError] = useState(false);
  
  const photoRef = place.photos?.[0]?.photo_reference;
  const imageUrl = photoRef
    ? `/api/photo?reference=${photoRef}&max_width=400`
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link href={`/place/${place.place_id}`}>
        <article className="card overflow-hidden cursor-pointer h-full flex flex-col">
          <div className="relative h-48 bg-[var(--bg-tertiary)] overflow-hidden">
            {imageUrl && !imageError ? (
              <img
                src={imageUrl}
                alt={place.name}
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg
                  className="w-16 h-16 text-[var(--text-muted)]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            )}
            
            {place.price_level && (
              <div className="absolute bottom-3 left-3 px-3 py-1 rounded-lg bg-black/70 backdrop-blur-sm text-white text-sm font-medium">
                {PRICE_LEVELS[place.price_level - 1] || "$"}
              </div>
            )}
          </div>

          <div className="p-5 flex-1 flex flex-col">
            <h3 className="font-semibold text-lg mb-2 line-clamp-1">
              {place.name}
            </h3>

            {place.address && (
              <p className="text-sm text-[var(--text-muted)] mb-3 line-clamp-2 flex-1">
                {place.address}
              </p>
            )}

            <div className="flex items-center justify-between mt-auto pt-3 border-t border-[var(--border-color)]">
              {place.rating ? (
                <div className="flex items-center gap-1">
                  <svg
                    className="w-4 h-4 text-yellow-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="font-medium">{place.rating.toFixed(1)}</span>
                  <span className="text-sm text-[var(--text-muted)]">
                    ({place.user_ratings_total})
                  </span>
                </div>
              ) : (
                <span className="text-sm text-[var(--text-muted)]">No ratings yet</span>
              )}

              <svg
                className="w-5 h-5 text-[var(--text-muted)]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </div>
        </article>
      </Link>
    </motion.div>
  );
}