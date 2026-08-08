const PORTAL_HOME_URL =
  process.env.NEXT_PUBLIC_PORTAL_URL?.trim() || "https://report.ugsot.com";

type Props = {
  variant?: "desktop" | "mobile";
};

export function PortalReturnButton({ variant = "desktop" }: Props) {
  if (variant === "mobile") {
    return (
      <a
        href={PORTAL_HOME_URL}
        className="mobile-header-portal-btn"
        aria-label="Return to Report hub"
      >
        Report hub
      </a>
    );
  }

  return (
    <a
      href={PORTAL_HOME_URL}
      className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/8 px-2.5 py-1.5 text-[0.72rem] font-semibold text-white/90 hover:bg-white/12 transition"
      aria-label="Return to Report hub"
    >
      Report hub
    </a>
  );
}
