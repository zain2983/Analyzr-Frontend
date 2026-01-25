
"use client";

import { useEffect } from "react";
import { BACKEND_URL } from "@/lib/config"

export default function WakeUpBackend() {
    useEffect(() => {
        console.log("WakeUpBackend mounted"); // 👈 MUST appear in browser console

        const wakeServer = async () => {
            try {
                console.log("Sending wake-up ping...");
                const res = await fetch(BACKEND_URL);
                console.log("Wake-up response status:", res.status);
            } catch (err) {
                console.log("Wake-up failed:", err);
            }
        };

        wakeServer();
    }, []);

    return null;
}
