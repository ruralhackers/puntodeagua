import { useCallback } from 'react'
import { useAuthHttpClient } from '../../auth/hooks/use-auth-http-client'
import { GetSummaryQry } from '../application/get-summary.qry'
import type { SummaryParams, SummaryResponse } from '../infrastructure/summary.api-rest-repository'
import { SummaryApiRestRepository } from '../infrastructure/summary.api-rest-repository'

export function useGetSummary() {
  const authHttpClient = useAuthHttpClient()

  const getSummary = useCallback(
    async (params?: SummaryParams): Promise<SummaryResponse> => {
      const repository = new SummaryApiRestRepository(authHttpClient)
      const query = new GetSummaryQry(repository)
      return await query.handle(params)
    },
    [authHttpClient]
  )

  return { getSummary }
}
