import React from "react";

// Lightweight segmented control used by list components to switch between card and compact layouts.

export type ViewMode = "card" | "compact";

interface ViewToggleProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
  className?: string;
}

const ViewToggle: React.FC<ViewToggleProps> = ({ value, onChange, className }) => {
  return (
    <div className={"flex items-center gap-2 " + (className ?? "") }>
      <span className="text-sm text-slate-500">View:</span>
      <div className="inline-flex rounded-md border border-gray-300 overflow-hidden">
        <button
          className={`px-3 py-1 text-sm ${
            value === "card"
              ? "bg-link-hover text-primary-accent-color"
              : "text-link-color hover:text-primary-accent-color"
          }`}
          onClick={() => onChange("card")}
          type="button"
        >
          Cards
        </button>
        <button
          className={`px-3 py-1 text-sm border-l border-gray-300 ${
            value === "compact"
              ? "bg-link-hover text-primary-accent-color"
              : "text-link-color hover:text-primary-accent-color"
          }`}
          onClick={() => onChange("compact")}
          type="button"
        >
          Compact
        </button>
      </div>
    </div>
  );
};

export default ViewToggle;
