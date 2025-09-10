import { PropsWithChildren, useEffect } from "react";

export function ThemeProvider({ children }: PropsWithChildren) {
  // Light-only for now (tokens already in globals.css)
  useEffect(() => {
    document.documentElement.classList.remove("dark");
  }, []);
  return <>{children}</>;
}
