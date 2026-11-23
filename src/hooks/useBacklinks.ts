import { useQuery } from '@tanstack/react-query';
import { getBacklinks } from '../lib/topicsApi';

export function useBacklinks(slug: string | undefined) {
  return useQuery({
    queryKey: ['backlinks', slug],
    queryFn: () => (slug ? getBacklinks(slug) : []),
    enabled: Boolean(slug),
    staleTime: 5 * 60 * 1000,
  });
}
