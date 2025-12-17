// ...existing code...
import React, { useEffect, useState } from "react";

type HelpButtonProps = {
    message: string;
    link?: string;
    ariaLabel?: string;
    size?: "sm" | "md";
};

export const HelpButton: React.FC<HelpButtonProps> = ({
    message,
    link = "https://example.com/help",
    ariaLabel = "Help",
    size = "sm",
}) => {
    const [show, setShow] = useState(false);
    const [isNarrow, setIsNarrow] = useState(() =>
        typeof window !== "undefined" ? window.innerWidth < 520 : false
    );
    const btnSize = size === "sm" ? 18 : 22;

    useEffect(() => {
        const onResize = () => setIsNarrow(window.innerWidth < 520);
        window.addEventListener("resize", onResize, { passive: true });
        return () => window.removeEventListener("resize", onResize);
    }, []);

    // colors tuned for a dark-themed site but visible
    const btnBg = "rgba(255,255,255,0.06)";
    const btnBorder = "rgba(255,255,255,0.14)";
    const btnHoverBg = "rgba(255,255,255,0.10)";
    const iconStroke = "rgba(255,255,255,0.95)";
    const iconFill = "rgba(255,255,255,0.98)";
    const dialogBg = "#081225";
    const linkColor = "#7dd3fc";

    const popupBaseStyle: React.CSSProperties = {
        position: "absolute",
        top: "calc(100% + 8px)",
        right: 0,
        zIndex: 9999,
        minWidth: 220,
        maxWidth: 360,
        background: dialogBg,
        color: "#e6eef8",
        padding: "12px",
        borderRadius: 10,
        boxShadow: "0 8px 28px rgba(2,6,23,0.6)",
        fontSize: 13,
        lineHeight: 1.4,
        border: "1px solid rgba(255,255,255,0.03)",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        alignItems: "flex-start",
        wordBreak: "break-word",
        overflowWrap: "anywhere",
    };

    const popupNarrowOverride: React.CSSProperties = isNarrow
        ? {
            left: "50%",
            right: "auto",
            transform: "translateX(-50%)",
            minWidth: "calc(100vw - 32px)",
            maxWidth: "calc(100vw - 32px)",
        }
        : {};

    return (
        <div
            style={{ display: "inline-block", position: "relative", marginLeft: 8 }}
            onMouseEnter={() => setShow(true)}
            onMouseLeave={() => setShow(false)}
            onFocusCapture={() => setShow(true)}
            onBlurCapture={() => setShow(false)}
        >
            <button
                aria-label={ariaLabel}
                type="button"
                style={{
                    width: btnSize,
                    height: btnSize,
                    padding: 0,
                    borderRadius: 6,
                    border: `1px solid ${btnBorder}`,
                    background: btnBg,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    transition: "background-color 120ms ease, transform 120ms ease, box-shadow 120ms ease",
                }}
                onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = btnHoverBg;
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 6px 14px rgba(0,0,0,0.45)";
                    setShow(true);
                }}
                onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = btnBg;
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
                }}
                onFocus={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 0 3px rgba(125,211,252,0.13)";
                    setShow(true);
                }}
                onBlur={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
                    // blur capture on wrapper will hide popup after focus leaves both button and link
                }}
            >
                <svg
                    width={btnSize - 2}
                    height={btnSize - 2}
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden
                >
                    <circle cx="12" cy="12" r="10" stroke={iconStroke} strokeWidth="1" />
                    <text
                        x="12"
                        y="16"
                        textAnchor="middle"
                        fontSize="12"
                        fontFamily="Arial, Helvetica, sans-serif"
                        fill={iconFill}
                        fontWeight={700}
                    >
                        ?
                    </text>
                </svg>
            </button>

            {show && (
                <div
                    role="dialog"
                    aria-live="polite"
                    style={{ ...popupBaseStyle, ...popupNarrowOverride }}
                >
                    <div style={{ whiteSpace: "normal" }}>{message}</div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        <div style={{ color: "rgba(230,238,248,0.9)", fontSize: 12 }}>
                            For more details with examples, please click on this link:
                        </div>
                        <a
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                color: linkColor,
                                textDecoration: "underline",
                                fontSize: 13,
                                lineHeight: 1.2,
                                // ensure no extra spacing behind or padding
                                padding: 0,
                                margin: 0,
                                display: "inline-block",
                                maxWidth: "100%",
                                overflowWrap: "anywhere",
                            }}
                        >
                            {link}
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HelpButton;
//