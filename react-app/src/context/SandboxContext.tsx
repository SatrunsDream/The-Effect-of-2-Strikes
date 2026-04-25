import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface SandboxState {
  selectedPlayer: string;
  strikeCount: '0' | '2';
  setSelectedPlayer: (p: string) => void;
  setStrikeCount: (s: '0' | '2') => void;
}

const SandboxContext = createContext<SandboxState | null>(null);

export function SandboxProvider({ children }: { children: ReactNode }) {
  const [selectedPlayer, setSelectedPlayer] = useState('Yordan AlvarezL');
  const [strikeCount, setStrikeCount] = useState<'0' | '2'>('0');

  return (
    <SandboxContext.Provider value={{ selectedPlayer, strikeCount, setSelectedPlayer, setStrikeCount }}>
      {children}
    </SandboxContext.Provider>
  );
}

export function useSandbox(): SandboxState {
  const ctx = useContext(SandboxContext);
  if (!ctx) throw new Error('useSandbox must be inside SandboxProvider');
  return ctx;
}
