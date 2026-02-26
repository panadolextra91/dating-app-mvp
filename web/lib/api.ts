import { toast } from "sonner";
import {
    User,
    CreateUserPayload,
    CreateLikePayload,
    LikeResponse,
    Match,
    CreateAvailabilityPayload,
    Availability,
    CommonSlot
} from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

const CA_CHON_FALLBACKS = [
    "Gặp lỗi rồi bồ tèo ơi! ☕",
    "Máy chủ đang đi nhậu rồi, thử lại sau nhé! 🍺",
    "Bấn quá hóa rồ hả? Lỗi rồi! 🙄",
    "Có gì đó sai sai, chắc tại thằng Backend! 👻",
    "Toang rồi ông giáo ạ! 🤠"
];

const getRandomFallback = () => CA_CHON_FALLBACKS[Math.floor(Math.random() * CA_CHON_FALLBACKS.length)];

/** Generic error handler with status-specific "Cà Chờn" attitude */
const handleError = (error: unknown, endpoint: string, fallbackMessage: string) => {
    console.error(`[API Error] ${endpoint}:`, error);

    let description = getRandomFallback();
    const message = error instanceof Error ? error.message : "Sập rồi!";

    // Smart Error Handling based on status
    if (error && typeof error === 'object' && 'status' in error) {
        if (error.status === 409) {
            description = "Trùng lịch/Email rồi ba ơi, kiểm tra lại đi! 🙄";
        } else if (error.status === 404) {
            description = "Không tìm thấy đối tượng, chắc nó sủi rồi! 👻";
        }
    }

    // Toast De-duplication using endpoint as ID
    toast.error(`${fallbackMessage}: ${message}`, {
        id: `api-error-${endpoint}`,
        description,
    });

    throw error; // Rethrow so components can use try/catch/finally
};

/** Base fetch wrapper */
async function apiFetch<T>(
    endpoint: string,
    options?: RequestInit
): Promise<T> {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...options?.headers,
        },
    });

    const text = await response.text();

    if (!response.ok) {
        const errorData = text ? JSON.parse(text) : {};
        const error = new Error(errorData.message || `Lỗi ${response.status}`);
        (error as Error & { status: number }).status = response.status;
        throw error;
    }

    return (text ? JSON.parse(text) : null) as T;
}

/** Specific API methods - All return original promises for loading handling */
export const api = {
    // Users
    createUser: (payload: CreateUserPayload) =>
        apiFetch<User>("/users", {
            method: "POST",
            body: JSON.stringify(payload),
        }).catch((e) => handleError(e, "/users", "Tạo profile thất bại")),

    getUsers: () =>
        apiFetch<User[]>("/users").catch((e) =>
            handleError(e, "/users", "Không lấy được danh sách user")
        ),

    getUserById: (id: string) =>
        apiFetch<User>(`/users/${id}`).catch((e) =>
            handleError(e, `/users/${id}`, "Không lấy được thông tin user")
        ),

    // Likes - Returns LikeResponse { like, match? }
    likeUser: (payload: CreateLikePayload) =>
        apiFetch<LikeResponse>("/likes", {
            method: "POST",
            body: JSON.stringify(payload),
        }).catch((e) => handleError(e, "/likes", "Like dạo thất bại")),

    // Matches
    getMatchesByUserId: (userId: string) =>
        apiFetch<Match[]>(`/matches/user/${userId}`).catch((e) =>
            handleError(e, `/matches/user/${userId}`, "Tìm match thất bại")
        ),

    getCommonSlot: (matchId: string) =>
        apiFetch<CommonSlot>(`/matches/${matchId}/common-slot`).catch((e) =>
            handleError(e, `/matches/${matchId}/common-slot`, "Kiểm tra lịch chung thất bại")
        ),

    // Availability
    addAvailability: (payload: CreateAvailabilityPayload) =>
        apiFetch<Availability>("/availabilities", { method: "POST", body: JSON.stringify(payload) })
            .catch(e => handleError(e, "/availabilities", "Thêm lịch nhậu thất bại")),

    getAvailabilitiesByUserId: (userId: string) =>
        apiFetch<Availability[]>(`/availabilities/user/${userId}`).catch((e) =>
            handleError(e, `/availabilities/user/${userId}`, "Không lấy được lịch nhậu")
        ),

    getUserByEmail: (email: string) =>
        apiFetch<User>(`/users/email/${email}`).catch((e) =>
            handleError(e, `/users/email/${email}`, "Không tìm thấy user bằng email này")
        ),
};
