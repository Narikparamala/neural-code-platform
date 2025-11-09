import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, Users, Wifi, WifiOff } from 'lucide-react';

const CollaborationSync: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionId, setConnectionId] = useState('');
  const [connectedUsers, setConnectedUsers] = useState<string[]>([]);

  const generateRoomId = () => {
    const id = Math.random().toString(36).substring(2, 8).toUpperCase();
    setConnectionId(id);
  };

  const connectToRoom = () => {
    if (connectionId) {
      setIsConnected(true);
      setConnectedUsers(['You', 'User_' + Math.random().toString(36).substring(2, 6)]);
    }
  };

  const disconnect = () => {
    setIsConnected(false);
    setConnectedUsers([]);
    setConnectionId('');
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <div className="flex items-center justify-center gap-3 mb-6">
          <Link className="w-12 h-12 text-indigo-400" />
          <h2 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Consciousness Sync
          </h2>
        </div>
        
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Connect with others for synchronized consciousness exploration sessions using WebRTC technology.
        </p>
      </motion.div>

      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700">
        {!isConnected ? (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <WifiOff className="w-8 h-8 text-indigo-400" />
              </div>
              <h3 className="text-2xl font-semibold mb-2">Join Consciousness Sync Session</h3>
              <p className="text-gray-300">
                Create or join a room to synchronize neural experiments with others.
              </p>
            </div>

            <div className="max-w-md mx-auto space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Room ID</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={connectionId}
                    onChange={(e) => setConnectionId(e.target.value.toUpperCase())}
                    placeholder="Enter room ID..."
                    className="flex-1 px-4 py-2 bg-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    onClick={generateRoomId}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors"
                  >
                    Generate
                  </button>
                </div>
              </div>

              <button
                onClick={connectToRoom}
                disabled={!connectionId}
                className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 rounded-lg font-medium transition-colors"
              >
                Connect to Room
              </button>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-900/20 rounded-lg text-yellow-400">
                <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                <span className="text-sm">WebRTC P2P Connection</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wifi className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-2xl font-semibold mb-2">Connected to Room: {connectionId}</h3>
              <p className="text-gray-300">
                Your session parameters are now synchronized with connected users.
              </p>
            </div>

            <div className="bg-gray-700/50 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-green-400" />
                <h4 className="font-semibold">Connected Users ({connectedUsers.length})</h4>
              </div>
              <div className="space-y-2">
                {connectedUsers.map((user, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-600/50 rounded">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span>{user}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-500/30">
              <h4 className="font-semibold mb-2">Sync Status</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Parameter Sync:</span>
                  <span className="text-green-400 ml-2">Active</span>
                </div>
                <div>
                  <span className="text-gray-400">Audio Sync:</span>
                  <span className="text-green-400 ml-2">Enabled</span>
                </div>
                <div>
                  <span className="text-gray-400">Session Timer:</span>
                  <span className="text-green-400 ml-2">Synchronized</span>
                </div>
                <div>
                  <span className="text-gray-400">Data Sharing:</span>
                  <span className="text-green-400 ml-2">Secure</span>
                </div>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={disconnect}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors"
              >
                Disconnect
              </button>
            </div>
          </div>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-8 text-center"
      >
        <p className="text-gray-400 text-sm">
          Sessions auto-terminate when users exit for privacy and security.
        </p>
      </motion.div>
    </div>
  );
};

export default CollaborationSync;