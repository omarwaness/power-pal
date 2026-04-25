import { useState } from "react"

import { ExportReadings } from "@/components/export-readings"
import { MeterDialog } from "@/components/meter-dialog"
import { MetricsSection } from "@/components/metrics-section"
import { OverviewSection } from "@/components/overview-section"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type Section = "overview" | "metrics"

function App() {
  const [activeSection, setActiveSection] = useState<Section>("overview")
  const [overviewRefreshKey, setOverviewRefreshKey] = useState(0)

  return (
    <main className="min-h-svh px-6 py-8 sm:px-8 md:px-16 md:py-16 lg:px-28">
      <div className="flex w-full flex-col items-start gap-8">
        <header className="flex w-full flex-col gap-3">
          <div className="flex w-full items-start justify-between gap-4">
            <div className="flex flex-col items-start gap-3">
              <h1 className="text-2xl font-base">
                Monthly consumption
              </h1>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  className={cn(
                    "px-4 rounded-xl",
                    activeSection === "overview" && "bg-muted/80 hover:bg-muted"
                  )}
                  aria-pressed={activeSection === "overview"}
                  onClick={() => setActiveSection("overview")}
                >
                  Overview
                </Button>

                <Button
                  variant="ghost"
                  className={cn(
                    "px-4 rounded-xl",
                    activeSection === "metrics" && "bg-muted/80 hover:bg-muted"
                  )}
                  aria-pressed={activeSection === "metrics"}
                  onClick={() => setActiveSection("metrics")}
                >
                  Metrics
                </Button>
              </div>
            </div>

            {activeSection === "overview" && (
              <div className="flex items-center gap-2">
                <ExportReadings />
                <MeterDialog
                  onCreated={() => setOverviewRefreshKey(current => current + 1)}
                />
              </div>
            )}
          </div>
        </header>

        {activeSection === "overview" ? (
          <OverviewSection refreshKey={overviewRefreshKey} />
        ) : (
          <MetricsSection />
        )}
      </div>
    </main>
  )
}

export default App