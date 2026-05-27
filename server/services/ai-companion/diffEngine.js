/**
 * Diff Engine — Applies patches to trip itinerary and creates snapshots for undo
 */

/**
 * Create a deep snapshot of the current tripData for undo
 */
function createSnapshot(tripData) {
    return JSON.parse(JSON.stringify(tripData));
}

/**
 * Apply a validated patch to trip data
 * Returns the modified tripData (does NOT mutate the original)
 * @param {Object} tripData - Current trip data
 * @param {Object} patch - Validated patch from patchGenerator
 * @returns {{ updatedTripData: Object, appliedChanges: Array, errors: Array }}
 */
function applyPatch(tripData, patch) {
    const updated = JSON.parse(JSON.stringify(tripData));
    const itinerary = updated.itinerary || [];
    const appliedChanges = [];
    const errors = [];

    for (const change of patch.changes) {
        const dayIdx = change.day - 1; // Convert 1-indexed to 0-indexed

        if (dayIdx < 0 || dayIdx >= itinerary.length) {
            errors.push(`Day ${change.day} does not exist (trip has ${itinerary.length} days)`);
            continue;
        }

        const day = itinerary[dayIdx];

        if (change.type === 'replace' && change.slot) {
            const result = replaceActivity(day, change);
            if (result.success) {
                appliedChanges.push(result.change);
            } else {
                errors.push(result.error);
            }
        } else if (change.type === 'add' && change.slot) {
            const result = addActivity(day, change);
            if (result.success) {
                appliedChanges.push(result.change);
            } else {
                errors.push(result.error);
            }
        } else if (change.type === 'remove' && change.slot) {
            const result = removeActivity(day, change);
            if (result.success) {
                appliedChanges.push(result.change);
            } else {
                errors.push(result.error);
            }
        } else if (change.type === 'modify' && change.slot) {
            // Modify is treated as replace
            const result = replaceActivity(day, change);
            if (result.success) {
                appliedChanges.push(result.change);
            } else {
                errors.push(result.error);
            }
        }
    }

    return { updatedTripData: updated, appliedChanges, errors };
}

/**
 * Replace an activity in a specific time slot
 */
function replaceActivity(day, change) {
    const slotName = normalizeSlot(change.slot);
    if (!day.activities || !Array.isArray(day.activities)) {
        return { success: false, error: `Day ${change.day} has no activities` };
    }

    const actIdx = day.activities.findIndex(
        (a) => (a.time || '').toLowerCase() === slotName
    );

    if (actIdx === -1) {
        // If slot doesn't exist, add it instead
        if (change.add) {
            day.activities.push({
                time: capitalize(slotName),
                placeName: change.add.placeName,
                activity: change.add.activity,
                estimatedCost: change.add.estimatedCost || '',
                mapsLink: change.add.mapsLink || '',
            });
            return {
                success: true,
                change: {
                    type: 'add',
                    day: change.day,
                    slot: slotName,
                    added: change.add,
                },
            };
        }
        return { success: false, error: `No ${slotName} slot found in day ${change.day}` };
    }

    const oldActivity = { ...day.activities[actIdx] };

    if (change.add) {
        day.activities[actIdx] = {
            ...day.activities[actIdx],
            placeName: change.add.placeName,
            activity: change.add.activity,
            estimatedCost: change.add.estimatedCost || day.activities[actIdx].estimatedCost,
            mapsLink: change.add.mapsLink || day.activities[actIdx].mapsLink,
        };
    }

    return {
        success: true,
        change: {
            type: 'replace',
            day: change.day,
            slot: slotName,
            removed: { placeName: oldActivity.placeName, activity: oldActivity.activity },
            added: change.add,
        },
    };
}

/**
 * Add a new activity to a day
 */
function addActivity(day, change) {
    if (!day.activities) day.activities = [];

    day.activities.push({
        time: capitalize(normalizeSlot(change.slot)),
        placeName: change.add.placeName,
        activity: change.add.activity,
        estimatedCost: change.add.estimatedCost || '',
        mapsLink: change.add.mapsLink || '',
    });

    return {
        success: true,
        change: {
            type: 'add',
            day: change.day,
            slot: normalizeSlot(change.slot),
            added: change.add,
        },
    };
}

/**
 * Remove an activity from a day
 */
function removeActivity(day, change) {
    const slotName = normalizeSlot(change.slot);
    if (!day.activities) return { success: false, error: 'No activities to remove' };

    const actIdx = day.activities.findIndex(
        (a) => (a.time || '').toLowerCase() === slotName
    );

    if (actIdx === -1) {
        return { success: false, error: `No ${slotName} slot found in day ${change.day}` };
    }

    const removed = day.activities.splice(actIdx, 1)[0];

    return {
        success: true,
        change: {
            type: 'remove',
            day: change.day,
            slot: slotName,
            removed: { placeName: removed.placeName, activity: removed.activity },
        },
    };
}

/**
 * Build a diff summary for frontend display
 */
function buildDiffSummary(patch, appliedChanges) {
    return {
        intent: patch.intent,
        targetDays: patch.targetDays,
        summary: patch.summary,
        benefits: patch.benefits,
        changes: appliedChanges.map((c) => ({
            type: c.type,
            day: c.day,
            slot: c.slot,
            removed: c.removed || null,
            added: c.added || null,
        })),
        totalChanges: appliedChanges.length,
    };
}

function normalizeSlot(slot) {
    if (!slot) return '';
    const s = slot.toLowerCase().replace(/^meal_/, '');
    const map = { morning: 'morning', afternoon: 'afternoon', evening: 'evening', night: 'night' };
    return map[s] || s;
}

function capitalize(str) {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
}

module.exports = { createSnapshot, applyPatch, buildDiffSummary };
