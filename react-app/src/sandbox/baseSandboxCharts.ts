import * as d3 from 'd3';
import type { PlayerAngles } from '../types/data';
import { ORANGE, RED } from '../theme';

const BAT_SVG = '/images/bat.svg';

/** Renders a clear white “baseball” on dark panels (avoids transparent PNG on navy). */
function appendBallDisc(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  ballX: number,
  ballY: number,
  r = 16,
) {
  const g = svg.append('g').attr('class', 'ball-marker');
  g.append('circle')
    .attr('cx', ballX)
    .attr('cy', ballY)
    .attr('r', r + 1.5)
    .attr('fill', 'rgba(0,0,0,0.25)');
  g.append('circle')
    .attr('cx', ballX)
    .attr('cy', ballY)
    .attr('r', r)
    .attr('fill', '#f5f5f5')
    .attr('stroke', 'rgba(0,0,0,0.35)')
    .attr('stroke-width', 1.25);
}

/** Dark-panel theme (matches previous React GaugeGrid on black). */
const TEXT = 'rgba(255,255,255,0.92)';
const TICK_LABEL = 'rgba(255,255,255,0.5)';
const BASELINE = 'rgba(255,255,255,0.3)';
const GAUGE_TRACK = 'rgba(255,255,255,0.12)';

/** Row passed to the original index.html draw pipeline — strikes selects MLB avg JSON. */
export type SandboxDrawRow = PlayerAngles & { strikes: 0 | 2 };

type ChartConfig = { title: string; max: number };

let previousAttackAngle: number | undefined;
let previousBatSpeed: number | undefined;
let previousDirectionAngle: number | undefined;
let previousSwingPathTilt: number | undefined;

function appendMLBAverage(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  cx: number,
  y: number,
  data: SandboxDrawRow[],
  field: keyof Pick<PlayerAngles, 'attack_angle' | 'bat_speed' | 'attack_direction' | 'swing_path_tilt'>,
  overrideFontSize: string,
) {
  const strikeCount = data[0]?.strikes ?? 0;
  const path = strikeCount === 0
    ? '/files/sandbox/zerostr_stats.json'
    : '/files/sandbox/twostr_stats.json';
  d3.json<Array<Record<string, number>>>(path)
    .then(stats => {
      if (stats?.[0]) {
        const mlbAvg = stats[0][field] as number;
        const fontSize = overrideFontSize || '10px';
        const deg =
          field === 'attack_angle' || field === 'attack_direction' || field === 'swing_path_tilt'
            ? '°'
            : '';
        svg
          .append('text')
          .attr('x', cx)
          .attr('y', y)
          .attr('text-anchor', 'middle')
          .style('font-size', fontSize)
          .style('fill', ORANGE)
          .text(`MLB Average: ${mlbAvg.toFixed(1)}${deg}`);
      }
    })
    .catch(err => console.error('Error loading MLB stats:', err));
}

type DivSel = d3.Selection<HTMLDivElement, unknown, null, undefined>;

