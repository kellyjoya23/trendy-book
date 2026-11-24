/* Trendy Book · CRM interno (fichas de la cita + curador) */
{
const CFG = window.TRENDY_CONFIG || {};
const CATALOGO = window.CATALOGO || [];
const sb = window.supabase.createClient(CFG.supabaseUrl, CFG.supabaseAnonKey);

const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

const ESTADOS = [['nueva','Nueva'],['en_curaduria','En curaduría'],['confirmada','Confirmada'],['empacada','Empacada'],['entregada','Entregada'],['cancelada','Cancelada']];
const EL = Object.fromEntries(ESTADOS);
const GEN = [['romance','Romance'],['romantasy','Romantasy'],['fantasia','Fantasía'],['misterio','Misterio / Thriller'],['drama','Drama / Contemporánea'],['humor','Humor / Ligero'],['clasicos','Clásicos'],['autoayuda','Autoayuda'],['poesia','Poesía'],['sorpresa','Sorpréndanme']];
const AV = [['romance','Romance'],['fantasia','Fantasía'],['misterio','Misterio / Thriller'],['drama','Drama'],['clasicos','Clásicos'],['autoayuda','Autoayuda'],['poesia','Poesía'],['triste','Temas tristes / duelo'],['spicy','Escenas explícitas'],['violencia','Violencia fuerte']];
const GL = Object.fromEntries([...AV, ...GEN]);
const LECT = {avido:'ávida', ocasional:'ocasional', retomando:'retomando el hábito', casinolee:'casi no lee'};

let fichas = [], filtro = 'activas', actual = null, sucio = false;
const F = {para:'regalo', gustos:new Set(), evitar:new Set()};

/* ---------- Vistas ---------- */
const vista = v => { $('#vBoot').hidden = true; $('#vAuth').hidden = v !== 'auth'; $('#vApp').hidden = v !== 'app'; };
const authMsg = (t, err) => { const m = $('#authMsg'); m.textContent = t; m.className = 'msg' + (err ? ' err' : ''); m.hidden = !t; };
const esEquipo = s => s?.user?.app_metadata?.rol === 'equipo';

let recuperando = false;
sb.auth.onAuthStateChange((ev, session) => {
  if (ev === 'PASSWORD_RECOVERY') { recuperando = true; vista('auth'); $('#fLogin').hidden = true; $('#fReset').hidden = false; authMsg(''); $('#newPass').focus(); return; }
  if (ev === 'SIGNED_OUT') { vista('auth'); }
});

const entrar = async session => {
  if (recuperando) return;
  if (!session) return vista('auth');
  if (!esEquipo(session)) { vista('auth'); authMsg('Esta cuenta todavía no tiene acceso al CRM. Pídele a Claude que la marque como equipo.', true); await sb.auth.signOut(); return; }
  vista('app'); await cargar();
};

$('#fLogin').addEventListener('submit', async e => {
  e.preventDefault(); authMsg('Entrando…');
  const { data, error } = await sb.auth.signInWithPassword({ email: $('#email').value.trim(), password: $('#pass').value });
  if (error) return authMsg(error.message.includes('Invalid') ? 'Correo o contraseña incorrectos.' : 'No se pudo entrar: ' + error.message, true);
  $('#pass').value = ''; authMsg(''); entrar(data.session);
});
$('#olvide').addEventListener('click', async () => {
  const email = $('#email').value.trim(); if (!email) return authMsg('Escribe el correo primero.', true);
  const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: location.origin + '/crm' });
  authMsg(error ? 'No se pudo enviar: ' + error.message : 'Listo. Revisa el correo y abre el enlace para crear una contraseña nueva.', !!error);
});
$('#fReset').addEventListener('submit', async e => {
  e.preventDefault();
  const { error } = await sb.auth.updateUser({ password: $('#newPass').value });
  if (error) return authMsg('No se pudo guardar: ' + error.message, true);
  recuperando = false; $('#fReset').hidden = true; $('#fLogin').hidden = false; $('#newPass').value = '';
  history.replaceState(null, '', '/crm');
  const { data } = await sb.auth.getSession(); entrar(data.session);
});
$('#btnSalir').addEventListener('click', async () => { if (sucio && !confirmarSalida()) return; await sb.auth.signOut(); vista('auth'); });

