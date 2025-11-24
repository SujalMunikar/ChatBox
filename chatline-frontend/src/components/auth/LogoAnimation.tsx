// Decorative hero animation used across auth pages.
export default function LogoAnimation() {
  return (
    <div className="relative flex h-[300px] w-[300px] items-center justify-center sm:h-[320px] sm:w-[320px]">
      <div className="absolute inset-0 rounded-[42px] bg-gradient-to-br from-blue-500/20 via-sky-400/10 to-purple-500/10 blur-3xl" />

      {/* Floating chat bubble card. */}
      <div className="absolute -left-3 top-10 floating-slow">
        <div className="relative h-16 w-28 rounded-3xl bg-gradient-to-r from-sky-400 to-indigo-400 shadow-lg shadow-sky-400/40">
          <div className="absolute -bottom-2 left-6 h-6 w-6 rotate-45 rounded-lg bg-gradient-to-br from-sky-400 to-indigo-400" />
          <div className="absolute left-5 top-4 h-2 w-6 rounded-full bg-white/80" />
          <div className="absolute left-16 top-4 h-2 w-7 rounded-full bg-white/60" />
        </div>
      </div>

      {/* Floating notification tile. */}
      <div className="absolute right-2 top-2 floating-medium">
        <div className="relative grid h-20 w-20 place-items-center rounded-[28px] bg-gradient-to-br from-fuchsia-400 via-purple-400 to-indigo-500 shadow-xl shadow-purple-500/40">
          <div className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full border border-white/70 bg-white/20 text-sm font-semibold text-white backdrop-blur-sm">
            +
          </div>
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-9 w-9 text-white drop-shadow"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path
              d="M5 7.75A3.75 3.75 0 0 1 8.75 4h6.5A3.75 3.75 0 0 1 19 7.75v5a3.75 3.75 0 0 1-3.75 3.75H11.2l-2.7 2.4c-.54.48-1.5.12-1.5-.62v-1.78H8.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="m8.8 10.8 3.1 2.1 3.1-2.1" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {/* Expressive emoji bubble. */}
      <div className="absolute -bottom-4 right-6 floating-slow">
        <div className="relative h-24 w-24 rounded-full bg-gradient-to-br from-yellow-300 via-orange-300 to-orange-500 shadow-xl shadow-orange-300/40">
          <div className="absolute left-7 top-8 flex gap-4">
            <span className="block h-3 w-3 rounded-full bg-white/90" />
            <span className="block h-3 w-3 rounded-full bg-white/90" />
          </div>
          <div className="absolute left-8 top-14 h-2 w-10 rounded-full bg-white/60" />
        </div>
      </div>

      {/* Glass orb centerpiece. */}
      <div className="absolute bottom-24 left-[48%] -translate-x-1/2 floating-fast">
        <div className="relative flex h-16 w-16 items-center justify-center overflow-visible rounded-full bg-gradient-to-br from-sky-200 via-sky-500 to-indigo-600 shadow-lg shadow-teal-500/35">
          <div className="absolute inset-[1px] rounded-full bg-[radial-gradient(circle_at_32%_26%,rgba(255,255,255,0.93),rgba(125,211,252,0.8)_48%,rgba(15,76,129,0.82)_78%)]" />
          <div className="absolute inset-[2px] rounded-full bg-white/8" />
          <div className="absolute inset-0 overflow-hidden rounded-full">
            <span className="absolute left-2 top-3 h-7 w-4 rounded-full bg-emerald-200/45" />
            <span className="absolute right-1.5 top-4 h-9 w-3 rounded-full bg-emerald-300/35" />
            <span className="absolute left-5 bottom-2 h-5 w-9 rounded-full bg-sky-100/28" />
            <span
              className="absolute right-4 bottom-3 h-6 w-4 rounded-full bg-emerald-100/35"
              style={{ transform: "rotate(12deg)" }}
            />
          </div>
          <span className="absolute left-4 top-4 h-3 w-3 rounded-full bg-white/35" />
          <span className="absolute right-4 top-7 h-2 w-6 rounded-full bg-white/14" />
          <div
            className="absolute -inset-3 -z-10 rounded-full"
            style={{
              transform: "scaleX(1.32) rotate(-8deg)",
              border: "1.2px solid rgba(255,255,255,0.38)",
              opacity: 0.65,
            }}
          />
        </div>
      </div>

      {/* Star badge accent. */}
      <div className="absolute left-10 bottom-10 floating-medium">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 to-red-500 shadow-lg shadow-rose-500/40">
          <div className="text-lg text-white">⭐</div>
        </div>
      </div>

      <div className="absolute -bottom-16 left-[-10%] h-4 w-4 rounded-full bg-sky-400/80 floating-fast" />
      <div className="absolute top-[-10%] left-[16%] h-2.5 w-2.5 rounded-full bg-cyan-200/80 floating-medium" />
      <div className="absolute bottom-[10%] right-[-14%] h-2.5 w-2.5 rounded-full bg-purple-300/80 floating-slow" />
      <div className="absolute top-[-18%] right-[8%] h-[11px] w-[11px] rounded-full bg-emerald-200/70 floating-slow" />
      <div className="absolute top-[84%] left-[-6%] h-1.5 w-1.5 rounded-full bg-sky-100/70 floating-medium" />
      <div className="absolute top-[6%] left-[-6%] h-3 w-3 rounded-full bg-indigo-200/70 floating-slow" />
      <div className="absolute bottom-[8%] left-[-8%] h-3.5 w-3.5 rounded-full bg-amber-200/80 floating-medium" />
      <div className="absolute top-[-6%] right-[-10%] h-3 w-3 rounded-full bg-blue-200/70 floating-fast" />
      <div className="absolute bottom-[-6%] left-[10%] h-5 w-5 rounded-full bg-sky-200/60 floating-slow" />
      <div className="absolute top-[96%] right-[58%] h-2.5 w-2.5 rounded-full bg-indigo-200/55 floating-medium" />
      <div className="absolute top-[-8%] left-[48%] h-1.5 w-1.5 rounded-full bg-white/70 floating-fast" />
      <div className="absolute bottom-[58%] left-[-12%] h-3 w-3 rounded-full bg-cyan-100/70 floating-slow" />
      <div className="absolute top-[42%] right-[76%] h-2.5 w-2.5 rounded-full bg-blue-100/70 floating-fast" />
      <div className="absolute bottom-[-4%] right-[28%] h-2.5 w-2.5 rounded-full bg-purple-200/60 floating-medium" />
      <div className="absolute top-[54%] left-[-10%] h-2.5 w-2.5 rounded-full bg-sky-200/70 floating-slow" />
      <div className="absolute bottom-[24%] left-[6%] h-2 w-2 rounded-full bg-cyan-100/75 floating-medium" />
      <div className="absolute top-[28%] left-[-4%] h-1.5 w-1.5 rounded-full bg-white/65 floating-fast" />
  <div className="absolute top-[22%] right-[-22%] h-2 w-2 rounded-full bg-indigo-100/65 floating-slow" />
      <div className="absolute bottom-[30%] right-[-20%] h-2.5 w-2.5 rounded-full bg-sky-100/70 floating-medium" />
      <div className="absolute top-[76%] right-[-16%] h-3 w-3 rounded-full bg-purple-100/60 floating-slow" />
      <div className="absolute top-[12%] right-[-32%] h-[12px] w-[12px] rounded-[5px] bg-emerald-200/65 floating-drift" />
      <div className="absolute top-[64%] right-[-26%] h-[8px] w-[14px] rounded-[4px] bg-sky-100/55 floating-medium" />
      <div className="absolute bottom-[18%] right-[-34%] h-[10px] w-[10px] rounded-full border border-white/55 bg-transparent floating-fast" />
      <div className="absolute top-[38%] right-[-6%] floating-orbit">
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6 text-white drop-shadow-[0_0_34px_rgba(128,216,255,0.7)]">
          <path d="M12 2.2 13 10l7 2-7 2-1 7.8-1-7.8-7-2 7-2Z" fill="currentColor" />
        </svg>
      </div>
      <div className="absolute top-[34%] left-[74%] h-1.5 w-1.5 rounded-full bg-white/70 floating-medium" />
      <div className="absolute bottom-[10%] left-[58%] h-3.5 w-3.5 rounded-full bg-purple-200/60 floating-slow" />
      <div className="absolute top-[86%] left-[28%] h-[6px] w-[6px] rounded-full bg-sky-300/75 floating-medium" />
      <div className="absolute top-[22%] right-[-12%] h-1.5 w-1.5 rounded-full bg-blue-100/70 floating-fast" />
      <div className="absolute bottom-[52%] left-[-18%] h-2.5 w-2.5 rounded-full bg-indigo-100/70 floating-slow" />
      <div className="absolute top-[-6%] right-[38%] h-1.5 w-1.5 rounded-full bg-white/60 floating-medium" />
      <div className="absolute bottom-[-8%] right-[60%] h-4 w-4 rounded-full bg-purple-100/55 floating-slow" />
      <div className="absolute top-[110%] right-[4%] h-2.5 w-2.5 rounded-full bg-indigo-200/45 floating-slow" />
      <div className="absolute top-[48%] left-[68%] h-1.5 w-1.5 rounded-full bg-white/60 floating-medium" />
      <div className="absolute top-[24%] left-[6%] floating-slow">
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-7 w-7 text-white drop-shadow-[0_0_36px_rgba(255,255,255,0.7)]">
          <path d="M12 2.2 13 10l7 2-7 2-1 7.8-1-7.8-7-2 7-2Z" fill="currentColor" />
        </svg>
      </div>
      <div className="absolute top-[8%] left-[28%] floating-fast">
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6 text-white drop-shadow-[0_0_34px_rgba(255,255,255,0.6)]">
          <path d="M12 2.2 13 10l7 2-7 2-1 7.8-1-7.8-7-2 7-2Z" fill="currentColor" />
        </svg>
      </div>
      <div className="absolute top-[62%] left-[6%] floating-slow">
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-7 w-7 text-white drop-shadow-[0_0_32px_rgba(255,255,255,0.6)]">
          <path d="M12 2.2 13 10l7 2-7 2-1 7.8-1-7.8-7-2 7-2Z" fill="currentColor" />
        </svg>
      </div>
      <div className="absolute bottom-[10%] right-[4%] floating-medium">
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-8 w-8 text-white drop-shadow-[0_0_38px_rgba(255,255,240,0.5)]">
          <path d="M12 2.2 13 10l7 2-7 2-1 7.8-1-7.8-7-2 7-2Z" fill="currentColor" />
        </svg>
      </div>
      <div className="absolute top-[60%] right-[30%] floating-medium">
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6 text-white drop-shadow-[0_0_28px_rgba(255,255,255,0.5)]">
          <path d="M12 2.2 13 10l7 2-7 2-1 7.8-1-7.8-7-2 7-2Z" fill="currentColor" />
        </svg>
      </div>
    </div>
  );
}
