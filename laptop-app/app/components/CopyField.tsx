"use client";

import { useState } from "react";

export default function CopyField({
  label,
  value,
  multiline,
}: {
  label: string;
  value: string;
  multiline?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // Clipboard API needs a secure context; fall back to a hidden textarea.
      const ta = document.createElement("textarea");
      ta.value = value;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <span className="corp-label">{label}</span>
        <button
          type="button"
          onClick={copy}
          disabled={!value}
          className="btn-corp px-3.5 py-1.5 text-[11px]"
        >
          {copied ? "Copied" : `Copy ${label}`}
        </button>
      </div>
      <div
        className={`border border-[color:var(--corp-edge-soft)] bg-corp-900/60 p-3.5 text-[13px] leading-relaxed text-corp-100 ${
          multiline ? "whitespace-pre-line" : "break-words"
        }`}
      >
        {value || <span className="text-corp-600">Not enough detail yet</span>}
      </div>
    </div>
  );
}
