import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { ORANGE, RED } from '../../theme';
import type { PlayerAngles, LeagueStats } from '../../types/data';

interface GaugeData {
  value: number;
  mlbAvg: number;
  title: string;
  unit: string;
  max: number;
  type: 'angle' | 'speed';
}

interface Props {
  playerData: PlayerAngles;
  leagueStats: LeagueStats;
}

function drawAngleGauge(container: d3.Selection<HTMLDivElement, unknown, null, undefined>, gauge: GaugeData) {
  container.selectAll('*').remove();
  const vbW = 300, vbH = 300;
  const svg = container.append('svg').attr('viewBox', `0 0 ${vbW} ${vbH}`)
    .attr('preserveAspectRatio', 'xMidYMid meet').style('width', '100%').style('height', 'auto');

  svg.append('text').attr('x', vbW / 2).attr('y', 28).attr('text-anchor', 'middle')
    .attr('fill', ORANGE).style('font-size', '18px').style('font-weight', '900').text(gauge.title);

  const angleScale = d3.scaleLinear().domain([0, gauge.max]).range([0, Math.PI / 3]);
  const theta = angleScale(gauge.value);
  const r = 110, cx = vbW / 2, cy = vbH / 2;
  const ballX = cx + r * 0.8, ballY = cy;

  // Ball image
  svg.append('image').attr('href', '/images/ball.png')
    .attr('x', ballX - 18).attr('y', ballY - 18).attr('width', 36).attr('height', 36);

  const lineLength = 240, zeroAngle = Math.PI;
  const blackX = ballX + lineLength * Math.cos(zeroAngle);
  const blackY = ballY - lineLength * Math.sin(zeroAngle);

  // Baseline (dashed)
  svg.append('line').attr('x1', ballX).attr('y1', ballY).attr('x2', blackX).attr('y2', blackY)
    .attr('stroke', 'rgba(255,255,255,0.3)').attr('stroke-width', 3).attr('stroke-dasharray', '8,6');

  const redX = ballX + lineLength * Math.cos(zeroAngle - theta);
  const redY = ballY - lineLength * Math.sin(zeroAngle - theta);

  // Polygon fill — animated
  const fillPoly = svg.append('polygon')
    .attr('points', `${ballX},${ballY} ${blackX},${blackY} ${ballX},${ballY}`)
    .attr('fill', ORANGE).attr('opacity', 0.45);

  fillPoly.transition().duration(900).ease(d3.easeQuadOut).attrTween('points', () => t => {
    const cx2 = ballX + (redX - ballX) * t, cy2 = ballY + (redY - ballY) * t;
    return `${ballX},${ballY} ${blackX},${blackY} ${cx2},${cy2}`;
  });

  // Red line — animated
  const redLine = svg.append('line').attr('x1', ballX).attr('y1', ballY).attr('x2', ballX).attr('y2', ballY)
    .attr('stroke', RED).attr('stroke-width', 4);
  redLine.transition().duration(900).ease(d3.easeQuadOut)
    .attr('x2', redX).attr('y2', redY);

  // Value text
  svg.append('text').attr('x', ballX + 20).attr('y', ballY - 8)
    .attr('fill', 'rgba(255,255,255,0.9)').style('font-size', '22px').style('font-weight', '900')
    .text(`${gauge.value.toFixed(1)}${gauge.unit}`);

  // MLB Average
  svg.append('text').attr('x', vbW / 2).attr('y', vbH - 18).attr('text-anchor', 'middle')
    .style('font-size', '14px').style('fill', ORANGE)
    .text(`MLB Avg: ${gauge.mlbAvg.toFixed(1)}${gauge.unit}`);
}

