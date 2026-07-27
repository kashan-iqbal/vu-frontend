"use client";

import { useSyncExternalStore } from "react";

/**
 * Tracks whether the user has already responded to (or dismissed) a feedback
 * prompt, so the inline auto-prompts show at most once. The floating button
 * ignores this — it's the always-available path.
 *
 * Read via useSyncExternalStore (with a server snapshot) to stay in sync across
 * every mounted prompt without a setState-in-effect.
 */

const KEY = "examprep-feedback-done";

let listeners: Array<() => void> = [];

function subscribe(cb: () => void) {
  listeners.push(cb);
  return () => {
    listeners = listeners.filter((l) => l !== cb);
  };
}

export function isFeedbackDone(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

// On the server we don't know yet — report "done" so the inline prompt renders
// nothing during SSR and only appears after hydration if genuinely not done.
// This avoids a hydration mismatch (server false vs client true).
function getServerSnapshot(): boolean {
  return true;
}

export function markFeedbackDone() {
  try {
    window.localStorage.setItem(KEY, "1");
  } catch {
    // storage blocked (private mode) — the in-memory notify below still hides
    // prompts for the rest of this session
  }
  listeners.forEach((l) => l());
}

/** Reactive read: true once the user has submitted or dismissed. */
export function useFeedbackDone(): boolean {
  return useSyncExternalStore(subscribe, isFeedbackDone, getServerSnapshot);
}
