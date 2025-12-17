"use client"

import { useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import type { Dataset } from "@/app/page"
import { Chart, registerables } from "chart.js"

Chart.register(...registerables)

interface ChartContainerProps {
  dataset: Dataset
  column: string
  chartType: "bar" | "histogram" | "pie"
}

export function ChartContainer({ dataset, column, chartType }: ChartContainerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chartRef = useRef<Chart | null>(null)

  useEffect(() => {
    if (!canvasRef.current || !dataset.data) return

    // Destroy previous chart
    if (chartRef.current) {
      chartRef.current.destroy()
    }

    const values = dataset.data.map((row) => row[column])

    // Calculate frequency distribution
    const frequencyMap = values.reduce((acc: Record<string, number>, val) => {
      const key = val || "(empty)"
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {})

    // Sort and limit to top 20 for better visualization
    const sortedEntries = Object.entries(frequencyMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)

    const labels = sortedEntries.map(([key]) => key)
    const data = sortedEntries.map(([, count]) => count)

    const ctx = canvasRef.current.getContext("2d")
    if (!ctx) return

    // Dark theme colors
    const chartColors = [
      "rgb(59, 130, 246)", // blue
      "rgb(16, 185, 129)", // emerald
      "rgb(249, 115, 22)", // orange
      "rgb(168, 85, 247)", // purple
      "rgb(236, 72, 153)", // pink
    ]

    chartRef.current = new Chart(ctx, {
      type: chartType === "histogram" ? "bar" : chartType,
      data: {
        labels,
        datasets: [
          {
            label: column,
            data,
            backgroundColor: chartColors,
            borderColor: "rgb(39, 39, 42)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: chartType === "pie",
            labels: {
              color: "rgb(161, 161, 170)",
              font: { size: 11 },
            },
          },
          tooltip: {
            backgroundColor: "rgb(24, 24, 27)",
            titleColor: "rgb(244, 244, 245)",
            bodyColor: "rgb(161, 161, 170)",
            borderColor: "rgb(63, 63, 70)",
            borderWidth: 1,
          },
        },
        scales:
          chartType !== "pie"
            ? {
                x: {
                  ticks: { color: "rgb(161, 161, 170)", font: { size: 10 } },
                  grid: { color: "rgb(39, 39, 42)" },
                },
                y: {
                  ticks: { color: "rgb(161, 161, 170)", font: { size: 10 } },
                  grid: { color: "rgb(39, 39, 42)" },
                },
              }
            : undefined,
      },
    })

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy()
      }
    }
  }, [dataset, column, chartType])

  const totalRecords = dataset.data?.length || 0
  const warningMessage = totalRecords > 1000 ? "Showing top 20 categories for better visualization" : null

  return (
    <Card className="border-zinc-800 bg-zinc-900 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-300">
          {chartType.charAt(0).toUpperCase() + chartType.slice(1)} - {column}
        </h3>
        <span className="text-xs text-zinc-500">{totalRecords.toLocaleString()} records</span>
      </div>

      <div className="flex items-center justify-center" style={{ height: "400px" }}>
        <canvas ref={canvasRef} />
      </div>

      {warningMessage && <p className="mt-4 text-xs text-zinc-500">{warningMessage}</p>}
    </Card>
  )
}