export function drawAttackAngle(containerSel: DivSel, data: SandboxDrawRow[], config: ChartConfig) {
  const svg = containerSel
    .append('svg')
    .attr('viewBox', '0 0 300 300')
    .attr('preserveAspectRatio', 'xMidYMid meet');
  svg
    .append('text')
    .attr('x', 150)
    .attr('y', 25)
    .attr('text-anchor', 'middle')
    .attr('fill', ORANGE)
    .style('font-size', '24px')
    .text(config.title);
  const angleScale = d3.scaleLinear().domain([0, config.max]).range([0, Math.PI / 3]);
  const avg = d3.mean(data, d => +d.attack_angle) || 0;
  const prevAvg = previousAttackAngle !== undefined ? previousAttackAngle : 0;
  previousAttackAngle = avg;
  const theta = angleScale(avg);
  const r = 120;
  const cx = 150;
  const cy = 150;
  const ballX = cx + r * 0.85;
  const ballY = cy;
  const lineLength = 250;
  const zeroAngle = Math.PI;
  const blackX = ballX + lineLength * Math.cos(zeroAngle);
  const blackY = ballY - lineLength * Math.sin(zeroAngle);
  svg
    .append('line')
    .attr('x1', ballX)
    .attr('y1', ballY)
    .attr('x2', blackX)
    .attr('y2', blackY)
    .attr('stroke', BASELINE)
    .attr('stroke-width', 3)
    .attr('stroke-dasharray', '8,6');
  const initialRedX = ballX + lineLength * Math.cos(zeroAngle - angleScale(prevAvg));
  const initialRedY = ballY - lineLength * Math.sin(zeroAngle - angleScale(prevAvg));
  const redX = ballX + lineLength * Math.cos(zeroAngle - theta);
  const redY = ballY - lineLength * Math.sin(zeroAngle - theta);
  const fillPoly = svg
    .append('polygon')
    .attr('points', `${ballX},${ballY} ${blackX},${blackY} ${initialRedX},${initialRedY}`)
    .attr('fill', ORANGE)
    .attr('opacity', 0.5);
  fillPoly.transition().duration(1000).attrTween('points', () => t => {
    const currX = initialRedX + (redX - initialRedX) * t;
    const currY = initialRedY + (redY - initialRedY) * t;
    return `${ballX},${ballY} ${blackX},${blackY} ${currX},${currY}`;
  });
  const redLine = svg
    .append('line')
    .attr('x1', ballX)
    .attr('y1', ballY)
    .attr('x2', ballX + lineLength * Math.cos(zeroAngle - angleScale(prevAvg)))
    .attr('y2', ballY - lineLength * Math.sin(zeroAngle - angleScale(prevAvg)))
    .attr('stroke', RED)
    .attr('stroke-width', 4);
  redLine
    .transition()
    .duration(1000)
    .attrTween('x2', () => {
      const interp = d3.interpolateNumber(angleScale(prevAvg), angleScale(avg));
      return t => String(ballX + lineLength * Math.cos(zeroAngle - interp(t)));
    })
    .attrTween('y2', () => {
      const interp = d3.interpolateNumber(angleScale(prevAvg), angleScale(avg));
      return t => String(ballY - lineLength * Math.sin(zeroAngle - interp(t)));
    });
  appendBallDisc(svg, ballX, ballY);
  svg
    .append('text')
    .attr('x', 165)
    .attr('y', 145)
    .attr('text-anchor', 'start')
    .attr('fill', TEXT)
    .style('font-size', '24px')
    .text(`${avg.toFixed(1)}°`);

  appendMLBAverage(svg, 150, 280, data, 'attack_angle', '32px');
}

export function drawBatSpeed(containerSel: DivSel, data: SandboxDrawRow[], config: ChartConfig) {
  const svg = containerSel
    .append('svg')
    .attr('viewBox', '0 0 160 160')
    .attr('preserveAspectRatio', 'xMidYMid meet');

  svg
    .append('text')
    .attr('x', 80)
    .attr('y', 12)
    .attr('text-anchor', 'middle')
    .attr('fill', ORANGE)
    .style('font-size', '14px')
    .style('font-weight', '900')
    .text(config.title);

  const bgArc = d3
    .arc<unknown>()
    .innerRadius(55)
    .outerRadius(62)
    .startAngle((-3 * Math.PI) / 4)
    .endAngle((3 * Math.PI) / 4);

  svg.append('path').attr('d', bgArc({}) ?? '').attr('transform', 'translate(80,80)').attr('fill', GAUGE_TRACK);

  const scale = d3
    .scaleLinear()
    .domain([0, config.max || 100])
    .range([(-3 * Math.PI) / 4, (3 * Math.PI) / 4]);

  const avg = d3.mean(data, d => +d.bat_speed) || 0;
  const prevAvg = previousBatSpeed !== undefined ? previousBatSpeed : 0;
  previousBatSpeed = avg;

  const fgArc = d3
    .arc<unknown>()
    .innerRadius(55)
    .outerRadius(62)
    .startAngle((-3 * Math.PI) / 4);

  const fgPath = svg
    .append('path')
    .attr('transform', 'translate(80,80)')
    .attr('fill', '#0066CC')
    .attr('d', fgArc.endAngle(scale(prevAvg))({}) ?? '');

  fgPath
    .transition()
    .duration(1000)
    .attrTween('d', () => {
      const interp = d3.interpolateNumber(scale(prevAvg), scale(avg));
      return t => fgArc.endAngle(interp(t))({}) ?? '';
    });

  const needle = svg
    .append('line')
    .attr('x1', 80)
    .attr('y1', 80)
    .attr('x2', 80 + 62 * Math.cos(scale(prevAvg) - Math.PI / 2))
    .attr('y2', 80 + 62 * Math.sin(scale(prevAvg) - Math.PI / 2))
    .attr('stroke', RED)
    .attr('stroke-width', 2);

  needle
    .transition()
    .duration(1000)
    .attrTween('x2', () => {
      const interp = d3.interpolateNumber(scale(prevAvg), scale(avg));
      return t => String(80 + 62 * Math.cos(interp(t) - Math.PI / 2));
    })
    .attrTween('y2', () => {
      const interp = d3.interpolateNumber(scale(prevAvg), scale(avg));
      return t => String(80 + 62 * Math.sin(interp(t) - Math.PI / 2));
    });

  const textVal = svg
    .append('text')
    .attr('x', 80)
    .attr('y', 95)
    .attr('text-anchor', 'middle')
    .attr('fill', TEXT)
    .style('font-size', '14px')
    .text(prevAvg.toFixed(1));

  textVal
    .transition()
    .delay(200)
    .duration(1000)
    .tween('text', function () {
      const i = d3.interpolateNumber(prevAvg, avg);
      return t => d3.select(this).text(i(t).toFixed(1));
    });

  appendMLBAverage(svg, 80, 145, data, 'bat_speed', '14px');

  const tickGroup = svg.append('g');
  const max = config.max || 100;
  d3.range(0, max + 1, max / 5).forEach(tick => {
    const angle = scale(tick);
    const lineStart = 48;
    const lineEnd = 68;
    const x1 = 80 + lineStart * Math.cos(angle - Math.PI / 2);
    const y1 = 80 + lineStart * Math.sin(angle - Math.PI / 2);
    const x2 = 80 + lineEnd * Math.cos(angle - Math.PI / 2);
    const y2 = 80 + lineEnd * Math.sin(angle - Math.PI / 2);

    tickGroup
      .append('line')
      .attr('x1', x1)
      .attr('y1', y1)
      .attr('x2', x2)
      .attr('y2', y2)
      .attr('stroke', '#fff')
      .attr('stroke-width', 1);

    const labelRadius = 35;
    const lx = 80 + labelRadius * Math.cos(angle - Math.PI / 2);
    const ly = 80 + labelRadius * Math.sin(angle - Math.PI / 2) + 2;

    tickGroup
      .append('text')
      .attr('x', lx)
      .attr('y', ly)
      .attr('text-anchor', 'middle')
      .attr('fill', TICK_LABEL)
      .style('font-size', '8px')
      .text(tick);
  });
}

