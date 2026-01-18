import { useState, useEffect, useCallback } from "react"

export type BackendStatus = "idle" | "loading" | "waking" | "slow" | "error" | "timeout"

interface UseBackendStatusOptions {
    wakingThreshold?: number // ms before showing "waking up" message (default: 3000)
    slowThreshold?: number   // ms before showing "taking longer" message (default: 8000)
    timeoutDuration?: number // ms before timeout error (default: 30000)
    onStatusChange?: (status: BackendStatus) => void
}

export function useBackendStatus(options: UseBackendStatusOptions = {}) {
    const {
        wakingThreshold = 3000,
        slowThreshold = 8000,
        timeoutDuration = 90000,
        onStatusChange,
    } = options

    const [status, setStatus] = useState<BackendStatus>("idle")
    const [elapsedTime, setElapsedTime] = useState(0)

    const startRequest = useCallback(() => {
        setStatus("loading")
        setElapsedTime(0)

        const startTime = Date.now()
        const statusInterval = setInterval(() => {
            const elapsed = Date.now() - startTime

            if (elapsed > timeoutDuration) {
                setStatus("timeout")
                clearInterval(statusInterval)
            } else if (elapsed > slowThreshold) {
                setStatus("slow")
                setElapsedTime(elapsed)
            } else if (elapsed > wakingThreshold) {
                setStatus("waking")
                setElapsedTime(elapsed)
            }

            setElapsedTime(elapsed)
        }, 500)

        return () => clearInterval(statusInterval)
    }, [wakingThreshold, slowThreshold, timeoutDuration])

    const completeRequest = useCallback(() => {
        setStatus("idle")
        setElapsedTime(0)
    }, [])

    const failRequest = useCallback((reason: "network" | "error" = "error") => {
        setStatus("error")
    }, [])

    useEffect(() => {
        onStatusChange?.(status)
    }, [status, onStatusChange])

    return {
        status,
        elapsedTime,
        startRequest,
        completeRequest,
        failRequest,
    }
}