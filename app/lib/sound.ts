"use client";

import { useSyncExternalStore } from "react";

/**
 * Quiz answer feedback sounds, played from the mp3s in /public.
 *
 * Playback is only ever triggered from a click handler, which satisfies browser
 * autoplay policies. Audio is a nicety here — every failure path is swallowed so
 * a blocked or missing sound can never break answering.
 */

const SOUND_KEY = "quiz-sound-enabled";

// NOTE: the correct-answer file on disk is "correct ans tune.mp3" — the spaces
// must stay percent-encoded or the request 404s.
const CORRECT_SRC = "/correct%20ans%20tune.mp3";
const WRONG_SRC = "/wrong_ans_tune.mp3";

const VOLUME = 0.7;

let correctEl: HTMLAudioElement | null = null;
let wrongEl: HTMLAudioElement | null = null;

function load(src: string): HTMLAudioElement | null {
  if (typeof window === "undefined" || typeof Audio === "undefined") return null;
  try {
    const el = new Audio(src);
    el.preload = "auto";
    el.volume = VOLUME;
    return el;
  } catch {
    return null;
  }
}

function play(el: HTMLAudioElement | null, other: HTMLAudioElement | null) {
  if (!el) return;
  try {
    // Answering fast shouldn't stack cues on top of each other.
    if (other && !other.paused) {
      other.pause();
      other.currentTime = 0;
    }
    el.currentTime = 0; // restart rather than ignore a rapid re-trigger
    // play() rejects if the browser blocks or interrupts it — not fatal.
    void el.play().catch(() => {});
  } catch {
    // ignore
  }
}

/** Warm the files up so the first answer doesn't wait on a download. */
export function preloadQuizSounds() {
  if (!correctEl) correctEl = load(CORRECT_SRC);
  if (!wrongEl) wrongEl = load(WRONG_SRC);
}

/**
 * Mark both clips as gesture-approved, synchronously inside a click handler.
 *
 * Which cue to play is now decided by the server, so the actual `play()` happens
 * after an await and is no longer part of the click's call stack — Safari in
 * particular blocks that. Starting and immediately pausing each element while the
 * gesture is still live satisfies the autoplay policy, so the later play works.
 */
export function unlockQuizSounds() {
  if (!isSoundEnabled()) return;
  preloadQuizSounds();
  for (const el of [correctEl, wrongEl]) {
    if (!el) continue;
    try {
      void el
        .play()
        .then(() => {
          el.pause();
          el.currentTime = 0;
        })
        .catch(() => {});
    } catch {
      // ignore
    }
  }
}

export function playCorrect() {
  if (!isSoundEnabled()) return;
  preloadQuizSounds();
  play(correctEl, wrongEl);
}

export function playWrong() {
  if (!isSoundEnabled()) return;
  preloadQuizSounds();
  play(wrongEl, correctEl);
}

// ── Mute preference (persisted) ───────────────────────────────────────────────
// useSyncExternalStore keeps this in sync without a setState-in-effect, and its
// server snapshot avoids a hydration mismatch on first paint.

let listeners: Array<() => void> = [];

function subscribe(cb: () => void) {
  listeners.push(cb);
  return () => {
    listeners = listeners.filter((l) => l !== cb);
  };
}

export function isSoundEnabled(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(SOUND_KEY) !== "off";
  } catch {
    return true; // private mode / storage blocked — default to on
  }
}

function getServerSnapshot(): boolean {
  return true;
}

export function setSoundEnabled(enabled: boolean) {
  try {
    window.localStorage.setItem(SOUND_KEY, enabled ? "on" : "off");
  } catch {
    // ignore storage failures; the toggle still works for this session
  }
  listeners.forEach((l) => l());
}

/** Reactive read of the persisted sound preference. */
export function useSoundEnabled(): boolean {
  return useSyncExternalStore(subscribe, isSoundEnabled, getServerSnapshot);
}
