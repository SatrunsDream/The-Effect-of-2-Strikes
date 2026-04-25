import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { NAVY, ORANGE } from '../../theme';

type RowData = Record<string, number | string>;

interface Props {
  data: RowData[];
  selectedMetric: string;
}

const J_METRICS = ['delta_attack_angle', 'delta_attack_direction', 'delta_swing_path_tilt'];

function pearsonCorr(x: number[], y: number[]): number {
  const meanX = d3.mean(x) ?? 0, meanY = d3.mean(y) ?? 0;
  const num = d3.sum(x.map((xi, i) => (xi - meanX) * (y[i] - meanY)));
  const den = Math.sqrt(d3.sum(x.map(xi => (xi - meanX) ** 2)) * d3.sum(y.map(yi => (yi - meanY) ** 2)));
  return den === 0 ? 0 : num / den;
}

function formatName(metric: string): string {
  if (metric === 'wOBA') return 'wOBA';
  if (metric === 'gb%') return 'GB%';
  const parts = metric.split('_');
  if (parts[0] === 'delta') {
    const rest = parts.slice(1).map(w => w[0].toUpperCase() + w.slice(1)).join(' ');
    return `Δ Var(${rest})`;
  }
  return parts.map(w => w[0].toUpperCase() + w.slice(1)).join('');
}

export function CorrelationMatrix({ data, selectedMetric }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current || !data.length) return;
    draw();
  }, [data, selectedMetric]);

  function draw() {
    if (!ref.current) return;
    d3.select(ref.current).selectAll('*').remove();

    const w = 300, h = 280, margin = { top: 50, right: 10, bottom: 44, left: 46 };

    J_METRICS.forEach((j, idx) => {
      const filtered = data.filter(d => isFinite(+d[selectedMetric]) && isFinite(+d[j]));
      const xVals = filtered.map(d => +d[j]);
      const yVals = filtered.map(d => +d[selectedMetric]);
      const r = xVals.length > 1 ? pearsonCorr(xVals, yVals).toFixed(3) : 'N/A';

      const div = d3.select(ref.current).append('div')
        .style('display', 'inline-block')
        .style('background', 'rgba(255,255,255,0.04)')
        .style('border', '1px solid rgba(255,255,255,0.08)')
        .style('border-radius', '12px')
        .style('padding', '12px')
        .style('margin', '8px');

      div.append('div')
        .style('text-align', 'center').style('font-weight', '900')
        .style('color', ORANGE).style('font-size', '12px').style('margin-bottom', '8px')
        .html(`${formatName(selectedMetric)} vs ${formatName(j)}<br/><span style="color:rgba(255,255,255,0.5);font-size:11px">r = ${r}</span>`);

      const svg = div.append('svg').attr('width', w).attr('height', h);

      const xScale = d3.scaleLinear().domain(d3.extent(xVals) as [number, number]).nice().range([margin.left, w - margin.right]);
      const yScale = d3.scaleLinear().domain(d3.extent(yVals) as [number, number]).nice().range([h - margin.bottom, margin.top]);

      // Grid
      svg.append('g').attr('transform', `translate(0,${h - margin.bottom})`)
        .call(d3.axisBottom(xScale).tickSize(-(h - margin.top - margin.bottom)).tickFormat(() => ''))
        .style('color', 'rgba(255,255,255,0.06)').select('.domain').remove();
      svg.append('g').attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(yScale).tickSize(-(w - margin.left - margin.right)).tickFormat(() => ''))
        .style('color', 'rgba(255,255,255,0.06)').select('.domain').remove();

      // Axes
      svg.append('g').attr('transform', `translate(0,${h - margin.bottom})`).call(d3.axisBottom(xScale).ticks(4))
        .selectAll('text').style('fill', 'rgba(255,255,255,0.5)').style('font-size', '10px');
      svg.append('g').attr('transform', `translate(${margin.left},0)`).call(d3.axisLeft(yScale).ticks(5))
        .selectAll('text').style('fill', 'rgba(255,255,255,0.5)').style('font-size', '10px');
      svg.selectAll('.domain, line').style('stroke', 'rgba(255,255,255,0.15)');

      // Regression line
      const n = xVals.length;
      const sumX = d3.sum(xVals), sumY = d3.sum(yVals);
      const sumXY = d3.sum(xVals.map((xi, i) => xi * yVals[i])), sumX2 = d3.sum(xVals.map(xi => xi * xi));
      const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
      const intercept = (sumY - slope * sumX) / n;
      const xDomain = xScale.domain();
      const regrPath = svg.append('line')
        .attr('x1', xScale(xDomain[0])).attr('x2', xScale(xDomain[0]))
        .attr('y1', yScale(slope * xDomain[0] + intercept))
        .attr('y2', yScale(slope * xDomain[0] + intercept))
        .attr('stroke', NAVY).attr('stroke-width', 2);
      regrPath.transition().duration(800).delay(idx * 150)
        .attr('x2', xScale(xDomain[1]))
        .attr('y2', yScale(slope * xDomain[1] + intercept));

      // Points
      svg.selectAll('circle').data(filtered).enter().append('circle')
        .attr('cx', d => xScale(+d[j]))
        .attr('cy', d => yScale(+d[selectedMetric]))
        .attr('r', 0).attr('fill', 'rgba(0,45,98,0.7)').attr('opacity', 0.75)
        .transition().duration(500).delay((_, i) => i * 3 + idx * 100)
        .attr('r', 4);

      // Axis labels
      svg.append('text').attr('x', (w + margin.left) / 2).attr('y', h - 4)
        .attr('text-anchor', 'middle').style('fill', 'rgba(255,255,255,0.5)').style('font-size', '10px')
        .text(formatName(j));
    });
  }

  return (
    <div ref={ref} className="flex flex-wrap justify-center" />
  );
}
