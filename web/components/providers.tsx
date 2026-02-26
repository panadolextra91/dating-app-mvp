"use client";

import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { Navbar } from "@/components/navbar";
import Confetti from "react-confetti";
import { useAppStore } from "@/store/useAppStore";

export function Providers({ children }: { children: React.ReactNode }) {
    const [hydrated, setHydrated] = useState(false);
    const { showConfetti, setShowConfetti } = useAppStore();
    const [windowSize, setWindowSize] = useState({
        width: 0,
        height: 0,
    });

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setHydrated(true);
        const updateSize = () => {
            setWindowSize({ width: window.innerWidth, height: window.innerHeight });
        };
        updateSize();
        window.addEventListener("resize", updateSize);
        return () => window.removeEventListener("resize", updateSize);
    }, []);

    // Auto-stop confetti after 5 seconds
    useEffect(() => {
        if (showConfetti) {
            const timer = setTimeout(() => setShowConfetti(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [showConfetti, setShowConfetti]);

    return (
        <>
            {hydrated ? (
                <div className="min-h-screen flex flex-col">
                    {showConfetti && (
                        <Confetti
                            width={windowSize.width}
                            height={windowSize.height}
                            recycle={false}
                            numberOfPieces={500}
                            style={{ zIndex: 100 }}
                        />
                    )}
                    <Navbar />
                    <main className="flex-1">
                        {children}
                    </main>
                </div>
            ) : (
                <div className="min-h-screen bg-background flex items-center justify-center">
                    <div className="neo-border neo-shadow bg-card p-8 text-center">
                        <p className="text-2xl font-black animate-pulse">
                            ☕ LÀM TÍ CAFE ĐỢI TÍ...
                        </p>
                    </div>
                </div>
            )}
            <Toaster
                position="top-center"
                toastOptions={{
                    style: {
                        border: "2px solid #000",
                        boxShadow: "4px 4px 0px 0px #000",
                        borderRadius: "0px",
                        background: "#ffffff",
                        color: "#1a1a1a",
                        fontWeight: 600,
                    },
                }}
            />
        </>
    );
}
