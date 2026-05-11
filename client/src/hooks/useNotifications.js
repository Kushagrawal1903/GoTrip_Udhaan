import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export function useNotifications(userId) {
    return useQuery({
        queryKey: ['notifications', userId],
        queryFn: async () => {
            const res = await api.get('/notifications');
            return res.data.data;
        },
        enabled: !!userId,
    });
}

export function useNotificationCount(userId) {
    return useQuery({
        queryKey: ['notifications', 'count', userId],
        queryFn: async () => {
            const res = await api.get('/notifications/count');
            return res.data.data.count;
        },
        enabled: !!userId,
        refetchInterval: 30000, // Poll every 30s
    });
}

export function useMarkRead(userId) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            await api.patch(`/notifications/${id}/read`);
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['notifications', userId] });
            qc.invalidateQueries({ queryKey: ['notifications', 'count', userId] });
        },
    });
}

export function useMarkAllRead(userId) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async () => {
            await api.patch('/notifications/read-all');
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['notifications', userId] });
            qc.setQueryData(['notifications', 'count', userId], 0);
        },
    });
}
