import type { FC, PropsWithChildren } from 'react'

export const Page: FC<PropsWithChildren> = ({ children }) => {
  return <div className="flex-col w-full h-full">{children}</div>
}
