import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

/**
 * usePackingList — manages packing list state, generation, and item toggling
 * @param {string} tripId - The trip ID to manage the packing list for
 * @param {Object} existingPackingList - Pre-loaded packing list from trip data
 */
export default function usePackingList(tripId, existingPackingList = null) {
    const [packingList, setPackingList] = useState(existingPackingList);
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (existingPackingList && existingPackingList.categories?.length > 0) {
            setPackingList(existingPackingList);
        }
    }, [existingPackingList]);

    const generate = useCallback(async () => {
        setGenerating(true);
        setError('');
        try {
            const res = await api.post('/packing-list/generate', { tripId });
            setPackingList(res.data.data.packingList);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to generate packing list.');
        } finally {
            setGenerating(false);
        }
    }, [tripId]);

    const toggleItem = useCallback(async (categoryIndex, itemIndex, checked) => {
        // Optimistic update
        setPackingList(prev => {
            if (!prev) return prev;
            const updated = JSON.parse(JSON.stringify(prev));
            updated.categories[categoryIndex].items[itemIndex].checked = checked;
            return updated;
        });

        try {
            await api.patch(`/packing-list/${tripId}/toggle`, {
                categoryIndex,
                itemIndex,
                checked,
            });
        } catch (err) {
            // Revert on failure
            setPackingList(prev => {
                if (!prev) return prev;
                const reverted = JSON.parse(JSON.stringify(prev));
                reverted.categories[categoryIndex].items[itemIndex].checked = !checked;
                return reverted;
            });
            setError('Failed to update item. Please try again.');
            setTimeout(() => setError(''), 3000);
        }
    }, [tripId]);

    // Calculate progress
    const progress = (() => {
        if (!packingList?.categories) return { checked: 0, total: 0, percent: 0 };
        let checked = 0, total = 0;
        for (const cat of packingList.categories) {
            for (const item of (cat.items || [])) {
                total++;
                if (item.checked) checked++;
            }
        }
        return { checked, total, percent: total > 0 ? Math.round((checked / total) * 100) : 0 };
    })();

    const downloadAsText = useCallback(() => {
        if (!packingList?.categories) return;
        let text = '=== GOTRIP PRO — PACKING LIST ===\n\n';
        if (packingList.weatherNote) text += `Weather: ${packingList.weatherNote}\n\n`;
        for (const cat of packingList.categories) {
            text += `${cat.icon || '📦'} ${cat.name}\n`;
            text += '─'.repeat(30) + '\n';
            for (const item of (cat.items || [])) {
                const check = item.checked ? '✓' : '○';
                const essential = item.essential ? ' [ESSENTIAL]' : '';
                const qty = item.quantity > 1 ? ` (×${item.quantity})` : '';
                const note = item.note ? ` — ${item.note}` : '';
                text += `  ${check} ${item.name}${qty}${essential}${note}\n`;
            }
            text += '\n';
        }
        if (packingList.proTip) text += `💡 Pro Tip: ${packingList.proTip}\n`;

        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'GoTrip-Packing-List.txt';
        a.click();
        URL.revokeObjectURL(url);
    }, [packingList]);

    return {
        packingList,
        generating,
        error,
        generate,
        toggleItem,
        progress,
        downloadAsText,
        hasPackingList: !!(packingList?.categories?.length > 0),
    };
}
