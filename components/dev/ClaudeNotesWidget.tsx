// @ts-nocheck
'use client';

// ClaudeNotesWidget — flotante de desarrollo para anotar la UI para Claude.
// Scaffold genérico (skill /localhost). Funciona en cualquier app React (Next,
// Vite, CRA, Remix). Flujo:
//   1. "Seleccionar" → modo picker: pasas el ratón (resalta) y clic en un
//      elemento → queda capturado (selector CSS + texto + ruta).
//   2. Escribes una nota y "Añadir". Persisten en localStorage.
//   3. "Guardar para Claude" → POST a ENDPOINT que escribe .claude/ui-notes.md.
//      Si no hay endpoint (p.ej. Vite sin middleware) cae a copiar+descargar.
//   4. En el chat dices: "aplica las notas".
//
// Solo se monta en desarrollo (ver dónde se importa). Estilos inline + z-index
// altísimo para no depender del CSS de la app ni verse afectado por restyles.

import { useEffect, useRef, useState, useCallback } from 'react';

// Endpoint que persiste las notas. El scaffold de la skill lo crea en:
//   Next App Router → app/api/_dev/ui-notes/route.js
//   Next Pages      → pages/api/_dev/ui-notes.js
// Si tu app no tiene backend, deja el fallback (copia + descarga) hacer el trabajo.
const ENDPOINT = '/api/dev/ui-notes';

const LS_KEY = 'claude-ui-notes';
const Z = 2147483000;
const ACCENT = '#19191b';

function cssPath(el) {
  if (!el || el.nodeType !== 1) return '';
  const parts = [];
  let node = el;
  while (node && node.nodeType === 1 && parts.length < 6 && node.tagName !== 'BODY') {
    let sel = node.tagName.toLowerCase();
    if (node.id) { sel = `#${node.id}`; parts.unshift(sel); break; }
    const cls = (typeof node.className === 'string' ? node.className : '')
      .split(/\s+/).filter((c) => c && !c.startsWith('css-') && c.length < 30).slice(0, 2);
    if (cls.length) sel += '.' + cls.join('.');
    const parent = node.parentElement;
    if (parent) {
      const sameTag = [...parent.children].filter((c) => c.tagName === node.tagName);
      if (sameTag.length > 1) sel += `:nth-of-type(${sameTag.indexOf(node) + 1})`;
    }
    parts.unshift(sel);
    node = node.parentElement;
  }
  return parts.join(' > ');
}

