import { useQuery } from '@tanstack/react-query';
import { getTopic } from '../lib/topicsApi';

export function useTopic(slug: string | undefined) {
  return useQuery({
    queryKey: ['topic', slug],
    queryFn: () => (slug ? getTopic(slug) : null),
    enabled: Boolean(slug),
    staleTime: 5 * 60 * 1000, // 5 minutes as specified
  });
}
