import React, { useEffect, useRef } from 'react';
import { NodeState } from '../../types/chainData';

interface PlotlyChartProps {
  data: NodeState | NodeState[];
  onNodeClick: (nodeId: string) => void;
}

const PlotlyChart: React.FC<PlotlyChartProps> = ({ data, onNodeClick }) => {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadPlotly = async () => {
      const Plotly = await import('plotly.js-dist-min');
      if (!chartRef.current) return;

      const nodes = Array.isArray(data) ? data : [data];
      
      const plotData = [{
        type: 'sunburst',
        ids: nodes.map(n => n.basicInfo[0]),
        labels: nodes.map(n => n.basicInfo[0]),
        parents: nodes.map(n => n.rootPath[n.rootPath.length - 2] || ''),
        values: nodes.map(n => parseInt(n.basicInfo[4]) || 1),
        branchvalues: 'total',
        insidetextorientation: 'radial'
      }];

      const layout = {
        margin: { l: 0, r: 0, b: 0, t: 0 },
        width: chartRef.current.offsetWidth,
        height: 400
      };

      Plotly.newPlot(chartRef.current, plotData, layout);

      chartRef.current.on('plotly_click', (event: any) => {
        const point = event.points[0];
        onNodeClick(point.id);
      });
    };

    loadPlotly();

    return () => {
      if (chartRef.current) {
        // @ts-ignore
        if (chartRef.current._Plotly) {
          // @ts-ignore
          chartRef.current._Plotly.purge(chartRef.current);
        }
      }
    };
  }, [data, onNodeClick]);

  return <div ref={chartRef} />;
};

export default PlotlyChart;