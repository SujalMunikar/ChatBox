import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Small utility that merges conditional class names while letting tailwind-merge resolve conflicts.
export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};
