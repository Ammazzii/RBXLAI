"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-lua';
import { useLuaValidation } from '@/hooks/useLuaValidation';
import ErrorIndicator from '@/components/ErrorIndicator';
import ErrorPanel from '@/components/ErrorPanel';
import { ValidationError } from '@/utils/luaValidator';
import { useAuth } from '@/contexts/AuthContext';
import AuthModal from '@/components/AuthModal';
import BillingModal from '@/components/BillingModal';
import { useRouter } from 'next/navigation';

// --- ROBLOX-STYLE ICONS ---
const ArrowIcon = ({ isOpen }: { isOpen: boolean }) => (
  <svg viewBox="0 0 16 16" className={`w-4 h-4 mr-1 transition-transform ${isOpen ? 'rotate-90' : ''} text-gray-400`}>
    <path fill="currentColor" d="M6 4l4 4-4 4V4z"/>
  </svg>
);

// Roblox Service Icons (matching Studio colors/styles)
const WorkspaceIcon = () => (
  <div className="w-4 h-4 mr-2 flex-shrink-0 flex items-center justify-center bg-blue-600 rounded text-white text-xs font-bold">W</div>
);

const PlayersIcon = () => (
  <div className="w-4 h-4 mr-2 flex-shrink-0 flex items-center justify-center bg-green-600 rounded text-white text-xs">👥</div>
);

const LightingIcon = () => (
  <div className="w-4 h-4 mr-2 flex-shrink-0 flex items-center justify-center bg-yellow-500 rounded text-white text-xs">💡</div>
);

const ReplicatedStorageIcon = () => (
  <div className="w-4 h-4 mr-2 flex-shrink-0 flex items-center justify-center bg-purple-600 rounded text-white text-xs font-bold">R</div>
);

const ServerScriptServiceIcon = () => (
  <div className="w-4 h-4 mr-2 flex-shrink-0 flex items-center justify-center bg-red-600 rounded text-white text-xs">🖥️</div>
);

const ServerStorageIcon = () => (
  <div className="w-4 h-4 mr-2 flex-shrink-0 flex items-center justify-center bg-orange-600 rounded text-white text-xs font-bold">S</div>
);

const StarterGuiIcon = () => (
  <div className="w-4 h-4 mr-2 flex-shrink-0 flex items-center justify-center bg-cyan-600 rounded text-white text-xs">🖼️</div>
);

const StarterPlayerIcon = () => (
  <div className="w-4 h-4 mr-2 flex-shrink-0 flex items-center justify-center bg-indigo-600 rounded text-white text-xs">👤</div>
);

const StarterPackIcon = () => (
  <div className="w-4 h-4 mr-2 flex-shrink-0 flex items-center justify-center bg-pink-600 rounded text-white text-xs">🎒</div>
);

const TeamsIcon = () => (
  <div className="w-4 h-4 mr-2 flex-shrink-0 flex items-center justify-center bg-teal-600 rounded text-white text-xs">👥</div>
);

const SoundServiceIcon = () => (
  <div className="w-4 h-4 mr-2 flex-shrink-0 flex items-center justify-center bg-green-500 rounded text-white text-xs">🔊</div>
);

const ChatIcon = () => (
  <div className="w-4 h-4 mr-2 flex-shrink-0 flex items-center justify-center bg-blue-500 rounded text-white text-xs">💬</div>
);

const ReplicatedFirstIcon = () => (
  <div className="w-4 h-4 mr-2 flex-shrink-0 flex items-center justify-center bg-violet-600 rounded text-white text-xs font-bold">1</div>
);

// Generic folder icon for custom folders
const FolderIcon = () => (
  <div className="w-4 h-4 mr-2 flex-shrink-0 flex items-center justify-center bg-yellow-600 rounded text-white text-xs">📁</div>
);

// Script Icons (with distinct colors and symbols)
const ScriptIcon = () => (
  <div className="w-4 h-4 mr-2 flex-shrink-0 flex items-center justify-center bg-blue-500 rounded text-white text-xs font-bold">S</div>
);

const LocalScriptIcon = () => (
  <div className="w-4 h-4 mr-2 flex-shrink-0 flex items-center justify-center bg-green-500 rounded text-white text-xs font-bold">L</div>
);

const ModuleScriptIcon = () => (
  <div className="w-4 h-4 mr-2 flex-shrink-0 flex items-center justify-center bg-orange-500 rounded text-white text-xs font-bold">M</div>
);

// Get icon based on service name or type
const getServiceIcon = (name: string) => {
  switch (name) {
    case 'Workspace': return <WorkspaceIcon />;
    case 'Players': return <PlayersIcon />;
    case 'Lighting': return <LightingIcon />;
    case 'ReplicatedStorage': return <ReplicatedStorageIcon />;
    case 'ServerScriptService': return <ServerScriptServiceIcon />;
    case 'ServerStorage': return <ServerStorageIcon />;
    case 'StarterGui': return <StarterGuiIcon />;
    case 'StarterPlayer': return <StarterPlayerIcon />;
    case 'StarterPack': return <StarterPackIcon />;
    case 'Teams': return <TeamsIcon />;
    case 'SoundService': return <SoundServiceIcon />;
    case 'Chat': return <ChatIcon />;
    case 'ReplicatedFirst': return <ReplicatedFirstIcon />;
    default: return <FolderIcon />;
  }
};

type ScriptType = 'Script' | 'LocalScript' | 'ModuleScript';
type ProjectItem = { id: string; name: string; type: 'folder' | 'script'; path: string; content?: string; scriptType?: ScriptType; children?: ProjectItem[]; lastModified?: number; isDirty?: boolean; updateId?: string; };
type Message = { role: 'user' | 'assistant'; content: string; };
type ModifiedFile = { path: string; content: string; lastModified: number; };


