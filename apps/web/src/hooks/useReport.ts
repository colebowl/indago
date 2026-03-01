import { useQuery } from '@tanstack/react-query'
import { getReport } from '@/providers/api'

export function useReport(propertyId: string | undefined) {
  return useQuery({
    queryKey: ['report', propertyId],
    queryFn: () => getReport(propertyId!),
    enabled: !!propertyId,
  })
}
