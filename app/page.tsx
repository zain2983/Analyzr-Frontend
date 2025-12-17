"use client"

import { useState } from "react"
import { TabNavigation } from "@/components/tab-navigation"
import { FileToolbar } from "@/components/file-toolbar"
import { FileUploadModal } from "@/components/file-upload-modal"
import { CSVBasicsTab } from "@/components/tabs/csv-basics-tab"
import { EDATab } from "@/components/tabs/eda-tab"
import { VisualizationsTab } from "@/components/tabs/visualizations-tab"
import { CompareTab } from "@/components/tabs/compare-tab"
import { DataOpsTab } from "@/components/tabs/data-ops-tab"
import { DataCleaningTab } from "@/components/tabs/data-cleaning-tab"
import { MergeJoinTab } from "@/components/tabs/merge-join-tab"
import { TransformationTab } from "@/components/tabs/transformation-tab"

export type TabId =
  | "csv-basics"
  | "eda"
  | "visualizations"
  | "compare"
  | "data-ops"
  | "data-cleaning"
  | "merge-join"
  | "transformation"

export interface Dataset {
  name: string
  rows: number
  columns: number
  columnNames: string[]
  data?: Record<string, any>[]
}

export default function Page() {
  const [activeTab, setActiveTab] = useState<TabId>("csv-basics")
  const [datasets, setDatasets] = useState<Dataset[]>([])
  const [showUploadModal, setShowUploadModal] = useState(false)

  const handleRemoveDataset = (index: number) => {
    const newDatasets = datasets.filter((_, i) => i !== index)
    setDatasets(newDatasets)
  }

  return (
    <div className="dark min-h-screen bg-zinc-950">
      {/* Top Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm">
        <div className="mx-auto flex h-auto max-w-7xl flex-col gap-4 px-4 py-4 sm:h-16 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-0">
          {/* Title */}
          <h1 className="text-2xl font-semibold text-zinc-100 sm:text-3xl">Analyzr</h1>

          {/* Tabs */}
          <div className="overflow-x-auto">
            <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
          </div>
        </div>
      </header>

      <div className="fixed top-16 left-0 right-0 z-40">
        <FileToolbar
          datasets={datasets}
          onUploadClick={() => setShowUploadModal(true)}
          onRemoveDataset={handleRemoveDataset}
          maxFiles={5}
        />
      </div>

      {/* Main Content */}
      <main className="pt-36 sm:pt-32">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
          {activeTab === "csv-basics" && <CSVBasicsTab datasets={datasets} />}

          {activeTab === "eda" && <EDATab datasets={datasets} />}

          {activeTab === "visualizations" && <VisualizationsTab datasets={datasets} />}

          {activeTab === "data-cleaning" && <DataCleaningTab datasets={datasets} />}

          {activeTab === "merge-join" && <MergeJoinTab datasets={datasets} />}

          {activeTab === "transformation" && <TransformationTab datasets={datasets} />}

          {activeTab === "compare" && <CompareTab datasets={datasets} />}

          {activeTab === "data-ops" && <DataOpsTab datasets={datasets} />}
        </div>
      </main>

      {showUploadModal && (
        <FileUploadModal
          datasets={datasets}
          onDatasetsChange={setDatasets}
          onClose={() => setShowUploadModal(false)}
          maxFiles={5}
        />
      )}
    </div>
  )
}
