import type { Analysis } from 'features'
import type { FC } from 'react'
import { Page } from '../../../core/components/page'

export const AnalysisPage: FC<{ analysis: Analysis[] }> = ({ analysis }) => {
  return (
    <Page>
      <div>{analysis.map((x) => x.toDto().id)}</div>
    </Page>
  )
}
