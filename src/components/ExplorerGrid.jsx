import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

const ExplorerGrid = ({ node }) => {
  const navigate = useNavigate();
  const [sortKey, setSortKey] = useState('name'); // 'name' | 'date'
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' | 'desc'

  const sortedChildren = useMemo(() => {
    if (!node || !node.children) return [];

    const children = [...node.children];

    // Sorting function
    const sortFn = (a, b) => {
        let comparison = 0;
        if (sortKey === 'name') {
            comparison = a.name.localeCompare(b.name);
        } else if (sortKey === 'date') {
            const dateA = new Date(a.mtime || 0).getTime();
            const dateB = new Date(b.mtime || 0).getTime();
            comparison = dateA - dateB;
        }

        return sortOrder === 'asc' ? comparison : -comparison;
    };

    // Group by type (directories first)
    const directories = children.filter(c => c.type === 'directory').sort(sortFn);
    const files = children.filter(c => c.type !== 'directory').sort(sortFn);

    return [...directories, ...files];
  }, [node, sortKey, sortOrder]);

  if (!node || !node.children) {
    return <div className="p-4 text-gray-500">Empty directory</div>;
  }

  return (
    <div className="p-4">
        {/* Controls */}
        <div className="flex justify-end mb-4 space-x-2">
            <select 
                value={sortKey} 
                onChange={(e) => setSortKey(e.target.value)}
                className="border border-gray-300 rounded px-2 py-1 text-sm bg-white"
            >
                <option value="name">Name</option>
                <option value="date">Date Modified</option>
            </select>
            <button 
                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                className="border border-gray-300 rounded px-3 py-1 text-sm bg-white hover:bg-gray-50"
            >
                {sortOrder === 'asc' ? 'Asc ⬆' : 'Desc ⬇'}
            </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {sortedChildren.map((child) => (
            <div
            key={child.path}
            onClick={() => navigate(`/${child.path}`)}
            className="flex flex-col items-center justify-center p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 hover:shadow-md cursor-pointer transition-all aspect-square text-center relative group"
            >
            <div className="mb-2 text-4xl text-gray-400">
                {child.type === 'directory' ? (
                <span role="img" aria-label="folder">📁</span>
                ) : (
                <span role="img" aria-label="file">📄</span>
                )}
            </div>
            <span className="text-sm font-medium text-gray-700 break-words w-full truncate px-2" title={child.name}>
                {child.name}
            </span>
            {child.mtime && (
                <span className="text-xs text-gray-400 mt-1 hidden group-hover:block absolute bottom-2">
                    {new Date(child.mtime).toLocaleDateString()}
                </span>
            )}
            </div>
        ))}
        </div>
    </div>
  );
};

export default ExplorerGrid;
