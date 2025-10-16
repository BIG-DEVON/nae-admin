import { useEffect, useMemo, useState } from "react";
import { cn } from "@/utils/cn";

type SmartImageProps = {
  /** Image URL (can be null/undefined) */
  src?: string | null;
  alt?: string;
  /** Wrapper classes (size, border, rounding, etc.) */
  className?: string;
  /** <img> classes; useful to tweak object-fit, etc. */
  imgClassName?: string;
  /** If true, append a short cache-busting query to avoid stale signed URLs */
  cacheBust?: boolean;
  /** Retries on load error (default 1) */
  maxRetries?: number;
  /** Optional custom fallback node (else a neutral placeholder) */
  fallback?: React.ReactNode;
};

export default function SmartImage({
  src,
  alt = "",
  className,
  imgClassName,
  cacheBust = true,
  maxRetries = 1,
  fallback,
}: SmartImageProps) {
  const [tries, setTries] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  // Normalize / cache-bust URL
  const url = useMemo(() => {
    if (!src || typeof src !== "string" || src.trim() === "") return "";
    if (!cacheBust) return src;
    const sep = src.includes("?") ? "&" : "?";
    // Keep it short; avoids breaking signed URLs while still refreshing previews
    return `${src}${sep}rb=${Date.now().toString().slice(-6)}`;
  }, [src, cacheBust, tries]);

  useEffect(() => {
    setLoaded(false);
    setErrored(false);
    setTries(0);
  }, [src]);

  const onError = () => {
    if (tries < maxRetries) {
      setTries((t) => t + 1);
      setLoaded(false);
      setErrored(false);
    } else {
      setErrored(true);
    }
  };

  // Default fallback (subtle checker + icon-esque dot)
  const defaultFallback = (
    <div className="flex h-full w-full items-center justify-center rounded-md border bg-neutral-50 text-neutral-400">
      <div className="flex items-center gap-2 text-xs">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-neutral-300" />
        No image
      </div>
    </div>
  );

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md border bg-white",
        // subtle elevation + shadow
        "shadow-sm",
        className
      )}
      aria-busy={!loaded && !errored}
    >
      {/* Skeleton / shimmer while loading */}
      {!loaded && !errored && (
        <div
          className={cn(
            "absolute inset-0 animate-pulse",
            "bg-[linear-gradient(110deg,rgba(0,0,0,0.04)_8%,rgba(0,0,0,0.08)_18%,rgba(0,0,0,0.04)_33%)]",
            "bg-[length:200%_100%]"
          )}
          style={{ animationDuration: "1.2s" }}
        />
      )}

      {/* Image or fallback */}
      {url && !errored ? (
        <img
          src={url}
          alt={alt}
          loading="lazy"
          decoding="async"
          // Fade in once loaded, keep object-cover by default
          className={cn(
            "h-full w-full object-cover transition-opacity duration-300",
            loaded ? "opacity-100" : "opacity-0",
            imgClassName
          )}
          onLoad={() => setLoaded(true)}
          onError={onError}
        />
      ) : (
        fallback ?? defaultFallback
      )}
    </div>
  );
}
