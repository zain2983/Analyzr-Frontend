"use client"

import type { TabId } from "@/app/page"

interface Tab {
  id: TabId
  label: string
}

// Configuration-based tab definitions - easy to extend
const tabs: Tab[] = [
  { id: "csv-basics", label: "CSV Basics" },
  { id: "eda", label: "EDA" },
  { id: "visualizations", label: "Visualizations" },
  { id: "data-cleaning", label: "Data Cleaning" },
  { id: "merge-join", label: "Merge & Join" },
  { id: "transformation", label: "Transform" },
  { id: "compare", label: "Compare" },
  { id: "data-ops", label: "Data Operations" },
]

interface TabNavigationProps {
  activeTab: TabId
  onTabChange: (tabId: TabId) => void
}

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <nav className="flex gap-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            activeTab === tab.id ? "bg-zinc-800 text-zinc-100" : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  )
}