// --- COMPONENTS ---
const ScriptCreationMenu = ({ onCreateScript }: { onCreateScript: (path: string, type: ScriptType, content: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState('ServerScriptService');
  const [scriptName, setScriptName] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [scriptType, setScriptType] = useState<ScriptType>('Script');

  const handleCreateScript = () => {
    if (!scriptName.trim()) {
      alert('Please enter a script name');
      return;
    }

    const scriptPath = `${selectedFolder}/${scriptName}`;
    const defaultContent = getDefaultScriptContent(scriptType);

    onCreateScript(scriptPath, scriptType, defaultContent);

    // Reset form
    setScriptName('');
    setShowModal(false);
    setIsOpen(false);
  };

  const getDefaultScriptContent = (type: ScriptType): string => {
    switch (type) {
      case 'LocalScript':
        return '-- LocalScript\nlocal player = game.Players.LocalPlayer\n\nprint("LocalScript started for", player.Name)';
      case 'ModuleScript':
        return '-- ModuleScript\nlocal module = {}\n\nfunction module.exampleFunction()\n    print("Example function called")\nend\n\nreturn module';
      default:
        return '-- Script\nprint("Hello from server script!")';
    }
  };

  return (
    <div
      className="relative"
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
        title="Create new script"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-1 bg-gray-700 border border-gray-600 rounded-md shadow-lg z-50 min-w-48">
          <div className="p-2">
            <button
              onClick={() => setShowModal(true)}
              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-600 rounded flex items-center"
            >
              <ScriptIcon />
              <span>Create Script</span>
            </button>
            <button
              onClick={() => { setScriptType('LocalScript'); setShowModal(true); }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-600 rounded flex items-center"
            >
              <LocalScriptIcon />
              <span>Create LocalScript</span>
            </button>
            <button
              onClick={() => { setScriptType('ModuleScript'); setShowModal(true); }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-600 rounded flex items-center"
            >
              <ModuleScriptIcon />
              <span>Create ModuleScript</span>
            </button>
          </div>
        </div>
      )}

      {/* Modal for script creation */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Create {scriptType}</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Script Name</label>
                <input
                  type="text"
                  value={scriptName}
                  onChange={(e) => setScriptName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
                  placeholder="Enter script name..."
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Location</label>
                <select
                  value={selectedFolder}
                  onChange={(e) => setSelectedFolder(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
                >
                  <option value="ServerScriptService">ServerScriptService</option>
                  <option value="StarterPlayer/StarterPlayerScripts">StarterPlayerScripts</option>
                  <option value="StarterPlayer/StarterCharacterScripts">StarterCharacterScripts</option>
                  <option value="StarterGui">StarterGui</option>
                  <option value="ReplicatedStorage">ReplicatedStorage</option>
                  <option value="ServerStorage">ServerStorage</option>
                  <option value="Workspace">Workspace</option>
                </select>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleCreateScript}
                className="flex-1 bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded text-white transition-colors"
              >
                Create
              </button>
              <button
                onClick={() => { setShowModal(false); setIsOpen(false); setScriptName(''); }}
                className="flex-1 bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded text-white transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ImportMenu = ({ onImport }: { onImport: (files: File[]) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      onImport(files);
      setIsOpen(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerFileImport = (multiple: boolean = false) => {
    if (fileInputRef.current) {
      fileInputRef.current.multiple = multiple;
      fileInputRef.current.accept = '.lua,.txt';
      fileInputRef.current.click();
    }
  };

  return (
    <div
      className="relative"
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
        title="Import scripts"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
        </svg>
      </button>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileImport}
      />

      {isOpen && (
        <div className="absolute top-full right-0 mt-1 bg-gray-700 border border-gray-600 rounded-md shadow-lg z-50 min-w-48">
          <div className="p-2">
            <button
              onClick={() => triggerFileImport(false)}
              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-600 rounded flex items-center"
            >
              <div className="w-4 h-4 mr-2 flex-shrink-0 flex items-center justify-center bg-blue-500 rounded text-white text-xs">📄</div>
              <span>Import .lua File</span>
            </button>
            <button
              onClick={() => triggerFileImport(true)}
              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-600 rounded flex items-center"
            >
              <div className="w-4 h-4 mr-2 flex-shrink-0 flex items-center justify-center bg-green-500 rounded text-white text-xs">📁</div>
              <span>Import Multiple Files</span>
            </button>
            <div className="border-t border-gray-600 mt-2 pt-2">
              <button
                onClick={() => {
                  // TODO: Implement text import
                  alert('Text import coming soon!');
                  setIsOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-600 rounded flex items-center"
              >
                <div className="w-4 h-4 mr-2 flex-shrink-0 flex items-center justify-center bg-purple-500 rounded text-white text-xs">📋</div>
                <span>Import from Text</span>
              </button>
              <button
                onClick={() => {
                  // TODO: Implement GitHub import
                  alert('GitHub import coming soon!');
                  setIsOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-600 rounded flex items-center"
              >
                <div className="w-4 h-4 mr-2 flex-shrink-0 flex items-center justify-center bg-gray-500 rounded text-white text-xs">🔗</div>
                <span>Import from GitHub</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const BackupRestoreMenu = ({ onBackup, onRestore }: { onBackup: () => void; onRestore: (file: File) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onRestore(file);
      setIsOpen(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerRestoreImport = () => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = '.json';
      fileInputRef.current.click();
    }
  };

  return (
    <div
      className="relative"
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
        title="Backup/Restore project"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      </button>

      {/* Hidden file input for restore */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleRestoreFile}
      />

      {isOpen && (
        <div className="absolute top-full right-0 mt-1 bg-gray-700 border border-gray-600 rounded-md shadow-lg z-50 min-w-48">
          <div className="p-2">
            <button
              onClick={() => {
                onBackup();
                setIsOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-600 rounded flex items-center"
            >
              <div className="w-4 h-4 mr-2 flex-shrink-0 flex items-center justify-center bg-green-600 rounded text-white text-xs">💾</div>
              <span>Backup Project</span>
            </button>
            <button
              onClick={() => triggerRestoreImport()}
              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-600 rounded flex items-center"
            >
              <div className="w-4 h-4 mr-2 flex-shrink-0 flex items-center justify-center bg-blue-600 rounded text-white text-xs">📁</div>
              <span>Restore Project</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const ProjectNode = ({ node, level, onFileSelect, activeFileId, onDelete, onExport }: { node: ProjectItem; level: number; onFileSelect: (file: ProjectItem) => void; activeFileId: string | null; onDelete: (path: string, name: string) => void; onExport: (node: ProjectItem) => void; }) => {
  const [isOpen, setIsOpen] = useState(true);

  const getIcon = () => {
    if (node.type === 'folder') {
      // Use specific service icons for known Roblox services
      return getServiceIcon(node.name);
    } else {
      // Use script-specific icons
      switch (node.scriptType) {
        case 'LocalScript': return <LocalScriptIcon />;
        case 'ModuleScript': return <ModuleScriptIcon />;
        default: return <ScriptIcon />;
      }
    }
  };
  const isSelected = node.id === activeFileId;
  const itemClass = `flex items-center w-full text-left py-1.5 cursor-pointer rounded-md transition-all duration-200 ${isSelected ? 'bg-blue-600' : 'hover:bg-gray-700/50'}`;
  if (node.type === 'folder') {
    return (
      <>
        <div onClick={() => setIsOpen(!isOpen)} className={itemClass} style={{ paddingLeft: `${level * 0.5}rem` }}> <ArrowIcon isOpen={isOpen} /> {getIcon()} <span>{node.name}</span> </div>
        {isOpen && node.children && (<div>{node.children.map(childNode => <ProjectNode key={childNode.id} node={childNode} level={level + 1} onFileSelect={onFileSelect} activeFileId={activeFileId} onDelete={onDelete} onExport={onExport} />)}</div>)}
      </>
    );
  }
  return (
    <div
      className={`${itemClass} group relative`}
      style={{ paddingLeft: `${level * 0.5 + 1.5}rem`, paddingRight: '8px' }}
    >
      {/* Main content area */}
      <div
        onClick={() => onFileSelect(node)}
        className="flex items-center flex-1 min-w-0 py-1"
      >
        {getIcon()}
        <span className={`truncate ${node.isDirty ? 'text-yellow-400' : ''}`}>
          {node.name}
        </span>

        {/* Dirty indicator - better positioned */}
        {node.isDirty && (
          <div className="ml-2 flex items-center">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" title="Unsaved changes" />
          </div>
        )}
      </div>

      {/* Action buttons - always visible on mobile, hover on desktop */}
      <div className="flex items-center space-x-1 ml-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onExport(node);
          }}
          className="flex items-center justify-center w-7 h-7 rounded-md bg-gray-700 hover:bg-blue-600 text-gray-300 hover:text-white transition-all duration-200 hover:scale-105"
          title="Export as .lua file"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m-9-4h12a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2z" />
          </svg>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (window.confirm(`Are you sure you want to delete ${node.name}?`)) {
              onDelete(node.path, node.name);
            }
          }}
          className="flex items-center justify-center w-7 h-7 rounded-md bg-gray-700 hover:bg-red-600 text-gray-300 hover:text-white transition-all duration-200 hover:scale-105"
          title="Delete script"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
};

const HighlightedCodeBlock = ({ code }: { code: string }) => {
  const highlighted = Prism.highlight(code, Prism.languages.lua, 'lua');
  return <div className="relative my-2 rounded-md border border-gray-600 bg-[#282c34]"> <button onClick={() => navigator.clipboard.writeText(code)} className="absolute top-2 right-2 z-10 rounded-md bg-gray-700 px-2 py-1 text-xs font-semibold text-white transition-colors hover:bg-gray-600">Copy</button> <div className="max-h-[14rem] overflow-y-auto p-3 pt-8 scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-gray-900/50"> <pre className="whitespace-pre-wrap break-words"><code className="text-sm" dangerouslySetInnerHTML={{ __html: highlighted }} /></pre> </div> </div>;
};

const LuaEditor = ({ file, onCodeChange }: { file: ProjectItem; onCodeChange: (path: string, newContent: string, isManualEdit?: boolean) => void }) => {
  const [code, setCode] = useState(file.content || '');
  const [history, setHistory] = useState([file.content || '']);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [saveStatus, setSaveStatus] = useState('Saved');
  const editorScrollRef = useRef<HTMLDivElement>(null);
  // Use validation hook
  const { validationResult, isValidating } = useLuaValidation(code);

  useEffect(() => {
    setCode(file.content || '');
    setHistory([file.content || '']);
    setHistoryIndex(0);
    setSaveStatus('Saved');
  }, [file.id, file.content, file.path, file.updateId]);

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newCode);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setSaveStatus('Unsaved');
  };

  const handleSave = () => { onCodeChange(file.path, code, true); setSaveStatus('Saved'); };
  const handleUndo = () => { if (historyIndex > 0) { const newIndex = historyIndex - 1; setCode(history[newIndex]); setHistoryIndex(newIndex); setSaveStatus('Unsaved'); } };
  const handleRedo = () => { if (historyIndex < history.length - 1) { const newIndex = historyIndex + 1; setCode(history[newIndex]); setHistoryIndex(newIndex); setSaveStatus('Unsaved'); } };

  const handleErrorClick = (error: ValidationError) => {
    // TODO: Scroll to line in editor - will implement in future update
    console.log('Navigate to line:', error.line);
  };

  const allErrors = validationResult ? [...validationResult.errors, ...validationResult.warnings] : [];

  return (
    <div className="flex flex-col w-full h-full bg-[#282c34] border border-gray-900">
      {/* Add global CSS for error underlines */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .error-underline {
            border-bottom: 2px dashed #f87171 !important;
            background-color: rgba(248, 113, 113, 0.1) !important;
            border-radius: 2px;
            padding: 1px 2px;
          }
          .warning-underline {
            border-bottom: 2px dashed #fbbf24 !important;
            background-color: rgba(251, 191, 36, 0.1) !important;
            border-radius: 2px;
            padding: 1px 2px;
          }
          .error-underline:hover,
          .warning-underline:hover {
            background-color: rgba(248, 113, 113, 0.15) !important;
          }
        `
      }} />
      <div className="flex items-center flex-shrink-0 h-10 px-4 bg-gray-800 border-b border-gray-900">
        <span className="font-semibold text-sm">{file.path}</span>

        {/* Validation Status */}
        <div className="ml-3 flex items-center space-x-2">
          {isValidating && (
            <div className="text-xs text-gray-400 animate-pulse">Validating...</div>
          )}
          <ErrorIndicator errors={allErrors} />
        </div>

        <div className="ml-auto flex items-center space-x-2">
          <span className={`text-xs font-semibold ${saveStatus === 'Saved' ? 'text-green-400' : 'text-yellow-400'}`}>{saveStatus}</span>
          <button onClick={handleSave} className="px-3 py-1 text-xs bg-blue-600 rounded hover:bg-blue-500">Save</button>
          <button onClick={handleUndo} disabled={historyIndex === 0} className="px-3 py-1 text-xs bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-50">Undo</button>
          <button onClick={handleRedo} disabled={historyIndex === history.length - 1} className="px-3 py-1 text-xs bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-50">Redo</button>
        </div>
      </div>

      <div className="flex flex-col w-full h-full">
        {/* Error Summary Bar */}
        {allErrors.length > 0 && (
          <div className="flex items-center px-4 py-2 bg-gray-700 border-b border-gray-600 text-sm">
            <ErrorIndicator errors={allErrors} />
            <span className="ml-2 text-gray-300">
              {allErrors.filter(e => e.severity === 'error').length > 0 && (
                <span className="mr-3">
                  {allErrors.filter(e => e.severity === 'error').length} error(s)
                </span>
              )}
              {allErrors.filter(e => e.severity === 'warning' || e.severity === 'info').length > 0 && (
                <span>
                  {allErrors.filter(e => e.severity === 'warning' || e.severity === 'info').length} warning(s)
                </span>
              )}
            </span>
          </div>
        )}

        <div className="flex flex-1 overflow-hidden">
          {/* Synchronized line numbers */}
          <div className="w-12 bg-gray-700/50 border-r border-gray-600 flex-shrink-0 overflow-hidden relative">
            <div
              ref={(el) => {
                // Sync scroll with editor
                if (el && editorScrollRef.current) {
                  el.scrollTop = editorScrollRef.current.scrollTop;
                }
              }}
              className="absolute inset-0 overflow-hidden"
              style={{
                paddingTop: '10px', // Match editor padding
                fontSize: '14px',
                fontFamily: '"Fira code", "Fira Mono", monospace',
                lineHeight: '21px' // Match editor line height
              }}
            >
              <div className="px-2 text-gray-400 text-right">
                {code.split('\n').map((_, index) => {
                  const lineNumber = index + 1;
                  const lineErrors = allErrors.filter(e => e.line === lineNumber);
                  const hasError = lineErrors.some(e => e.severity === 'error');
                  const hasWarning = lineErrors.some(e => e.severity === 'warning' || e.severity === 'info');

                  return (
                    <div
                      key={index}
                      className={`relative flex items-center justify-end ${
                        hasError ? 'text-red-400 font-bold' : hasWarning ? 'text-yellow-400' : ''
                      }`}
                      style={{ height: '21px' }} // Exact line height match
                      title={lineErrors.map(e => e.message).join('; ')}
                    >
                      {lineNumber}
                      {lineErrors.length > 0 && (
                        <div className="absolute -right-1 top-1/2 transform -translate-y-1/2">
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            hasError ? 'bg-red-400' : 'bg-yellow-400'
                          }`} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Code editor */}
          <div
            className="flex-1 overflow-auto"
            ref={editorScrollRef}
            onScroll={(e) => {
              // Sync line numbers scroll
              const lineNumbersEl = e.currentTarget.parentElement?.querySelector('.w-12 .absolute');
              if (lineNumbersEl) {
                lineNumbersEl.scrollTop = e.currentTarget.scrollTop;
              }
            }}
          >
            <Editor
              value={code}
              onValueChange={handleCodeChange}
              highlight={(code) => {
                // First apply normal syntax highlighting
                const highlighted = Prism.highlight(code, Prism.languages.lua, 'lua');

                // Then add error underlines
                const lines = code.split('\n');
                let modifiedHighlighted = highlighted;

                // Process each line for errors
                lines.forEach((line, lineIndex) => {
                  const lineNumber = lineIndex + 1;
                  const lineErrors = allErrors.filter(e => e.line === lineNumber);

                  if (lineErrors.length > 0) {
                    // Determine the most severe error type for the line
                    const hasError = lineErrors.some(e => e.severity === 'error');
                    const underlineClass = hasError ? 'error-underline' : 'warning-underline';

                    // Combine all error messages for tooltip
                    const allMessages = lineErrors.map(e => e.message).join(' | ');

                    // Apply underline to entire line (only once per line)
                    const linePattern = new RegExp(`(${line.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})(?=\\n|$)`, 'g');
                    modifiedHighlighted = modifiedHighlighted.replace(linePattern, `<span class="${underlineClass}" title="${allMessages}">$1</span>`);
                  }
                });

                return modifiedHighlighted;
              }}
              padding={10}
              style={{
                fontFamily: '"Fira code", "Fira Mono", monospace',
                fontSize: 14,
                lineHeight: '21px', // Explicit line height for sync
                minHeight: 'calc(100% - 60px)', // Leave space at bottom
                paddingBottom: '60px', // Add bottom padding
                backgroundColor: 'transparent'
              }}
            />
          </div>
        </div>

        {/* Error Panel */}
        {allErrors.length > 0 && (
          <ErrorPanel
            errors={allErrors}
            onErrorClick={handleErrorClick}
            className="flex-shrink-0"
          />
        )}
      </div>
    </div>
  );
};

// --- INITIAL STATE & UTILS ---
const initialProjectState: ProjectItem[] = [ { id: '1', name: 'Workspace', type: 'folder', path: 'Workspace', children: [] }, { id: '2', name: 'Players', type: 'folder', path: 'Players', children: [] }, { id: '3', name: 'Lighting', type: 'folder', path: 'Lighting', children: [] }, { id: '4', name: 'ReplicatedFirst', type: 'folder', path: 'ReplicatedFirst', children: [] }, { id: '5', name: 'ReplicatedStorage', type: 'folder', path: 'ReplicatedStorage', children: [] }, { id: '6', name: 'ServerScriptService', type: 'folder', path: 'ServerScriptService', children: [] }, { id: '7', name: 'ServerStorage', type: 'folder', path: 'ServerStorage', children: [] }, { id: '8', name: 'StarterGui', type: 'folder', path: 'StarterGui', children: [] }, { id: '9', name: 'StarterPack', type: 'folder', path: 'StarterPack', children: [] }, { id: '10', name: 'StarterPlayer', type: 'folder', path: 'StarterPlayer', children: [ { id: '10-1', name: 'StarterPlayerScripts', type: 'folder', path: 'StarterPlayer/StarterPlayerScripts', children: [] }, { id: '10-2', name: 'StarterCharacterScripts', type: 'folder', path: 'StarterPlayer/StarterCharacterScripts', children: [] }, ] }, { id: '11', name: 'Teams', type: 'folder', path: 'Teams', children: [] }, { id: '12', name: 'SoundService', type: 'folder', path: 'SoundService', children: [] }, { id: '13', name: 'Chat', type: 'folder', path: 'Chat', children: [] }, ];
const generateProjectTreeString = (nodes: ProjectItem[], prefix = ''): string => {let treeString = '';nodes.forEach((node, index) => {const isLast = index === nodes.length - 1;const connector = isLast ? '└── ' : '├── ';const newPrefix = prefix + (isLast ? '    ' : '│   ');const typeIndicator = node.type === 'folder' ? '' : `[${node.scriptType}]`;treeString += `${prefix}${connector}${node.name} ${typeIndicator}\n`;if (node.children && node.children.length > 0) {treeString += generateProjectTreeString(node.children, newPrefix);}});return treeString;};

// --- MAIN COMPONENT ---
export default function HomePage() {
  const { user, token, logout, isLoading: authLoading, promptStats, updatePromptStats } = useAuth();
  
  // --- NEW CODE, PART 1: INITIALIZE THE ROUTER ---
  const router = useRouter(); 

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{ role: 'assistant', content: 'Welcome to RBXAI! How can I help you build your Roblox game today?' }]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const [projectTree, setProjectTree] = useState<ProjectItem[]>(initialProjectState);
  const [openTabs, setOpenTabs] = useState<ProjectItem[]>([]);
  const [activeTabId, setActiveTabId] = useState<string>('chat');
  const [modifiedFiles, setModifiedFiles] = useState<Map<string, ModifiedFile>>(new Map());
  const [lastAutoSave, setLastAutoSave] = useState<Date | null>(null);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);

  // --- NEW CODE, PART 2: DEFINE THE REDIRECT FUNCTION ---
  const handleModalCloseAndRedirect = () => {
    setShowAuthModal(false);
    router.push('/'); 
  };

   // --- ADD THIS NEW BLOCK HERE ---
  useEffect(() => {
    // If auth is done loading and there is NO user, we must show the modal.
    if (!authLoading && !user) {
      setShowAuthModal(true);
    }
    // If the user logs in, the user object will update, and this will hide the modal.
    if (user) {
      setShowAuthModal(false);
    }
  }, [user, authLoading]);
  // --- END OF NEW BLOCK ---

  useEffect(() => { if (activeTabId === 'chat') { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); } }, [messages, isLoading, activeTabId]);

  // Auto-save functionality
  useEffect(() => {
    // Recovery: Load saved data on startup
    const loadAutoSave = () => {
      try {
        const savedData = localStorage.getItem('rbxai-autosave');
        if (savedData) {
          const { projectTree: savedTree, modifiedFiles: savedModified, timestamp } = JSON.parse(savedData);

          if (savedTree && Array.isArray(savedTree) && savedTree.length > 0) {
            // Check if saved data has actual content
            const hasContent = savedTree.some((node: ProjectItem) =>
              node.children?.some((child: ProjectItem) => child.type === 'script' && child.content)
            );

            if (hasContent) {
              const confirmRestore = window.confirm(
                `Auto-save found from ${new Date(timestamp).toLocaleString()}. Restore your work?`
              );

              if (confirmRestore) {
                setProjectTree(savedTree);

                // Restore modified files map
                if (savedModified && Array.isArray(savedModified)) {
                  const restoredMap = new Map();
                  savedModified.forEach(([key, value]: [string, ModifiedFile]) => {
                    restoredMap.set(key, value);
                  });
                  setModifiedFiles(restoredMap);
                }

                setLastAutoSave(new Date(timestamp));
              }
            }
          }
        }
      } catch (error) {
        console.error('Failed to load auto-save:', error);
      }
    };

    loadAutoSave();
  }, []);

  // Auto-save timer
  useEffect(() => {
    if (!autoSaveEnabled) return;

    const saveInterval = setInterval(() => {
      try {
        // Only save if there are modified files or scripts with content
        const hasContent = modifiedFiles.size > 0 || projectTree.some(node =>
          node.children?.some(child => child.type === 'script' && child.content)
        );

        if (hasContent) {
          const saveData = {
            projectTree,
            modifiedFiles: Array.from(modifiedFiles.entries()),
            timestamp: new Date().toISOString()
          };

          localStorage.setItem('rbxai-autosave', JSON.stringify(saveData));
          setLastAutoSave(new Date());
        }
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(saveInterval);
  }, [projectTree, modifiedFiles, autoSaveEnabled]);


  // Export script as .lua file
  const exportScript = (node: ProjectItem) => {
    if (node.type !== 'script' || !node.content) {
      alert('No content to export');
      return;
    }

    // Get the latest content for this script
    const latestContent = getLatestFileContent(node.path);

    // Create a Blob with the script content
    const blob = new Blob([latestContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    // Create a temporary download link
    const a = document.createElement('a');
    a.href = url;
    a.download = `${node.name}.lua`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Import files and add them to project
  const handleImport = async (files: File[]) => {
    try {
      for (const file of files) {
        // Read file content
        const content = await file.text();

        // Determine script type and location based on filename and content
        const { scriptType, targetFolder } = determineScriptTypeAndLocation(file.name, content);

        // Clean filename (remove .lua extension)
        const scriptName = file.name.replace(/\.lua$/, '');
        const scriptPath = `${targetFolder}/${scriptName}`;

        // Add script to project
        recursivelyAddNode(scriptPath, scriptType, content);
      }

      alert(`Successfully imported ${files.length} file(s)!`);
    } catch (error) {
      console.error('Import failed:', error);
      alert('Failed to import files. Please check the file format.');
    }
  };

  // Smart detection of script type and placement location
  const determineScriptTypeAndLocation = (filename: string, content: string): { scriptType: ScriptType; targetFolder: string } => {
    const lowerName = filename.toLowerCase();
    const lowerContent = content.toLowerCase();

    // Detect script type from filename
    let scriptType: ScriptType = 'Script'; // default
    if (lowerName.includes('local') || lowerName.includes('client')) {
      scriptType = 'LocalScript';
    } else if (lowerName.includes('module') || lowerContent.includes('return ')) {
      scriptType = 'ModuleScript';
    }

    // Detect target folder from content analysis
    let targetFolder = 'ServerScriptService'; // default

    if (scriptType === 'LocalScript') {
      if (lowerContent.includes('player') || lowerContent.includes('mouse') || lowerContent.includes('userinputservice')) {
        targetFolder = 'StarterPlayer/StarterPlayerScripts';
      } else if (lowerContent.includes('character') || lowerContent.includes('humanoid')) {
        targetFolder = 'StarterPlayer/StarterCharacterScripts';
      } else if (lowerContent.includes('gui') || lowerContent.includes('screengui')) {
        targetFolder = 'StarterGui';
      }
    } else if (scriptType === 'ModuleScript') {
      targetFolder = 'ReplicatedStorage';
    } else {
      // Server Script
      if (lowerContent.includes('datastore') || lowerContent.includes('http')) {
        targetFolder = 'ServerScriptService';
      } else if (lowerContent.includes('workspace') || lowerContent.includes('part')) {
        targetFolder = 'Workspace';
      }
    }

    return { scriptType, targetFolder };
  };

  const findNodeByPath = (path: string): ProjectItem | null => {
    const find = (nodes: ProjectItem[]): ProjectItem | null => {
      for (const node of nodes) {
        if (node.path === path) return node;
        if (node.children) {
          const found = find(node.children);
          if (found) return found;
        }
      }
      return null;
    };
    return find(projectTree);
  };
  
  const recursivelyUpdateNode = (path: string, newContent: string, isManualEdit = false) => {
    const now = Date.now();

    // Track in modifiedFiles
    setModifiedFiles(prev => {
        const updated = new Map(prev);
        updated.set(path, { path, content: newContent, lastModified: now });
        return updated;
    });

    // Update project tree - AI updates clear the dirty flag
    setProjectTree(currentTree => {
        const updateTree = (nodes: ProjectItem[]): ProjectItem[] => nodes.map(node => {
            if (node.path === path) {
                return {
                    ...node,
                    content: newContent,
                    lastModified: now,
                    isDirty: isManualEdit // false for AI updates, true for manual edits
                };
            }
            if (node.children) return { ...node, children: updateTree(node.children) };
            return node;
        });
        return updateTree(currentTree);
    });

    // Update open tabs - AI updates clear the dirty flag
    setOpenTabs(currentTabs => {
        return currentTabs.map(tab => {
            if (tab.path === path) {
                return {
                    ...tab,
                    content: newContent,
                    lastModified: now,
                    isDirty: isManualEdit // false for AI updates, true for manual edits
                };
            }
            return tab;
        });
    });
  };

  const recursivelyAddNode = (path: string, type: ScriptType, content: string) => {
    const pathParts = path.split('/');
    const scriptName = pathParts.pop();
    const parentPath = pathParts.join('/');
    if (!scriptName) return;

    const now = Date.now();
    const uniqueId = `${now}_${Math.random().toString(36).substr(2, 9)}`; // Ensure unique ID

    // Track new files in modifiedFiles
    setModifiedFiles(prev => {
        const updated = new Map(prev);
        updated.set(path, { path, content, lastModified: now });
        return updated;
    });

    const add = (nodes: ProjectItem[]): ProjectItem[] => nodes.map(node => {
        if (node.path === parentPath && node.type === 'folder') {
            if (!node.children) node.children = [];
            if (node.children.some(child => child.name === scriptName)) return node; // Avoid duplicates
            const newScript: ProjectItem = { id: uniqueId, name: scriptName, type: 'script', path, scriptType: type, content, lastModified: now, isDirty: false, updateId: `new_${now}` };
            return { ...node, children: [...node.children, newScript].sort((a,b) => a.name.localeCompare(b.name)) };
        }
        if (node.children) return { ...node, children: add(node.children) };
        return node;
    });
    setProjectTree(currentTree => add(currentTree));
  };
  
  const recursivelyDeleteNode = (path: string) => {
    const nodeToDelete = findNodeByPath(path);
    if(nodeToDelete) handleCloseTab(nodeToDelete.id);

    // Remove from modified files map
    setModifiedFiles(prev => {
        const updated = new Map(prev);
        updated.delete(path);
        return updated;
    });

    const remove = (nodes: ProjectItem[]): ProjectItem[] => nodes
        .filter(node => node.path !== path)
        .map(node => {
            if (node.children) return { ...node, children: remove(node.children) };
            return node;
        });
    setProjectTree(currentTree => remove(currentTree));
  };

  const handleFileSelect = (file: ProjectItem) => {
    // Check if tab already exists and is active
    const existingTab = openTabs.find(tab => tab.path === file.path);
    if (existingTab && activeTabId === existingTab.id) {
      // Tab is already active, no need to do anything
      return;
    }

    setOpenTabs(currentTabs => {
        const existingTabIndex = currentTabs.findIndex(tab => tab.path === file.path);
        if (existingTabIndex >= 0) {
            // Replace existing tab with fresh data from project tree
            const updatedTabs = [...currentTabs];
            updatedTabs[existingTabIndex] = { ...file };
            return updatedTabs;
        } else {
            // Add new tab
            return [...currentTabs, { ...file }];
        }
    });

    setActiveTabId(file.id);
  };
  const handleTabSelect = (tabId: string) => setActiveTabId(tabId);
  const handleCloseTab = (tabId: string, e?: React.MouseEvent) => { e?.stopPropagation(); setOpenTabs(tabs => tabs.filter(tab => tab.id !== tabId)); if (activeTabId === tabId) setActiveTabId('chat'); };

  // Function to get the absolute latest content for any file
  const getLatestFileContent = (path: string): string => {
    // Check open tabs first (most up-to-date for active editing)
    const tabFile = openTabs.find(tab => tab.path === path);
    if (tabFile?.content !== undefined) {
      return tabFile.content;
    }

    // Check project tree
    const treeFile = findNodeByPath(path);
    if (treeFile?.content !== undefined) {
      return treeFile.content;
    }

    // Check modified files map
    const modifiedFile = modifiedFiles.get(path);
    if (modifiedFile?.content !== undefined) {
      return modifiedFile.content;
    }

    return '';
  };

  // Backup project to JSON file
  const handleBackupProject = () => {
    try {
      // Create a backup object with all scripts that have content
      const backupData = {
        timestamp: new Date().toISOString(),
        version: '1.0',
        scripts: [] as Array<{path: string; content: string; scriptType: ScriptType; lastModified: number}>
      };

      // Collect all scripts with content from the project tree
      const collectScripts = (nodes: ProjectItem[]) => {
        nodes.forEach(node => {
          if (node.type === 'script' && node.content) {
            // Get the absolute latest content
            const latestContent = getLatestFileContent(node.path);
            if (latestContent.trim()) {
              backupData.scripts.push({
                path: node.path,
                content: latestContent,
                scriptType: node.scriptType || 'Script',
                lastModified: node.lastModified || Date.now()
              });
            }
          }
          if (node.children) {
            collectScripts(node.children);
          }
        });
      };

      collectScripts(projectTree);

      // Also include any modified files not yet in the tree
      modifiedFiles.forEach((file, path) => {
        const latestContent = getLatestFileContent(path);
        if (latestContent.trim() && !backupData.scripts.some(s => s.path === path)) {
          // Determine script type from path
          const pathParts = path.split('/');
          const scriptName = pathParts[pathParts.length - 1];
          let scriptType: ScriptType = 'Script';
          if (scriptName.toLowerCase().includes('local')) scriptType = 'LocalScript';
          else if (scriptName.toLowerCase().includes('module')) scriptType = 'ModuleScript';

          backupData.scripts.push({
            path: path,
            content: latestContent,
            scriptType: scriptType,
            lastModified: file.lastModified
          });
        }
      });

      if (backupData.scripts.length === 0) {
        alert('No scripts to backup!');
        return;
      }

      // Create and download the backup file
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rbxai-backup-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      alert(`Successfully backed up ${backupData.scripts.length} scripts!`);
    } catch (error) {
      console.error('Backup failed:', error);
      alert('Failed to create backup. Please try again.');
    }
  };

  // Restore project from JSON file
  const handleRestoreProject = async (file: File) => {
    try {
      const content = await file.text();
      const backupData = JSON.parse(content);

      // Validate backup format
      if (!backupData.scripts || !Array.isArray(backupData.scripts)) {
        throw new Error('Invalid backup format');
      }

      if (backupData.scripts.length === 0) {
        alert('Backup file contains no scripts!');
        return;
      }

      // Confirm restore action
      const confirmRestore = window.confirm(
        `This will restore ${backupData.scripts.length} scripts from backup created on ${
          backupData.timestamp ? new Date(backupData.timestamp).toLocaleString() : 'unknown date'
        }. Continue?`
      );

      if (!confirmRestore) return;

      // Clear existing modified files
      setModifiedFiles(new Map());

      // Close all tabs except chat
      setOpenTabs([]);
      setActiveTabId('chat');

      // Reset project tree to initial state
      setProjectTree([...initialProjectState]);

      // Add all scripts from backup
      let successCount = 0;
      for (const script of backupData.scripts) {
        try {
          recursivelyAddNode(script.path, script.scriptType, script.content);
          successCount++;
        } catch (error) {
          console.error(`Failed to restore script ${script.path}:`, error);
        }
      }

      alert(`Successfully restored ${successCount} out of ${backupData.scripts.length} scripts!`);
    } catch (error) {
      console.error('Restore failed:', error);
      alert('Failed to restore backup. Please check the file format.');
    }
  };

  const handleSendMessage = async () => {
    if (!user || !token) {
      setShowAuthModal(true);
      return;
    }

    if (inputValue.trim() && !isLoading) {
      const newUserMessage: Message = { role: 'user', content: inputValue.trim() };
      const currentMessages = [...messages, newUserMessage];
      const projectTreeString = generateProjectTreeString(projectTree);

      // ALWAYS get the absolute latest content for active file
      let activeFile: { path: string; content?: string } | null = null;
      if (activeTabId !== 'chat') {
        const tabFile = openTabs.find(tab => tab.id === activeTabId);
        if (tabFile) {
          const absoluteLatestContent = getLatestFileContent(tabFile.path);
          activeFile = { path: tabFile.path, content: absoluteLatestContent };
        }
      }

      // Get ALL files that have any content and include them
      const allFilesWithContent: ModifiedFile[] = [];

      // Add all modified files with their latest content
      modifiedFiles.forEach((file, path) => {
        const latestContent = getLatestFileContent(path);
        allFilesWithContent.push({ path, content: latestContent, lastModified: file.lastModified });
      });

      // Add any other open files that might have content (including current active file)
      openTabs.forEach(tab => {
        if (tab.type === 'script' && tab.content && !modifiedFiles.has(tab.path)) {
          const latestContent = getLatestFileContent(tab.path);
          if (latestContent) {
            allFilesWithContent.push({ path: tab.path, content: latestContent, lastModified: tab.lastModified || Date.now() });
          }
        }
      });

      // CRITICAL: Always include the currently active file even if not in modifiedFiles
      if (activeFile && activeFile.path && !allFilesWithContent.some(f => f.path === activeFile.path)) {
        allFilesWithContent.push({
          path: activeFile.path,
          content: activeFile.content || '',
          lastModified: Date.now()
        });
      }



      setMessages(currentMessages);
      setInputValue('');
      setIsLoading(true);

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            messages: currentMessages,
            projectTree: projectTreeString,
            activeFile: activeFile,
            modifiedFiles: allFilesWithContent
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          if (response.status === 402) {
            // Prompt limit exceeded
            setMessages(prev => [...prev, {
              role: 'assistant',
              content: `⚠️ **Daily Prompt Limit Reached**\n\n${errorData.message}\n\nRemaining prompts: ${errorData.remainingPrompts || 0}\nCurrent plan: ${errorData.subscriptionTier}`
            }]);
            setIsLoading(false);
            return;
          }
          throw new Error(`API Error: ${response.statusText}`);
        }
        const data = await response.json();
        const rawReply = data.reply;

        // Update prompt stats if available
        if (data.usage) {
          updatePromptStats({
            promptsUsedToday: (promptStats?.promptsUsedToday || 0) + 1,
            dailyLimit: data.usage.dailyLimit,
            remainingPrompts: data.usage.remainingPrompts
          });
        }

        const toolRegex = /```tool_code\s*\n([\s\S]*?)\n\s*```/;
        const toolMatch = rawReply.match(toolRegex);
        const conversationalReply = rawReply.replace(toolRegex, '').trim();

        // Only check for missing tool_code on explicit create/update requests (NOT questions)
        const input = inputValue.toLowerCase();
        const isQuestion = input.includes('see') || input.includes('what') || input.includes('change i made') || input.includes('do you see');
        const isActualRequest = (input.includes('create') || input.includes('make') || input.includes('add') || input.includes('update') || input.includes('fix')) && !isQuestion;

        if (!toolMatch && isActualRequest) {
            console.error('🚨 AI FAILED TO GENERATE TOOL_CODE for script request!');
            const errorReply = `❌ **AI Error**: The AI didn't generate the required tool command. Please try asking again.

${conversationalReply}`;
            setMessages(prev => [...prev, { role: 'assistant', content: errorReply }]);
            setIsLoading(false);
            return;
        }

        if (toolMatch && toolMatch[1]) {
            try {
                const cleanJsonString = toolMatch[1].trim();
                const toolJson = JSON.parse(cleanJsonString);

                // Validate required fields
                if (!toolJson.action) {
                    throw new Error('Tool action is required');
                }

                switch(toolJson.action) {
                    case 'create':
                        if (!toolJson.path || !toolJson.type || toolJson.content === undefined) {
                            throw new Error('Create action requires path, type, and content');
                        }
                        recursivelyAddNode(toolJson.path, toolJson.type, toolJson.content);
                        break;
                    case 'update':
                        if (!toolJson.path || toolJson.content === undefined) {
                            throw new Error('Update action requires path and content');
                        }

                        // Execute the update
                        recursivelyUpdateNode(toolJson.path, toolJson.content, false);
                        break;
                    case 'delete':
                        if (!toolJson.path) {
                            throw new Error('Delete action requires path');
                        }
                        if (window.confirm(`AI wants to delete ${toolJson.path}. Are you sure?`)) {
                           recursivelyDeleteNode(toolJson.path);
                        }
                        break;
                    default:
                        throw new Error(`Unknown action: ${toolJson.action}`);
                }
                
                // --- THE FIX: THIS REDUNDANT BLOCK IS DELETED ---
                // The conversationalReply from the AI already contains the user-facing code block.
                // Adding another one was causing the duplication.

            } catch (e) {
                console.error("Failed to parse or execute tool JSON:", e);
                const errorMessage = e instanceof Error ? e.message : 'Unknown error occurred';
                const errorReply = `⚠️ Tool Error: ${errorMessage}\n\n${conversationalReply}`;
                setMessages(prev => [...prev, { role: 'assistant', content: errorReply }]);
                setIsLoading(false);
                return;
            }
        }
        
        if (conversationalReply) {
          const assistantReply: Message = { role: 'assistant', content: conversationalReply };
          setMessages(prev => [...prev, assistantReply]);
        }

      } catch (error) {
        console.error('Failed to get AI response:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        setMessages(prev => [...prev, { role: 'assistant', content: `❌ Network Error: ${errorMessage}\n\nPlease check your connection and try again.` }]);
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  // ---------------- //
// --- START OF NEW CODE TO PASTE --- //
// ---------------- //

  return (
    <>
      {/* The Modals are now controlled by the gatekeeper logic */}
    <Suspense fallback={null}>
        <AuthModal
  isOpen={showAuthModal}
  onClose={handleModalCloseAndRedirect}
/>
      </Suspense>

      <BillingModal
        isOpen={showBillingModal}
        onClose={() => setShowBillingModal(false)}
      />

      {/* --- THE GATE --- */}
      {/* If auth is still loading OR if there is no user, show a simple loading screen. */}
      {authLoading || !user ? (
        <div className="flex h-screen w-full items-center justify-center bg-gray-900">
          <p className="animate-pulse text-gray-400">Authenticating...</p>
        </div>
      ) : (
        // --- If the user IS logged in, render your FULL original UI ---
        <main className="flex h-screen flex-col text-white">
          <header className="flex h-14 w-full flex-shrink-0 items-center justify-between border-b border-gray-700 bg-gray-800 px-4">
            <h1 className="text-xl font-bold">RBXAI</h1>
            <div className="flex items-center space-x-6">
              {user && (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="text-xs text-gray-300">
                      <span className="font-medium">{promptStats?.remainingPrompts || 0}</span>
                      <span className="text-gray-400">/{promptStats?.dailyLimit || 10} prompts</span>
                    </div>
                    <div className={`text-xs px-2 py-1 rounded ${
                      user.subscriptionTier === 'FREE' ? 'bg-gray-600 text-gray-200' :
                      user.subscriptionTier === 'STARTER' ? 'bg-blue-600 text-white' :
                      user.subscriptionTier === 'PROFESSIONAL' ? 'bg-purple-600 text-white' :
                      'bg-gold-600 text-white'
                    }`}>
                      {user.subscriptionTier}
                    </div>
                    {user.subscriptionTier === 'FREE' ? (
                      <button onClick={() => setShowBillingModal(true)} className="text-xs px-2 py-1 bg-blue-600 hover:bg-blue-500 rounded text-white transition-colors" title="Upgrade for more prompts">Upgrade</button>
                    ) : (
                      <button onClick={async () => {
                        try {
                          const response = await fetch('/api/billing/manage-subscription', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                              'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify({ action: 'create_portal_session' })
                          })
                          const data = await response.json()
                          if (response.ok) {
                            window.open(data.url, '_blank')
                          }
                        } catch (error) {
                          console.error('Failed to open billing portal:', error)
                        }
                      }} className="text-xs px-2 py-1 bg-purple-600 hover:bg-purple-500 rounded text-white transition-colors" title="Manage subscription">Manage</button>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-300">Hi, {user.name}</span>
                    <button onClick={logout} className="px-2 py-1 bg-gray-600 hover:bg-gray-500 rounded text-xs transition-colors" title="Logout">Logout</button>
                  </div>
                </div>
              )}
              {user && (
                <div className="flex items-center space-x-2">
                  <button onClick={() => setAutoSaveEnabled(!autoSaveEnabled)} className={`flex items-center space-x-1 px-2 py-1 rounded text-xs transition-colors ${autoSaveEnabled ? 'bg-green-600 hover:bg-green-500' : 'bg-gray-600 hover:bg-gray-500'}`} title={autoSaveEnabled ? 'Auto-save enabled' : 'Auto-save disabled'}>
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                    <span>{autoSaveEnabled ? 'Auto-save' : 'Manual'}</span>
                  </button>
                  {lastAutoSave && (<span className="text-xs text-gray-400">Last saved: {lastAutoSave.toLocaleTimeString()}</span>)}
                </div>
              )}
            </div>
          </header>
          <div className="flex flex-grow overflow-hidden">
            <aside className="w-64 flex-shrink-0 border-r border-gray-700 bg-gray-800 flex flex-col">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700 bg-gray-800 flex-shrink-0">
                <h2 className="font-semibold text-lg">Explorer</h2>
                <div className="flex items-center space-x-2">
                  <BackupRestoreMenu onBackup={handleBackupProject} onRestore={handleRestoreProject} />
                  <ImportMenu onImport={handleImport} />
                  <ScriptCreationMenu onCreateScript={recursivelyAddNode} />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-2">
                {projectTree.map(node => <ProjectNode key={node.id} node={node} level={0} onFileSelect={handleFileSelect} activeFileId={activeTabId} onDelete={recursivelyDeleteNode} onExport={exportScript} />)}
              </div>
            </aside>
            <section className="flex flex-grow flex-col bg-gray-900/50">
              <div className="flex h-10 flex-shrink-0 border-b border-gray-900">
                <button onClick={() => handleTabSelect('chat')} className={`flex items-center px-4 text-sm font-medium border-r border-gray-900 ${activeTabId === 'chat' ? 'bg-gray-700 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700/50'}`}>Chat</button>
                {openTabs.map(tab => (<button key={tab.id} onClick={() => handleTabSelect(tab.id)} className={`flex items-center px-4 text-sm font-medium border-r border-gray-900 ${activeTabId === tab.id ? 'bg-gray-700 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700/50'}`}><span>{tab.name}</span><span onClick={(e) => handleCloseTab(tab.id, e)} className="ml-3 text-gray-500 hover:text-white">×</span></button>))}
              </div>
              <div className="flex-grow overflow-hidden">
                {activeTabId === 'chat' && (
                  <div className="flex flex-col h-full">
                    <div className="flex-grow space-y-4 overflow-y-auto p-4">{messages.map((msg, index) => (
                      <div key={`${msg.role}-${index}`} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xl rounded-lg px-4 py-2 ${msg.role === 'user' ? 'bg-blue-600' : 'bg-gray-800'}`}>
                          <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ code(props) { const { children, className } = props; const match = /language-(\w+)/.exec(className || ''); return match ? (<HighlightedCodeBlock code={String(children).trim()} />) : (<code className="rounded bg-black/30 px-1 py-0.5">{children}</code>); } }}>{msg.content}</ReactMarkdown>
                        </div>
                      </div>
                    ))}{isLoading && (<div className="flex justify-start"><div className="max-w-xl rounded-lg bg-gray-800 px-4 py-2"><p className="animate-pulse">Assistant is typing...</p></div></div>)}<div ref={messagesEndRef} /></div>
                    <div className="border-t border-gray-600 p-4">
                      <input type="text" placeholder="Ask RBXAI for help..." className="w-full rounded bg-gray-800 p-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50" value={inputValue} disabled={isLoading} onChange={(e) => setInputValue(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }} />
                    </div>
                  </div>
                )}
                {(() => {
                  const activeFile = openTabs.find(tab => tab.id === activeTabId);
                  if (!activeFile) return null;
                  const editorKey = `${activeFile.path}_${activeFile.updateId || activeFile.id}`;
                  return (<LuaEditor key={editorKey} file={activeFile} onCodeChange={recursivelyUpdateNode} />);
                })()}
              </div>
            </section>
          </div>
        </main>
      )}
    </>
  );
}
// ---------------- //
// --- END OF NEW CODE TO PASTE --- //
// ---------------- //