/* Trendy Book · Formulario "Blind date with a book" */
{
const CFG = window.TRENDY_CONFIG || {};
const WA_NUMERO = (CFG.whatsappNumero || '').replace(/\D/g, '');

const GUSTOS=[['romance','Romance'],['romantasy','Romantasy'],['fantasia','Fantasía'],['misterio','Misterio / Thriller'],['drama','Drama / Contemporánea'],['humor','Humor / Ligero'],['clasicos','Clásicos'],['autoayuda','Autoayuda / Crecimiento'],['poesia','Poesía'],['sorpresa','Sorpréndanme']];
const EVITAR=[['romance','Romance'],['fantasia','Fantasía'],['misterio','Misterio / Thriller'],['drama','Drama'],['clasicos','Clásicos'],['autoayuda','Autoayuda'],['poesia','Poesía'],['triste','Temas tristes / duelo'],['spicy','Escenas explícitas (spicy)'],['violencia','Violencia fuerte'],['nada','Nada en especial']];
const OCAS={regalo:['Cumpleaños','Aniversario','Para dar las gracias','Para animarla','Navidad','Sin motivo'],mi:['Darme un gusto','Terminé un libro','Fue una semana larga','Celebrar un logro','Navidad','Sin motivo']};
const LEE={avido:['Le encanta leer','Me encanta leer'],ocasional:['Lee de vez en cuando','Leo de vez en cuando'],casinolee:['Casi no lee, pero le gustaría','Casi no leo, pero me gustaría'],retomando:['Está retomando el hábito','Estoy retomando el hábito']};
const T={ /* [regalo, para mí] */
 edad:['¿Qué edad tiene, más o menos?','¿Qué edad tienes, más o menos?'],
 edadHelp:['O en qué etapa de su vida está. Con algo aproximado nos basta.','O en qué etapa de tu vida estás. Con algo aproximado nos basta.'],
 lee:['¿Qué tanto lee?','¿Qué tanto lees?'],
 gen:['¿Qué géneros le encantan?','¿Qué géneros te encantan?'],
 evitar:['¿Hay algo que definitivamente no quieras que le llegue?','¿Hay algo que definitivamente no quieras recibir?'],
 notasHelp:['Si está pasando por un momento especial, algo que le esté pasando, o cualquier detalle suelto que ayude.','Si estás pasando por un momento especial, algo que te esté pasando, o cualquier detalle suelto que ayude.'],
 fin:['Con esto le buscamos algo que sienta que fue elegido para ella, no al azar. Envíanos la ficha por WhatsApp y seguimos por ahí.','Con esto te buscamos algo que sientas que fue elegido para ti, no al azar. Envíanos la ficha por WhatsApp y seguimos por ahí.']
};
const S={para:'',lee:'',ocasion:'',gustos:new Set(),evitar:new Set()};
const nuevoCodigo=()=>{const a='ABCDEFGHJKLMNPQRSTUVWXYZ23456789',r=new Uint8Array(5);crypto.getRandomValues(r);return 'TB-'+[...r].map(n=>a[n%a.length]).join('')};
let codigo=nuevoCodigo(), guardadoFirma='';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const chips=(arr,el)=>{el.innerHTML=arr.map(([v,l])=>`<button class="chip" data-v="${v}" aria-pressed="false">${esc(l)}</button>`).join('')};
chips(GUSTOS,$('#gustos'));chips(EVITAR,$('#evitar'));
const drawOcas=()=>{const k=S.para||'regalo';chips(OCAS[k].map(o=>[o,o]),$('#ocasion'));$$('#ocasion .chip').forEach(c=>c.setAttribute('aria-pressed',c.dataset.v===S.ocasion))};
drawOcas();

let cur=0;const LAST=8;
const show=n=>{
  cur=n;$$('.step').forEach(s=>s.classList.toggle('on',+s.dataset.step===n));
  $('#prog').hidden=n===0||n===LAST;
  $('#progTxt').textContent=`Paso ${n} de 7`;$('#progBar').style.width=(n/7*100)+'%';
  $('#card').classList.toggle('unsealed',n!==LAST);
  if(n===LAST)render();
  const f=document.querySelector(`.step[data-step="${n}"] input,.step[data-step="${n}"] textarea`);
  if(f&&matchMedia('(min-width:821px)').matches)setTimeout(()=>f.focus(),60);
  if(matchMedia('(max-width:820px)').matches)$('#card').scrollIntoView({block:'start',behavior:'smooth'});
};
const applyT=()=>{const i=S.para==='mi'?1:0;
  $$('[data-t]').forEach(el=>{const k=el.dataset.t;if(T[k])el.textContent=T[k][i]});
  ['avido','ocasional','casinolee','retomando'].forEach((k,j)=>{const b=document.querySelector(`[data-t="lee${j+1}"]`);if(b)b.textContent=LEE[k][i]});
  $('#wrapPara').hidden=S.para==='mi';drawOcas();
};

document.addEventListener('click',e=>{
  const go=e.target.closest('[data-go]'); if(go)return show(+go.dataset.go);
  if(e.target.closest('[data-next]')&&!e.target.closest('[disabled]'))return show(Math.min(cur+1,LAST));
  if(e.target.closest('[data-back]'))return show(Math.max(cur-1,0));
  const b=e.target.closest('.opt,.chip'); if(!b)return;
  const single=b.parentElement.dataset.single, multi=b.parentElement.dataset.multi, v=b.dataset.v;
  if(single){
    S[single]=S[single]===v&&single!=='para'?'':v;
    [...b.parentElement.children].forEach(c=>c.setAttribute('aria-pressed',c.dataset.v===S[single]));
    if(single==='para'){$('#nextPara').disabled=false;applyT();}
    if(single==='ocasion'&&S.ocasion)$('#ocasionOtro').value='';
  }else if(multi){
    const set=S[multi];
    if(set.has(v))set.delete(v);else{
      set.add(v);
      if(multi==='evitar'){if(v==='nada'){set.clear();set.add('nada')}else set.delete('nada')}
      if(multi==='gustos'){if(v==='sorpresa'){set.clear();set.add('sorpresa')}else set.delete('sorpresa')}
    }
    [...b.parentElement.children].forEach(c=>c.setAttribute('aria-pressed',set.has(c.dataset.v)));
  }
});
$('#ocasionOtro').addEventListener('input',()=>{if($('#ocasionOtro').value){S.ocasion='';$$('#ocasion .chip').forEach(c=>c.setAttribute('aria-pressed','false'))}});
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.matches('input[type=text]')){e.preventDefault();show(Math.min(cur+1,LAST))}});

