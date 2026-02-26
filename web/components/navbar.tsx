"use client";

import Link from "next/link";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { LogOut, User as UserIcon } from "lucide-react";

export function Navbar() {
    const { currentUser, logout } = useAppStore();
    const [mounted, setMounted] = useState(false);

    // Hydration safety: only show user info on the client
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
    }, []);

    return (
        <nav className="sticky top-0 z-50 w-full bg-background border-b-2 border-black py-4 px-6 md:px-12 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
                <span className="text-2xl font-black tracking-tighter">
                    CÀ CHỚN DATING
                </span>
            </Link>

            <div className="flex items-center gap-4">
                {mounted && currentUser ? (
                    <>
                        <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-white neo-border neo-shadow-sm">
                            <UserIcon size={16} />
                            <span className="font-bold text-sm truncate max-w-[150px]">
                                {currentUser.name}
                            </span>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={logout}
                            className="font-bold"
                        >
                            <LogOut size={16} className="md:mr-2" />
                            <span className="hidden md:inline">THOÁT</span>
                        </Button>
                    </>
                ) : (
                    <Link href="/">
                        <Button size="sm" className="font-bold">
                            BẮT ĐẦU
                        </Button>
                    </Link>
                )}
            </div>
        </nav>
    );
}
