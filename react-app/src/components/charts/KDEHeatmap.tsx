import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { KDEData } from '../../types/data';

interface Props {
  data: KDEData;
  strikeCount: 0 | 2;
  title: string;
}

export function KDEHeatmap({ data, strikeCount, title }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current || !data) return;
    draw();
    const ro = new ResizeObserver(() => draw());
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, [data, strikeCount]);

  function draw() {
    if (!ref.current) return;
    d3.select(ref.current).selectAll('*').remove();

    const { zone, grid } = data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const zData = strikeCount === 0 ? grid.z0 : ((grid as any)['z2'] as number[][] ?? grid.z0);

    const w = 400, h = 400;
    const margin = { top: 30, right: 20, bottom: 40, left: 50 };

    const x = d3.scaleLinear().domain([d3.min(grid.x) ?? 0, d3.max(grid.x) ?? 1]).range([0, w]);
    const y = d3.scaleLinear().domain([d3.min(grid.y) ?? 0, d3.max(grid.y) ?? 1]).range([h, 0]);
    const colorScale = d3.scaleSequential(d3.interpolateRdBu)
      .domain([d3.max(zData.flat()) ?? 1, 0]);

    const svg = d3.select(ref.current).append('svg')
      .attr('viewBox', `0 0 ${w + margin.left + margin.right} ${h + margin.top + margin.bottom}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .style('width', '100%').style('height', 'auto')
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const cellW = w / grid.x.length;
    const cellH = h / grid.y.length;

    const cellData = zData[0].map((_, i) =>
      zData.map((row, j) => ({ x: grid.x[j], y: grid.y[i], value: row[i] }))
    ).flat();

    svg.selectAll('rect').data(cellData).enter().append('rect')
      .attr('x', d => x(d.x))
      .attr('y', d => y(d.y) - cellH)
      .attr('width', cellW)
      .attr('height', cellH)
      .attr('fill', d => colorScale(d.value));

    // Strike zone outline
    svg.append('rect')
      .attr('x', x(zone.left)).attr('y', y(zone.top))
      .attr('width', x(zone.right) - x(zone.left))
      .attr('height', y(zone.bottom) - y(zone.top))
      .attr('fill', 'none').attr('stroke', '#ff0000').attr('stroke-width', 2.5);

    // Title
    svg.append('text').attr('x', w / 2).attr('y', -10)
      .attr('text-anchor', 'middle').attr('fill', 'rgba(255,255,255,0.85)')
      .style('font-size', '14px').style('font-weight', '700').text(title);
  }

  return <div ref={ref} className="w-full" style={{ maxWidth: '320px' }} />;
}