export function drawDirectionAngle(containerSel: DivSel, data: SandboxDrawRow[], config: ChartConfig) {
  const svg = containerSel
    .append('svg')
    .attr('viewBox', '0 0 300 300')
    .attr('preserveAspectRatio', 'xMidYMid meet');

  svg
    .append('text')
    .attr('x', 150)
    .attr('y', 25)
    .attr('text-anchor', 'middle')
    .attr('fill', ORANGE)
    .style('font-size', '24px')
    .text(config.title);

  const angleScale = d3.scaleLinear().domain([0, config.max]).range([0, Math.PI / 3]);
  const avg = d3.mean(data, d => +d.attack_direction) || 0;
  const prevAvg = previousDirectionAngle !== undefined ? previousDirectionAngle : avg;
  previousDirectionAngle = avg;
  const prevTheta = angleScale(prevAvg);
  const theta = angleScale(avg);

  const r = 120;
  const cx = 150;
  const cy = 150;
  const ballX = cx;
  const ballY = cy + r * 0.85;

  const lineLength = 250;
  const zeroAngle = -Math.PI / 2;
  const blackX = ballX + lineLength * Math.cos(zeroAngle);
  const blackY = ballY + lineLength * Math.sin(zeroAngle);

  svg
    .append('line')
    .attr('x1', ballX)
    .attr('y1', ballY)
    .attr('x2', blackX)
    .attr('y2', blackY)
    .attr('stroke', BASELINE)
    .attr('stroke-width', 3)
    .attr('stroke-dasharray', '8,6');

  const redX = ballX + lineLength * Math.cos(zeroAngle + theta);
  const redY = ballY + lineLength * Math.sin(zeroAngle + theta);
  const initialRedX = ballX + lineLength * Math.cos(zeroAngle + prevTheta);
  const initialRedY = ballY + lineLength * Math.sin(zeroAngle + prevTheta);

  const fillPoly = svg
    .append('polygon')
    .attr('class', 'orangeFill')
    .attr('points', `${ballX},${ballY} ${blackX},${blackY} ${initialRedX},${initialRedY}`)
    .attr('fill', ORANGE)
    .attr('opacity', 0.5);

  fillPoly.transition().duration(1000).attrTween('points', () => t => {
    const currX = initialRedX + (redX - initialRedX) * t;
    const currY = initialRedY + (redY - initialRedY) * t;
    return `${ballX},${ballY} ${blackX},${blackY} ${currX},${currY}`;
  });

  const redLine = svg
    .append('line')
    .attr('x1', ballX)
    .attr('y1', ballY)
    .attr('x2', initialRedX)
    .attr('y2', initialRedY)
    .attr('stroke', '#00ff00')
    .attr('stroke-width', 4);

  redLine
    .transition()
    .duration(1000)
    .attrTween('x2', () => {
      const interp = d3.interpolateNumber(initialRedX, redX);
      return t => String(interp(t));
    })
    .attrTween('y2', () => {
      const interp = d3.interpolateNumber(initialRedY, redY);
      return t => String(interp(t));
    });

  appendBallDisc(svg, ballX, ballY);
  svg
    .append('text')
    .attr('x', 165)
    .attr('y', 145)
    .attr('text-anchor', 'start')
    .attr('fill', TEXT)
    .style('font-size', '24px')
    .text(`${avg.toFixed(1)}°`);

  appendMLBAverage(svg, 150, 285, data, 'attack_direction', '32px');
}

