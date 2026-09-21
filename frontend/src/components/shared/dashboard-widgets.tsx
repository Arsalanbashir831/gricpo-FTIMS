import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function DashboardPanel({ title, children, className }: { title: string; children: ReactNode; className?: string }) {
  return (
    <Card className={cn("min-w-0 gap-4 border-0 py-5 shadow-none ring-1 ring-slate-200/80", className)}>
      <CardHeader><CardTitle className="text-base font-semibold text-slate-900"><h2>{title}</h2></CardTitle></CardHeader>
      <CardContent className="min-w-0">{children}</CardContent>
    </Card>
  );
}

export function DashboardTable({ headers, rows, minWidth = "min-w-[580px]" }: { headers: string[]; rows: ReactNode[][]; minWidth?: string }) {
  return (
    <div className="overflow-x-auto">
      <table className={cn("w-full border-collapse text-left text-xs sm:text-sm", minWidth)}>
        <thead><tr className="bg-sky-50/80 text-slate-700">{headers.map((header) => <th key={header} scope="col" className="px-3 py-3 font-semibold whitespace-nowrap">{header}</th>)}</tr></thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={headers.length} className="py-8 text-center text-xs text-slate-500">
                No records found.
              </td>
            </tr>
          ) : (
            rows.map((row, index) => (
              <tr key={index} className="border-b border-slate-100 last:border-0">
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="px-3 py-3 whitespace-nowrap text-slate-700">
                    {cell}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

const pillColors = {
  green: "bg-emerald-50 text-emerald-700",
  amber: "bg-amber-50 text-amber-800",
  red: "bg-rose-50 text-rose-700",
};
export function StatusPill({ children, tone }: { children: ReactNode; tone: keyof typeof pillColors }) {
  return <span className={cn("inline-flex min-w-14 justify-center rounded-md px-2 py-1 text-xs font-medium tabular-nums", pillColors[tone])}>{children}</span>;
}
