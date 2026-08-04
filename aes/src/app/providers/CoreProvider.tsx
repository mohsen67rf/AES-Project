import { createContext, useContext, ReactNode } from 'react';

// این یه نمونه ساده‌ست، بعداً کاملش می‌کنیم
const CoreContext = createContext({});

export function CoreProvider({ children }: { children: ReactNode }) {
  return (
    <CoreContext.Provider value={{}}>
      {children}
    </CoreContext.Provider>
  );
}

export function useCore() {
  return useContext(CoreContext);
}