export function drawSwingPathTilt(containerSel: DivSel, data: SandboxDrawRow[], config: ChartConfig) {
  const svg = containerSel
    .append('svg')
    .attr('viewBox', '0 0 300 300')
    .attr('preserveAspectRatio', 'xMidYMid meet');

  svg
    .append('text')
    .attr('x', 150)
    .attr('y', 25)
    .attr('text-anchor', 'middle')
    .attr('fill', ORANGE)
    .style('font-size', '24px')
    .text(config.title);

  const avg = d3.mean(data, d => +d.swing_path_tilt) || 0;
  const prevAvg = previousSwingPathTilt !== undefined ? previousSwingPathTilt : 0;
  previousSwingPathTilt = avg;
  const prevTheta = Math.abs(prevAvg) * (Math.PI / 180);
  const theta = Math.abs(avg) * (Math.PI / 180);

  const cx = 150;
  const cy = 150;
  const r = 120;
  const ballX = cx + r * 0.85;
  const ballY = cy;
  const lineLength = 180;
  const zeroAngle = Math.PI;

  const blackX = ballX + lineLength * Math.cos(zeroAngle);
  const blackY = ballY - lineLength * Math.sin(zeroAngle);

  svg
    .append('line')
    .attr('x1', ballX)
    .attr('y1', ballY)
    .attr('x2', blackX)
    .attr('y2', blackY)
    .attr('stroke', BASELINE)
    .attr('stroke-width', 3)
    .attr('stroke-dasharray', '8,6');

  const adjustedTheta = theta;
  const prevAdjustedTheta = prevTheta;
  const redX = ballX + lineLength * Math.cos(zeroAngle + adjustedTheta);
  const redY = ballY - lineLength * Math.sin(zeroAngle + adjustedTheta);

  const fillPoly = svg
    .append('polygon')
    .attr(
      'points',
      `${ballX},${ballY} ${blackX},${blackY} ${ballX + lineLength * Math.cos(zeroAngle + prevAdjustedTheta)},${ballY - lineLength * Math.sin(zeroAngle + prevAdjustedTheta)}`,
    )
    .attr('fill', ORANGE)
    .attr('opacity', 0.5);

  fillPoly.transition().duration(1000).attrTween('points', () => t => {
    const initX = ballX + lineLength * Math.cos(zeroAngle + prevAdjustedTheta);
    const initY = ballY - lineLength * Math.sin(zeroAngle + prevAdjustedTheta);
    const finalX = ballX + lineLength * Math.cos(zeroAngle + adjustedTheta);
    const finalY = ballY - lineLength * Math.sin(zeroAngle + adjustedTheta);
    const currX = initX + (finalX - initX) * t;
    const currY = initY + (finalY - initY) * t;
    return `${ballX},${ballY} ${blackX},${blackY} ${currX},${currY}`;
  });

  const newHeight = 20;
  const batLength = lineLength;

  const batG = svg
    .append('g')
    .attr('class', 'swing-bat')
    .attr('transform', `translate(${ballX},${ballY}) rotate(${-Math.abs(prevAvg)})`);

  batG
    .append('image')
    .attr('href', BAT_SVG)
    .attr('width', batLength)
    .attr('height', newHeight)
    .attr('preserveAspectRatio', 'none')
    .attr('x', 0)
    .attr('y', -newHeight / 2)
    .attr('transform', 'scale(-1,1)');

  batG
    .transition()
    .duration(1000)
    .attrTween('transform', () => {
      const startAngle = -Math.abs(prevAvg);
      const endAngle = -Math.abs(avg);
      const interp = d3.interpolateNumber(startAngle, endAngle);
      return t => `translate(${ballX},${ballY}) rotate(${interp(t)})`;
    });

  appendBallDisc(svg, ballX, ballY);

  const centroidX = (ballX + blackX + redX) / 3;
  const centroidY = (ballY + blackY + redY) / 3;
  svg
    .append('text')
    .attr('x', centroidX)
    .attr('y', centroidY)
    .attr('text-anchor', 'middle')
    .attr('fill', TEXT)
    .style('font-size', '24px')
    .text(`${avg.toFixed(1)}°`);

  appendMLBAverage(svg, 150, 280, data, 'swing_path_tilt', '32px');
}
