'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface PageTitleContextValue {
  title: string;
  setTitle: (title: string) => void;
}

const PageTitleContext = createContext<PageTitleContextValue>({
  title: 'Petals ERP',
  setTitle: () => {},
});

export function PageTitleProvider({
  children,
  initialTitle = 'Petals ERP',
}: {
  children: ReactNode;
  initialTitle?: string;
}) {
  const [title, setTitle] = useState(initialTitle);

  return (
    <PageTitleContext.Provider value={{ title, setTitle }}>
      {children}
    </PageTitleContext.Provider>
  );
}

export function usePageTitle(newTitle?: string) {
  const ctx = useContext(PageTitleContext);
  React.useEffect(() => {
    if (newTitle) {
      ctx.setTitle(newTitle);
    }
  }, [newTitle, ctx]);

  return ctx;
}