function drawSpeedGauge(container: d3.Selection<HTMLDivElement, unknown, null, undefined>, gauge: GaugeData) {
  container.selectAll('*').remove();
  const vbW = 180, vbH = 180;
  const svg = container.append('svg').attr('viewBox', `0 0 ${vbW} ${vbH}`)
    .attr('preserveAspectRatio', 'xMidYMid meet').style('width', '100%').style('height', 'auto');

  svg.append('text').attr('x', vbW / 2).attr('y', 14).attr('text-anchor', 'middle')
    .attr('fill', ORANGE).style('font-size', '14px').style('font-weight', '900').text(gauge.title);

  const cx = vbW / 2, cy = vbH / 2;
  const innerR = 52, outerR = 60;
  const arcScale = d3.scaleLinear().domain([0, gauge.max]).range([-3 * Math.PI / 4, 3 * Math.PI / 4]);

  const bgArc = d3.arc<unknown>().innerRadius(innerR).outerRadius(outerR)
    .startAngle(-3 * Math.PI / 4).endAngle(3 * Math.PI / 4);
  svg.append('path').attr('d', bgArc({})).attr('transform', `translate(${cx},${cy})`).attr('fill', '#333');

  const fgArc = d3.arc<unknown>().innerRadius(innerR).outerRadius(outerR).startAngle(-3 * Math.PI / 4);
  const fgPath = svg.append('path').attr('transform', `translate(${cx},${cy})`).attr('fill', '#0066CC')
    .attr('d', fgArc.endAngle(arcScale(0))({}));
  fgPath.transition().duration(900).attrTween('d', () => {
    const interp = d3.interpolateNumber(arcScale(0), arcScale(gauge.value));
    return (t: number) => fgArc.endAngle(interp(t))({}) ?? '';
  });

  // Needle
  const needle = svg.append('line').attr('x1', cx).attr('y1', cy)
    .attr('x2', cx + outerR * Math.cos(arcScale(0) - Math.PI / 2))
    .attr('y2', cy + outerR * Math.sin(arcScale(0) - Math.PI / 2))
    .attr('stroke', RED).attr('stroke-width', 2);
  needle.transition().duration(900).attrTween('x2', () => { const i = d3.interpolateNumber(arcScale(0), arcScale(gauge.value)); return (t: number) => String(cx + outerR * Math.cos(i(t) - Math.PI / 2)); })
    .attrTween('y2', () => { const i = d3.interpolateNumber(arcScale(0), arcScale(gauge.value)); return (t: number) => String(cy + outerR * Math.sin(i(t) - Math.PI / 2)); });

  // Value
  svg.append('text').attr('x', cx).attr('y', cy + 12).attr('text-anchor', 'middle')
    .attr('fill', 'rgba(255,255,255,0.9)').style('font-size', '16px').style('font-weight', '900')
    .text(gauge.value.toFixed(1));

  svg.append('text').attr('x', cx).attr('y', vbH - 8).attr('text-anchor', 'middle')
    .style('font-size', '11px').style('fill', ORANGE)
    .text(`MLB Avg: ${gauge.mlbAvg.toFixed(1)}`);
}

export function GaugeGrid({ playerData, leagueStats }: Props) {
  const attackRef = useRef<HTMLDivElement>(null);
  const speedRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);
  const dirRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!playerData || !leagueStats) return;

    if (attackRef.current) drawAngleGauge(d3.select(attackRef.current), {
      value: playerData.attack_angle, mlbAvg: leagueStats.attack_angle,
      title: 'Attack Angle (°)', unit: '°', max: 60, type: 'angle',
    });
    if (speedRef.current) drawSpeedGauge(d3.select(speedRef.current), {
      value: playerData.bat_speed, mlbAvg: leagueStats.bat_speed,
      title: 'Bat Speed (mph)', unit: ' mph', max: 120, type: 'speed',
    });
    if (tiltRef.current) drawAngleGauge(d3.select(tiltRef.current), {
      value: playerData.swing_path_tilt, mlbAvg: leagueStats.swing_path_tilt,
      title: 'Swing Path Tilt (°)', unit: '°', max: 60, type: 'angle',
    });
    if (dirRef.current) drawAngleGauge(d3.select(dirRef.current), {
      value: playerData.attack_direction, mlbAvg: leagueStats.attack_direction,
      title: 'Direction Angle (°)', unit: '°', max: 60, type: 'angle',
    });
  }, [playerData, leagueStats]);

  const cellClass = 'rounded-xl p-2 flex items-center justify-center';
  const cellStyle = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' };

  return (
    <div className="grid grid-cols-2 gap-3 w-full">
      <div ref={attackRef} className={cellClass} style={cellStyle} />
      <div ref={speedRef} className={cellClass} style={cellStyle} />
      <div ref={tiltRef} className={cellClass} style={cellStyle} />
      <div ref={dirRef} className={cellClass} style={cellStyle} />
    </div>
  );
}
