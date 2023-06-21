import type { ReactNode } from "react";

export function Paragraph({ children }: { children: ReactNode }) {
  return (
    <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
      {children}
    </p>
  );
}