const lbl=(arr,set)=>arr.filter(([v])=>set.has(v)).map(([,l])=>l).join(', ');
const ficha=()=>{
  const mi=S.para==='mi', v=id=>$('#'+id).value.trim();
  const ev=[lbl(EVITAR,S.evitar),v('evitarOtro')].filter(Boolean).join(', ');
  return [
    ['Para',mi?'Para mí':'Regalo'],
    ['Se llama',mi?'':v('nombrePara')],
    ['Edad / etapa',v('edad')],
    ['Lee',S.lee?LEE[S.lee][mi?1:0]:''],
    [mi?'Me encanta':'Le encanta',lbl(GUSTOS,S.gustos)],
    ['Evitar',ev],
    ['Ocasión',S.ocasion||v('ocasionOtro')],
    ['Notas',v('notas')],
    ['De',v('nombre')],
    ['Código',codigo]
  ].filter(([,x])=>x);
};
const mensaje=()=>{const mi=S.para==='mi';
  return `Hola Trendy Book 🤍 Quiero ${mi?'darme':'regalar'} una cita a ciegas con un libro.\n\nFicha de la cita\n`+ficha().map(([k,x])=>`${k}: ${x}`).join('\n')+`\n\n✨`};
/* Guarda la ficha en Supabase. Si la clienta edita después de enviar, se guarda como ficha nueva con otro código. */
const registro=()=>{const v=id=>$('#'+id).value.trim()||null;return{
  codigo, para:S.para||'regalo', nombre:v('nombre'), nombre_para:S.para==='mi'?null:v('nombrePara'),
  edad:v('edad'), lee:S.lee||null, gustos:[...S.gustos], evitar:[...S.evitar].filter(x=>x!=='nada'),
  evitar_otro:v('evitarOtro'), ocasion:S.ocasion||v('ocasionOtro'), notas:v('notas')}};
const guardar=()=>{
  if(!CFG.supabaseUrl||!CFG.supabaseAnonKey)return;
  const firma=JSON.stringify({...registro(),codigo:''});
  if(firma===guardadoFirma)return;
  if(guardadoFirma){codigo=nuevoCodigo();render()}
  guardadoFirma=firma;
  fetch(CFG.supabaseUrl+'/rest/v1/fichas',{method:'POST',keepalive:true,
    headers:{apikey:CFG.supabaseAnonKey,Authorization:'Bearer '+CFG.supabaseAnonKey,'Content-Type':'application/json',Prefer:'return=minimal'},
    body:JSON.stringify(registro())}).then(r=>{if(!r.ok)guardadoFirma=''}).catch(()=>{guardadoFirma=''});
};
$('#wa').addEventListener('click',guardar);
const render=()=>{
  $('#sum').innerHTML=ficha().map(([k,x])=>`<div><dt>${esc(k)}</dt><dd>${esc(x)}</dd></div>`).join('')||'<div><dd>Sin datos todavía</dd></div>';
  $('#wa').href='https://wa.me/'+(WA_NUMERO||'')+'?text='+encodeURIComponent(mensaje());
  $('#copied').hidden=true;
};
$('#copy').addEventListener('click',async()=>{guardar();try{await navigator.clipboard.writeText(mensaje());$('#copied').hidden=false}catch(_){$('#copied').textContent='No se pudo copiar; selecciona el texto de la ficha.';$('#copied').hidden=false}});
if(WA_NUMERO)$('#waTxt').textContent='+'+WA_NUMERO;
}
