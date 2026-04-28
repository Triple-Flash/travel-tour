"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Heart, Loader2 } from "lucide-react";
import { addToWishlistAction, removeFromWishlistAction } from "./actions";

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
        aria-label="Đăng nhập để thêm vào yêu thích"
        title="Đăng nhập để thêm vào yêu thích"
        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-pink-500/30 bg-pink-500/10 text-pink-300 backdrop-blur-sm transition-all hover:scale-105 hover:bg-pink-500/20 hover:text-white"
      >
        <Heart size={14} />
      </Link>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={toggleFavorite}
        disabled={isPending}
        aria-label={
          isFavorite ? "Bỏ khỏi danh sách yêu thích" : "Thêm vào danh sách yêu thích"
        }
        title={
          isFavorite ? "Bỏ khỏi danh sách yêu thích" : "Thêm vào danh sách yêu thích"
        }
        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-pink-500/30 bg-pink-500/10 text-pink-300 backdrop-blur-sm transition-all hover:scale-105 hover:bg-pink-500/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <Heart size={14} fill={isFavorite ? "currentColor" : "none"} />
        )}
      </button>

      {error ? (
        <p className="absolute left-0 top-[calc(100%+0.5rem)] min-w-max text-xs text-rose-300">
          {error}
        </p>
      ) : null}
    </div>
  );
}
