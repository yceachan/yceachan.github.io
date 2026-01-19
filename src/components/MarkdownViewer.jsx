import React, { useState, useEffect } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import rehypeKatex from 'rehype-katex';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark as atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import 'katex/dist/katex.min.css'; // Import KaTeX styles
import Sidebar from './Sidebar';
import '../markdown-styles.css'; // Import custom styles

const MarkdownViewer = ({ node, siblings }) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toc, setToc] = useState([]);

  useEffect(() => {
    if (!node || !node.path) return;

    const fetchPath = `/notes/${node.path}`;

    setLoading(true);
    fetch(fetchPath)
      .then(res => {
        if (!res.ok) throw new Error(`Failed to load document (status: ${res.status})`);
        return res.text();
      })
      .then(text => {
        setContent(text);
        setLoading(false);
        
        // Parse TOC from markdown text
        const newToc = [];
        // Helper to slugify text to match rehype-slug behavior (simplified)
        const slugify = (text) => {
            return text
                .toString()
                .toLowerCase()
                .trim()
                .replace(/\s+/g, '-')     // Replace spaces with -
                .replace(/&/g, '-and-')   // Replace & with 'and'
                .replace(/[^\w\u4e00-\u9fa5\-]+/g, '') // Remove all non-word chars
                .replace(/\-\-+/g, '-');  // Replace multiple - with single -
        };
        
        // Regex to find headers: # Header (at start of line)
        // Matches:
        // ^\s*        : Optional whitespace at start of line
        // (#{1,6})    : 1 to 6 hash marks (Group 1)
        // \s+         : One or more spaces
        // (.*?)       : The header text (Group 2)
        // \s*         : Optional trailing whitespace
        // $           : End of line
        // Flags: g (global), m (multiline)
        const headerRegex = /^\s*(#{1,6})\s+(.*?)\s*$/gm;
        
        let match;
        while ((match = headerRegex.exec(text)) !== null) {
            const level = match[1].length;
            if (level <= 5) { // Only H1-H5 as requested
                const text = match[2];
                const id = slugify(text);
                newToc.push({ level, text, id });
            }
        }
        
        setToc(newToc);
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, [node]);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading document...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="flex h-full">
        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto h-full bg-white">
            <div className="max-w-4xl mx-auto p-6 md:p-10">
              <div className="markdown-body">
                <Markdown
                  remarkPlugins={[remarkGfm, remarkMath]}
                  rehypePlugins={[rehypeRaw, rehypeSlug, rehypeKatex]}
                  components={{
                    code({ node, inline, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || '');
                      return !inline && match ? (
                        <SyntaxHighlighter
                          style={atomOneDark}
                          language={match[1]}
                          PreTag="div"
                          {...props}
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      ) : (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      );
                    },
                  }}
                >
                  {content}
                </Markdown>
              </div>
            </div>
        </div>

        {/* Right Sidebar */}
        <Sidebar siblings={siblings} toc={toc} currentPath={node.path} />
    </div>
  );
};

export default MarkdownViewer;
