export interface TimeSlot {
    startTime: Date;
    endTime: Date;
}

/**
 * Find the first overlapping time slot between two sorted arrays of slots.
 * Uses O(N log N) two-pointer approach — no nested loops.
 *
 * @returns The exact overlapped period { start, end } or null if no overlap.
 */
export function findFirstCommonSlot(
    slotsA: TimeSlot[],
    slotsB: TimeSlot[],
): { start: Date; end: Date } | null {
    if (slotsA.length === 0 || slotsB.length === 0) return null;

    const sortedA = [...slotsA].sort(
        (a, b) => a.startTime.getTime() - b.startTime.getTime(),
    );
    const sortedB = [...slotsB].sort(
        (a, b) => a.startTime.getTime() - b.startTime.getTime(),
    );

    let i = 0;
    let j = 0;

    while (i < sortedA.length && j < sortedB.length) {
        const startA = sortedA[i].startTime;
        const endA = sortedA[i].endTime;
        const startB = sortedB[j].startTime;
        const endB = sortedB[j].endTime;

        const overlapStart = new Date(Math.max(startA.getTime(), startB.getTime()));
        const overlapEnd = new Date(Math.min(endA.getTime(), endB.getTime()));

        if (overlapStart < overlapEnd) {
            return { start: overlapStart, end: overlapEnd };
        }

        if (endA <= endB) {
            i++;
        } else {
            j++;
        }
    }

    return null;
}
