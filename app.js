/* Trendy Book · Formulario "Blind date with a book" */
{
const CFG = window.TRENDY_CONFIG || {};
const WA_NUMERO = (CFG.whatsappNumero || '').replace(/\D/g, '');

const GUSTOS=[['romance','Romance'],['romantasy','Romantasy'],['fantasia','Fantasía'],['misterio','Misterio / Thriller'],['drama','Drama / Contemporánea'],['humor','Humor / Ligero'],['clasicos','Clásicos'],['autoayuda','Autoayuda / Crecimiento'],['poesia','Poesía'],['sorpresa','Sorpréndanme']];
const EVITAR=[['romance','Romance'],['fantasia','Fantasía'],['misterio','Misterio / Thriller'],['drama','Drama'],['clasicos','Clásicos'],['autoayuda','Autoayuda'],['poesia','Poesía'],['triste','Temas tristes / duelo'],['spicy','Escenas explícitas (spicy)'],['violencia','Violencia fuerte'],['nada','Nada en especial']];
const LEE={avido:['Le encanta leer','Me encanta leer'],ocasional:['Lee de vez en cuando','Leo de vez en cuando'],casinolee:['Casi no lee, pero le gustaría','Casi no leo, pero me gustaría'],retomando:['Está retomando el hábito','Estoy retomando el hábito']};
const T={ /* [regalo, para mí] */
 edad:['¿Qué edad tiene, más o menos?','¿Qué edad tienes, más o menos?'],
 edadHelp:['O en qué etapa de su vida está. Con algo aproximado nos basta.','O en qué etapa de tu vida estás. Con algo aproximado nos basta.'],
 lee:['¿Qué tanto lee?','¿Qué tanto lees?'],
 gen:['¿Qué géneros le gustaría recibir?','¿Qué géneros te gustaría recibir?'],
 evitar:['¿Hay algo que definitivamente no quieras que le llegue?','¿Hay algo que definitivamente no quieras recibir?'],
 notasHelp:['Si está pasando por un momento especial, algo que le esté pasando, o cualquier detalle suelto que ayude.','Si estás pasando por un momento especial, algo que te esté pasando, o cualquier detalle suelto que ayude.'],
 idiomaLbl:['¿En qué idioma prefiere leer?','¿En qué idioma prefieres leer?'],
 colorH:['¿Cuál es su color favorito?','¿Cuál es tu color favorito?'],
 entregaHelp:['Selecciona cómo quieres enviar tu cita.','Selecciona cómo quieres recibir tu cita.'],
 fin:['Con esta información buscamos algo especialmente para quien la recibe, no al azar. Envíanos la ficha por WhatsApp para completar la compra.','Con esta información buscamos algo especialmente para ti, no al azar. Envíanos la ficha por WhatsApp para completar la compra.']
};
const S={para:'',lee:'',idioma:'',color:'',entrega:'',punto:'',pago:'transferencia',gustos:new Set(),evitar:new Set()};
const IDIOMA={es:'Español',en:'Inglés',cualquiera:'Cualquiera de los dos'};
const COLORES=[['Rosa','#F4A6C0'],['Rojo','#D64545'],['Morado','#9C6ADE'],['Lila','#CDB4F0'],['Azul','#5B8DEF'],['Celeste','#A8D8F0'],['Verde','#6FBF73'],['Verde menta','#B8E6CF'],['Amarillo','#F7D154'],['Naranja','#F59A5A'],['Durazno','#F4BEAE'],['Beige','#E6D5BF'],['Café','#8B5E3C'],['Negro','#2B2B2B'],['Sorpresa','']];
const ENTREGA={punto:'Sonsonate · Punto fijo (24 h)',domicilio:'Sonsonate · Entrega personalizada (24 h)',envio:'Envío a otro departamento (Boxful)'};
const PAGO={transferencia:'Transferencia'};
const FOTOS=[['producto.jpg','Una cita de Trendy Book: libro envuelto a mano en papel floral, sellado con cera, con separador, pin y detalles'],['foto-rosa.jpg','Cita de Trendy Book en papel de flores silvestres, con sello de cera rosa, borla y detalles'],['foto-amarilla.jpg','Cita de Trendy Book en papel de flores amarillas, con sello de cera dorado, borla y book review']];
FOTOS.slice(1).forEach(([f])=>{const i=new Image();i.src=f});
const nuevoCodigo=()=>{const a='ABCDEFGHJKLMNPQRSTUVWXYZ23456789',r=new Uint8Array(5);crypto.getRandomValues(r);return 'TB-'+[...r].map(n=>a[n%a.length]).join('')};
let codigo=nuevoCodigo(), guardadoFirma='';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const chips=(arr,el)=>{el.innerHTML=arr.map(([v,l])=>`<button class="chip" data-v="${v}" aria-pressed="false">${esc(l)}</button>`).join('')};
chips(GUSTOS,$('#gustos'));chips(EVITAR,$('#evitar'));
$('#colores').innerHTML=COLORES.map(([n,h])=>`<button class="sw${h?'':' sorpresa'}" data-v="${esc(n)}" aria-pressed="false"><i${h?` style-bg="${h}"`:''}></i>${esc(n)}</button>`).join('');
$$('#colores [style-bg]').forEach(i=>i.style.background=i.getAttribute('style-bg'));

let cur=0;const LAST=10;
/* paso -> [fase, texto de avance] */
const FASE=n=>n<=6?[1,`Pregunta ${n} de 6`]:n===7?[2,'Preparamos tu cita']:[3,`Coordinamos la entrega · ${n-7} de 2`];
const show=n=>{
  cur=n;$$('.step').forEach(s=>s.classList.toggle('on',+s.dataset.step===n));
  $('#prog').hidden=n===0||n===LAST;
  if(n>0&&n<LAST){const [f,t]=FASE(n);$('#progTxt').textContent=t;$('#progBar').style.width=(n/9*100)+'%';
    $$('.fases li').forEach(li=>{const k=+li.dataset.f;li.classList.toggle('on',k===f);li.classList.toggle('ok',k<f)});}
  $('#card').classList.toggle('unsealed',n!==LAST);
  {const [f,a]=FOTOS[n===0||n===LAST?0:(n%2?1:2)];const im=$('#foto');if(!im.src.endsWith(f)){im.src=f;im.alt=a;}}
  if(n===LAST)render();
  const f=document.querySelector(`.step[data-step="${n}"] input,.step[data-step="${n}"] textarea`);
  if(f&&matchMedia('(min-width:821px)').matches)setTimeout(()=>f.focus(),60);
  if(matchMedia('(max-width:820px)').matches)$('#card').scrollIntoView({block:'start',behavior:'smooth'});
};
const applyT=()=>{const i=S.para==='mi'?1:0;
  $$('[data-t]').forEach(el=>{const k=el.dataset.t;if(T[k])el.textContent=T[k][i]});
  ['avido','ocasional','casinolee','retomando'].forEach((k,j)=>{const b=document.querySelector(`[data-t="lee${j+1}"]`);if(b)b.textContent=LEE[k][i]});
  $('#wrapRecibe').hidden=S.para==='mi';
};

document.addEventListener('click',e=>{
  const go=e.target.closest('[data-go]'); if(go)return show(+go.dataset.go);
  if(e.target.closest('[data-next]')&&!e.target.closest('[disabled]'))return show(Math.min(cur+1,LAST));
  if(e.target.closest('[data-back]'))return show(Math.max(cur-1,0));
  const b=e.target.closest('.opt,.chip,.sw'); if(!b)return;
  const single=b.parentElement.dataset.single, multi=b.parentElement.dataset.multi, v=b.dataset.v;
  if(single){
    S[single]=S[single]===v&&single!=='para'?'':v;
    $$(`[data-single="${single}"] > [data-v]`).forEach(c=>c.setAttribute('aria-pressed',c.dataset.v===S[single]));
    if(single==='para'){$('#nextPara').disabled=false;applyT();}
    if(single==='entrega'){$('#wrapPunto').hidden=S.entrega!=='punto';$('#wrapDir').hidden=!['domicilio','envio'].includes(S.entrega);}
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
/* Fecha: mínimo 48 h */
const abrirFecha=()=>{const f=$('#fecha');try{f.showPicker()}catch(_){f.focus();f.click()}};
$('#btnFecha').addEventListener('click',abrirFecha);
$('#fecha').addEventListener('change',()=>{const t=fechaTxt();$('#fechaTxt').textContent=t||'Seleccionar fecha';$('#btnFecha').setAttribute('aria-pressed',!!t)});
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.matches('input[type=text],input[type=tel]')){e.preventDefault();show(Math.min(cur+1,LAST))}});

const lbl=(arr,set)=>arr.filter(([v])=>set.has(v)).map(([,l])=>l).join(', ');
const fechaTxt=()=>{const f=$('#fecha').value;if(!f)return '';const d=new Date(f+'T12:00:00');return d.toLocaleDateString('es-SV',{weekday:'long',day:'numeric',month:'long'})};
const ficha=()=>{
  const mi=S.para==='mi', v=id=>$('#'+id).value.trim();
  const ev=[lbl(EVITAR,S.evitar),v('evitarOtro')].filter(Boolean).join(', ');
  const limpia=rows=>rows.filter(([,x])=>x);
  return [
    ['1 · Gustos',limpia([
      ['Para',mi?'Para mí':'Regalo'],
      ['Edad / etapa',v('edad')],
      ['Lee',S.lee?LEE[S.lee][mi?1:0]:''],
      ['Idioma',IDIOMA[S.idioma]||''],
      [mi?'Me encanta':'Le encanta',lbl(GUSTOS,S.gustos)],
      ['Evitar',ev],
      ['Notas',v('notas')]])],
    ['2 · La cita',limpia([
      ['Para cuándo',fechaTxt()],
      ['Color favorito',S.color],
  ])],
    ['3 · Entrega',limpia([
      ['Entrega',ENTREGA[S.entrega]||''],
      ['Punto',S.entrega==='punto'?S.punto:''],
      ['Dirección completa',['domicilio','envio'].includes(S.entrega)?v('direccion'):''],
      ['Quién recibe',mi?'':v('nombrePara')],
      ['Tel. de quien recibe',mi?'':v('telRecibe')],
      ['Pago',PAGO[S.pago]||''],
      ['De',v('nombre')],
      ['WhatsApp',v('telefono')],
      ['Código',codigo]])]
  ].filter(([,r])=>r.length);
};
const mensaje=()=>{const mi=S.para==='mi';
  return `Hola Trendy Book 🩷 Quiero ${mi?'darme':'regalar'} una cita a ciegas con un libro.\n\n`+ficha().map(([t,r])=>`${t}\n`+r.map(([k,x])=>`${k}: ${x}`).join('\n')).join('\n\n')+`\n\n✨`};
/* Guarda la ficha en Supabase. Si la clienta edita después de enviar, se guarda como ficha nueva con otro código. */
const registro=()=>{const v=id=>$('#'+id).value.trim()||null;return{
  codigo, para:S.para||'regalo', nombre:v('nombre'), nombre_para:S.para==='mi'?null:v('nombrePara'),
  edad:v('edad'), lee:S.lee||null, gustos:[...S.gustos], evitar:[...S.evitar].filter(x=>x!=='nada'),
  evitar_otro:v('evitarOtro'), ocasion:null, notas:v('notas'),
  fecha_deseada:v('fecha'), lo_antes_posible:false,
  dedicatoria:null, telefono_recibe:S.para==='mi'?null:v('telRecibe'),
  entrega:S.entrega||null, punto:S.entrega==='punto'?(S.punto||null):null,
  direccion:['domicilio','envio'].includes(S.entrega)?v('direccion'):null,
  pago:S.pago||null, telefono:v('telefono'), idioma:S.idioma||null, color:S.color||null}};
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
  $('#sum').innerHTML=ficha().map(([t,r])=>`<section class="sumg"><h3>${esc(t)}</h3><dl>${r.map(([k,x])=>`<div><dt>${esc(k)}</dt><dd>${esc(x)}</dd></div>`).join('')}</dl></section>`).join('');
  $('#wa').href='https://wa.me/'+(WA_NUMERO||'')+'?text='+encodeURIComponent(mensaje());
  $('#copied').hidden=true;
};
$('#copy').addEventListener('click',async()=>{guardar();try{await navigator.clipboard.writeText(mensaje());$('#copied').hidden=false}catch(_){$('#copied').textContent='No se pudo copiar; selecciona el texto de la ficha.';$('#copied').hidden=false}});
{const d=new Date(Date.now()+2*864e5);$('#fecha').min=new Date(d-d.getTimezoneOffset()*6e4).toISOString().slice(0,10)}
if(WA_NUMERO)$('#waTxt').textContent=WA_NUMERO.length===11&&WA_NUMERO.startsWith('503')?`+503 ${WA_NUMERO.slice(3,7)} ${WA_NUMERO.slice(7)}`:'+'+WA_NUMERO;
}
