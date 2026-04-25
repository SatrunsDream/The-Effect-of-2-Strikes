import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { ContactScatterPoint, LeagueRates } from '../../types/data';

interface Props {
  data: ContactScatterPoint[];
  leagueRates: LeagueRates[];
}

export function ContactScatter({ data, leagueRates }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current || !data.length) return;
    draw();

    const ro = new ResizeObserver(() => draw());
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, [data, leagueRates]);

  function draw() {
    if (!ref.current) return;
    d3.select(ref.current).selectAll('*').remove();

    const rect = ref.current.getBoundingClientRect();
    const containerWidth = Math.max(400, rect.width);
    const containerHeight = Math.max(320, rect.height);
    const margin = { top: 60, right: 30, bottom: 60, left: 70 };
    const width = containerWidth - margin.left - margin.right;
    const height = containerHeight - margin.top - margin.bottom;

    const svg = d3.select(ref.current)
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', `0 0 ${containerWidth} ${containerHeight}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const tooltip = d3.select(ref.current)
      .append('div')
      .style('position', 'absolute')
      .style('background', 'rgba(0,0,0,0.85)')
      .style('color', '#fff')
      .style('padding', '7px 10px')
      .style('border-radius', '6px')
      .style('font-size', '12px')
      .style('pointer-events', 'none')
      .style('opacity', '0')
      .style('font-family', 'Montserrat, sans-serif');

    const processed = data.map(d => ({
      ...d,
      wOBA: +d.wOBA,
      'contact%': +d['contact%'],
      cleanName: d.name_with_stand.replace(/[LR]$/, ''),
    }));

    const league_woba = d3.mean(processed, d => d.wOBA) ?? 0;
    const league_contact = +(leagueRates[0]?.['contact%'] ?? 0);

    const x = d3.scaleLinear().domain([0.16, 0.38]).range([0, width]);
    const y = d3.scaleLinear().domain([0.55, 1.0]).range([height, 0]);

    // Grid lines
    svg.append('g')
      .attr('opacity', 0.15)
      .call(d3.axisLeft(y).tickValues([0.55, 0.65, 0.75, 0.85, 0.95]).tickSize(-width).tickFormat(() => ''))
      .select('.domain').remove();

    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .attr('opacity', 0.15)
      .call(d3.axisBottom(x).tickValues([0.16, 0.2, 0.24, 0.28, 0.32, 0.36]).tickSize(-height).tickFormat(() => ''))
      .select('.domain').remove();

    // Axes
    svg.append('g')
      .call(d3.axisLeft(y).tickValues([0.55, 0.65, 0.75, 0.85, 0.95]).tickFormat(d => (+(d) * 100).toFixed(0) + '%'))
      .selectAll('text').style('fill', 'rgba(255,255,255,0.6)').style('font-size', '11px');

    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).tickValues([0.16, 0.2, 0.24, 0.28, 0.32, 0.36]).tickFormat(d => (+(d)).toFixed(3)))
      .selectAll('text').style('fill', 'rgba(255,255,255,0.6)').style('font-size', '11px');

    svg.selectAll('.domain, line').style('stroke', 'rgba(255,255,255,0.2)');

    // League average lines
    svg.append('line').attr('x1', 0).attr('x2', width).attr('y1', y(league_contact)).attr('y2', y(league_contact))
      .attr('stroke', 'rgba(255,255,255,0.3)').attr('stroke-dasharray', '5,4');
    svg.append('line').attr('y1', 0).attr('y2', height).attr('x1', x(league_woba)).attr('x2', x(league_woba))
      .attr('stroke', 'rgba(255,255,255,0.3)').attr('stroke-dasharray', '5,4');

    // Player dots — enter staggered via D3 transition
    svg.selectAll('circle.player-dot')
      .data(processed.filter(d => d.cleanName !== 'Yordan Alvarez'))
      .enter()
      .append('circle')
      .attr('class', 'player-dot')
      .attr('cx', d => x(d.wOBA))
      .attr('cy', d => y(d['contact%']))
      .attr('r', 0)
      .attr('fill', '#EB6E1F')
      .attr('opacity', 0.55)
      .transition()
      .duration(600)
      .delay((_, i) => i * 4)
      .attr('r', 5);

    type DotDatum = ContactScatterPoint & { cleanName: string };
    // Pointer events on dots (re-select after transition)
    (svg.selectAll('circle.player-dot') as d3.Selection<SVGCircleElement, DotDatum, SVGGElement, unknown>)
      .on('mouseover', (_event, d) => {
        tooltip.html(`<strong>${d.cleanName}</strong><br/>wOBA: ${d.wOBA.toFixed(3)}<br/>Contact%: ${(d['contact%'] * 100).toFixed(1)}%`)
          .style('opacity', '1');
      })
      .on('mousemove', (event) => {
        tooltip.style('left', (event.offsetX + 15) + 'px').style('top', (event.offsetY - 35) + 'px');
      })
      .on('mouseout', () => tooltip.style('opacity', '0'));

    // Yordan highlight
    const yordan = processed.find(d => d.cleanName === 'Yordan Alvarez');
    if (yordan) {
      const xv = x(yordan.wOBA), yv = y(yordan['contact%']), s = 30;
      svg.append('defs').append('clipPath').attr('id', 'yc').append('circle').attr('r', s / 2).attr('cx', 0).attr('cy', 0);
      const yg = svg.append('g').attr('transform', `translate(${xv},${yv})`).style('cursor', 'pointer');

      // Pulse ring
      yg.append('circle').attr('r', s / 2 + 4).attr('fill', 'none')
        .attr('stroke', '#EB6E1F').attr('stroke-width', 2).attr('opacity', 0.5);

      yg.append('circle').attr('r', s / 2).attr('fill', '#fff');
      yg.append('image').attr('href', '/files/yordan/yadro.png')
        .attr('x', -s / 2).attr('y', -s / 2).attr('width', s).attr('height', s)
        .attr('clip-path', 'url(#yc)');
      yg.append('circle').attr('r', s / 2).attr('fill', 'transparent')
        .on('mouseover', () => {
          tooltip.html(`<strong>Yordan Alvarez</strong><br/>wOBA: ${yordan.wOBA.toFixed(3)}<br/>Contact%: ${(yordan['contact%'] * 100).toFixed(1)}%`)
            .style('opacity', '1');
        })
        .on('mousemove', (event) => {
          tooltip.style('left', (event.offsetX + 15) + 'px').style('top', (event.offsetY - 35) + 'px');
        })
        .on('mouseout', () => tooltip.style('opacity', '0'));
    }

    // Axis labels
    svg.append('text').attr('x', width / 2).attr('y', height + 46).attr('text-anchor', 'middle')
      .style('fill', 'rgba(255,255,255,0.7)').style('font-size', '13px').style('font-weight', '700').text('wOBA');
    svg.append('text').attr('transform', 'rotate(-90)').attr('y', -54).attr('x', -height / 2)
      .attr('text-anchor', 'middle').style('fill', 'rgba(255,255,255,0.7)').style('font-size', '13px').style('font-weight', '700').text('Contact %');

    svg.append('text').attr('x', width / 2).attr('y', -28).attr('text-anchor', 'middle')
      .style('fill', '#EB6E1F').style('font-size', '15px').style('font-weight', '900')
      .text('At Two Strikes: Contact % vs wOBA');
  }

  return (
    <div ref={ref} className="w-full h-full relative" style={{ minHeight: '380px' }} />
  );
}
