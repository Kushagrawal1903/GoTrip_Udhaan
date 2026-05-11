import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

export default function useDashboardStats(userId) {
    return useQuery({
        queryKey: ['dashboard', 'stats', userId],
        queryFn: async () => {
            const res = await api.get('/dashboard/stats');
            return res.data.data;
        },
        enabled: !!userId,
    });
}
