import React, { useEffect, useState } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
});

const Mermaid = ({ chart }) => {
  const [svg, setSvg] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    const renderChart = async () => {
      try {
        if (!chart) return;
        
        // Generate a unique ID for each diagram
        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
        
        // mermaid.render returns an object { svg } in newer versions
        const { svg: renderedSvg } = await mermaid.render(id, chart);
        setSvg(renderedSvg);
        setError(null);
      } catch (err) {
        console.error('Mermaid rendering failed:', err);
        // Mermaid might leave some residual elements in the DOM, cleaning them up if possible isn't easy without document access, 
        // but react handles the component unmount.
        // We set error state to display a fallback.
        setError(err.message || 'Failed to render diagram');
      }
    };

    renderChart();
  }, [chart]);

  if (error) {
    return (
      <div className="p-4 border border-red-300 bg-red-50 text-red-700 rounded">
        <p className="font-bold">Mermaid Error:</p>
        <pre className="text-sm overflow-x-auto">{error}</pre>
        <pre className="text-xs mt-2 text-gray-500">{chart}</pre>
      </div>
    );
  }

  return (
    <div 
      className="mermaid-diagram flex justify-center p-4 bg-white rounded-lg shadow-sm border border-gray-100 my-4 overflow-x-auto"
      dangerouslySetInnerHTML={{ __html: svg }} 
    />
  );
};

export default Mermaid;
