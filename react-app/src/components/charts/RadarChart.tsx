import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { ORANGE } from '../../theme';
import type { RadarPlayer } from '../../types/data';

interface Props {
  data: RadarPlayer[];
  animate?: boolean;
}

const METRICS = ['wOBA', 'contact%', 'oppo%', 'chase%', 'barrel%'] as const;

function getPercentile(y: RadarPlayer, metric: string): number {
  if (metric === 'wOBA') return parseFloat(String(y['wOBA_2str_pctile'])) / 100;
  if (metric === 'barrel%') return parseFloat(String(y['barrel%_percentile'])) / 100;
  if (metric === 'oppo%') return parseFloat(String(y['oppo%_percentile'])) / 100;
  if (metric === 'chase%') return parseFloat(String(y['chase%_percentile'])) / 100;
  const raw = parseFloat(String(y[metric]));
  return isNaN(raw) ? 0 : raw;
}

export function RadarChart({ data, animate = true }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current || !data.length) return;
    draw();
    const ro = new ResizeObserver(() => draw());
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, [data, animate]);

  function draw() {
    if (!ref.current) return;
    d3.select(ref.current).selectAll('*').remove();

    const containerWidth = ref.current.clientWidth || 460;
    const size = Math.min(containerWidth, 460);
    const margin = { top: 70, right: 70, bottom: 70, left: 70 };
    const innerW = size - margin.left - margin.right;
    const innerH = size - margin.top - margin.bottom;
    const radius = Math.min(innerW, innerH) / 2;
    const angleSlice = (Math.PI * 2) / METRICS.length;
    const rScale = d3.scaleLinear().domain([0, 1]).range([0, radius]);

    const svg = d3.select(ref.current)
      .append('svg')
      .attr('width', size).attr('height', size)
      .attr('viewBox', `0 0 ${size} ${size}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left + innerW / 2}, ${margin.top + innerH / 2})`);

    // Concentric circles
    for (let lvl = 1; lvl <= 5; lvl++) {
      g.append('circle').attr('r', radius * lvl / 5)
        .attr('fill', 'none').attr('stroke', 'rgba(255,255,255,0.12)').attr('stroke-dasharray', '3 3');
      g.append('text').attr('y', -radius * lvl / 5 - 4).attr('text-anchor', 'middle')
        .style('font-size', '11px').attr('fill', 'rgba(255,255,255,0.4)').text(`${lvl * 20}%`);
    }

    // Axes
    METRICS.forEach((m, i) => {
      const angle = angleSlice * i - Math.PI / 2;
      g.append('line').attr('x1', 0).attr('y1', 0)
        .attr('x2', Math.cos(angle) * radius).attr('y2', Math.sin(angle) * radius)
        .attr('stroke', 'rgba(255,255,255,0.2)').attr('stroke-width', 1);
      const labelDist = radius + 36;
      g.append('text')
        .attr('x', Math.cos(angle) * labelDist).attr('y', Math.sin(angle) * labelDist)
        .attr('dy', '0.35em').attr('text-anchor', 'middle')
        .style('font-size', '13px').style('font-weight', '700').attr('fill', 'rgba(255,255,255,0.8)')
        .text(m === 'wOBA' ? 'wOBA' : m.replace('%', '') + '%');
    });

    // Data polygon
    const yordan = data.find(d => d.name_with_stand === 'Yordan AlvarezL');
    if (!yordan) return;

    const values = METRICS.map(m => getPercentile(yordan, m));
    values.push(values[0]);

    const radarLine = d3.lineRadial<number>()
      .radius(d => rScale(d))
      .angle((_, i) => i * angleSlice)
      .curve(d3.curveLinearClosed);

    const pathData = radarLine(values) ?? '';

    if (animate) {
      // Draw fill first with low opacity
      g.append('path').datum(values).attr('d', radarLine)
        .attr('fill', ORANGE).attr('fill-opacity', 0).attr('stroke', 'none')
        .transition().duration(1000).delay(800).attr('fill-opacity', 0.28);

      // Outline draws itself via dashoffset
      const outline = g.append('path').datum(values).attr('d', pathData)
        .attr('fill', 'none').attr('stroke', ORANGE).attr('stroke-width', 2.5);

      const totalLen = (outline.node() as SVGPathElement).getTotalLength();
      outline
        .attr('stroke-dasharray', totalLen)
        .attr('stroke-dashoffset', totalLen)
        .transition().duration(1200).ease(d3.easeQuadInOut)
        .attr('stroke-dashoffset', 0);
    } else {
      g.append('path').datum(values).attr('d', radarLine)
        .attr('fill', ORANGE).attr('fill-opacity', 0.28)
        .attr('stroke', ORANGE).attr('stroke-width', 2.5);
    }

    // Title
    svg.append('text').attr('x', size / 2).attr('y', 22).attr('text-anchor', 'middle')
      .style('font-size', '13px').style('font-weight', '900').attr('fill', ORANGE)
      .text('2-Strike Profile vs Peers (Percentiles)');
  }

  return <div ref={ref} className="w-full" style={{ maxWidth: '460px', margin: '0 auto' }} />;
}