export default function ClaudeNotesWidget() {
  const [open, setOpen] = useState(false);
  const [picking, setPicking] = useState(false);
  const [target, setTarget] = useState(null); // { selector, text, tag, url }
  const [note, setNote] = useState('');
  const [notes, setNotes] = useState([]);
  const [saved, setSaved] = useState('');
  const rootRef = useRef(null);
  const hiliteRef = useRef(null);

  // cargar / persistir
  useEffect(() => {
    try { const raw = localStorage.getItem(LS_KEY); if (raw) setNotes(JSON.parse(raw)); } catch { /* */ }
  }, []);
  useEffect(() => {
    try { localStorage.setItem(LS_KEY, JSON.stringify(notes)); } catch { /* */ }
  }, [notes]);

  const isOwn = useCallback((el) => rootRef.current && el && rootRef.current.contains(el), []);

  // modo picker
  useEffect(() => {
    if (!picking) { if (hiliteRef.current) hiliteRef.current.style.display = 'none'; return undefined; }
    const onMove = (e) => {
      const el = document.elementFromPoint(e.clientX, e.clientY);
      if (!el || isOwn(el)) { if (hiliteRef.current) hiliteRef.current.style.display = 'none'; return; }
      const r = el.getBoundingClientRect();
      const h = hiliteRef.current;
      if (h) { h.style.display = 'block'; h.style.top = `${r.top}px`; h.style.left = `${r.left}px`; h.style.width = `${r.width}px`; h.style.height = `${r.height}px`; }
    };
    const onClick = (e) => {
      const el = document.elementFromPoint(e.clientX, e.clientY);
      if (!el || isOwn(el)) return;
      e.preventDefault(); e.stopPropagation();
      setTarget({
        selector: cssPath(el),
        text: (el.innerText || el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 80),
        tag: el.tagName.toLowerCase(),
        url: location.pathname + location.search,
      });
      setPicking(false);
      setOpen(true);
    };
    const onKey = (e) => { if (e.key === 'Escape') setPicking(false); };
    document.addEventListener('mousemove', onMove, true);
    document.addEventListener('click', onClick, true);
    document.addEventListener('keydown', onKey, true);
    return () => {
      document.removeEventListener('mousemove', onMove, true);
      document.removeEventListener('click', onClick, true);
      document.removeEventListener('keydown', onKey, true);
    };
  }, [picking, isOwn]);

  const addNote = () => {
    if (!note.trim()) return;
    setNotes((prev) => [...prev, {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      selector: target?.selector || '(sin elemento)',
      text: target?.text || '',
      tag: target?.tag || '',
      url: target?.url || (typeof location !== 'undefined' ? location.pathname : ''),
      note: note.trim(),
    }]);
    setNote('');
    setTarget(null);
  };
  const removeNote = (id) => setNotes((p) => p.filter((n) => n.id !== id));
  const clearAll = () => { setNotes([]); setSaved(''); };

  const toMarkdown = () => notes.map((n, i) =>
    `### Nota ${i + 1}\n- **Página:** \`${n.url}\`\n- **Elemento:** \`${n.selector}\`${n.text ? ` — "${n.text}"` : ''}\n- **Pide:** ${n.note}`
  ).join('\n\n');

  const fullMarkdown = () => {
    const header = `# Notas de UI para Claude\n\n> Generado por ClaudeNotesWidget · ${new Date().toISOString()} · ${notes.length} nota(s).\n> Cuando el usuario diga "aplica las notas", lee este archivo y aplícalas.\n\n`;
    return header + toMarkdown() + '\n';
  };

  const copyAll = async () => {
    try { await navigator.clipboard.writeText(toMarkdown()); setSaved('Copiado al portapapeles'); }
    catch { setSaved('No se pudo copiar'); }
    setTimeout(() => setSaved(''), 2500);
  };

  // Fallback si no hay endpoint: descarga ui-notes.md + copia al portapapeles.
  const downloadFallback = async () => {
    try { await navigator.clipboard.writeText(toMarkdown()); } catch { /* */ }
    try {
      const blob = new Blob([fullMarkdown()], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'ui-notes.md'; a.click();
      URL.revokeObjectURL(url);
      setSaved('Sin endpoint → descargado ui-notes.md (muévelo a .claude/) y copiado');
    } catch { setSaved('No se pudo guardar'); }
    setTimeout(() => setSaved(''), 5000);
  };

  const saveForClaude = async () => {
    try {
      const r = await fetch(ENDPOINT, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes, markdown: toMarkdown() }),
      });
      if (!r.ok) throw new Error('fail');
      setSaved('Guardado en .claude/ui-notes.md — dile a Claude: "aplica las notas"');
      setTimeout(() => setSaved(''), 4000);
    } catch {
      // sin endpoint o falló → fallback descarga
      await downloadFallback();
    }
  };

  const btn = (label, onClick, primary, extra = {}) => (
    <button type="button" onClick={onClick} style={{
      font: '600 11px/1 -apple-system, system-ui, sans-serif', letterSpacing: '-0.01em',
      padding: '7px 10px', borderRadius: 8, cursor: 'pointer',
      border: primary ? 'none' : '0.8px solid rgba(0,0,0,0.14)',
      background: primary ? ACCENT : '#fff', color: primary ? '#fff' : ACCENT, ...extra,
    }}>{label}</button>
  );

  return (
    <div ref={rootRef} style={{ position: 'fixed', zIndex: Z, fontFamily: '-apple-system, system-ui, sans-serif' }}>
      {/* highlight overlay */}
      <div ref={hiliteRef} style={{ position: 'fixed', display: 'none', zIndex: Z - 1, pointerEvents: 'none', border: `2px solid ${ACCENT}`, background: 'rgba(25,25,27,0.06)', borderRadius: 4, transition: 'all .04s linear' }} />

      {/* launcher */}
      {!open && (
        <button type="button" onClick={() => setOpen(true)} aria-label="Notas para Claude" style={{
          position: 'fixed', bottom: 18, right: 18, width: 46, height: 46, borderRadius: 23,
          background: ACCENT, color: '#fff', border: 'none', cursor: 'pointer', boxShadow: '0 6px 22px rgba(0,0,0,0.28)',
          font: '600 11px/1 -apple-system, system-ui, sans-serif', display: 'grid', placeItems: 'center',
        }}>
          {notes.length ? notes.length : '✎'}
        </button>
      )}

      {/* panel */}
      {open && (
        <div style={{
          position: 'fixed', bottom: 18, right: 18, width: 320, maxHeight: '78vh', display: 'flex', flexDirection: 'column',
          background: '#fff', borderRadius: 14, border: '0.8px solid rgba(0,0,0,0.12)', boxShadow: '0 18px 50px -10px rgba(0,0,0,0.4)', overflow: 'hidden',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 13px', borderBottom: '0.8px solid rgba(0,0,0,0.08)' }}>
            <span style={{ font: '600 12.5px/1 -apple-system, system-ui, sans-serif', letterSpacing: '-0.01em', color: ACCENT, flex: 1 }}>Notas para Claude</span>
            <span style={{ font: '500 10px/1 -apple-system,system-ui,sans-serif', color: '#9d9da4' }}>{notes.length} nota{notes.length === 1 ? '' : 's'}</span>
            <button type="button" onClick={() => { setOpen(false); setPicking(false); }} aria-label="Cerrar" style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#9d9da4', fontSize: 16, lineHeight: 1 }}>×</button>
          </div>

          {/* Composer: bloque FIJO (no scrollea) para que el textarea nunca se aplaste
              a una línea cuando hay muchas notas. Solo la lista de abajo scrollea. */}
          <div style={{ padding: 13, display: 'flex', flexDirection: 'column', gap: 9, flex: 'none', borderBottom: notes.length > 0 ? '0.8px solid rgba(0,0,0,0.08)' : 'none' }}>
            {btn(picking ? 'Selecciona en la página… (Esc cancela)' : '◎ Seleccionar elemento', () => setPicking((p) => !p), picking, { width: '100%', padding: '9px 10px', background: picking ? '#c4861f' : ACCENT, color: '#fff', border: 'none' })}

            {target && (
              <div style={{ background: '#f6f6f5', borderRadius: 8, padding: '7px 9px', fontSize: 10.5, color: '#6c6c72', wordBreak: 'break-all' }}>
                <div style={{ fontFamily: 'SF Mono, ui-monospace, monospace', color: ACCENT }}>{target.selector}</div>
                {target.text && <div style={{ marginTop: 3, fontStyle: 'italic' }}>&ldquo;{target.text}&rdquo;</div>}
                <button type="button" onClick={() => setTarget(null)} style={{ marginTop: 4, border: 'none', background: 'none', color: '#d2484b', cursor: 'pointer', fontSize: 10, padding: 0 }}>quitar elemento</button>
              </div>
            )}

            <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder={target ? 'Qué cambiar en este elemento…' : 'Nota general (sin elemento concreto)…'} rows={3}
              style={{ width: '100%', minHeight: 66, resize: 'vertical', flex: 'none', borderRadius: 8, border: '0.8px solid rgba(0,0,0,0.14)', padding: '8px 9px', font: '400 12px/1.4 -apple-system, system-ui, sans-serif', letterSpacing: '-0.01em', color: ACCENT, boxSizing: 'border-box', outline: 'none' }}
              onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) addNote(); }} />
            {btn('+ Añadir nota  (⌘↵)', addNote, true, { width: '100%' })}
          </div>

          {notes.length > 0 && (
            <div style={{ padding: '10px 13px', display: 'flex', flexDirection: 'column', gap: 6, overflowY: 'auto', flex: 1 }}>
              {notes.map((n, i) => (
                <div key={n.id} style={{ background: '#fafafa', border: '0.8px solid rgba(0,0,0,0.07)', borderRadius: 8, padding: '7px 9px', fontSize: 11 }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <span style={{ color: '#9d9da4', fontWeight: 600 }}>{i + 1}.</span>
                    <span style={{ flex: 1, color: ACCENT }}>{n.note}</span>
                    <button type="button" onClick={() => removeNote(n.id)} style={{ border: 'none', background: 'none', color: '#c6c6cb', cursor: 'pointer', fontSize: 13, lineHeight: 1 }}>×</button>
                  </div>
                  {n.selector !== '(sin elemento)' && <div style={{ fontFamily: 'SF Mono, ui-monospace, monospace', fontSize: 9, color: '#9d9da4', marginTop: 3, wordBreak: 'break-all' }}>{n.selector}</div>}
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: 7, padding: 11, borderTop: '0.8px solid rgba(0,0,0,0.08)', flexWrap: 'wrap' }}>
            {btn('💾 Guardar para Claude', saveForClaude, true, { flex: 1 })}
            {btn('Copiar', copyAll, false)}
            {notes.length > 0 && btn('Vaciar', clearAll, false, { color: '#d2484b', borderColor: 'rgba(210,72,75,0.3)' })}
          </div>
          {saved && <div style={{ padding: '0 11px 11px', fontSize: 10.5, color: '#2f9d5b', textAlign: 'center' }}>{saved}</div>}
        </div>
      )}
    </div>
  );
}
