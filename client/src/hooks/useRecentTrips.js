import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

export default function useRecentTrips(userId) {
    return useQuery({
        queryKey: ['dashboard', 'recentTrips', userId],
        queryFn: async () => {
            const res = await api.get('/dashboard/recent-trips');
            return res.data.data;
        },
        enabled: !!userId,
    });
}
