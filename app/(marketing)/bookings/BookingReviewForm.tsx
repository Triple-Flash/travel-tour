"use client";

import { useState, useTransition } from "react";
import { MessageSquarePlus, Pencil, Loader2, Star } from "lucide-react";
import {
  createReviewAction,
  updateReviewAction,
} from "./actions";

interface BookingReviewFormProps {
  tourId: string;
  existingReview:
    | {
        id: string;
        rating: number | null;
        comment: string | null;
      }
    | null;
}

export default function BookingReviewForm({
  tourId,
  existingReview,
}: BookingReviewFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(existingReview?.rating ?? 5);
  const [comment, setComment] = useState(existingReview?.comment ?? "");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    startTransition(async () => {
      const normalizedComment = comment.trim();
      const result = existingReview
        ? await updateReviewAction(tourId, {
            id: existingReview.id,
            rating,
            comment: normalizedComment,
          })
        : await createReviewAction({
            tour_id: tourId,
            rating,
            comment: normalizedComment,
          });

      if (!result.success) {
        setError(result.error);
        return;
      }

      setMessage(
        existingReview ? "Your review was updated." : "Your review was saved."
      );
      setIsOpen(true);
    });
  }

  return (
    <div className="w-full space-y-3">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="flex-1 sm:flex-none text-center rounded-xl bg-amber-500/10 px-6 py-3 font-bold text-amber-300 transition-all hover:bg-amber-500/20 hover:shadow-[0_0_20px_rgba(245,158,11,0.2)]"
      >
        <span className="inline-flex items-center gap-2">
          {existingReview ? <Pencil size={16} /> : <MessageSquarePlus size={16} />}
          {existingReview ? "Edit Review" : "Rate Tour"}
        </span>
      </button>

      {existingReview && !isOpen ? (
        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
          <div className="mb-2 flex items-center gap-1 text-amber-400">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star
                key={index}
                size={14}
                fill={index < (existingReview.rating ?? 0) ? "currentColor" : "none"}
              />
            ))}
          </div>
          {existingReview.comment ? (
            <p className="text-sm text-white/60">{existingReview.comment}</p>
          ) : (
            <p className="text-sm text-white/40">No written comment yet.</p>
          )}
        </div>
      ) : null}

      {isOpen ? (
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-xl border border-white/10 bg-white/[0.04] p-4"
        >
          <div>
            <p className="mb-3 text-sm font-medium text-white/70">Your rating</p>
            <div className="flex items-center gap-2">
              {Array.from({ length: 5 }).map((_, index) => {
                const value = index + 1;
                const active = value <= rating;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    className="rounded-full p-1 text-amber-400 transition-transform hover:scale-110"
                    aria-label={`Rate ${value} star${value > 1 ? "s" : ""}`}
                  >
                    <Star size={22} fill={active ? "currentColor" : "none"} />
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-white/70">
              Comment
            </label>
            <textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              rows={4}
              maxLength={2000}
              className="w-full resize-none rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition-all focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50"
              placeholder="Share what you liked about the trip..."
            />
          </div>

          {error ? <p className="text-sm text-rose-300">{error}</p> : null}
          {message ? <p className="text-sm text-emerald-300">{message}</p> : null}

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500/10 px-5 py-3 font-bold text-amber-300 transition-all hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Review"
              )}
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="inline-flex items-center justify-center rounded-xl bg-white/10 px-5 py-3 font-bold text-white/80 transition-all hover:bg-white/15"
            >
              Close
            </button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
