'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Cloud, Upload, File, Image, Trash2, Download, Lock, LogOut, X, FileText, Film, Music, Archive } from 'lucide-react';

const PASSWORD = '100012';
const STORAGE_KEY = 'minicloud_files';

interface StoredFile {
  id: string;
  name: string;
  type: string;
  size: number;
  data: string; // base64
  uploadedAt: string;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function getIcon(type: string) {
  if (type.startsWith('image/')) return <Image size={24} />;
  if (type.startsWith('video/')) return <Film size={24} />;
  if (type.startsWith('audio/')) return <Music size={24} />;
  if (type.includes('zip') || type.includes('rar') || type.includes('tar')) return <Archive size={24} />;
  if (type.includes('pdf') || type.includes('text') || type.includes('document')) return <FileText size={24} />;
  return <File size={24} />;
}

export default function Home() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [files, setFiles] = useState<StoredFile[]>([]);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<StoredFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('minicloud_auth');
    if (saved === 'true') setAuthenticated(true);
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setFiles(JSON.parse(stored));
      } catch {}
    }
  }, []);

  const saveFiles = useCallback((newFiles: StoredFile[]) => {
    setFiles(newFiles);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newFiles));
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === PASSWORD) {
      setAuthenticated(true);
      localStorage.setItem('minicloud_auth', 'true');
      setError('');
    } else {
      setError('Incorrect password');
    }
  };

  const handleLogout = () => {
    setAuthenticated(false);
    localStorage.removeItem('minicloud_auth');
    setPassword('');
  };

  const processFiles = async (fileList: FileList | File[]) => {
    setUploading(true);
    const newFiles: StoredFile[] = [];
    for (const file of Array.from(fileList)) {
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} is too large (max 5MB for browser storage)`);
        continue;
      }
      const data = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      newFiles.push({
        id: crypto.randomUUID(),
        name: file.name,
        type: file.type || 'application/octet-stream',
        size: file.size,
        data,
        uploadedAt: new Date().toISOString(),
      });
    }
    saveFiles([...newFiles, ...files]);
    setUploading(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length) processFiles(e.dataTransfer.files);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this file?')) {
      saveFiles(files.filter((f) => f.id !== id));
      if (preview?.id === id) setPreview(null);
    }
  };

  const handleDownload = (file: StoredFile) => {
    const a = document.createElement('a');
    a.href = file.data;
    a.download = file.name;
    a.click();
  };

  if (!authenticated) {
    return (
      <div style={styles.loginContainer}>
        <div style={styles.loginCard}>
          <div style={styles.logo}>
            <Cloud size={48} color="#6366f1" />
            <h1 style={{ marginTop: 16, fontSize: 28, fontWeight: 700 }}>Minicloud</h1>
            <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>Enter password to access</p>
          </div>
          <form onSubmit={handleLogin} style={{ marginTop: 32 }}>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: 14, top: 14, color: 'var(--text-muted)' }} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                style={styles.input}
                autoFocus
              />
            </div>
            {error && <p style={{ color: 'var(--danger)', marginTop: 12, fontSize: 14 }}>{error}</p>}
            <button type="submit" style={styles.primaryBtn}>
              Unlock
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Cloud size={28} color="#6366f1" />
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>Minicloud</h1>
        </div>
        <button onClick={handleLogout} style={styles.ghostBtn}>
          <LogOut size={18} /> Logout
        </button>
      </header>

      <main style={styles.main}>
        <div
          style={{
            ...styles.dropzone,
            ...(dragging ? styles.dropzoneActive : {}),
          }}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            style={{ display: 'none' }}
            onChange={(e) => e.target.files && processFiles(e.target.files)}
          />
          <Upload size={40} color={dragging ? '#818cf8' : '#6366f1'} />
          <p style={{ marginTop: 16, fontWeight: 600 }}>
            {uploading ? 'Uploading...' : 'Drop files here or click to upload'}
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 8 }}>
            Images, documents, videos & more (max 5MB each)
          </p>
        </div>

        {files.length > 0 && (
          <div style={styles.fileGrid}>
            {files.map((file) => (
              <div key={file.id} style={styles.fileCard}>
                <div
                  style={styles.filePreview}
                  onClick={() => setPreview(file)}
                >
                  {file.type.startsWith('image/') ? (
                    <img src={file.data} alt={file.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ color: 'var(--accent)' }}>{getIcon(file.type)}</div>
                  )}
                </div>
                <div style={styles.fileInfo}>
                  <p style={styles.fileName} title={file.name}>{file.name}</p>
                  <p style={styles.fileMeta}>{formatSize(file.size)} · {new Date(file.uploadedAt).toLocaleDateString()}</p>
                </div>
                <div style={styles.fileActions}>
                  <button onClick={() => handleDownload(file)} style={styles.iconBtn} title="Download">
                    <Download size={16} />
                  </button>
                  <button onClick={() => handleDelete(file.id)} style={{ ...styles.iconBtn, color: 'var(--danger)' }} title="Delete">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {files.length === 0 && (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: 48 }}>
            No files yet. Upload something to get started!
          </p>
        )}
      </main>

      {preview && (
        <div style={styles.modal} onClick={() => setPreview(null)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setPreview(null)} style={styles.closeBtn}>
              <X size={20} />
            </button>
            {preview.type.startsWith('image/') ? (
              <img src={preview.data} alt={preview.name} style={{ maxWidth: '100%', maxHeight: '70vh', borderRadius: 8 }} />
            ) : preview.type.startsWith('video/') ? (
              <video src={preview.data} controls style={{ maxWidth: '100%', maxHeight: '70vh' }} />
            ) : preview.type.startsWith('audio/') ? (
              <audio src={preview.data} controls style={{ width: '100%' }} />
            ) : (
              <div style={{ textAlign: 'center', padding: 40 }}>
                {getIcon(preview.type)}
                <p style={{ marginTop: 16 }}>{preview.name}</p>
                <button onClick={() => handleDownload(preview)} style={{ ...styles.primaryBtn, marginTop: 16, width: 'auto', padding: '10px 24px' }}>
                  Download
                </button>
              </div>
            )}
            <p style={{ marginTop: 12, color: 'var(--text-muted)', fontSize: 14 }}>{preview.name}</p>
          </div>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  loginContainer: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    background: 'radial-gradient(ellipse at top, #1a1a2e 0%, #0a0a0f 70%)',
  },
  loginCard: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 20,
    padding: '40px 36px',
    width: '100%',
    maxWidth: 380,
    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
  },
  logo: {
    textAlign: 'center',
  },
  input: {
    width: '100%',
    padding: '12px 14px 12px 42px',
    background: 'var(--surface-2)',
    border: '1px solid var(--border)',
    borderRadius: 10,
    color: 'var(--text)',
    fontSize: 16,
    outline: 'none',
  },
  primaryBtn: {
    width: '100%',
    marginTop: 16,
    padding: '12px 20px',
    background: 'var(--accent)',
    color: 'white',
    border: 'none',
    borderRadius: 10,
    fontSize: 16,
    fontWeight: 600,
  },
  app: {
    minHeight: '100vh',
    background: 'var(--bg)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 24px',
    borderBottom: '1px solid var(--border)',
    background: 'var(--surface)',
  },
  ghostBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: 'transparent',
    border: '1px solid var(--border)',
    color: 'var(--text-muted)',
    padding: '8px 14px',
    borderRadius: 8,
    fontSize: 14,
  },
  main: {
    maxWidth: 960,
    margin: '0 auto',
    padding: '32px 24px',
  },
  dropzone: {
    border: '2px dashed var(--border)',
    borderRadius: 16,
    padding: '48px 24px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
    background: 'var(--surface)',
  },
  dropzoneActive: {
    borderColor: 'var(--accent)',
    background: 'rgba(99, 102, 241, 0.08)',
  },
  fileGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: 16,
    marginTop: 32,
  },
  fileCard: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 12,
    overflow: 'hidden',
    transition: 'transform 0.15s, box-shadow 0.15s',
  },
  filePreview: {
    height: 120,
    background: 'var(--surface-2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  fileInfo: {
    padding: '10px 12px 4px',
  },
  fileName: {
    fontSize: 13,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  fileMeta: {
    fontSize: 11,
    color: 'var(--text-muted)',
    marginTop: 2,
  },
  fileActions: {
    display: 'flex',
    gap: 4,
    padding: '4px 8px 10px',
  },
  iconBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-muted)',
    padding: 6,
    borderRadius: 6,
    display: 'flex',
  },
  modal: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.85)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    padding: 20,
  },
  modalContent: {
    position: 'relative',
    background: 'var(--surface)',
    borderRadius: 16,
    padding: 24,
    maxWidth: '90vw',
    maxHeight: '90vh',
    overflow: 'auto',
  },
  closeBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    background: 'var(--surface-2)',
    border: 'none',
    color: 'var(--text)',
    width: 36,
    height: 36,
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};
