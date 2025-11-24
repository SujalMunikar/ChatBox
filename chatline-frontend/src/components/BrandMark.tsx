// Compact logotype used in the navbar and authentication views.
import { cn } from "../helper/tailwindMergeClass.helper";

interface BrandMarkProps {
  className?: string;
}

export default function BrandMark({ className }: BrandMarkProps) {
  return (
    <span
      className={cn(
        "flex items-center gap-3 text-primary-text-color",
        className
      )}
    >
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-sky-500 via-indigo-500 to-purple-500 text-base font-black uppercase tracking-tight text-white">
        C
      </span>
      <span className="leading-tight">
        <span className="block text-xs font-semibold uppercase tracking-[0.48em] text-slate-400 dark:text-slate-500">
          chatline
        </span>
        <span className="block text-[22px] font-extrabold tracking-tight">
          <span className="bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent">
            Chat
          </span>
          <span className="text-primary-accent-color">line</span>
        </span>
      </span>
    </span>
  );
}
