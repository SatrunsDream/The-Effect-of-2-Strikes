import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { AppData } from '../types/data';

const DataContext = createContext<AppData | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('/files/yordan/alvarez_kde_data.json').then(r => r.json()),
      fetch('/files/yordan/radar.json').then(r => r.json()),
      fetch('/files/yordan/delta_angles.json').then(r => r.json()),
      fetch('/files/yordan/contact_vs_wOBA_2str.json').then(r => r.json()),
      fetch('/files/yordan/overall_wOBA_vs_barrel_percent.json').then(r => r.json()),
      fetch('/files/yordan/yordansummary.json').then(r => r.json()),
      fetch('/files/But/league_trend.json').then(r => r.json()),
      fetch('/files/sandbox/players_angles_0str.json').then(r => r.json()),
      fetch('/files/sandbox/players_angles_2str.json').then(r => r.json()),
      fetch('/files/sandbox/zerostr_stats.json').then(r => r.json()),
      fetch('/files/sandbox/twostr_stats.json').then(r => r.json()),
      fetch('/files/sandbox/league_average_rates_2str.json').then(r => r.json()),
      fetch('/files/sandbox/player_average_rates_0str.json').then(r => r.json()),
      fetch('/files/sandbox/player_average_rates_2str.json').then(r => r.json()),
    ]).then(([kde, radar, delta, contactScatter, overall, yordanSummary,
              leagueTrend, players0, players2, zeroStats, twoStats,
              leagueRates2, playerRates0, playerRates2]) => {
      setData({
        kde, radar, delta, contactScatter, overall, yordanSummary,
        leagueTrend, players0, players2, zeroStats, twoStats,
        leagueRates2, playerRates0, playerRates2,
      });
    }).catch(err => console.error('Data load failed:', err));
  }, []);

  return (
    <DataContext.Provider value={data}>
      {children}
    </DataContext.Provider>
  );
}

export function useData(): AppData | null {
  return useContext(DataContext);
}
