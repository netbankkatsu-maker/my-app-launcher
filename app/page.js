'use client';
import { useState, useEffect } from 'react';

const VIEWS = [
  { key: 'grid', icon: '\u25a6', label: 'グリッド' },
  { key: 'compact', icon: '\u2630', label: 'コンパクト' },
  { key: 'list', icon: '\u2261', label: 'リスト' },
];

export default function Home() {
  const [apps, setApps] = useState(null);
  const [editing, setEditing] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ icon: '', name: '', url: '', desc: '' });
  const [status, setStatus] = useState('');
  const [view, setView] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('launcher_view') || 'grid';
    return 'grid';
  });

  useEffect(() => { loadApps(); }, []);
  useEffect(() => { localStorage.setItem('launcher_view', view); }, [view]);

  async function loadApps() {
    try {
      const res = await fetch('/api/apps');
      const data = await res.json();
      setApps(data);
    } catch { setApps([]); }
  }

  async function saveToServer(newApps) {
    setApps(newApps);
    try {
      await fetch('/api/apps', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newApps) });
      flash('保存しました');
    } catch { flash('保存に失敗しました'); }
  }

  function flash(msg) { setStatus(msg); setTimeout(() => setStatus(''), 2500); }

  function openAdd() {
    setEditing(null);
    setForm({ icon: '', name: '', url: '', desc: '' });
    setShowModal(true);
  }

  function openEdit(app) {
    setEditing(app.id);
    setForm({ icon: app.icon, name: app.name, url: app.url, desc: app.desc });
    setShowModal(true);
  }

  function handleSave() {
    const icon = form.icon.trim() || '\u{1f4f1}';
    const name = form.name.trim();
    const url = form.url.trim() || '#';
    const desc = form.desc.trim();
    if (!name) { alert('アプリ名を入力してください'); return; }
    let newApps;
    if (editing !== null) {
      newApps = apps.map(a => a.id === editing ? { ...a, icon, name, url, desc } : a);
    } else {
      const nextId = apps.length ? Math.max(...apps.map(a => a.id)) + 1 : 1;
      newApps = [...apps, { id: nextId, icon, name, url, desc }];
    }
    setShowModal(false);
    saveToServer(newApps);
  }

  function handleDelete(id) {
    if (!confirm('このアプリを削除しますか？')) return;
    saveToServer(apps.filter(a => a.id !== id));
  }

  function cycleView() {
    const i = VIEWS.findIndex(v => v.key === view);
    setView(VIEWS[(i + 1) % VIEWS.length].key);
  }

  if (apps === null) return <div style={s.body}><div style={s.loading}>読み込み中...</div></div>;

  const currentView = VIEWS.find(v => v.key === view);

  return (
    <div style={s.body}>
      <style>{`
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
        a { text-decoration: none; color: inherit; }
        .card:hover { transform: translateY(-3px) !important; box-shadow: 0 6px 20px rgba(124,111,255,.25) !important; border-color: #7c6fff !important; }
        .card-btn:hover { background: rgba(124,111,255,.15); color: #7c6fff; }
        .del-btn:hover { background: rgba(255,77,106,.15) !important; color: #ff4d6a !important; }
        .view-btn:hover { background: #2a2a4a; }
        @media(max-width:600px) {
          .header { padding: 12px 16px !important; }
          .grid-view { padding: 12px !important; gap: 10px !important; grid-template-columns: repeat(auto-fill,minmax(140px,1fr)) !important; }
          .compact-view, .list-view { padding: 12px !important; gap: 6px !important; }
        }
      `}</style>

      <header className="header" style={s.header}>
        <h1 style={s.h1}><span style={{ color: '#7c6fff' }}>My</span> Apps</h1>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button className="view-btn" onClick={cycleView} style={s.viewBtn} title={currentView.label}>
            <span style={{ fontSize: 18 }}>{currentView.icon}</span>
          </button>
          <button style={s.btnAdd} onClick={openAdd}>+</button>
        </div>
      </header>

      {status && <div style={s.syncStatus}>{status}</div>}

      {apps.length === 0 && <div style={s.empty}>アプリがありません</div>}

      {/* Grid View */}
      {view === 'grid' && apps.length > 0 && (
        <div className="grid-view" style={s.gridView}>
          {apps.map(app => (
            <a key={app.id} className="card" href={app.url === '#' ? undefined : app.url} target="_blank" rel="noopener"
              onClick={e => { if (app.url === '#') { e.preventDefault(); alert('URLが未設定です'); } }}
              style={s.gridCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ fontSize: '2rem' }}>{app.icon}</div>
                <div style={{ display: 'flex', gap: 2 }}>
                  <button className="card-btn" onClick={e => { e.preventDefault(); e.stopPropagation(); openEdit(app); }} style={s.smallBtn}>&#9998;</button>
                  <button className="card-btn del-btn" onClick={e => { e.preventDefault(); e.stopPropagation(); handleDelete(app.id); }} style={s.smallBtn}>&times;</button>
                </div>
              </div>
              <div style={{ fontWeight: 600, fontSize: '.95rem', marginTop: 8 }}>{app.name}</div>
              <div style={{ fontSize: '.75rem', color: '#666', marginTop: 4, lineHeight: 1.4 }}>{app.desc}</div>
            </a>
          ))}
        </div>
      )}

      {/* Compact View */}
      {view === 'compact' && apps.length > 0 && (
        <div className="compact-view" style={s.compactView}>
          {apps.map(app => (
            <a key={app.id} className="card" href={app.url === '#' ? undefined : app.url} target="_blank" rel="noopener"
              onClick={e => { if (app.url === '#') { e.preventDefault(); alert('URLが未設定です'); } }}
              style={s.compactCard}>
              <div style={{ fontSize: '1.4rem', width: 36, textAlign: 'center', flexShrink: 0 }}>{app.icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: '.9rem' }}>{app.name}</div>
                <div style={{ fontSize: '.7rem', color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{app.desc}</div>
              </div>
              <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
                <button className="card-btn" onClick={e => { e.preventDefault(); e.stopPropagation(); openEdit(app); }} style={s.smallBtn}>&#9998;</button>
                <button className="card-btn del-btn" onClick={e => { e.preventDefault(); e.stopPropagation(); handleDelete(app.id); }} style={s.smallBtn}>&times;</button>
              </div>
            </a>
          ))}
        </div>
      )}

      {/* List View */}
      {view === 'list' && apps.length > 0 && (
        <div className="list-view" style={s.listView}>
          {apps.map(app => (
            <a key={app.id} className="card" href={app.url === '#' ? undefined : app.url} target="_blank" rel="noopener"
              onClick={e => { if (app.url === '#') { e.preventDefault(); alert('URLが未設定です'); } }}
              style={s.listCard}>
              <div style={{ fontSize: '1.1rem', width: 28, textAlign: 'center', flexShrink: 0 }}>{app.icon}</div>
              <div style={{ flex: 1, fontWeight: 500, fontSize: '.85rem', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{app.name}</div>
              <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
                <button className="card-btn" onClick={e => { e.preventDefault(); e.stopPropagation(); openEdit(app); }} style={s.tinyBtn}>&#9998;</button>
                <button className="card-btn del-btn" onClick={e => { e.preventDefault(); e.stopPropagation(); handleDelete(app.id); }} style={s.tinyBtn}>&times;</button>
              </div>
            </a>
          ))}
        </div>
      )}

      {showModal && (
        <div style={s.overlay} onClick={() => setShowModal(false)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <h2 style={{ marginBottom: 16, fontSize: '1.1rem' }}>{editing !== null ? 'アプリを編集' : 'アプリを追加'}</h2>
            <label style={s.label}>アイコン（絵文字）</label>
            <input style={s.input} value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })} placeholder="🎵" maxLength={4} />
            <label style={s.label}>アプリ名</label>
            <input style={s.input} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="ミュージックプレイヤー" />
            <label style={s.label}>URL</label>
            <input style={s.input} value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} placeholder="https://example.com" />
            <label style={s.label}>説明</label>
            <textarea style={{ ...s.input, height: 50, resize: 'vertical' }} value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} placeholder="音楽を再生するアプリ" />
            <div style={s.modalBtns}>
              <button style={s.btnCancel} onClick={() => setShowModal(false)}>キャンセル</button>
              <button style={s.btnSave} onClick={handleSave}>{editing !== null ? '保存' : '追加'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const s = {
  body: { fontFamily: "'Segoe UI','Hiragino Sans',sans-serif", background: '#0f0f1a', color: '#e0e0e0', minHeight: '100vh' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#16162a', borderBottom: '1px solid #2a2a4a' },
  h1: { fontSize: '1.3rem', letterSpacing: '.05em', margin: 0 },
  viewBtn: { background: 'none', border: '1px solid #2a2a4a', color: '#888', width: 34, height: 34, borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  btnAdd: { background: '#7c6fff', color: '#fff', border: 'none', width: 34, height: 34, borderRadius: 8, fontSize: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  syncStatus: { fontSize: '.7rem', color: '#7c6fff', padding: '2px 16px', textAlign: 'right' },
  empty: { textAlign: 'center', padding: '60px 20px', color: '#555', fontSize: '.95rem' },
  loading: { textAlign: 'center', padding: '60px 20px', color: '#7c6fff', fontSize: '1rem' },

  // Grid
  gridView: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 12, padding: 16 },
  gridCard: { background: '#1e1e38', borderRadius: 12, padding: 14, cursor: 'pointer', transition: 'all .2s', border: '1px solid #2a2a4a', display: 'block' },

  // Compact
  compactView: { display: 'flex', flexDirection: 'column', gap: 6, padding: 16 },
  compactCard: { background: '#1e1e38', borderRadius: 10, padding: '10px 14px', cursor: 'pointer', transition: 'all .2s', border: '1px solid #2a2a4a', display: 'flex', alignItems: 'center', gap: 10 },

  // List
  listView: { display: 'flex', flexDirection: 'column', gap: 2, padding: '8px 16px' },
  listCard: { background: '#1e1e38', borderRadius: 6, padding: '8px 10px', cursor: 'pointer', transition: 'all .2s', border: '1px solid transparent', display: 'flex', alignItems: 'center', gap: 8 },

  // Buttons
  smallBtn: { background: 'none', border: 'none', color: '#555', fontSize: '.8rem', cursor: 'pointer', width: 24, height: 24, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s' },
  tinyBtn: { background: 'none', border: 'none', color: '#555', fontSize: '.75rem', cursor: 'pointer', width: 22, height: 22, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s' },

  // Modal
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  modal: { background: '#1e1e38', borderRadius: 14, padding: 24, width: '90%', maxWidth: 380, border: '1px solid #2a2a4a' },
  label: { display: 'block', fontSize: '.8rem', color: '#888', marginBottom: 3, marginTop: 12 },
  input: { width: '100%', padding: '8px 10px', borderRadius: 7, border: '1px solid #2a2a4a', background: '#16162a', color: '#e0e0e0', fontSize: '.9rem', outline: 'none', boxSizing: 'border-box' },
  modalBtns: { display: 'flex', gap: 8, marginTop: 20, justifyContent: 'flex-end' },
  btnCancel: { padding: '8px 16px', borderRadius: 8, border: 'none', fontSize: '.85rem', cursor: 'pointer', background: '#2a2a4a', color: '#e0e0e0' },
  btnSave: { padding: '8px 16px', borderRadius: 8, border: 'none', fontSize: '.85rem', cursor: 'pointer', background: '#7c6fff', color: '#fff' },
};
