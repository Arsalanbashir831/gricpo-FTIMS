import type { InputHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

type AuthFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  icon?: ReactNode;
};

export function AuthField({
  className,
  icon,
  id,
  label,
  ...props
}: AuthFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-foreground" htmlFor={id}>
        {label}
      </label>
      <div className="relative">
        {icon ? (
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
            {icon}
          </span>
        ) : null}
        <input
          id={id}
          className={cn(
            "h-12 w-full rounded-lg border border-input bg-background px-3.5 text-[0.95rem] text-foreground outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/15",
            icon ? "pl-11" : null,
            className,
          )}
          {...props}
        />
      </div>
    </div>
  );
}
