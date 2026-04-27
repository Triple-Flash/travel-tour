"use client";

import { useState, useTransition } from "react";
import { Loader2, Save } from "lucide-react";
import { updateProfileAction } from "./actions";

interface ProfileSettingsFormProps {
  fullName: string;
  email: string;
  phoneNumber: string | null;
}

export default function ProfileSettingsForm({
  fullName,
  email,
  phoneNumber,
}: ProfileSettingsFormProps) {
  const [name, setName] = useState(fullName);
  const [phone, setPhone] = useState(phoneNumber ?? "");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);

    startTransition(async () => {
      const result = await updateProfileAction({
        full_name: name.trim(),
        phone_number: phone.trim() ? phone.trim() : null,
      });

      if (result.success) {
        setName(result.data.full_name);
        setPhone(result.data.phone_number ?? "");
        setMessage("Thong tin cua ban da duoc cap nhat.");
        return;
      }

      setError(result.error);
    });
  }

  return (
    <form className="space-y-8" onSubmit={handleSubmit}>
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-white/70">
             Họ & tên
            </label>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white outline-none transition-all focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50"
              required
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-white/70">
              Email đăng nhập
            </label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full cursor-not-allowed rounded-xl border border-white/5 bg-black/30 px-4 py-3 text-white/40 outline-none"
            />
            <p className="mt-1.5 text-xs text-white/40">
              Email không thể thay đổi đối với tài khoản liên kết với google
            </p>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-white/70">
            Số điện thoại liên hệ
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="Chua cap nhat"
            className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white outline-none transition-all focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50"
          />
        </div>
      </div>

      {(message || error) && (
        <div
          className={
            error
              ? "rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300"
              : "rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300"
          }
        >
          {error ?? message}
        </div>
      )}

      <div className="flex justify-end border-t border-white/10 pt-6">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-xl bg-cyan-500/10 px-8 py-3 text-sm font-bold text-cyan-400 transition-all hover:bg-cyan-500/20 hover:shadow-[0_0_20px_rgba(6,182,212,0.2)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Dang luu...
            </>
          ) : (
            <>
              <Save size={16} />
              Luu thay doi
            </>
          )}
        </button>
      </div>
    </form>
  );
}
