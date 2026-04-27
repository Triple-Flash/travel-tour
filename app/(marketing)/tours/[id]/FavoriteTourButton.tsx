"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Heart, Loader2 } from "lucide-react";
import {
  addToWishlistAction,
  removeFromWishlistAction,
} from "./actions";

interface FavoriteTourButtonProps {
  tourId: string;
  initialIsFavorite: boolean;
  isSignedIn: boolean;
}

export default function FavoriteTourButton({
  tourId,
  initialIsFavorite,
  isSignedIn,
}: FavoriteTourButtonProps) {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function toggleFavorite() {
    setError(null);

    startTransition(async () => {
      const nextFavorite = !isFavorite;
      const result = nextFavorite
        ? await addToWishlistAction({ tour_id: tourId })
        : await removeFromWishlistAction({ tour_id: tourId });

      if (result.success) {
        setIsFavorite(nextFavorite);
        return;
      }

      setError(result.error);
    });
  }

  if (!isSignedIn) {
    return (
      <Link
        href="/login"
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-pink-500/30 bg-pink-500/10 px-6 py-3 font-bold text-pink-300 transition-all hover:bg-pink-500/20 hover:text-white"
      >
        <Heart size={18} />
        Add to favorites
      </Link>
    );
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={toggleFavorite}
        disabled={isPending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-pink-500/30 bg-pink-500/10 px-6 py-3 font-bold text-pink-300 transition-all hover:bg-pink-500/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <Heart size={18} fill={isFavorite ? "currentColor" : "none"} />
        )}
        {isFavorite ? "Saved to favorites" : "Add to favorites"}
      </button>

      {error ? <p className="text-sm text-rose-300">{error}</p> : null}
    </div>
  );
}
