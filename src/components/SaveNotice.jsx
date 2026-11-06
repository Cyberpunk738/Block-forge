import { useState } from 'react';
import useStore from '../store/useStore';
import { downloadFile } from '../utils/downloadFile';

export default function SaveNotice() {
  const error = useStore(s => s.saveError);
  const recovery = useStore(s => s.recoveryRequired);
  const [backedUp, setBackedUp] = useState(false);
  const [backupError, setBackupError] = useState('');
  if (!error) return null;
  const backup = () => {
    try { downloadFile(useStore.getState().getStoredBackup(), 'blockforge-stored-backup.json', 'application/json'); setBackedUp(true); }
    catch { setBackupError('Stored data could not be read. Export your current work before continuing.'); }
  };
  return <div role="alert" className="save-notice border-b border-amber-300 bg-amber-50 p-3 text-sm text-amber-950">
    <p>{error}</p>
    {backupError && <p>{backupError}</p>}
    {recovery ? <div className="flex gap-3 mt-2">
      <button className="underline focus-ring" onClick={backup}>Download stored backup</button>
      <button className="underline focus-ring disabled:opacity-40" disabled={!backedUp} onClick={() => useStore.getState().recoverStorage()}>Save current workspace</button>
    </div> : <button className="underline mt-1 focus-ring" onClick={() => useStore.getState().retrySave()}>Retry saving</button>}
  </div>;
}
