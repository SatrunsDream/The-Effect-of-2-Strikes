// Yordan summary stats (yordansummary.json)
export interface PlayerSummary {
  name_with_stand: string;
  wOBA: number;
  wOBA_percentile: number;
  'barrel%': number;
  'barrel%_percentile': number;
  EV90: number;
  EV90_percentile: number;
  HRs: number;
  HRs_percentile: number;
}

// Radar chart data (radar.json)
export interface RadarPlayer {
  name_with_stand: string;
  wOBA: number;
  wOBA_2str_pctile: number;
  OBP: number;
  OBP_percentile: number;
  delta_attack_angle: number;
  delta_attack_angle_percentile: number;
  delta_attack_direction: number;
  delta_attack_direction_percentile: number;
  delta_swing_path_tilt: number;
  delta_swing_path_tilt_percentile: number;
  angle_magnitude: number;
  angle_magnitude_percentile: number;
  pitches_seen: number;
  'swing%': number;
  [key: string]: number | string;
}

// Contact vs wOBA scatter (contact_vs_wOBA_2str.json)
export interface ContactScatterPoint {
  name_with_stand: string;
  wOBA: number;
  wOBA_2str_pctile: number;
  pitches_seen: number;
  is_K: number;
  'swing%': number;
  'zone_swing%': number;
  'chase%': number;
  'contact%': number;
  'whiff%': number;
  'foul%': number;
  'in_play%': number;
  'oppo%': number;
  'gb%': number;
  'barrel%': number;
  ABs: number;
  PAs: number;
}

// Overall wOBA vs barrel% scatter (overall_wOBA_vs_barrel_percent.json)
export interface OverallScatterPoint {
  name_with_stand: string;
  is_swing: number;
  is_inzone: number;
  is_whiff: number;
  is_contact: number;
  is_foul: number;
  is_zone_swing: number;
  is_inplay: number;
  is_oppo: number;
  is_gb: number;
  is_barrel: number;
  is_K: number;
  pitches_seen: number;
  'swing%': number;
  'zone_swing%': number;
  'chase%': number;
  'contact%': number;
  'whiff%': number;
  'foul%': number;
  'in_play%': number;
  'oppo%': number;
  'gb%': number;
  'barrel%': number;
  wOBA: number;
}

// Delta angles histogram (delta_angles.json)
export interface DeltaAnglesPoint {
  name_with_stand: string;
  delta_attack_angle: number;
  delta_attack_direction: number;
  delta_swing_path_tilt: number;
}

// KDE heatmap data (alvarez_kde_data.json)
export interface KDEData {
  zone: { left: number; right: number; bottom: number; top: number };
  grid: {
    x: number[];
    y: number[];
    z0: number[][];
    z1: number[][];
  };
}

// League average rates
export interface LeagueRates {
  'chase%': number;
  'contact%': number;
  'whiff%': number;
  'oppo%': number;
  'gb%': number;
  'barrel%': number;
}

// Player average rates (player_average_rates_*.json)
export interface PlayerRates {
  name_with_stand: string;
  'chase%': number;
  'contact%': number;
  'whiff%': number;
  'oppo%': number;
  'gb%': number;
  'barrel%': number;
}

// Sandbox player angles (players_angles_*.json)
export interface PlayerAngles {
  name_with_stand: string;
  attack_angle: number;
  attack_direction: number;
  swing_path_tilt: number;
  bat_speed: number;
}

// Sandbox league-average stats for a single strike count (zerostr_stats / twostr_stats)
export interface LeagueStats {
  attack_angle: number;
  attack_direction: number;
  swing_path_tilt: number;
  bat_speed: number;
}

// League trend data (league_trend.json) — columnar object format
export interface LeagueTrendRaw {
  name_with_stand: Record<string, string>;
  [key: string]: Record<string, string | number>;
}

// All loaded app data
export interface AppData {
  kde: KDEData;
  radar: RadarPlayer[];
  delta: DeltaAnglesPoint[];
  contactScatter: ContactScatterPoint[];
  overall: OverallScatterPoint[];
  yordanSummary: PlayerSummary[];
  leagueTrend: LeagueTrendRaw;
  players0: PlayerAngles[];
  players2: PlayerAngles[];
  zeroStats: LeagueStats[];
  twoStats: LeagueStats[];
  leagueRates2: LeagueRates[];
  playerRates0: PlayerRates[];
  playerRates2: PlayerRates[];
}
