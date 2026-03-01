import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { CreatePropertyInput } from '@indago/types'
import { listProperties, getProperty, createProperty, deleteProperty } from '@/providers/api'

export function useProperties() {
  return useQuery({
    queryKey: ['properties'],
    queryFn: listProperties,
  })
}

export function useProperty(id: string | undefined) {
  return useQuery({
    queryKey: ['property', id],
    queryFn: () => getProperty(id!),
    enabled: !!id,
  })
}

export function useCreateProperty() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CreatePropertyInput) => createProperty(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['properties'] }),
  })
}

export function useDeleteProperty() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteProperty(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['properties'] }),
  })
}
