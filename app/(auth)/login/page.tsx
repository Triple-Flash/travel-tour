import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  return (
    <div style={styles.root}>
      {/* ── Animated background blobs ───────────────────────── */}
      <div style={styles.blob1} />
      <div style={styles.blob2} />
      <div style={styles.blob3} />

      {/* ── Card ────────────────────────────────────────────── */}
      <main style={styles.card} id="login-card">
        {/* Logo / brand */}
        <div style={styles.logoRow}>
          <span style={styles.logoIcon}>✈</span>
          <span style={styles.logoText}>TravelTour</span>
        </div>

        <h1 style={styles.heading}>Welcome back</h1>
        <p style={styles.subheading}>
          Sign in to access your bookings, wish‑lists, and personalised
          recommendations.
        </p>

        {/* Google sign-in (client component) */}
        <GoogleSignInButton />

        {/* Error message */}
        <ErrorBanner searchParams={searchParams} />

        {/* Divider */}
        <div style={styles.divider}>
          <span style={styles.dividerLine} />
          <span style={styles.dividerText}>secure sign‑in</span>
          <span style={styles.dividerLine} />
        </div>

        {/* Trust badges */}
        <div style={styles.badges}>
          <span style={styles.badge}>🔒 SSL encrypted</span>
          <span style={styles.badge}>🛡 No password stored</span>
        </div>

        <p style={styles.terms}>
          By continuing you agree to our{" "}
          <a href="/terms" style={styles.link}>
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="/privacy" style={styles.link}>
            Privacy Policy
          </a>
          .
        </p>
      </main>
    </div>
  );
}

/* ── Async error banner ─────────────────────────────────────── */
async function ErrorBanner({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  if (!error) return null;

  const messages: Record<string, string> = {
    auth_callback_error: "Authentication failed. Please try again.",
    oauth_error: "Could not connect to Google. Please try again.",
  };

  return (
    <div style={styles.errorBanner} role="alert" aria-live="polite">
      ⚠ {messages[error] ?? "An unexpected error occurred."}
    </div>
  );
}

/* ── Inline styles ──────────────────────────────────────────── */
const styles: Record<string, React.CSSProperties> = {
  root: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background:
      "linear-gradient(135deg, #0f0c29 0%, #1a1040 50%, #0d1b4b 100%)",
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    position: "relative",
    overflow: "hidden",
    padding: "24px",
  },
  blob1: {
    position: "absolute",
    top: "-15%",
    left: "-10%",
    width: "500px",
    height: "500px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(99,102,241,0.35) 0%, transparent 70%)",
    filter: "blur(60px)",
    pointerEvents: "none",
  },
  blob2: {
    position: "absolute",
    bottom: "-20%",
    right: "-10%",
    width: "600px",
    height: "600px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%)",
    filter: "blur(80px)",
    pointerEvents: "none",
  },
  blob3: {
    position: "absolute",
    top: "40%",
    left: "55%",
    width: "300px",
    height: "300px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(59,130,246,0.25) 0%, transparent 70%)",
    filter: "blur(50px)",
    pointerEvents: "none",
  },
  card: {
    position: "relative",
    zIndex: 10,
    width: "100%",
    maxWidth: "420px",
    background: "rgba(255,255,255,0.05)",
    backdropFilter: "blur(24px)",
    WebkitBackdropFilter: "blur(24px)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "24px",
    padding: "48px 40px",
    boxShadow: "0 32px 80px rgba(0,0,0,0.5)",
    textAlign: "center",
  },
  logoRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    marginBottom: "28px",
  },
  logoIcon: {
    fontSize: "28px",
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  logoText: {
    fontSize: "22px",
    fontWeight: 700,
    background: "linear-gradient(135deg, #a5b4fc, #e0e7ff)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    letterSpacing: "-0.3px",
  },
  heading: {
    margin: "0 0 10px",
    fontSize: "28px",
    fontWeight: 700,
    color: "#f1f5f9",
    letterSpacing: "-0.5px",
  },
  subheading: {
    margin: "0 0 32px",
    fontSize: "14px",
    color: "rgba(226,232,240,0.65)",
    lineHeight: 1.6,
  },
  errorBanner: {
    marginTop: "16px",
    padding: "12px 16px",
    borderRadius: "10px",
    background: "rgba(239,68,68,0.15)",
    border: "1px solid rgba(239,68,68,0.3)",
    color: "#fca5a5",
    fontSize: "13px",
  },
  divider: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    margin: "28px 0 16px",
  },
  dividerLine: {
    flex: 1,
    height: "1px",
    background: "rgba(255,255,255,0.1)",
  },
  dividerText: {
    fontSize: "11px",
    color: "rgba(148,163,184,0.6)",
    textTransform: "uppercase",
    letterSpacing: "1px",
    whiteSpace: "nowrap",
  },
  badges: {
    display: "flex",
    justifyContent: "center",
    gap: "12px",
    flexWrap: "wrap",
    marginBottom: "24px",
  },
  badge: {
    fontSize: "12px",
    color: "rgba(148,163,184,0.7)",
    background: "rgba(255,255,255,0.05)",
    padding: "4px 10px",
    borderRadius: "20px",
    border: "1px solid rgba(255,255,255,0.08)",
  },
  terms: {
    fontSize: "12px",
    color: "rgba(148,163,184,0.55)",
    lineHeight: 1.6,
    margin: 0,
  },
  link: {
    color: "#a5b4fc",
    textDecoration: "none",
  },
};
