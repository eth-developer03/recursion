import React, { useState } from 'react';
import { Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';

const ScriptDisplay = ({ scriptData }) => {
  const [copied, setCopied] = useState(false);
  const [showSources, setShowSources] = useState(false);
  
  if (!scriptData) return null;
  
  const { title, script, sources } = scriptData;
  
  // Split script into sections based on segment markers
  const sections = script.split(/\[SEGMENT \d+:/g);
  const intro = sections[0];
  const contentSections = sections.slice(1).map(section => {
    // Extract the section title from the first line
    const lines = section.split('\n');
    const sectionTitle = lines[0].replace(']', '').trim();
    const sectionContent = lines.slice(1).join('\n');
    return { title: sectionTitle, content: sectionContent };
  });
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(script);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-gray-900 rounded-lg shadow-xl border border-gray-700 w-full max-w-4xl mx-auto my-8 overflow-hidden">
      {/* Script Header */}
      <div className="bg-gradient-to-r from-blue-900 to-purple-900 p-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <button 
            onClick={copyToClipboard}
            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Copied!' : 'Copy Script'}
          </button>
        </div>
      </div>
      
      {/* Script Content */}
      <div className="p-6 bg-gray-800 text-gray-200">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-blue-400 mb-3">Intro</h3>
          <div className="whitespace-pre-wrap font-light leading-relaxed">
            {intro}
          </div>
        </div>
        
        {contentSections.map((section, index) => (
          <div key={index} className="mb-6 border-t border-gray-700 pt-6">
            <h3 className="text-xl font-bold text-blue-400 mb-3">{section.title}</h3>
            <div className="whitespace-pre-wrap font-light leading-relaxed">
              {section.content}
            </div>
          </div>
        ))}
      </div>
      
      {/* Sources Section */}
      <div className="border-t border-gray-700">
        <button 
          onClick={() => setShowSources(!showSources)}
          className="flex items-center justify-between w-full p-4 bg-gray-900 hover:bg-gray-800 transition"
        >
          <span className="font-medium text-gray-300">Sources ({sources?.length || 0})</span>
          {showSources ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
        
        {showSources && sources && (
          <div className="p-4 bg-gray-800">
            {sources.map((source, index) => (
              <div key={index} className="mb-3 p-3 bg-gray-900 rounded-lg">
                <div className="flex justify-between items-start">
                  <span className="inline-block px-2 py-1 text-xs bg-blue-800 text-white rounded mb-2">
                    {source.source}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(source.created).toLocaleString()}
                  </span>
                </div>
                <h4 className="font-medium mb-1">{source.title}</h4>
                {source.content && (
                  <p className="text-sm text-gray-400 mb-2">{source.content}</p>
                )}
                {source.url && (
                  <a 
                    href={source.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 text-sm"
                  >
                    View Source
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ScriptDisplay;
