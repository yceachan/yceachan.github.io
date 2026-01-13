import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import Breadcrumbs from './components/Breadcrumbs';
import ExplorerGrid from './components/ExplorerGrid';
import MarkdownViewer from './components/MarkdownViewer';
import ProfileSidebar from './components/ProfileSidebar';

// Helper to find a node in the tree by path and return { node, parentNode }
const findNodeInfo = (tree, pathSegments) => {
  if (pathSegments.length === 0) return { node: tree, parentNode: null };
  
  let currentNode = tree;
  let parentNode = null;
  
  for (const segment of pathSegments) {
    if (!currentNode.children) return { node: null, parentNode };
    
    const decodedSegment = decodeURIComponent(segment);
    
    const nextNode = currentNode.children.find(child => child.name === decodedSegment);
    if (!nextNode) return { node: null, parentNode: currentNode };
    
    parentNode = currentNode;
    currentNode = nextNode;
  }
  
  return { node: currentNode, parentNode };
};

const ContentResolver = ({ tree }) => {
  const location = useLocation();
  
  // Remove leading slash and split
  const path = location.pathname.substring(1); 
  const segments = path ? path.split('/') : [];
  
  const { node, parentNode } = findNodeInfo(tree, segments);

  if (!node) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-red-600">404 - Not Found</h2>
        <p className="text-gray-600">The path {location.pathname} does not exist in the index.</p>
      </div>
    );
  }

  // If viewing a file, we want to show siblings in sidebar
  // Siblings are children of the parentNode
  const siblings = parentNode ? parentNode.children : [];

  return (
    <div className="flex flex-col h-full overflow-hidden w-full">
      <Breadcrumbs />
      <div className="flex-1 overflow-hidden bg-gray-100 relative">
        {node.type === 'directory' ? (
          <div className="h-full overflow-auto">
             <ExplorerGrid node={node} />
          </div>
        ) : (
          <MarkdownViewer node={node} siblings={siblings} />
        )}
      </div>
    </div>
  );
};

function App() {
  const [tree, setTree] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/directory-tree.json')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load directory index');
        return res.json();
      })
      .then(data => {
        setTree(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-xl text-gray-600">Loading Workspace Index...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-xl text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <HashRouter>
      <div className="flex h-screen w-screen overflow-hidden">
        {/* Global Sidebar */}
        <ProfileSidebar />
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <Routes>
            <Route path="*" element={<ContentResolver tree={tree} />} />
          </Routes>
        </div>
      </div>
    </HashRouter>
  );
}

export default App;
