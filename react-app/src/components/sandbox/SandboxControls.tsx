import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSandbox } from '../../context/SandboxContext';
import { ORANGE } from '../../theme';

interface Props {
  playerNames: string[];
}

export function SandboxControls({ playerNames }: Props) {
  const { selectedPlayer, strikeCount, setSelectedPlayer, setStrikeCount } = useSandbox();
  const [inputVal, setInputVal] = useState(selectedPlayer.replace(/[LR]$/, ''));
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync input when context player changes externally
  useEffect(() => {
    setInputVal(selectedPlayer.replace(/[LR]$/, ''));
  }, [selectedPlayer]);

  function handleInput(val: string) {
    setInputVal(val);
    if (val.length < 2) { setSuggestions([]); setOpen(false); return; }
    const matches = playerNames
      .filter(p => p.toLowerCase().includes(val.toLowerCase()))
      .slice(0, 8);
    setSuggestions(matches);
    setOpen(matches.length > 0);
  }

  function select(name: string) {
    setSelectedPlayer(name);
    setInputVal(name.replace(/[LR]$/, ''));
    setSuggestions([]);
    setOpen(false);
  }

  return (
    <div className="flex flex-wrap items-center gap-6 p-4 rounded-2xl mb-6"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>

      {/* Player search */}
      <div className="relative flex-1 min-w-52">
        <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: 'rgba(255,255,255,0.45)' }}>
          Player
        </label>
        <input
          ref={inputRef}
          type="text"
          value={inputVal}
          onChange={e => handleInput(e.target.value)}
          onFocus={() => inputVal.length >= 2 && suggestions.length > 0 && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="e.g. Yordan Alvarez"
          className="w-full rounded-xl px-4 py-2.5 text-sm font-bold text-white outline-none"
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}
        />
        <AnimatePresence>
          {open && (
            <motion.ul
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute left-0 right-0 top-full z-50 rounded-xl overflow-hidden overflow-y-auto"
              style={{ background: '#111', border: '1px solid rgba(255,255,255,0.12)', maxHeight: '220px' }}
            >
              {suggestions.map((name, i) => (
                <motion.li
                  key={name}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onMouseDown={() => select(name)}
                  className="px-4 py-2.5 cursor-pointer text-sm font-bold hover:text-white transition-colors"
                  style={{ color: 'rgba(255,255,255,0.7)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(235,110,31,0.15)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  {name.replace(/[LR]$/, '')}
                  <span className="ml-1.5 text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    {name.slice(-1) === 'L' ? 'LHB' : 'RHB'}
                  </span>
                </motion.li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>

      {/* Strike count toggle */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: 'rgba(255,255,255,0.45)' }}>
          Strike Count
        </label>
        <div className="flex gap-2">
          {(['0', '2'] as const).map(count => (
            <button
              key={count}
              onClick={() => setStrikeCount(count)}
              className="px-5 py-2.5 rounded-xl text-sm font-black uppercase tracking-wide transition-all duration-200"
              style={{
                background: strikeCount === count ? ORANGE : 'rgba(255,255,255,0.06)',
                color: strikeCount === count ? '#fff' : 'rgba(255,255,255,0.5)',
                border: `1px solid ${strikeCount === count ? ORANGE : 'rgba(255,255,255,0.1)'}`,
              }}
            >
              {count} Strikes
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
