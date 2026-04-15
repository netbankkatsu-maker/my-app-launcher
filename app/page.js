'use client';
import { useState, useEffect } from 'react';

export default function Home() {
  const [apps, setApps] = useState(null);
  const [editing, setEditing] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ icon: '', name: '', url: '', desc: '' });
  const [status, setStatus] = useState('');

  useEffect(() => { loadApps(); }, []);

  async function loadApps() {
    try {
      const res = await fetch('/api/apps');
      const data = await res.json();
      setApps(data);
    } catch {
      setApps([]);
    }
  }

  async function saveToServer(newApps) {
    setApps(newApps);
    try {
      await fetch('/api/apps', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newApps),
      });
      flash('保存しました');
    } catch {
      flash('保存に失敗しました');
    }
  }

  function flash(msg) {
    setStatus(msg);
    setTimeout(() => setStatus(''), 2500);
  }

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

  if (apps === null) {
    return <div style={styles.body}><div style={styles.loading}>読み込み中...</div></div>;
  }

  return (
    <div style={styles.body}>
      <header style={styles.header}>
        <h1 style={styles.h1}><span style={{ color: '#7c6fff' }}>My</span> Apps</h1>
        <button style={styles.btnAdd} onClick={openAdd}>+ 追加</button>
      </header>

      {status && <div style={styles.syncStatus}>{status}</div>}

      <div style={styles.grid}>
        {apps.length === 0 && <div style={styles.empty}>アプリがありません。「+ 追加」ボタンから追加してください。</div>}
        {apps.map(app => (
          <a
            key={app.id}
            href={app.url === '#' ? undefined : app.url}
            target="_blank"
            rel="noopener"
            style={styles.card}
            onClick={e => {
              if (app.url === '#') { e.preventDefault(); alert('URLが未設定です。編集ボタンからURLを設定してください。'); }
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(124,111,255,.2)'; e.currentTarget.style.borderColor = '#7c6fff'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; e.currentTarget.style.borderColor = '#2a2a4a'; }}
          >
            <button style={styles.cardEdit} onClick={e => { e.preventDefault(); e.stopPropagation(); openEdit(app); }} title="編集">&#9998;</button>
            <button style={styles.cardDelete} onClick={e => { e.preventDefault(); e.stopPropagation(); handleDelete(app.id); }} title="削除">&times;</button>
            <div style={styles.cardIcon}>{app.icon}</div>
            <div style={styles.cardName}>{app.name}</div>
            <div style={styles.cardDesc}>{app.desc}</div>
          </a>
        ))}
      </div>

      {showModal && (
        <div style={styles.overlay} onClick={() => setShowModal(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <h2 style={{ marginBottom: 20, fontSize: '1.2rem' }}>{editing !== null ? 'アプリを編集' : 'アプリを追加'}</h2>
            <label style={styles.label}>アイコン（絵文字）</label>
            <input style={styles.input} value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })} placeholder="例: 🎵" maxLength={4} />
            <label style={styles.label}>アプリ名</label>
            <input style={styles.input} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="例: ミュージックプレイヤー" />
            <label style={styles.label}>URL</label>
            <input style={styles.input} value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} placeholder="例: https://example.com" />
            <label style={styles.label}>説明</label>
            <textarea style={{ ...styles.input, height: 60, resize: 'vertical' }} value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} placeholder="例: 音楽を再生するアプリ" />
            <div style={styles.modalBtns}>
              <button style={styles.btnCancel} onClick={() => setShowModal(false)}>キャンセル</button>
              <button style={styles.btnSave} onClick={handleSave}>{editing !== null ? '保存' : '追加'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  body: { fontFamily: "'Segoe UI','Hiragino Sans',sans-serif", background: '#0f0f1a', color: '#e0e0e0', minHeight: '100vh', margin: 0 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 32px', background: '#16162a', borderBottom: '1px solid #2a2a4a' },
  h1: { fontSize: '1.6rem', letterSpacing: '.05em', margin: 0 },
  btnAdd: { background: '#7c6fff', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 10, fontSize: '.95rem', cursor: 'pointer' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 20, padding: 32 },
  card: { background: '#1e1e38', borderRadius: 16, padding: 24, cursor: 'pointer', transition: 'transform .2s, box-shadow .2s', position: 'relative', textDecoration: 'none', color: 'inherit', display: 'block', border: '1px solid #2a2a4a' },
  cardIcon: { fontSize: '2.8rem', marginBottom: 12 },
  cardName: { fontSize: '1.15rem', fontWeight: 600, marginBottom: 6 },
  cardDesc: { fontSize: '.85rem', color: '#888', lineHeight: 1.5 },
  cardEdit: { position: 'absolute', top: 10, right: 42, background: 'none', border: 'none', color: '#555', fontSize: '1rem', cursor: 'pointer', width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  cardDelete: { position: 'absolute', top: 10, right: 10, background: 'none', border: 'none', color: '#555', fontSize: '1.2rem', cursor: 'pointer', width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  modal: { background: '#1e1e38', borderRadius: 16, padding: 32, width: '90%', maxWidth: 420, border: '1px solid #2a2a4a' },
  label: { display: 'block', fontSize: '.85rem', color: '#888', marginBottom: 4, marginTop: 14 },
  input: { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #2a2a4a', background: '#16162a', color: '#e0e0e0', fontSize: '.95rem', outline: 'none', boxSizing: 'border-box' },
  modalBtns: { display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' },
  btnCancel: { padding: '10px 20px', borderRadius: 10, border: 'none', fontSize: '.9rem', cursor: 'pointer', background: '#2a2a4a', color: '#e0e0e0' },
  btnSave: { padding: '10px 20px', borderRadius: 10, border: 'none', fontSize: '.9rem', cursor: 'pointer', background: '#7c6fff', color: '#fff' },
  loading: { textAlign: 'center', padding: '80px 20px', color: '#7c6fff', fontSize: '1.1rem' },
  empty: { textAlign: 'center', padding: '80px 20px', color: '#555', fontSize: '1.1rem', gridColumn: '1/-1' },
  syncStatus: { fontSize: '.75rem', color: '#7c6fff', padding: '4px 32px', textAlign: 'right' },
};
