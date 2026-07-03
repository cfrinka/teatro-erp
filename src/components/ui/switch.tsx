"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SwitchProps {
  defaultChecked?: boolean;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export function Switch({
  defaultChecked = false,
  checked,
  onCheckedChange,
  disabled = false,
  className,
}: SwitchProps) {
  const [internalChecked, setInternalChecked] = React.useState(defaultChecked);
  const isControlled = checked !== undefined;
  const isChecked = isControlled ? checked : internalChecked;

  const handleClick = () => {
    if (disabled) return;
    const newValue = !isChecked;
    if (!isControlled) setInternalChecked(newValue);
    onCheckedChange?.(newValue);
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isChecked}
      disabled={disabled}
      onClick={handleClick}
      className={cn(
        "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-50 dark:focus-visible:ring-zinc-400 dark:focus-visible:ring-offset-zinc-950",
        isChecked
          ? "bg-zinc-900 dark:bg-zinc-50"
          : "bg-zinc-200 dark:bg-zinc-700",
        className
      )}
    >
      <span
        className={cn(
          "pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform dark:bg-zinc-950",
          isChecked ? "translate-x-4" : "translate-x-0"
        )}
      />
    </button>
  );
}
