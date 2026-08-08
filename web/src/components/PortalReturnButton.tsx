import { PORTAL_HOME_URL } from "@/lib/portalUrl";

function ReportHubIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
      className="shrink-0 opacity-70"
    >
      <rect
        x="1.5"
        y="1.5"
        width="5"
        height="5"
        rx="0.75"
        stroke="currentColor"
        strokeWidth="1.25"
      />
      <rect
        x="9.5"
        y="1.5"
        width="5"
        height="5"
        rx="0.75"
        stroke="currentColor"
        strokeWidth="1.25"
      />
      <rect
        x="1.5"
        y="9.5"
        width="5"
        height="5"
        rx="0.75"
        stroke="currentColor"
        strokeWidth="1.25"
      />
      <rect
        x="9.5"
        y="9.5"
        width="5"
        height="5"
        rx="0.75"
        stroke="currentColor"
        strokeWidth="1.25"
      />
    </svg>
  );
}

type Props = {
  variant?: "desktop" | "mobile";
};

export function PortalReturnButton({ variant = "desktop" }: Props) {
  return (
    <a
      href={PORTAL_HOME_URL}
      className={
        variant === "mobile"
          ? "report-hub-link report-hub-link-mobile"
          : "report-hub-link report-hub-link-desktop"
      }
      aria-label="Return to report hub"
    >
      <ReportHubIcon />
      <span>Return to report hub</span>
    </a>
  );
}
