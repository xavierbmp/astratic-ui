// @ts-nocheck
// app/api/dev/ui-notes/route.ts (no en _dev: Next trata las carpetas con _ como privadas y no las enruta)
// Endpoint de DESARROLLO para ClaudeNotesWidget (skill /localhost).
// POST → escribe las notas en .claude/ui-notes.md (Claude las lee al pedírselo).
// GET  → devuelve el markdown guardado.
// Fail-closed en producción.

import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const FILE = path.join(process.cwd(), '.claude', 'ui-notes.md');

function disabled() {
  return process.env.NODE_ENV === 'production'
    ? NextResponse.json({ error: 'Disabled in production' }, { status: 404 })
    : null;
}

export async function POST(request) {
  const off = disabled();
  if (off) return off;
  try {
    const body = await request.json().catch(() => ({}));
    const md = typeof body?.markdown === 'string' ? body.markdown : '';
    const count = Array.isArray(body?.notes) ? body.notes.length : 0;
    const header = `# Notas de UI para Claude\n\n> Generado por ClaudeNotesWidget · ${new Date().toISOString()} · ${count} nota(s).\n> Cuando el usuario diga "aplica las notas", lee este archivo y aplícalas.\n\n`;
    await fs.mkdir(path.dirname(FILE), { recursive: true });
    await fs.writeFile(FILE, header + md + '\n', 'utf8');
    return NextResponse.json({ ok: true, count, path: '.claude/ui-notes.md' });
  } catch {
    return NextResponse.json({ error: 'No se pudieron guardar las notas' }, { status: 500 });
  }
}

export async function GET() {
  const off = disabled();
  if (off) return off;
  try {
    const md = await fs.readFile(FILE, 'utf8').catch(() => '');
    return NextResponse.json({ ok: true, markdown: md });
  } catch {
    return NextResponse.json({ error: 'No se pudieron leer las notas' }, { status: 500 });
  }
}
