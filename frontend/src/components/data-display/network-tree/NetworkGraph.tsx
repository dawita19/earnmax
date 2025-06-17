import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { HierarchyPointNode } from 'd3-hierarchy';
import NetworkNode from './NetworkNode';
import { UserNetworkData } from '../../../types';

interface NetworkGraphProps {
  width: number;
  height: number;
  data: UserNetworkData;
  onNodeClick: (userId: string) => void;
}

const NetworkGraph: React.FC<NetworkGraphProps> = ({ width, height, data, onNodeClick }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data) return;

    const svg = d3.select(svgRef.current);
    const g = d3.select(gRef.current);

    // Clear previous render
    g.selectAll('*').remove();

    // Create simulation
    const simulation = d3.forceSimulation(data.nodes)
      .force('charge', d3.forceManyBody().strength(-500))
      .force('link', d3.forceLink(data.links).id((d: any) => d.id).distance(150))
      .force('x', d3.forceX(width / 2).strength(0.05))
      .force('y', d3.forceY(height / 2).strength(0.05));

    // Create links
    const link = g.append('g')
      .selectAll('line')
      .data(data.links)
      .enter().append('line')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', d => Math.sqrt(d.value));

    // Create nodes group
    const node = g.append('g')
      .selectAll('g')
      .data(data.nodes)
      .enter().append('g')
      .call(
        d3.drag<SVGGElement, any>()
          .on('start', dragstarted)
          .on('drag', dragged)
          .on('end', dragended)
      )
      .on('click', (event, d) => onNodeClick(d.id));

    // Add custom node components
    node.each(function(d) {
      d3.select(this).append(() => 
        NetworkNode({
          user: d,
          size: 30 + (d.level * 5),
          isRoot: d.level === 0
        })
      );
    });

    // Update positions on tick
    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: any) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    return () => {
      simulation.stop();
    };
  }, [data, height, width]);

  return (
    <svg ref={svgRef} width={width} height={height}>
      <g ref={gRef} />
    </svg>
  );
};

export default NetworkGraph;