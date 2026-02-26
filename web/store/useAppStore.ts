import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User } from "@/lib/types";

const STORAGE_KEY = "ca-chon-dating-user";

type AppState = {
    currentUser: User | null;
    showConfetti: boolean;
    login: (user: User) => void;
    logout: () => void;
    setShowConfetti: (show: boolean) => void;
};

export const useAppStore = create<AppState>()(
    persist(
        (set) => ({
            currentUser: null,
            showConfetti: false,

            login: (user: User) => {
                set({ currentUser: user });
            },

            logout: () => {
                set({ currentUser: null });
                // Nuclear option: also nuke the persisted storage
                try {
                    localStorage.removeItem(STORAGE_KEY);
                } catch {
                    // SSR or storage unavailable — ignore
                }
            },

            setShowConfetti: (show: boolean) => {
                set({ showConfetti: show });
            },
        }),
        {
            name: STORAGE_KEY,
            version: 1,
            storage: createJSONStorage(() => localStorage),
        }
    )
);
