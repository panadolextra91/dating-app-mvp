"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { User2, Ghost, Heart, Clock } from "lucide-react";

const PERSONAS = [
    {
        name: "Văn Tèo",
        email: "teo@ex.com",
        role: "Tui là Văn Tèo nè mẹ ơi! 🍌 (Acc Chính)",
        icon: User2,
    },
    {
        name: "Thằng ảo A",
        email: "bob@test.com",
        role: "Scenario A: Overlap (Mai 9h-11h) 🐶",
        icon: Clock,
    },
    {
        name: "Thằng ảo B",
        email: "cuong@test.com",
        role: "Scenario B: Lệch Pha (Kia 14h-15h) 💨",
        icon: Ghost,
    },
    {
        name: "Thằng ảo C",
        email: "dung@test.com",
        role: "Scenario C: Đa Tình (Đồ cổ 10 ngày sau) 💘",
        icon: Heart,
    },
];

export function DevIdentitySwitcher() {
    const { login } = useAppStore();
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [switching, setSwitching] = useState<string | null>(null);

    const handleSwitch = async (email: string) => {
        setSwitching(email);
        try {
            const user = await api.getUserByEmail(email);
            if (user) {
                login(user);
                toast.success(`Đã nhập hồn vào ${user.name}! 😈`, {
                    description: "Mẹ bắt đầu quậy thôi!",
                });
                setOpen(false);
                router.push("/swipe");
            }
        } catch {
            // Handled by api toasts
        } finally {
            setSwitching(null);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button
                        className="w-16 h-16 rounded-none bg-[#A855F7] text-white neo-border neo-shadow hover:translate-y-[2px] hover:shadow-none transition-all flex flex-col items-center justify-center p-0"
                        title="TÔI LÀ AI?"
                    >
                        <span className="text-xl">🎭</span>
                        <span className="text-[8px] font-black uppercase text-center leading-tight mt-1">
                            TÔI LÀ AI?
                        </span>
                    </Button>
                </DialogTrigger>
                <DialogContent className="neo-border bg-card max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="text-3xl font-black italic uppercase tracking-tighter">
                            CHỌN DANH TÍNH 🎭
                        </DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        {PERSONAS.map((p) => {
                            const Icon = p.icon;
                            return (
                                <button
                                    key={p.email}
                                    onClick={() => handleSwitch(p.email)}
                                    disabled={switching !== null}
                                    className="flex items-center gap-4 p-4 text-left neo-border bg-white hover:bg-primary/10 hover:translate-y-[2px] transition-all group disabled:opacity-50"
                                >
                                    <div className="w-12 h-12 bg-primary/20 neo-border flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                                        <Icon size={24} />
                                    </div>
                                    <div>
                                        <p className="font-black uppercase text-lg">{p.name}</p>
                                        <p className="text-xs font-bold opacity-60">{p.role}</p>
                                    </div>
                                    {switching === p.email && (
                                        <div className="ml-auto animate-spin">☕</div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                    <p className="text-[10px] font-bold text-center opacity-50 uppercase">
                        Công cụ dành cho &quot;GOD MODE&quot;
                    </p>
                </DialogContent>
            </Dialog>
        </div>
    );
}
