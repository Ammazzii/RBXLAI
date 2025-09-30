import { useState } from 'react';
import { ValidationError } from '@/utils/luaValidator';

interface ErrorPanelProps {
  errors: ValidationError[];
  onErrorClick?: (error: ValidationError) => void;
  className?: string;
}

const ErrorPanel = ({ errors, onErrorClick, className = '' }: ErrorPanelProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filter, setFilter] = useState<'all' | 'errors' | 'warnings'>('all');

  const filteredErrors = errors.filter(error => {
    switch (filter) {
      case 'errors':
        return error.severity === 'error';
      case 'warnings':
        return error.severity === 'warning' || error.severity === 'info';
      default:
        return true;
    }
  });

  const errorCount = errors.filter(e => e.severity === 'error').length;
  const warningCount = errors.filter(e => e.severity === 'warning' || e.severity === 'info').length;

  if (errors.length === 0) return null;

  const getErrorIcon = (severity: string) => {
    switch (severity) {
      case 'error':
        return (
          <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-4 h-4 text-yellow-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4 text-blue-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'syntax':
        return 'Syntax';
      case 'roblox-api':
        return 'Roblox API';
      case 'deprecated':
        return 'Deprecated';
      case 'best-practice':
        return 'Best Practice';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className={`bg-gray-800 border-t border-gray-700 ${className}`}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-2 bg-gray-900 cursor-pointer hover:bg-gray-800 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1">
            <svg
              className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
            </svg>
            <span className="font-medium text-sm">Problems</span>
          </div>

          <div className="flex items-center space-x-3">
            {errorCount > 0 && (
              <div className="flex items-center text-red-400">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="text-xs">{errorCount}</span>
              </div>
            )}
            {warningCount > 0 && (
              <div className="flex items-center text-yellow-400">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="text-xs">{warningCount}</span>
              </div>
            )}
          </div>
        </div>

        {/* Filter buttons */}
        {isExpanded && (
          <div className="flex bg-gray-700 rounded-md">
            <button
              onClick={(e) => { e.stopPropagation(); setFilter('all'); }}
              className={`px-2 py-1 text-xs rounded-l-md transition-colors ${
                filter === 'all' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-600'
              }`}
            >
              All
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setFilter('errors'); }}
              className={`px-2 py-1 text-xs transition-colors ${
                filter === 'errors' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-600'
              }`}
            >
              Errors
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setFilter('warnings'); }}
              className={`px-2 py-1 text-xs rounded-r-md transition-colors ${
                filter === 'warnings' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-600'
              }`}
            >
              Warnings
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="max-h-48 overflow-y-auto">
          {filteredErrors.length === 0 ? (
            <div className="px-4 py-3 text-gray-400 text-sm">
              No {filter === 'all' ? 'problems' : filter} found
            </div>
          ) : (
            filteredErrors.map((error, index) => (
              <div
                key={index}
                className="flex items-start px-4 py-2 hover:bg-gray-700 cursor-pointer border-b border-gray-700 last:border-b-0"
                onClick={() => onErrorClick?.(error)}
              >
                <div className="mr-3 mt-0.5">
                  {getErrorIcon(error.severity)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-sm font-medium text-white">
                      Line {error.line}, Column {error.column}
                    </span>
                    <span className="text-xs px-1.5 py-0.5 bg-gray-600 rounded text-gray-300">
                      {getTypeLabel(error.type)}
                    </span>
                    {error.code && (
                      <span className="text-xs text-gray-400">
                        {error.code}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-300 break-words">
                    {error.message}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ErrorPanel;