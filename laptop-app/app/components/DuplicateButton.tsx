"use client";

import { useFormStatus } from "react-dom";

/**
 * Submit button for the duplicate form.
 *
 * Split out as a client component purely so it can read `useFormStatus` and
 * disable itself mid-flight: the action creates a record, so a double click on
 * a slow render would leave two copies to clean up.
 */
export default function DuplicateButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      title="Create another laptop with the same specs and a new reference code"
      className="btn-corp-ghost px-3 py-1.5 text-[11px] disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? "Duplicating…" : "Duplicate"}
    </button>
  );
}
