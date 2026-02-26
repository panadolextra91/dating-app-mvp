"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Heart } from "lucide-react";

type MatchDialogProps = {
    isOpen: boolean;
    onClose: () => void;
    matchId: string;
};

export function MatchDialog({ isOpen, onClose, matchId }: MatchDialogProps) {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="bg-background neo-border neo-shadow max-w-sm p-8 text-center sm:rounded-none">
                <DialogHeader className="items-center">
                    <div className="w-20 h-20 bg-primary neo-border neo-shadow flex items-center justify-center mb-4 rotate-3 animate-bounce">
                        <Heart className="text-white fill-white" size={40} />
                    </div>
                    <DialogTitle className="text-4xl font-black tracking-tight leading-tight">
                        ĐÙ MÁ
                        <br />
                        MATCH RỒI! 🎉
                    </DialogTitle>
                    <DialogDescription className="text-lg font-bold text-foreground pt-4">
                        Hai người &quot;hợp rơ&quot; ghê luôn ấy.
                        Đi nhậu ngay và luôn không bồ?
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex-col sm:flex-col gap-3 pt-6">
                    <Link href={`/match/${matchId}`} className="w-full">
                        <Button className="w-full text-lg h-12" onClick={onClose}>
                            CHỐT LỊCH NGAY! 🚀
                        </Button>
                    </Link>
                    <Button variant="ghost" className="w-full font-bold" onClick={onClose}>
                        ĐỂ SAU ĐI...
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
