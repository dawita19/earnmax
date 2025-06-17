import React, { useState } from 'react';
import * as d3 from 'd3';
import { HierarchyPointNode } from 'd3-hierarchy';
import NetworkNode from './NetworkNode';
import { UserHierarchyNode } from '../../../types';

interface TreeViewProps {
  width: number;
  height: number;
  data: UserHierarchyNode;
  onNodeClick: (userId: string) => void;
}

const TreeView: React.FC<TreeViewProps> = ({ width, height, data, onNodeClick }) => {
  const [zoom, setZoom] = useState<number>(1);
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data) return;

    const svg = d3.select(svgRef.current);
    const g = d3.select(gRef.current);

    // Clear previous render
    g.selectAll('*').remove();

    // Create hierarchy
    const root = d3.hierarchy(data);
    const treeLayout = d3.tree<UserHierarchyNode>().size([width, height - 100]);
    const treeData = treeLayout(root);

    // Calculate links
    const links = treeData.links();

    // Draw links
    g.append('g')
      .selectAll('path')
      .data(links)
      .enter()
      .append('path')
      .attr('d', d3.linkVertical()
        .x(d => d.x)
        .y(d => d.y)
      )
      .attr('fill', 'none')
      .attr('stroke', '#ddd')
      .attr('stroke-width', 1.5);

    // Create nodes group
    const nodes = g.append('g')
      .selectAll('g')
      .data(treeData.descendants())
      .enter()
      .append('g')
      .attr('transform', d => `translate(${d.x},${d.y})`)
      .on('click', (event, d) => onNodeClick(d.data.id));

    // Add custom node components
    nodes.each(function(d) {
      const nodeData = d.data;
      d3.select(this).append(() => 
        NetworkNode({
          user: {
            id: nodeData.id,
            name: nodeData.name,
            level: d.depth,
            vipLevel: nodeData.vipLevel,
            totalEarnings: nodeData.totalEarnings
          },
          size: 40 - (d.depth * 5),
          isRoot: d.depth === 0
        })
      );
    });

    // Add zoom behavior
    const zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 2])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
        setZoom(event.transform.k);
      });

    svg.call(zoomBehavior);

  }, [data, height, width]);

  return (
    <div className="relative">
      <div className="absolute top-4 right-4 bg-white p-2 rounded shadow">
        Zoom: {zoom.toFixed(1)}x
      </div>
      <svg 
        ref={svgRef} 
        width={width} 
        height={height}
        className="border rounded-lg bg-white"
      >
        <g ref={gRef} />
      </svg>
    </div>
  );
};

export default TreeView;