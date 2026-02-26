// ============================================
// Shared TypeScript types for Cà Chớn Dating
// Mirrors backend Prisma schema exactly
// ============================================

/** Gender enum — matches Prisma Gender enum */
export type Gender = "MALE" | "FEMALE" | "OTHER";

/** Full User object returned by the backend (GET /users, POST /users, GET /users/:id) */
export type User = {
    id: string;
    email: string;
    name: string;
    age: number;
    gender: Gender;
    bio: string | null;
    createdAt: string; // ISO date string from JSON serialization
    updatedAt: string; // ISO date string from JSON serialization
};

/** POST /users request body */
export type CreateUserPayload = {
    email: string;
    name: string;
    age: number;
    gender: Gender;
    bio?: string;
};

/** POST /likes request body */
export type CreateLikePayload = {
    fromUserId: string;
    toUserId: string;
};

/** Like object returned by backend */
export type Like = {
    id: string;
    fromUserId: string;
    toUserId: string;
    createdAt: string;
};

/** Match response from POST /likes when mutual match occurs */
export type LikeResponse = {
    like: Like;
    match?: Match;
};

/** Match object returned by backend (POST /likes when mutual, GET /matches/user/:userId) */
export type Match = {
    id: string;
    user1Id: string;
    user2Id: string;
    createdAt: string;
};

/** POST /availabilities request body */
export type CreateAvailabilityPayload = {
    userId: string;
    startTime: string; // ISO date string
    endTime: string; // ISO date string
};

/** Availability object returned by backend */
export type Availability = {
    id: string;
    userId: string;
    startTime: string;
    endTime: string;
};

/** Common slot response from GET /matches/:matchId/common-slot */
export type CommonSlot = {
    startTime: string;
    endTime: string;
};
