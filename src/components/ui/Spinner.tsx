type Props = {
  size?: number;      // pixel size
  className?: string; // extra tailwind classes if you want
};

export default function Spinner({ size = 20, className = "" }: Props) {
  const s = `${size}px`;
  return (
    <span
      role="status"
      aria-label="loading"
      className={`inline-block animate-spin ${className}`}
      style={{
        width: s,
        height: s,
        borderWidth: Math.max(2, Math.round(size / 10)),
        borderStyle: "solid",
        borderColor: "rgba(0,0,0,0.15)",
        borderTopColor: "rgba(0,0,0,0.6)",
        borderRadius: "9999px",
      }}
    />
  );
}
