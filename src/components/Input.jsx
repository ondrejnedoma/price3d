import clsx from "clsx";
import React, { useId } from "react";

export default function Input({
  children,
  value,
  onChange,
  type,
  min,
  max,
  step,
}) {
  const id = useId();
  const inputClasses = clsx(
    "peer w-full rounded-lg px-3 py-2 transition duration-300 focus:ring-2 focus:outline-none",
    value == ""
      ? "text-red-500 ring-2 ring-red-500 focus:ring-red-500"
      : "ring ring-neutral-400 focus:ring-blue-500",
  );
  const labelClasses = clsx(
    "absolute left-2.5 origin-left transform cursor-text bg-neutral-50 px-1 transition-all peer-focus:-top-2 peer-focus:text-xs dark:bg-neutral-900",
    value == ""
      ? "top-2.5 text-sm text-red-500"
      : "-top-2 text-xs text-neutral-400 peer-focus:text-blue-500",
  );
  return (
    <div className="relative">
      <input
        id={id}
        value={value}
        onChange={onChange}
        type={type}
        className={inputClasses}
        min={min}
        max={max}
        step={step}
      />
      <label htmlFor={id} className={labelClasses}>
        {children}
      </label>
    </div>
  );
}
