
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { Key, Save, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { getRemoteToken, setRemoteToken } from './utils/firebase';

const AdminPanel: React.FC = () => {
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });

  useEffect(() => {
    fetchCurrent();
  }, []);

  const fetchCurrent = async () => {
    setIsLoading(true);
    const current = await getRemoteToken();
    if (current) setToken(current);
    setIsLoading(false);
  };

  const handleUpdate = async () => {
    if (!token.trim()) {
      setStatus({ type: 'error', message: 'Token cannot be empty' });
      return;
    }

    setIsLoading(true);
    setStatus({ type: null, message: '' });

    // Handle full JSON input (incase user pastes the whole object)
    let finalToken = token;
    try {
        const parsed = JSON.parse(token);
        if (parsed.authToken) finalToken = parsed.authToken;
    } catch(e) {}

    const success = await setRemoteToken(finalToken);
    setIsLoading(false);

    if (success) {
      setStatus({ type: 'success', message: 'Auth Token updated successfully!' });
      setToken(finalToken);
    } else {
      setStatus({ type: 'error', message: 'Failed to update token. Check Firebase rules.' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-xl bg-[#111111] rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden">
        <div className="bg-red-600 p-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-2xl">
                    <Key className="w-8 h-8 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-black italic tracking-tighter uppercase">Admin Panel</h1>
                    <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Waisi TV Gateway Control</p>
                </div>
            </div>
            <button onClick={fetchCurrent} className="p-3 bg-white/10 rounded-xl active:rotate-180 transition-transform">
                <RefreshCw className="w-5 h-5" />
            </button>
        </div>

        <div className="p-8">
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-4 ml-2">Enter Auth Token / JSON</label>
            <textarea 
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder='Paste your {"authToken": "..."} here...'
                className="w-full h-48 bg-black/50 border border-white/10 rounded-3xl p-6 text-xs font-mono text-red-400 focus:outline-none focus:border-red-600/50 transition-colors resize-none mb-6"
            />

            {status.type && (
                <div className={`flex items-center gap-3 p-4 rounded-2xl mb-6 ${status.type === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                    {status.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    <span className="text-xs font-bold uppercase tracking-wide">{status.message}</span>
                </div>
            )}

            <button 
                onClick={handleUpdate}
                disabled={isLoading}
                className="w-full py-5 bg-red-600 rounded-3xl flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl shadow-red-600/20 disabled:opacity-50"
            >
                {isLoading ? (
                    <RefreshCw className="w-6 h-6 animate-spin" />
                ) : (
                    <>
                        <Save className="w-6 h-6" />
                        <span className="font-black uppercase tracking-widest text-sm">Update Gateway Token</span>
                    </>
                )}
            </button>
        </div>
        
        <div className="bg-black/40 px-8 py-4 text-center">
            <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">
                Changes take effect instantly on all active apps
            </p>
        </div>
      </div>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('admin-root')!);
root.render(<AdminPanel />);
