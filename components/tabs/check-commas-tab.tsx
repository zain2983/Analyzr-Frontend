"use client"

import { useState } from "react"
import type { Dataset } from "@/app/page"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { checkCommas } from "@/lib/api/check-commas"
import { AlertCircle, CheckCircle } from "lucide-react"
import { DatasetSelector } from "@/components/dataset-selector"

interface CheckCommasTabProps {
    datasets: Dataset[]
}

export function CheckCommasTab({ datasets }: CheckCommasTabProps) {
    const [selectedDatasetId, setSelectedDatasetId] = useState<string>(datasets[0]?.id ?? "")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [response, setResponse] = useState<any>(null)

    if (datasets.length === 0) {
        return (
            <div className="flex min-h-[400px] items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/50 p-8">
                <p className="text-center text-sm text-zinc-400">Upload a CSV file to check commas</p>
            </div>
        )
    }

    const selectedDataset = datasets.find(d => d.id === selectedDatasetId)

    const handleExecute = async () => {
        if (!selectedDatasetId) return

        setLoading(true)
        setError(null)
        setResponse(null)

        try {
            const res = await checkCommas({ dataset_id: selectedDatasetId })
            setResponse(res)
        } catch (err: any) {
            console.error(err)
            setError(err?.message || "Request failed")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* <div>
                <h2 className="text-2xl font-semibold text-zinc-100">Check Commas</h2>
                <p className="mt-1 text-sm text-zinc-400">Run comma validation on your dataset.</p>
            </div> */}

            <Card className="border-zinc-800 bg-zinc-900 p-6">
                <div className="space-y-4">
                    <DatasetSelector
                        datasets={datasets}
                        value={selectedDatasetId}
                        onChange={setSelectedDatasetId}
                    />

                    <Button
                        onClick={handleExecute}
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                        {loading ? "Checking..." : "Check Commas"}
                    </Button>
                    {error && <p className="text-sm text-red-400">{error}</p>}
                </div>
            </Card>

            {response && (
                <Card className="border-zinc-800 bg-zinc-900 p-6">
                    <div className="space-y-6">
                        {/* Summary */}
                        <div className="flex items-center gap-3">
                            {response.success ? (
                                <>
                                    {response.total_issues === 0 ? (
                                        <>
                                            <CheckCircle className="h-6 w-6 text-green-500" />
                                            <div>
                                                <h3 className="text-lg font-semibold text-green-400">No Issues Found</h3>
                                                <p className="text-sm text-zinc-400">Your CSV file has valid comma formatting.</p>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <AlertCircle className="h-6 w-6 text-yellow-500" />
                                            <div>
                                                <h3 className="text-lg font-semibold text-yellow-400">
                                                    {response.total_issues} Issue{response.total_issues !== 1 ? 's' : ''} Found
                                                </h3>
                                                <p className="text-sm text-zinc-400">Found problematic lines in your CSV.</p>
                                            </div>
                                        </>
                                    )}
                                </>
                            ) : (
                                <>
                                    <AlertCircle className="h-6 w-6 text-red-500" />
                                    <div>
                                        <h3 className="text-lg font-semibold text-red-400">Error</h3>
                                        <p className="text-sm text-zinc-400">Failed to check commas.</p>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Issues List */}
                        {response.issues && response.issues.length > 0 && (
                            <div className="space-y-3">
                                <h4 className="font-semibold text-zinc-100">Problematic Lines:</h4>
                                <div className="space-y-2 max-h-96 overflow-y-auto">
                                    {response.issues.map((issue: any, idx: number) => (
                                        <div key={idx} className="rounded-md border border-zinc-700 bg-zinc-950 p-3">
                                            <div className="mb-2 flex items-center justify-between">
                                                <span className="text-sm font-medium text-yellow-400">Line {issue.line}</span>
                                            </div>
                                            <div className="rounded bg-zinc-900 p-2 font-mono text-xs text-zinc-300 break-all">
                                                {issue.content}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </Card>
            )}
        </div>
    )
}