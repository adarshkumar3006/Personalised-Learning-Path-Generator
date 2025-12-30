import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { FiDownload, FiCheckCircle, FiCircle } from 'react-icons/fi';
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
    if (!containerRef.current || !topics || topics.length === 0) return;

    try {
      const pdf = new jsPDF('portrait', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = pageWidth - (margin * 2);
      let yPosition = margin;

      // Header Section
      pdf.setFillColor(102, 126, 234);
      pdf.rect(0, 0, pageWidth, 40, 'F');

      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Learning Roadmap', margin, 25);

      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Generated on ${new Date().toLocaleDateString()}`, margin, 35);

      yPosition = 50;

      // Summary Section
      const completedCount = topics.filter(t => t.completed).length;
      const totalCount = topics.length;
      const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

      pdf.setTextColor(51, 51, 51);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Progress Summary', margin, yPosition);
      yPosition += 8;

      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Completed: ${completedCount} / ${totalCount} topics (${progressPercentage}%)`, margin, yPosition);
      yPosition += 15;

      // Topics Section
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Learning Topics', margin, yPosition);
      yPosition += 10;

      const sortedTopics = [...topics].sort((a, b) => a.order - b.order);

      sortedTopics.forEach((topic, index) => {
        // Check if we need a new page
        if (yPosition > pageHeight - 40) {
          pdf.addPage();
          yPosition = margin;
        }

        // Topic Card Background
        const cardHeight = 35;
        pdf.setDrawColor(221, 221, 221);
        if (topic.completed) {
          pdf.setFillColor(241, 248, 233);
        } else {
          pdf.setFillColor(255, 255, 255);
        }
        pdf.roundedRect(margin, yPosition - cardHeight + 5, contentWidth, cardHeight, 3, 3, 'FD');

        // Completion Checkbox
        if (topic.completed) {
          pdf.setFillColor(139, 195, 74);
          pdf.circle(margin + 8, yPosition - cardHeight + 20, 4, 'F');
          pdf.setTextColor(255, 255, 255);
          pdf.setFontSize(10);
          pdf.text('✓', margin + 5.5, yPosition - cardHeight + 22);
        } else {
          pdf.setDrawColor(204, 204, 204);
          pdf.circle(margin + 8, yPosition - cardHeight + 20, 4, 'D');
        }

        // Topic Title
        pdf.setTextColor(51, 51, 51);
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        const titleX = margin + 20;
        pdf.text(topic.title, titleX, yPosition - cardHeight + 15);

        // Topic Meta Information
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(102, 102, 102);

        const difficultyColor = topic.difficulty === 'Beginner' ? [46, 125, 50] :
          topic.difficulty === 'Intermediate' ? [230, 81, 0] : [194, 24, 91];
        pdf.setTextColor(difficultyColor[0], difficultyColor[1], difficultyColor[2]);
        pdf.text(`${topic.difficulty}`, titleX, yPosition - cardHeight + 25);

        pdf.setTextColor(102, 102, 102);
        pdf.text(`• ${topic.estimatedHours} hours`, titleX + 30, yPosition - cardHeight + 25);

        // Topic Description (truncated if too long)
        if (topic.description) {
          const descriptionLines = pdf.splitTextToSize(topic.description, contentWidth - 25);
          pdf.setFontSize(8);
          pdf.setTextColor(102, 102, 102);
          pdf.text(descriptionLines[0] || '', titleX, yPosition - cardHeight + 32);
        }

        yPosition += cardHeight + 5;
      });

      // Footer
      const totalPages = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(153, 153, 153);
        pdf.text(
          `Page ${i} of ${totalPages}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
      }

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
          <FiDownload className="export-icon" />
          <span>Export PDF</span>
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