/* ---------- Datos ---------- */
const cargar = async () => {
  $('#resumen').textContent = 'Cargando…';
  const { data, error } = await sb.from('fichas').select('*').order('creada', { ascending: false }).limit(1000);
  if (error) { $('#resumen').textContent = 'No se pudieron cargar las fichas: ' + error.message; return; }
  fichas = data;
  if (actual?.id) { const f = fichas.find(x => x.id === actual.id); if (f && !sucio) abrir(f, false); }
  pintarLista();
};
$('#btnRecargar').addEventListener('click', cargar);
setInterval(() => { if (!$('#vApp').hidden && !sucio && document.visibilityState === 'visible') cargar(); }, 60000);

const cuando = iso => { const d = new Date(iso), h = new Date(), dias = Math.floor((h.setHours(0,0,0,0) - new Date(iso).setHours(0,0,0,0)) / 864e5);
  const hora = d.toLocaleTimeString('es-SV', { hour: 'numeric', minute: '2-digit' });
  return dias === 0 ? 'Hoy ' + hora : dias === 1 ? 'Ayer ' + hora : d.toLocaleDateString('es-SV', { day: 'numeric', month: 'short' }); };
const titulo = f => f.para === 'mi' ? (f.nombre ? `${f.nombre}, para ella` : 'Autorregalo') : (f.nombre_para ? `Para ${f.nombre_para}` : (f.nombre ? `Regalo de ${f.nombre}` : 'Regalo'));

const pintarLista = () => {
  const cuenta = k => fichas.filter(f => k === 'todas' ? true : k === 'activas' ? !['entregada','cancelada'].includes(f.estado) : f.estado === k).length;
  const tabs = [['activas','Activas'], ...ESTADOS, ['todas','Todas']];
  $('#tabsEstado').innerHTML = tabs.map(([k, l]) => `<button class="tab" role="tab" data-k="${k}" aria-selected="${k === filtro}">${esc(l)}<b>${cuenta(k)}</b></button>`).join('');
  const q = norm($('#buscar').value);
  const vis = fichas.filter(f => (filtro === 'todas' || (filtro === 'activas' ? !['entregada','cancelada'].includes(f.estado) : f.estado === filtro))
    && (!q || norm([f.codigo, f.nombre, f.nombre_para, f.notas, f.ocasion, f.libro, f.notas_internas].join(' ')).includes(q)));
  $('#lista').innerHTML = vis.map(f => `<li><button class="item" data-id="${esc(f.id)}" aria-current="${actual?.id === f.id}">
      <span class="who">${esc(titulo(f))}</span><span class="when">${esc(cuando(f.creada))}</span>
      <span class="meta"><span class="pill ${esc(f.estado)}">${esc(EL[f.estado] || f.estado)}</span>${esc(f.codigo)} · ${esc([f.ocasion, f.gustos.map(g => GL[g] || g).join(', ')].filter(Boolean).join(' · ') || 'sin detalles')}</span></button></li>`).join('');
  $('#listaVacia').hidden = vis.length > 0;
  const nuevas = cuenta('nueva');
  $('#resumen').textContent = `${fichas.length} ficha${fichas.length === 1 ? '' : 's'} · ${nuevas} nueva${nuevas === 1 ? '' : 's'} por atender`;
};
$('#tabsEstado').addEventListener('click', e => { const t = e.target.closest('.tab'); if (t) { filtro = t.dataset.k; pintarLista(); } });
$('#buscar').addEventListener('input', pintarLista);
$('#lista').addEventListener('click', e => { const b = e.target.closest('.item'); if (!b) return; if (sucio && !confirmarSalida()) return; abrir(fichas.find(f => f.id === b.dataset.id)); });

