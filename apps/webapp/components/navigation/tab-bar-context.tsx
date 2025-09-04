'use client'

import React, { createContext, type ReactNode, useContext, useState } from 'react'

interface TabBarContextType {
  isTabBarVisible: boolean
  hideTabBar: () => void
  showTabBar: () => void
}

const TabBarContext = createContext<TabBarContextType | undefined>(undefined)

export const TabBarProvider = ({ children }: { children: ReactNode }) => {
  const [isTabBarVisible, setIsTabBarVisible] = useState(true)

  const hideTabBar = () => setIsTabBarVisible(false)
  const showTabBar = () => setIsTabBarVisible(true)

  return (
    <TabBarContext.Provider value={{ isTabBarVisible, hideTabBar, showTabBar }}>
      {children}
    </TabBarContext.Provider>
  )
}

export function useTabBar() {
  const context = useContext(TabBarContext)
  if (context === undefined) {
    throw new Error('useTabBar must be used within a TabBarProvider')
  }
  return context
}
