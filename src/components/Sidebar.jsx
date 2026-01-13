import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Sidebar = ({ siblings, toc, currentPath }) => {
  const [activeTab, setActiveTab] = useState('directory'); // 'directory' | 'outline'

  return (
    <div className="w-64 flex-shrink-0 flex flex-col h-full bg-gray-50 border-r border-gray-200">
      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          className={`flex-1 py-3 text-sm font-medium text-center ${
            activeTab === 'directory'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
          }`}
          onClick={() => setActiveTab('directory')}
        >
          文件 (Files)
        </button>
        <button
          className={`flex-1 py-3 text-sm font-medium text-center ${
            activeTab === 'outline'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
          }`}
          onClick={() => setActiveTab('outline')}
        >
          大纲 (TOC)
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'directory' && (
          <ul className="space-y-1">
            {siblings
              .sort((a, b) => {
                // 1. Folders first
                if (a.type === 'directory' && b.type !== 'directory') return -1;
                if (a.type !== 'directory' && b.type === 'directory') return 1;
                
                // 2. Name ascending
                return a.name.localeCompare(b.name);
              })
              .map((file) => {
              const isActive = file.path === currentPath;
              // Ensure we link to the full path. The sibling path is relative to root notes dir?
              // In sync-notes.js: path is like "OsCookBook/file.md"
              // In App.jsx: we navigate to "/OsCookBook/file.md"
              const linkPath = `/${file.path}`;
              
              return (
                <li key={file.path}>
                  <Link
                    to={linkPath}
                    className={`block px-3 py-2 rounded-md text-sm truncate ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    title={file.name}
                  >
                    {file.type === 'directory' ? '📁 ' : '📄 '}
                    {file.name}
                  </Link>
                </li>
              );
            })}
            {siblings.length === 0 && (
              <li className="text-sm text-gray-400 italic">Empty directory</li>
            )}
          </ul>
        )}

        {activeTab === 'outline' && (
          <div className="space-y-1">
            {toc.length > 0 ? (
              toc.map((heading, index) => (
                <a
                  key={index}
                  href={`#${heading.id}`}
                  className={`block text-sm text-gray-700 hover:text-blue-600 hover:bg-gray-100 py-1 pr-2 rounded truncate transition-colors`}
                  style={{ paddingLeft: `${(heading.level - 1) * 12 + 8}px` }}
                  title={heading.text}
                  onClick={(e) => {
                    // Smooth scroll to element
                    e.preventDefault();
                    const element = document.getElementById(heading.id);
                    if (element) {
                        element.scrollIntoView({ behavior: 'smooth' });
                        // Update hash without jumping (optional, handled by scrollIntoView)
                        window.history.pushState(null, null, `#${heading.id}`);
                    }
                  }}
                >
                  {heading.text}
                </a>
              ))
            ) : (
              <div className="text-sm text-gray-400 italic text-center mt-4">
                No headings found
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
