"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { api } from "@/lib/api";
import { CommonSlot, Availability } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Calendar, Clock, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function MatchPage({ params }: { params: Promise<{ matchId: string }> }) {
    const { matchId } = use(params);
    const { currentUser } = useAppStore();
    const router = useRouter();
    const [commonSlot, setCommonSlot] = useState<CommonSlot | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Form state
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (!currentUser) {
            router.push("/");
            return;
        }

        const fetchData = async () => {
            try {
                const [slot] = await Promise.all([
                    api.getCommonSlot(matchId),
                    api.getAvailabilitiesByUserId(currentUser.id)
                ]);
                setCommonSlot(slot && slot.startTime ? slot : null);
            } catch {
                // Handled by api toasts
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [currentUser, router, matchId]);

    const handleAddAvailability = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser || !startTime || !endTime) return;

        setSubmitting(true);
        try {
            await api.addAvailability({
                userId: currentUser.id,
                startTime: new Date(startTime).toISOString(),
                endTime: new Date(endTime).toISOString(),
            });

            toast.success("Đã thêm lịch thành công! Đang check kèo...");

            // Refresh data
            const slot = await api.getCommonSlot(matchId);
            setCommonSlot(slot && slot.startTime ? slot : null);

            setStartTime("");
            setEndTime("");
        } catch {
            // Handled by api toasts
        } finally {
            setSubmitting(false);
        }
    };

    const formatDateTime = (iso: string) => {
        const d = new Date(iso);
        return d.toLocaleString("vi-VN", {
            weekday: "short",
            day: "2-digit",
            month: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    if (!mounted || !currentUser) return null;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-80px)] bg-background">
                <div className="neo-border neo-shadow bg-card p-6 scale-110">
                    <p className="text-xl font-bold animate-pulse uppercase">Đang check lịch nhậu...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container max-w-4xl mx-auto py-12 px-4 space-y-8 bg-background">
            <div className="text-center space-y-4">
                <h1 className="text-5xl font-black italic uppercase tracking-tighter">
                    Ố KÈ, ĐI NHẬU! 🍺
                </h1>
                <p className="text-xl font-bold">
                    Quăng cái lịch của bồ vào đây, để xem khi nào hai đứa rảnh.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Left: Input Form */}
                <div className="space-y-6">
                    <Card className="neo-border neo-shadow bg-white flex flex-col h-full">
                        <CardHeader className="bg-primary text-white border-b-2 border-black">
                            <CardTitle className="text-2xl font-black uppercase italic">
                                Bồ rảnh lúc nào?
                            </CardTitle>
                            <CardDescription className="text-white/90 font-bold">
                                Càng rảnh nhiều càng dễ match kèo!
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6 flex-1">
                            <form onSubmit={handleAddAvailability} className="space-y-6">
                                <div className="p-3 bg-yellow-100 border-2 border-black font-bold text-sm">
                                    ⚠️ LƯU Ý: Chỉ nhận lịch trong vòng 3 tuần tới thôi bồ ơi!
                                </div>
                                <div className="space-y-2">
                                    <label className="font-black uppercase text-sm flex items-center gap-2">
                                        <Calendar size={16} /> Bắt đầu
                                    </label>
                                    <Input
                                        type="datetime-local"
                                        value={startTime}
                                        onChange={(e) => setStartTime(e.target.value)}
                                        required
                                        min={new Date().toISOString().slice(0, 16)}
                                        max={new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)}
                                        className="neo-border h-12 font-bold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="font-black uppercase text-sm flex items-center gap-2">
                                        <Clock size={16} /> Kết thúc
                                    </label>
                                    <Input
                                        type="datetime-local"
                                        value={endTime}
                                        onChange={(e) => setEndTime(e.target.value)}
                                        required
                                        min={startTime || new Date().toISOString().slice(0, 16)}
                                        max={new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)}
                                        className="neo-border h-12 font-bold"
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    className="w-full text-lg h-14"
                                    disabled={submitting}
                                >
                                    {submitting ? "ĐANG CHỐT..." : "THÊM LỊCH ➕"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                {/* Right: Common Slot */}
                <div className="space-y-6">
                    <div className="h-full flex flex-col">
                        <h2 className="text-2xl font-black uppercase mb-4 flex items-center gap-2 italic">
                            <Sparkles className="text-primary fill-primary" /> Kèo nhậu chung
                        </h2>

                        {commonSlot ? (
                            <Card className="neo-border border-primary bg-primary/5 shadow-[0_0_20px_rgba(168,85,247,0.3)] animate-in zoom-in duration-300 flex-1 flex flex-col items-center justify-center p-8 text-center">
                                <div className="w-16 h-16 bg-primary text-white neo-border neo-shadow flex items-center justify-center mb-6 rotate-3">
                                    <Sparkles size={32} />
                                </div>
                                <h3 className="text-3xl font-black uppercase tracking-tight text-primary">
                                    CHỐT ĐƠN! 🎉
                                </h3>
                                <div className="mt-8 space-y-4 w-full">
                                    <div className="bg-white neo-border neo-shadow-sm p-4 text-left">
                                        <p className="text-xs font-black uppercase opacity-60">Từ lúc:</p>
                                        <p className="text-xl font-black">{formatDateTime(commonSlot.startTime)}</p>
                                    </div>
                                    <div className="bg-white neo-border neo-shadow-sm p-4 text-left">
                                        <p className="text-xs font-black uppercase opacity-60">Đến lúc:</p>
                                        <p className="text-xl font-black">{formatDateTime(commonSlot.endTime)}</p>
                                    </div>
                                </div>
                                <p className="mt-8 text-lg font-black italic">
                                    &quot;Cà chớn&quot; đúng lúc, hạnh phúc đúng người!
                                </p>
                            </Card>
                        ) : (
                            <Card className="neo-border neo-shadow bg-white flex-1 flex flex-col items-center justify-center p-8 text-center grayscale">
                                <div className="text-6xl mb-4">⌛</div>
                                <h3 className="text-2xl font-black uppercase opacity-40">Chưa có kèo nào...</h3>
                                <p className="font-bold opacity-60 mt-2">
                                    Đang đợi đối phương thêm lịch hoặc bồ chưa rảnh trùng lúc nào hết!
                                </p>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
