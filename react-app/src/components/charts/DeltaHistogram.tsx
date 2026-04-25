import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { DeltaAnglesPoint } from '../../types/data';
import { ORANGE, RED } from '../../theme';

type Angle = 'attack_angle' | 'attack_direction' | 'swing_path_tilt';

const ANGLE_LABELS: Record<Angle, string> = {
  attack_angle: 'Δ Var(Attack Angle)',
  attack_direction: 'Δ Var(Attack Direction)',
  swing_path_tilt: 'Δ Var(Swing Path Tilt)',
};

interface Props {
  data: DeltaAnglesPoint[];
  angle: Angle;
}

const TARGET = 'Yordan AlvarezL';

export function DeltaHistogram({ data, angle }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current || !data.length) return;
    draw();
    const ro = new ResizeObserver(() => draw());
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, [data, angle]);

  function draw() {
    if (!ref.current) return;
    d3.select(ref.current).selectAll('*').remove();

    const containerW = ref.current.clientWidth || 560;
    const margin = { top: 40, right: 24, bottom: 44, left: 52 };
    const chartW = containerW - margin.left - margin.right;
    const chartH = 280 - margin.top - margin.bottom;

    const key = `delta_${angle}` as keyof DeltaAnglesPoint;

    // Percentile computation
    const vals = data.map(d => +(d[key] ?? 0)).sort(d3.ascending);
    const yordanEntry = data.find(d => d.name_with_stand === TARGET);
    const x0 = yordanEntry ? +(yordanEntry[key] ?? 0) : 0;
    const pctIdx = d3.bisectLeft(vals, x0);
    const p0 = (pctIdx / (vals.length - 1)) * 100;

    const x = d3.scaleLinear().domain(d3.extent(vals) as [number, number]).nice().range([0, chartW]);
    const bins = d3.bin().domain(x.domain() as [number, number]).thresholds(13)(vals);
    const densities = bins.map(b => b.length / (data.length * ((b.x1 ?? 0) - (b.x0 ?? 0))));
    const y = d3.scaleLinear().domain([0, d3.max(densities) ?? 1]).nice().range([chartH, 0]);

    const svg = d3.select(ref.current).append('svg')
      .attr('width', '100%').attr('height', chartH + margin.top + margin.bottom)
      .attr('viewBox', `0 0 ${containerW} ${chartH + margin.top + margin.bottom}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // Title
    svg.append('text').attr('x', chartW / 2).attr('y', -20).attr('text-anchor', 'middle')
      .style('font-size', '13px').style('font-weight', '900').attr('fill', ORANGE)
      .text(ANGLE_LABELS[angle]);

    // Bars — enter animation scaleY from bottom
    svg.selectAll('rect').data(bins).enter().append('rect')
      .attr('x', b => x(b.x0 ?? 0) + 1)
      .attr('y', chartH)
      .attr('width', b => Math.max(0, x(b.x1 ?? 0) - x(b.x0 ?? 0) - 1))
      .attr('height', 0)
      .attr('fill', '#1f77b4')
      .attr('fill-opacity', 0.85)
      .transition().duration(700).delay((_, i) => i * 30).ease(d3.easeBackOut.overshoot(1.1))
      .attr('y', (_, i) => y(densities[i]))
      .attr('height', (_, i) => chartH - y(densities[i]));

    // Axes
    svg.append('g').attr('class', 'x-axis').attr('transform', `translate(0,${chartH})`)
      .call(d3.axisBottom(x)).selectAll('text').style('fill', 'rgba(255,255,255,0.55)').style('font-size', '11px');
    svg.append('g').attr('class', 'y-axis')
      .call(d3.axisLeft(y).ticks(5)).selectAll('text').style('fill', 'rgba(255,255,255,0.55)').style('font-size', '11px');
    svg.selectAll('.domain, line').style('stroke', 'rgba(255,255,255,0.2)');

    // Yordan line — delayed
    const xPos = x(x0);
    svg.append('line')
      .attr('x1', xPos).attr('x2', xPos).attr('y1', chartH).attr('y2', chartH)
      .attr('stroke', RED).attr('stroke-width', 2.5).attr('stroke-dasharray', '5,3')
      .transition().duration(500).delay(600).attr('y1', 18);

    // Annotation
    svg.append('text').attr('x', xPos).attr('y', 14).attr('text-anchor', 'middle')
      .attr('fill', RED).style('font-size', '10px').style('font-weight', '700').style('opacity', '0')
      .text(`Yordan — ${p0.toFixed(0)}th Pct`)
      .transition().duration(400).delay(900).style('opacity', '1');
  }

  return <div ref={ref} className="w-full" />;
}
