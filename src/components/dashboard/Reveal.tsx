import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useMotionPreference } from "@/hooks/use-motion-preference";

/** Card de vidro com entrada em cascata (fade + translateY 8px, 40ms de stagger). */
export function Reveal({
  index = 0,
  className,
  children,
  as = "section",
  ...rest
}: {
  index?: number;
  className?: string;
  children: ReactNode;
  as?: "section" | "article" | "div";
  "aria-labelledby"?: string;
  id?: string;
}) {
  const Comp = motion[as];
  const reduce = useMotionPreference();
  return (
    <Comp
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
      className={cn("glass p-5", className)}
      {...rest}
    >
      {children}
    </Comp>
  );
}
