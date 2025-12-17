"use client"

import { useState } from "react"
import { TabNavigation } from "@/components/tab-navigation"
import { CSVBasicsTab } from "@/components/tabs/csv-basics-tab"
import { EDATab } from "@/components/tabs/eda-tab"
import { VisualizationsTab } from "@/components/tabs/visualizations-tab"

export type TabId = "csv-basics" | "eda" | "visualizations"

export interface Dataset {
  name: string
  rows: number
  columns: number
  columnNames: string[]
  data?: Record<string, any>[]
}

export default function Page() {
  const [activeTab, setActiveTab] = useState<TabId>("csv-basics")
  const [dataset, setDataset] = useState<Dataset | null>(null)

  return (
    <div className="dark min-h-screen bg-zinc-950">
      {/* Top Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm">
        <div className="mx-auto flex h-auto max-w-7xl flex-col gap-4 px-4 py-4 sm:h-16 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-0">
          {/* Title */}
          <h1 className="text-2xl font-semibold text-zinc-100 sm:text-3xl">
            Analyzr
          </h1>

          {/* Tabs */}
          <div className="overflow-x-auto">
            <TabNavigation
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 sm:pt-16">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
          {activeTab === "csv-basics" && (
            <CSVBasicsTab
              dataset={dataset}
              onDatasetChange={setDataset}
            />
          )}

          {activeTab === "eda" && <EDATab dataset={dataset} />}

          {activeTab === "visualizations" && (
            <VisualizationsTab dataset={dataset} />
          )}
        </div>
      </main>
    </div>
  )
}