/* ---------- Detalle ---------- */
$('#dEstado').innerHTML = ESTADOS.map(([v, l]) => `<option value="${v}">${esc(l)}</option>`).join('');
$('#listaLibros').innerHTML = CATALOGO.map(b => `<option value="${esc(b.titulo + ' · ' + b.autor)}"></option>`).join('');
const chips = (arr, el) => el.innerHTML = arr.map(([v, l]) => `<button class="chip" type="button" data-v="${v}" aria-pressed="false">${esc(l)}</button>`).join('');
chips(GEN, $('#cGustos')); chips(AV, $('#cEvitar'));
const syncChips = () => {
  $$('#cPara .chip').forEach(c => c.setAttribute('aria-pressed', c.dataset.v === F.para));
  $$('#cGustos .chip').forEach(c => c.setAttribute('aria-pressed', F.gustos.has(c.dataset.v)));
  $$('#cEvitar .chip').forEach(c => c.setAttribute('aria-pressed', F.evitar.has(c.dataset.v)));
  $('#dNombrePara').disabled = F.para === 'mi';
};
const confirmarSalida = () => confirm('Hay cambios sin guardar. ¿Salir sin guardar?');
const marcarSucio = () => { sucio = true; $('#saveMsg').textContent = 'Cambios sin guardar'; $('#saveMsg').className = 'msg'; };

const CAMPOS = { dNombre:'nombre', dNombrePara:'nombre_para', dEdad:'edad', dLee:'lee', dEvitarOtro:'evitar_otro', dOcasion:'ocasion', dNotas:'notas', dEstado:'estado', dLibro:'libro', dNotasInt:'notas_internas' };

const abrir = (f, enfocar = true) => {
  actual = f; sucio = false;
  $('#placeholder').hidden = true; $('#detalle').hidden = false; $('#vApp').classList.add('viendo');
  $('#imp').hidden = !!f.id; $('#respuestas').open = !f.id || !f.libro;
  $('#dCodigo').textContent = f.codigo;
  $('#dTitulo').textContent = f.id ? titulo(f) : 'Ficha nueva';
  $('#dFecha').textContent = f.id ? `Llegó ${cuando(f.creada).toLowerCase()} · actualizada ${cuando(f.actualizada).toLowerCase()}` : 'Para pedidos que llegaron por DM o WhatsApp sin formulario.';
  for (const [id, k] of Object.entries(CAMPOS)) $('#' + id).value = f[k] ?? '';
  F.para = f.para || 'regalo'; F.gustos = new Set(f.gustos || []); F.evitar = new Set(f.evitar || []);
  syncChips(); sugerir();
  $('#saveMsg').textContent = '';
  pintarLista();
  if (enfocar && matchMedia('(max-width:860px)').matches) window.scrollTo({ top: 0 });
};
$('#btnVolver').addEventListener('click', () => { if (sucio && !confirmarSalida()) return; $('#vApp').classList.remove('viendo'); actual = null; sucio = false; $('#detalle').hidden = true; $('#placeholder').hidden = false; pintarLista(); });

