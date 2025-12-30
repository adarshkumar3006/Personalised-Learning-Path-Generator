import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import './RoadmapVisualization.css';

const RoadmapVisualization = ({ topics, onTopicSelect, selectedTopic }) => {
  const svgRef = useRef();
  const containerRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 600, height: 800 });

  useEffect(() => {
    if (!topics || topics.length === 0) return;

    // Calculate dimensions based on number of topics
    const height = Math.max(800, topics.length * 120);
    setDimensions({ width: 600, height });
  }, [topics]);

  useEffect(() => {
    if (topics && topics.length > 0) {
      drawRoadmap();
    }
  }, [topics, selectedTopic, dimensions]);

  const drawRoadmap = React.useCallback(() => {
    if (!svgRef.current || !topics || topics.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = dimensions.width;
    const height = dimensions.height;
    const margin = { top: 40, right: 40, bottom: 40, left: 40 };

    svg.attr('width', width).attr('height', height);

    // Create a group for the main content
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const contentWidth = width - margin.left - margin.right;
    const contentHeight = height - margin.top - margin.bottom;

    // Sort topics by order
    const sortedTopics = [...topics].sort((a, b) => a.order - b.order);

    // Calculate node positions
    const nodeHeight = 80;
    const nodeSpacing = 20;
    const nodeWidth = contentWidth;
    const nodes = sortedTopics.map((topic, index) => ({
      id: topic.id,
      topic,
      x: nodeWidth / 2,
      y: index * (nodeHeight + nodeSpacing),
      width: nodeWidth,
      height: nodeHeight,
    }));

    // Create links based on prerequisites
    const links = [];
    sortedTopics.forEach((topic) => {
      if (topic.prerequisites && topic.prerequisites.length > 0) {
        topic.prerequisites.forEach((prereqId) => {
          const sourceNode = nodes.find((n) => n.id === prereqId);
          const targetNode = nodes.find((n) => n.id === topic.id);
          if (sourceNode && targetNode) {
            links.push({
              source: sourceNode,
              target: targetNode,
            });
          }
        });
      }
    });

    // Draw links
    const link = g
      .append('g')
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('x1', (d) => d.source.x)
      .attr('y1', (d) => d.source.y + d.source.height / 2)
      .attr('x2', (d) => d.target.x)
      .attr('y2', (d) => d.target.y + d.target.height / 2)
      .attr('stroke', '#999')
      .attr('stroke-width', 2)
      .attr('marker-end', 'url(#arrowhead)');

    // Create arrow marker
    svg
      .append('defs')
      .append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 15)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#999');

    // Draw nodes
    const node = g
      .append('g')
      .selectAll('g')
      .data(nodes)
      .enter()
      .append('g')
      .attr('transform', (d) => `translate(${d.x - d.width / 2},${d.y})`)
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        onTopicSelect(d.topic);
      });

    // Draw node rectangles
    node
      .append('rect')
      .attr('width', (d) => d.width)
      .attr('height', (d) => d.height)
      .attr('rx', 10)
      .attr('fill', (d) => {
        if (d.topic.completed) return '#8bc34a';
        if (selectedTopic?.id === d.id) return '#667eea';
        return '#fff';
      })
      .attr('stroke', (d) => {
        if (selectedTopic?.id === d.id) return '#764ba2';
        return '#ddd';
      })
      .attr('stroke-width', (d) => (selectedTopic?.id === d.id ? 3 : 2));

    // Add text
    node
      .append('text')
      .attr('x', 10)
      .attr('y', 25)
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .attr('fill', (d) => {
        if (d.topic.completed) return '#fff';
        return '#333';
      })
      .text((d) => d.topic.title);

    node
      .append('text')
      .attr('x', 10)
      .attr('y', 45)
      .attr('font-size', '11px')
      .attr('fill', (d) => {
        if (d.topic.completed) return '#fff';
        return '#666';
      })
      .text((d) => `${d.topic.difficulty} • ${d.topic.estimatedHours}h`);

    // Add completion checkmark
    node
      .filter((d) => d.topic.completed)
      .append('text')
      .attr('x', (d) => d.width - 30)
      .attr('y', 45)
      .attr('font-size', '20px')
      .attr('fill', '#fff')
      .text('✓');

    // Add hover effects
    node
      .on('mouseover', function (event, d) {
        d3.select(this)
          .select('rect')
          .transition()
          .duration(200)
          .attr('stroke-width', 3)
          .attr('stroke', '#667eea');
      })
      .on('mouseout', function (event, d) {
        d3.select(this)
          .select('rect')
          .transition()
          .duration(200)
          .attr('stroke-width', (d) => (selectedTopic?.id === d.id ? 3 : 2))
          .attr('stroke', (d) => (selectedTopic?.id === d.id ? '#764ba2' : '#ddd'));
      });
  }, [topics, selectedTopic, dimensions]);

  const handleExportPDF = async () => {
    if (!containerRef.current) return;

    try {
      const canvas = await html2canvas(containerRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      const imgWidth = 297; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save('learning-roadmap.pdf');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Failed to export PDF. Please try again.');
    }
  };

  if (!topics || topics.length === 0) {
    return (
      <div className="roadmap-empty">
        <p>No topics available for visualization</p>
      </div>
    );
  }

  return (
    <div className="roadmap-visualization-container" ref={containerRef}>
      <div className="roadmap-header">
        <h3>Learning Roadmap</h3>
        <button onClick={handleExportPDF} className="btn-export">
          Export PDF
        </button>
      </div>
      <div className="roadmap-svg-container">
        <svg ref={svgRef}></svg>
      </div>
      <div className="roadmap-legend">
        <div className="legend-item">
          <div className="legend-color completed"></div>
          <span>Completed</span>
        </div>
        <div className="legend-item">
          <div className="legend-color selected"></div>
          <span>Selected</span>
        </div>
        <div className="legend-item">
          <div className="legend-color pending"></div>
          <span>Pending</span>
        </div>
      </div>
    </div>
  );
};

export default RoadmapVisualization;

