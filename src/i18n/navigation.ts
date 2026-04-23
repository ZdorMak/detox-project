import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

// Locale-aware Link / redirect / hooks. Use these instead of `next/link`
// when navigating between localized pages so the prefix is applied automatically.
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
