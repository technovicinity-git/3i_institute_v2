import type { ChangeEvent } from "react";

/**
 * Wraps a react-hook-form `onChange` so a number input can't go above `max`
 * while typing: e.g. typing "150" in a percentage field leaves "100".
 * (The `max` attribute alone only affects the spinner, not typing.)
 */
export function capAt(
  max: number,
  onChange: (event: ChangeEvent<HTMLInputElement>) => unknown,
) {
  return (event: ChangeEvent<HTMLInputElement>) => {
    if (Number(event.target.value) > max) {
      event.target.value = String(max);
    }
    return onChange(event);
  };
}
