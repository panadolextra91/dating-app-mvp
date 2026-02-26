"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { api } from "@/lib/api";
import { User } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, X } from "lucide-react";
import { MatchDialog } from "@/components/match-dialog";

export default function SwipePage() {
    const { currentUser, setShowConfetti } = useAppStore();
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [matchData, setMatchData] = useState<{ isOpen: boolean; matchId: string }>({
        isOpen: false,
        matchId: "",
    });

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (!currentUser) {
            router.push("/");
            return;
        }

        const fetchUsers = async () => {
            try {
                const data = await api.getUsers();
                // Filter out current user
                setUsers(data.filter((u) => u.id !== currentUser.id));
            } catch {
                // Handled by api toasts
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [currentUser, router]);

    const handleLike = async () => {
        if (!currentUser || !users[currentIndex]) return;

        const targetUser = users[currentIndex];
        try {
            const result = await api.likeUser({
                fromUserId: currentUser.id,
                toUserId: targetUser.id,
            });

            if (result.match) {
                setShowConfetti(true);
                setMatchData({
                    isOpen: true,
                    matchId: result.match.id,
                });
            }

            // Move to next user regardless of match
            setCurrentIndex((prev) => prev + 1);
        } catch {
            // Error handled by api toasts
        }
    };

    const handleSkip = () => {
        setCurrentIndex((prev) => prev + 1);
    };

    if (!mounted || !currentUser) return null;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
                <div className="neo-border neo-shadow bg-card p-6 scale-110">
                    <p className="text-xl font-bold animate-pulse uppercase">Đang tìm đối tượng...</p>
                </div>
            </div>
        );
    }

    const activeUser = users[currentIndex];

    return (
        <div className="container max-w-lg mx-auto py-8 px-4 flex flex-col items-center justify-center min-h-[calc(100vh-80px)]">
            {activeUser ? (
                <div className="w-full space-y-6">
                    <Card className="neo-border neo-shadow overflow-hidden bg-white">
                        <div className="aspect-[4/5] bg-muted relative flex items-center justify-center border-b-2 border-black">
                            {/* Profile Image Placeholder with Neo-brutalism vibe */}
                            <div className="absolute inset-0 flex items-center justify-center text-9xl">
                                {activeUser.gender === "MALE" ? "🙋‍♂️" : activeUser.gender === "FEMALE" ? "🙋‍♀️" : "🧑‍🎤"}
                            </div>
                            <div className="absolute bottom-4 left-4 bg-primary text-white neo-border neo-shadow-sm px-4 py-2">
                                <span className="text-2xl font-black uppercase italic">
                                    {activeUser.name}, {activeUser.age}
                                </span>
                            </div>
                        </div>
                        <CardHeader className="bg-white">
                            <CardTitle className="text-xl font-black uppercase">Về tui:</CardTitle>
                        </CardHeader>
                        <CardContent className="bg-white min-h-[100px]">
                            <p className="text-lg font-bold leading-relaxed">
                                {activeUser.bio || "Thanh niên này lười vãi, không thèm ghi bio luôn..."}
                            </p>
                        </CardContent>
                    </Card>

                    <div className="flex gap-6 w-full px-4">
                        <Button
                            variant="outline"
                            size="lg"
                            className="flex-1 h-20 text-2xl neo-border rounded-none"
                            onClick={handleSkip}
                        >
                            <X size={32} />
                        </Button>
                        <Button
                            size="lg"
                            className="flex-1 h-20 text-2xl neo-border bg-destructive hover:bg-destructive/90 rounded-none shadow-[4px_4px_0_0_#000]"
                            onClick={handleLike}
                        >
                            <Heart size={32} className="fill-white" />
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="text-center space-y-6">
                    <div className="neo-border neo-shadow bg-white p-12">
                        <div className="text-6xl mb-4">💨</div>
                        <h2 className="text-3xl font-black uppercase">Hếtttttt!</h2>
                        <p className="text-xl font-bold mt-2">
                            Quét sạch cả app rồi bồ ơi.
                            Nghỉ giải lao đi, mai quẹt tiếp!
                        </p>
                    </div>
                    <Button
                        size="lg"
                        onClick={() => window.location.reload()}
                        className="text-xl font-bold h-16"
                    >
                        QUÉT LẠI TỪ ĐẦU 🔄
                    </Button>
                </div>
            )}

            <MatchDialog
                isOpen={matchData.isOpen}
                onClose={() => setMatchData({ ...matchData, isOpen: false })}
                matchId={matchData.matchId}
            />
        </div>
    );
}
