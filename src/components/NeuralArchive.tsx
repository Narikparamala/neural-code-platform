import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Archive, Download, Upload, Trash2, Eye, X, Save, FileText, Clock, Brain } from 'lucide-react';

interface NeuralArchiveProps {
  isOpen: boolean;
  onToggle: () => void;
  sessionData: any;
}

interface SessionRecord {
  id: string;
  timestamp: number;
  lab: string;
  data: any;
  duration: number;
  name: string;
}

const NeuralArchive: React.FC<NeuralArchiveProps> = ({ isOpen, onToggle, sessionData }) => {
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [selectedSession, setSelectedSession] = useState<SessionRecord | null>(null);
  const [sessionName, setSessionName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLab, setFilterLab] = useState<string>('all');

  // Load sessions from localStorage on mount
  useEffect(() => {
    const savedSessions = localStorage.getItem('neural-archive');
    if (savedSessions) {
      setSessions(JSON.parse(savedSessions));
    }
  }, []);

  // Save sessions to localStorage whenever sessions change
  useEffect(() => {
    localStorage.setItem('neural-archive', JSON.stringify(sessions));
  }, [sessions]);

  const saveCurrentSession = () => {
    if (!sessionData || !sessionName.trim()) return;

    const newSession: SessionRecord = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      lab: sessionData.lab,
      data: sessionData,
      duration: sessionData.sessionTime || 0,
      name: sessionName.trim()
    };

    setSessions(prev => [newSession, ...prev]);
    setSessionName('');
  };

  const exportSession = (session: SessionRecord) => {
    const dataStr = JSON.stringify(session, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `neural-session-${session.name.replace(/\s+/g, '-')}.nsd`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const exportAllSessions = () => {
    const dataStr = JSON.stringify(sessions, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `neural-archive-${new Date().toISOString().split('T')[0]}.nsd`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importSession = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);
        
        if (Array.isArray(importedData)) {
          // Multiple sessions
          setSessions(prev => [...importedData, ...prev]);
        } else {
          // Single session
          setSessions(prev => [importedData, ...prev]);
        }
      } catch (error) {
        console.error('Error importing session:', error);
        alert('Error importing file. Please check the file format.');
      }
    };
    reader.readAsText(file);
    
    // Reset input
    event.target.value = '';
  };

  const deleteSession = (id: string) => {
    setSessions(prev => prev.filter(session => session.id !== id));
    if (selectedSession?.id === id) {
      setSelectedSession(null);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getLabIcon = (lab: string) => {
    switch (lab) {
      case 'rate': return '🌊';
      case 'place': return '🌍';
      case 'population': return '👥';
      case 'monroe': return '🧠';
      default: return '⚡';
    }
  };

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = session.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.lab.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterLab === 'all' || session.lab === filterLab;
    return matchesSearch && matchesFilter;
  });

  const getSessionStats = () => {
    const totalSessions = sessions.length;
    const totalDuration = sessions.reduce((acc, session) => acc + session.duration, 0);
    const labCounts = sessions.reduce((acc, session) => {
      acc[session.lab] = (acc[session.lab] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { totalSessions, totalDuration, labCounts };
  };

  const stats = getSessionStats();

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 400 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 400 }}
      transition={{ duration: 0.3 }}
      className="fixed top-0 right-0 w-full md:w-96 lg:w-[28rem] h-full bg-gray-900/95 backdrop-blur-sm border-l border-gray-700 z-50 overflow-y-auto"
    >
      <div className="p-4 lg:p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Archive className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-bold">Neural Archive</h2>
          </div>
          <button
            onClick={onToggle}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Statistics */}
        <div className="mb-6 p-4 bg-gray-800/50 rounded-lg">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Brain className="w-5 h-5 text-blue-400" />
            Archive Statistics
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{stats.totalSessions}</div>
              <div className="text-gray-400">Sessions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{formatDuration(stats.totalDuration)}</div>
              <div className="text-gray-400">Total Time</div>
            </div>
          </div>
          <div className="mt-3 space-y-1">
            {Object.entries(stats.labCounts).map(([lab, count]) => (
              <div key={lab} className="flex justify-between text-sm">
                <span className="capitalize">{getLabIcon(lab)} {lab} Lab:</span>
                <span className="text-gray-400">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Save Current Session */}
        <div className="mb-6 p-4 bg-gray-800/50 rounded-lg">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Save className="w-5 h-5 text-green-400" />
            Save Current Session
          </h3>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Session name..."
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={saveCurrentSession}
              disabled={!sessionData || !sessionName.trim()}
              className="w-full p-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 rounded-lg transition-colors text-sm font-medium"
            >
              Save Session
            </button>
          </div>
        </div>

        {/* Import/Export */}
        <div className="mb-6 space-y-2">
          <label className="flex items-center gap-2 p-3 bg-gray-800/50 rounded-lg cursor-pointer hover:bg-gray-800/70 transition-colors">
            <Upload className="w-5 h-5 text-green-400" />
            <span className="text-sm">Import Sessions (.nsd)</span>
            <input
              type="file"
              accept=".nsd,.json"
              onChange={importSession}
              className="hidden"
            />
          </label>
          
          <button
            onClick={exportAllSessions}
            disabled={sessions.length === 0}
            className="w-full flex items-center gap-2 p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-5 h-5 text-blue-400" />
            <span className="text-sm">Export All Sessions</span>
          </button>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 space-y-3">
          <input
            type="text"
            placeholder="Search sessions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          
          <select
            value={filterLab}
            onChange={(e) => setFilterLab(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Labs</option>
            <option value="rate">Rate Lab</option>
            <option value="place">Place Lab</option>
            <option value="population">Population Lab</option>
            <option value="monroe">Monroe Hub</option>
          </select>
        </div>

        {/* Session List */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-300 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Saved Sessions ({filteredSessions.length})
          </h3>
          {filteredSessions.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">
              {sessions.length === 0 ? 'No sessions saved yet' : 'No sessions match your search'}
            </p>
          ) : (
            filteredSessions.map((session) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium truncate flex items-center gap-2">
                    <span>{getLabIcon(session.lab)}</span>
                    {session.name}
                  </h4>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setSelectedSession(session)}
                      className="p-1 hover:bg-gray-700 rounded text-blue-400"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => exportSession(session)}
                      className="p-1 hover:bg-gray-700 rounded text-green-400"
                      title="Export Session"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteSession(session.id)}
                      className="p-1 hover:bg-gray-700 rounded text-red-400"
                      title="Delete Session"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="text-sm text-gray-400 space-y-1">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    <span>Duration: {formatDuration(session.duration)}</span>
                  </div>
                  <div>Lab: {session.lab}</div>
                  <div>Date: {formatDate(session.timestamp)}</div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Session Details Modal */}
        <AnimatePresence>
          {selectedSession && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setSelectedSession(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gray-900 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-gray-700"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <span>{getLabIcon(selectedSession.lab)}</span>
                    {selectedSession.name}
                  </h3>
                  <button
                    onClick={() => setSelectedSession(null)}
                    className="p-1 hover:bg-gray-800 rounded"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-4 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium text-blue-400">Lab:</span> {selectedSession.lab}
                    </div>
                    <div>
                      <span className="font-medium text-green-400">Duration:</span> {formatDuration(selectedSession.duration)}
                    </div>
                    <div className="col-span-2">
                      <span className="font-medium text-yellow-400">Date:</span> {formatDate(selectedSession.timestamp)}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-purple-400">Session Data:</span>
                    <pre className="mt-2 p-3 bg-gray-800 rounded text-xs overflow-x-auto max-h-60">
                      {JSON.stringify(selectedSession.data, null, 2)}
                    </pre>
                  </div>
                </div>
                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => exportSession(selectedSession)}
                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                  >
                    Export Session
                  </button>
                  <button
                    onClick={() => setSelectedSession(null)}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default NeuralArchive;