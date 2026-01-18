import { Loader2, AlertCircle, Clock } from "lucide-react"
import type { BackendStatus } from "@/lib/hooks/useBackendStatus"

interface BackendStatusDisplayProps {
    status: BackendStatus
    elapsedTime: number
}

export function BackendStatusDisplay({ status, elapsedTime }: BackendStatusDisplayProps) {
    const formatTime = (ms: number) => {
        const seconds = Math.floor(ms / 1000)
        return `${seconds}s`
    }

    if (status === "idle") {
        return null
    }

    if (status === "loading") {
        return (
            <div className="mt-4 flex items-center justify-center gap-3 rounded-lg border border-zinc-800 bg-zinc-950 p-4 text-zinc-400">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-sm">Processing files...</span>
            </div>
        )
    }

    if (status === "waking") {
        return (
            <div className="mt-4 flex items-center justify-center gap-3 rounded-lg border border-blue-900/50 bg-blue-950/20 p-4">
                <Clock className="h-5 w-5 text-blue-400 animate-pulse" />
                <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-blue-400">
                        Waking up backend service...
                    </span>
                    <span className="text-xs text-blue-300/70">
                        This may take up to 60 seconds on first request
                    </span>
                </div>
                <span className="ml-auto text-xs text-blue-300">{formatTime(elapsedTime)}</span>
            </div>
        )
    }

    if (status === "slow") {
        return (
            <div className="mt-4 flex items-center justify-center gap-3 rounded-lg border border-amber-900/50 bg-amber-950/20 p-4">
                <Clock className="h-5 w-5 text-amber-400 animate-pulse" />
                <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-amber-400">
                        Still processing...
                    </span>
                    <span className="text-xs text-amber-300/70">
                        Your request is taking longer than usual. Please wait.
                    </span>
                </div>
                <span className="ml-auto text-xs text-amber-300">{formatTime(elapsedTime)}</span>
            </div>
        )
    }

    if (status === "timeout") {
        return (
            <div className="mt-4 flex items-start gap-3 rounded-lg border border-red-900/50 bg-red-950/20 p-4">
                <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-red-400">
                        Request timeout
                    </span>
                    <span className="text-xs text-red-300/70">
                        The request took too long. Please try again or check your connection.
                    </span>
                </div>
            </div>
        )
    }

    if (status === "error") {
        return (
            <div className="mt-4 flex items-start gap-3 rounded-lg border border-red-900/50 bg-red-950/20 p-4">
                <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-red-400">
                        Connection error
                    </span>
                    <span className="text-xs text-red-300/70">
                        Failed to reach the backend. Check your connection and try again.
                    </span>
                </div>
            </div>
        )
    }

    return null
}