const nuevoCodigo = () => { const a = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', r = new Uint8Array(5); crypto.getRandomValues(r); return 'TB-' + [...r].map(n => a[n % a.length]).join(''); };
$('#btnNueva').addEventListener('click', () => { if (sucio && !confirmarSalida()) return; abrir({ codigo: nuevoCodigo(), para: 'regalo', gustos: [], evitar: [], estado: 'nueva' }); });

document.addEventListener('click', e => {
  const c = e.target.closest('#detalle .chip'); if (!c) return;
  const g = c.parentElement;
  if (g.dataset.single) F.para = c.dataset.v;
  else { const set = F[g.dataset.multi], v = c.dataset.v; set.has(v) ? set.delete(v) : set.add(v);
    if (g.dataset.multi === 'gustos') { if (v === 'sorpresa' && set.has(v)) { set.clear(); set.add(v); } else if (v !== 'sorpresa') set.delete('sorpresa'); } }
  syncChips(); marcarSucio(); sugerir();
});
$('#detalle').addEventListener('input', e => { if (e.target.closest('#pegado')) return; if (e.target.matches('input,textarea,select')) { marcarSucio(); if (!['dLibro','dNotasInt','dEstado'].includes(e.target.id)) sugerir(); } });
$('#detalle').addEventListener('change', e => { if (e.target.id === 'dEstado') marcarSucio(); });

const leerForm = () => {
  const v = id => $('#' + id).value.trim() || null;
  const r = { para: F.para, gustos: [...F.gustos], evitar: [...F.evitar] };
  for (const [id, k] of Object.entries(CAMPOS)) r[k] = v(id);
  if (r.para === 'mi') r.nombre_para = null;
  r.estado = r.estado || 'nueva';
  return r;
};

$('#btnGuardar').addEventListener('click', async () => {
  const b = $('#btnGuardar'); b.disabled = true; $('#saveMsg').textContent = 'Guardando…'; $('#saveMsg').className = 'msg';
  const r = leerForm();
  const q = actual.id ? sb.from('fichas').update(r).eq('id', actual.id).select().single()
                      : sb.from('fichas').insert({ ...r, codigo: actual.codigo }).select().single();
  const { data, error } = await q; b.disabled = false;
  if (error) { $('#saveMsg').textContent = 'No se guardó: ' + error.message; $('#saveMsg').className = 'msg err'; return; }
  const i = fichas.findIndex(f => f.id === data.id); if (i >= 0) fichas[i] = data; else fichas.unshift(data);
  sucio = false; abrir(data, false); $('#saveMsg').textContent = 'Guardado';
});

/* ---------- Pegar mensaje (pedidos sin formulario) ---------- */
const fromLabels = (txt, arr) => { const n = norm(txt), out = new Set(); arr.forEach(([v, l]) => { if (n.includes(norm(l))) out.add(v); }); return out; };
$('#btnImp').addEventListener('click', () => {
  const d = {}; $('#pegado').value.split(/\n/).forEach(l => { const m = l.match(/^\s*([^:]{2,20}):\s*(.+)$/); if (m) d[norm(m[1]).trim()] = m[2].trim(); });
  if (!Object.keys(d).length) return;
  if (d['para']) F.para = norm(d['para']).includes('mi') ? 'mi' : 'regalo';
  if (d['se llama']) $('#dNombrePara').value = d['se llama'];
  if (d['de']) $('#dNombre').value = d['de'];
  if (d['edad / etapa']) $('#dEdad').value = d['edad / etapa'];
  if (d['lee']) { const n = norm(d['lee']); $('#dLee').value = n.includes('encanta') ? 'avido' : n.includes('vez en cuando') ? 'ocasional' : n.includes('casi no') ? 'casinolee' : n.includes('retomando') ? 'retomando' : ''; }
  const gust = d['le encanta'] || d['me encanta']; if (gust) F.gustos = fromLabels(gust, GEN);
  if (d['evitar']) { F.evitar = fromLabels(d['evitar'], AV);
    const conocidas = ['romance','fantasia','misterio / thriller','drama','clasicos','autoayuda','poesia','temas tristes / duelo','escenas explicitas (spicy)','violencia fuerte','nada en especial'];
    $('#dEvitarOtro').value = d['evitar'].split(',').map(s => s.trim()).filter(s => s && !conocidas.includes(norm(s))).join(', '); }
  if (d['ocasion']) $('#dOcasion').value = d['ocasion'];
  if (d['notas']) $('#dNotas').value = d['notas'];
  if (d['codigo'] && /^TB-[A-Z0-9]{5}$/.test(d['codigo'])) { actual.codigo = d['codigo']; $('#dCodigo').textContent = d['codigo']; }
  syncChips(); marcarSucio(); sugerir();
});

/* ---------- Curador ---------- */
const OCAS_TONO = { animar:['reconfortante','ligero','tierno','animar','reir'], ruptura:['sanacion','segundas oportunidades','agridulce','ruptura','reir'], logro:['empoderamiento','logro','competencia'], cumple:['divertido','adrenalina'], aniversario:['tierno','segundas oportunidades'], gracias:['reconfortante','tierno'] };
const puntaje = (b, c) => { let s = 0; const why = [];
  const like = b.generos.filter(g => c.gustos.has(g)); if (like.length) { s += 3 * like.length; why.push('le encanta ' + like.map(g => GL[g]).join(', ')); }
  const badG = b.generos.filter(g => c.evitar.has(g)); if (badG.length) { s -= 8 * badG.length; why.push('ojo: toca ' + badG.map(g => GL[g]).join(', ')); }
  const badT = b.eviteSi.filter(t => c.evitar.has(t)); if (badT.length) { s -= 10 * badT.length; why.push('ojo: toca ' + badT.map(t => GL[t]).join(', ')); }
  if (c.lee && b.lector.includes(c.lee)) { s += 2; why.push('va con lectora ' + LECT[c.lee]); }
  if (c.lee === 'casinolee') { if (b.longitud === 'corto') s += 2; if (b.longitud === 'largo') s -= 3; }
  if (c.lee === 'avido' && b.longitud === 'largo') s += 1;
  if (/#[2-9]/.test(b.titulo) && !/ya ley|segundo|continuaci|saga/.test(c.texto)) s -= 4;
  const hits = b.tono.filter(t => c.texto.includes(norm(t))); if (hits.length) { s += 2 * hits.length; why.push('coincide con: ' + hits.join(', ')); }
  for (const [k, tonos] of Object.entries(OCAS_TONO)) if (c.texto.includes(k)) { if (b.tono.some(t => tonos.includes(t))) { s += 2; why.push('encaja con la ocasión'); } break; }
  if (c.texto.includes(norm(b.autor)) || c.texto.includes(norm(b.titulo.split('(')[0].trim()))) { s -= 20; why.push('ojo: la ficha menciona este libro o autora'); }
  return { b, s, why };
};
const sugerir = () => {
  const r0 = leerForm();
  const c = { gustos: F.gustos, evitar: F.evitar, lee: r0.lee, texto: norm([r0.notas, r0.ocasion, r0.edad, r0.evitar_otro].join(' ')) };
  const r = CATALOGO.map(b => puntaje(b, c)).sort((a, z) => z.s - a.s), top = r[0];
  if (!top) { $('#sugerencia').innerHTML = '<p class="tease">El catálogo está vacío. Agrega libros en catalogo.js.</p>'; $('#alts').innerHTML = ''; return; }
  const lvl = top.s >= 8 ? 'Match fuerte' : top.s >= 4 ? 'Buen match' : top.s >= 0 ? 'Match tibio, revisa alternativas' : 'Nada encaja bien; conviene buscar otro título';
  $('#sugerencia').innerHTML = `<svg class="spark" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 1.5l2.6 7.9 7.9 2.6-7.9 2.6L12 22.5l-2.6-7.9L1.5 12l7.9-2.6z" fill="#FF7BAC"/></svg>
    <div class="lbl">Sugerencia del curador · ${esc(lvl)}</div>
    <p class="tease">${esc(top.b.teaser)}</p>
    <p class="real"><b>${esc(top.b.titulo)}</b> · ${esc(top.b.autor)}${top.b.goodreads ? ' · ★ ' + esc(top.b.goodreads.rating) : ''}</p>
    <div class="tags">${[...top.b.generos.map(g => GL[g] || g), top.b.longitud, ...top.b.eviteSi.map(t => 'toca: ' + (GL[t] || t))].map(t => `<span class="tag">${esc(t)}</span>`).join('')}</div>
    <p class="why">${esc(top.why.join(' · ') || 'Perfil general, sin coincidencias fuertes')}. Puntaje ${top.s}.</p>
    <div class="acts"><button class="btn2" type="button" data-usar="0">Usar este libro</button><button class="btn2" type="button" id="cpTease">Copiar teaser</button><span class="msg" id="cpMsg"></span></div>`;
  $('#alts').innerHTML = `<details class="card"><summary><h3>Alternativas</h3></summary>${r.slice(1, 4).map((x, i) => `<div class="alt"><div><b>${esc(x.b.titulo)}</b><span>${esc(x.why.join(' · ') || 'perfil general')}</span></div><div><em>${x.s} pts</em><button class="btn2" type="button" data-usar="${i + 1}">Usar</button></div></div>`).join('')}</details>`;
  $('#sugerencia').onclick = $('#alts').onclick = async e => {
    const u = e.target.closest('[data-usar]');
    if (u) { const x = r[+u.dataset.usar]; $('#dLibro').value = x.b.titulo + ' · ' + x.b.autor; if ($('#dEstado').value === 'nueva') $('#dEstado').value = 'en_curaduria'; marcarSucio(); $('#dLibro').focus(); return; }
    if (e.target.id === 'cpTease') { try { await navigator.clipboard.writeText(top.b.teaser); $('#cpMsg').textContent = 'Copiado'; } catch (_) { $('#cpMsg').textContent = 'Selecciona el texto para copiarlo'; } }
  };
};

window.addEventListener('beforeunload', e => { if (sucio) { e.preventDefault(); e.returnValue = ''; } });

/* ---------- Inicio ---------- */
(async () => {
  if (/type=recovery/.test(location.hash)) return; // lo maneja onAuthStateChange
  const { data } = await sb.auth.getSession(); entrar(data.session);
})();
}
