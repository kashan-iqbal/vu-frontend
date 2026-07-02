"use client";

import { useEffect, useRef } from "react";

interface OtpInputProps {
  value: string;
  onChange: (next: string) => void;
  length?: number;
  autoFocus?: boolean;
}

/**
 * Six individual digit boxes for OTP entry. Keeps `value` as a single joined
 * string of digits so callers can validate/submit it unchanged. Supports
 * auto-advance on type, backspace to the previous box, and pasting a full code.
 */
export function OtpInput({
  value,
  onChange,
  length = 6,
  autoFocus = true,
}: OtpInputProps) {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (autoFocus) {
      inputsRef.current[0]?.focus();
    }
  }, [autoFocus]);

  const digits = Array.from({ length }, (_, i) => value[i] ?? "");

  const focusBox = (index: number) => {
    const clamped = Math.max(0, Math.min(length - 1, index));
    inputsRef.current[clamped]?.focus();
    inputsRef.current[clamped]?.select();
  };

  const setDigit = (index: number, digit: string) => {
    const chars = value.split("");
    // pad so we can write at `index` even if earlier boxes are empty
    while (chars.length <= index) chars.push("");
    chars[index] = digit;
    onChange(chars.join("").replace(/\D/g, "").slice(0, length));
  };

  const handleChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const raw = e.target.value.replace(/\D/g, "");
    if (!raw) {
      setDigit(index, "");
      return;
    }
    // if multiple digits landed here (e.g. autofill), spread them across boxes
    if (raw.length > 1) {
      const merged = (
        value.slice(0, index) + raw
      )
        .replace(/\D/g, "")
        .slice(0, length);
      onChange(merged);
      focusBox(merged.length);
      return;
    }
    setDigit(index, raw);
    focusBox(index + 1);
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace") {
      if (digits[index]) {
        setDigit(index, "");
      } else if (index > 0) {
        e.preventDefault();
        setDigit(index - 1, "");
        focusBox(index - 1);
      }
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      focusBox(index - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      focusBox(index + 1);
    }
  };

  const handlePaste = (
    index: number,
    e: React.ClipboardEvent<HTMLInputElement>,
  ) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "");
    if (!pasted) return;
    const merged = (value.slice(0, index) + pasted)
      .replace(/\D/g, "")
      .slice(0, length);
    onChange(merged);
    focusBox(merged.length);
  };

  return (
    <div className="flex justify-between gap-2 sm:gap-3">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputsRef.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(index, e)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={(e) => handlePaste(index, e)}
          onFocus={(e) => e.target.select()}
          aria-label={`Digit ${index + 1}`}
          className="h-12 w-full min-w-0 rounded-lg border border-slate-300 text-center text-2xl font-bold text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200 sm:h-14"
        />
      ))}
    </div>
  );
}
