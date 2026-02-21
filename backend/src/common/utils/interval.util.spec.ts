import { findFirstCommonSlot, TimeSlot } from './interval.util';

function slot(start: string, end: string): TimeSlot {
    return { startTime: new Date(start), endTime: new Date(end) };
}

describe('findFirstCommonSlot', () => {
    it('should return null when both arrays are empty', () => {
        expect(findFirstCommonSlot([], [])).toBeNull();
    });

    it('should return null when one array is empty', () => {
        const slotsA = [slot('2026-03-01T09:00:00Z', '2026-03-01T10:00:00Z')];
        expect(findFirstCommonSlot(slotsA, [])).toBeNull();
        expect(findFirstCommonSlot([], slotsA)).toBeNull();
    });

    it('should return null when no overlap exists', () => {
        const slotsA = [slot('2026-03-01T09:00:00Z', '2026-03-01T10:00:00Z')];
        const slotsB = [slot('2026-03-01T11:00:00Z', '2026-03-01T12:00:00Z')];

        expect(findFirstCommonSlot(slotsA, slotsB)).toBeNull();
    });

    it('should return null when slots are adjacent but not overlapping', () => {
        const slotsA = [slot('2026-03-01T09:00:00Z', '2026-03-01T10:00:00Z')];
        const slotsB = [slot('2026-03-01T10:00:00Z', '2026-03-01T11:00:00Z')];

        expect(findFirstCommonSlot(slotsA, slotsB)).toBeNull();
    });

    it('should find partial overlap', () => {
        const slotsA = [slot('2026-03-01T09:00:00Z', '2026-03-01T11:00:00Z')];
        const slotsB = [slot('2026-03-01T10:00:00Z', '2026-03-01T12:00:00Z')];

        const result = findFirstCommonSlot(slotsA, slotsB);
        expect(result).toEqual({
            start: new Date('2026-03-01T10:00:00Z'),
            end: new Date('2026-03-01T11:00:00Z'),
        });
    });

    it('should find overlap when one slot fully contains another', () => {
        const slotsA = [slot('2026-03-01T08:00:00Z', '2026-03-01T14:00:00Z')];
        const slotsB = [slot('2026-03-01T10:00:00Z', '2026-03-01T12:00:00Z')];

        const result = findFirstCommonSlot(slotsA, slotsB);
        expect(result).toEqual({
            start: new Date('2026-03-01T10:00:00Z'),
            end: new Date('2026-03-01T12:00:00Z'),
        });
    });

    it('should find exact same slot overlap', () => {
        const slotsA = [slot('2026-03-01T09:00:00Z', '2026-03-01T10:00:00Z')];
        const slotsB = [slot('2026-03-01T09:00:00Z', '2026-03-01T10:00:00Z')];

        const result = findFirstCommonSlot(slotsA, slotsB);
        expect(result).toEqual({
            start: new Date('2026-03-01T09:00:00Z'),
            end: new Date('2026-03-01T10:00:00Z'),
        });
    });

    it('should return the FIRST common slot when multiple overlaps exist', () => {
        const slotsA = [
            slot('2026-03-01T09:00:00Z', '2026-03-01T11:00:00Z'),
            slot('2026-03-02T14:00:00Z', '2026-03-02T16:00:00Z'),
        ];
        const slotsB = [
            slot('2026-03-01T10:00:00Z', '2026-03-01T12:00:00Z'),
            slot('2026-03-02T15:00:00Z', '2026-03-02T17:00:00Z'),
        ];

        const result = findFirstCommonSlot(slotsA, slotsB);
        expect(result).toEqual({
            start: new Date('2026-03-01T10:00:00Z'),
            end: new Date('2026-03-01T11:00:00Z'),
        });
    });

    it('should handle unsorted input arrays correctly', () => {
        const slotsA = [
            slot('2026-03-02T14:00:00Z', '2026-03-02T16:00:00Z'),
            slot('2026-03-01T09:00:00Z', '2026-03-01T11:00:00Z'),
        ];
        const slotsB = [
            slot('2026-03-02T15:00:00Z', '2026-03-02T17:00:00Z'),
            slot('2026-03-01T10:00:00Z', '2026-03-01T12:00:00Z'),
        ];

        const result = findFirstCommonSlot(slotsA, slotsB);
        expect(result).toEqual({
            start: new Date('2026-03-01T10:00:00Z'),
            end: new Date('2026-03-01T11:00:00Z'),
        });
    });

    it('should skip non-overlapping slots and find later overlap', () => {
        const slotsA = [
            slot('2026-03-01T06:00:00Z', '2026-03-01T07:00:00Z'),
            slot('2026-03-01T09:00:00Z', '2026-03-01T11:00:00Z'),
        ];
        const slotsB = [
            slot('2026-03-01T08:00:00Z', '2026-03-01T08:30:00Z'),
            slot('2026-03-01T10:00:00Z', '2026-03-01T12:00:00Z'),
        ];

        const result = findFirstCommonSlot(slotsA, slotsB);
        expect(result).toEqual({
            start: new Date('2026-03-01T10:00:00Z'),
            end: new Date('2026-03-01T11:00:00Z'),
        });
    });
});
