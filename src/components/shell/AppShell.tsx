import type { ReactNode } from "react";
import type { PeriodN, ViewId } from "@/lib/dashboard-data";
import { BottomTabs, Rail } from "./Rail";
import { TopBar } from "./TopBar";

/** ≥1280px: app em altura fixa sem scroll de página; abaixo disso a página rola e o rail vira abas inferiores. */
export function AppShell({ view, brand, monthLabel, period, onPeriod, children }: { view: ViewId; brand: string; monthLabel: string; period: PeriodN; onPeriod: (n: PeriodN) => void; children: ReactNode }) {
  return (
    <div className="flex min-h-dvh xl:h-dvh xl:overflow-hidden">
      <Rail view={view} />
      <div className="flex min-w-0 flex-1 flex-col xl:min-h-0">
        <TopBar brand={brand} monthLabel={monthLabel} period={period} onPeriod={onPeriod} />
        <main className="min-h-0 flex-1 p-3 pb-24 xl:overflow-hidden xl:pb-3">{children}</main>
      </div>
      <BottomTabs view={view} />
    </div>
  );
}
