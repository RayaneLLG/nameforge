/* =========================================================
   NAMEFORGE GENERATOR ENGINE
   ---------------------------------------------------------
   Generic client-side name generation engine.
   Generator-specific data lives in js/data/.
   Storage remains handled by nameforge-storage.js.
========================================================= */
window.NameForge=window.NameForge||{};

(function(){
  function randomItem(a){return a[Math.floor(Math.random()*a.length)];}
  function clean(v){return String(v||'').trim();}
  function capitalize(v){v=clean(v);return v?v.charAt(0).toUpperCase()+v.slice(1):v;}
  function getData(generator,style){
    const group=window.NameForgeData&&window.NameForgeData[generator];
    if(!group) throw new Error('NameForge data not loaded: '+generator);
    return group[style]||group.default||Object.values(group)[0];
  }
  function makeName(data,length){
    let name=randomItem(data.prefixes||[])+randomItem(data.suffixes||[]);
    if(length==='short') name=(randomItem(data.prefixes||[])+randomItem(data.suffixes||[]).slice(0,2));
    if(length==='long') name+=randomItem(data.suffixes||[]);
    return capitalize(name.replace(/([aeiou])\1{2,}/gi,'$1'));
  }
  function generate(options={}){
    const generator=options.generator||'fantasy';
    const style=options.style;
    const length=options.length||'medium';
    const quantity=Number(options.quantity||9);
    const data=getData(generator,style);
    const out=[]; const seen=new Set(); let attempts=0;
    while(out.length<quantity&&attempts<quantity*100){
      attempts++; const name=makeName(data,length);
      if(!name||seen.has(name)) continue;
      seen.add(name);
      out.push({name,description:randomItem(data.descriptions||[]),style:data.label||style||'',icon:data.icon||'✨',bestFor:data.bestFor||''});
    }
    return out;
  }
  function copy(name){
    if(navigator.clipboard&&navigator.clipboard.writeText) return navigator.clipboard.writeText(name);
    const t=document.createElement('textarea'); t.value=name; document.body.appendChild(t); t.select(); document.execCommand('copy'); t.remove(); return Promise.resolve();
  }
  function actions(item,generator,style){
    const existing=typeof findNameForgeEntry==='function'?findNameForgeEntry(item.name,generator):null;
    const liked=!!(existing&&existing.liked), saved=!!(existing&&existing.saved);
    return `<div class="nf-actions"><button type="button" class="nf-action" data-action="save" data-name="${esc(item.name)}">${saved?'🔖 Saved':'🔖 Save'}</button><button type="button" class="nf-action" data-action="like" data-name="${esc(item.name)}">${liked?'❤️ Liked':'🤍 Like'}</button></div><div class="nf-note-row"><button type="button" class="nf-action" data-action="note" data-name="${esc(item.name)}">📝 Note</button><div class="nf-rating" aria-label="Rate"><button type="button" data-action="rate" data-rating="1" data-name="${esc(item.name)}">☆</button><button type="button" data-action="rate" data-rating="2" data-name="${esc(item.name)}">☆</button><button type="button" data-action="rate" data-rating="3" data-name="${esc(item.name)}">☆</button><button type="button" data-action="rate" data-rating="4" data-name="${esc(item.name)}">☆</button><button type="button" data-action="rate" data-rating="5" data-name="${esc(item.name)}">☆</button></div></div>`;
  }
  function esc(v){return String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
  function render(container,items,options={}){
    if(!container) return;
    container.innerHTML=items.map(item=>`<article class="result"><div class="result-name">${esc(item.name)}</div><div class="result-style">${item.icon} ${esc(item.style)}</div><p class="result-description">✨ ${esc(item.description)}</p><div class="best-for"><strong>Best for:</strong> ${esc(item.bestFor)}</div>${actions(item,options.generator,options.style)}<button type="button" class="copy" data-action="copy" data-name="${esc(item.name)}">📋 Copy name</button></article>`).join('');
    container.querySelectorAll('[data-action]').forEach(btn=>btn.addEventListener('click',()=>handleAction(btn,options)));
  }
  function handleAction(btn,options){
    const name=btn.dataset.name, generator=options.generator, style=options.style;
    try{
      if(btn.dataset.action==='copy'){copy(name).then(()=>{btn.textContent='✓ Copied';setTimeout(()=>btn.textContent='📋 Copy name',1200);});}
      else if(btn.dataset.action==='save'&&typeof saveName==='function'){const e=findNameForgeEntry(name,generator);e&&e.saved?unsaveName(name,generator):saveName(name,generator,style); options.refresh&&options.refresh();}
      else if(btn.dataset.action==='like'&&typeof likeName==='function'){likeName(name,generator,style); options.refresh&&options.refresh();}
      else if(btn.dataset.action==='note'&&typeof updateNameNote==='function'){const old=findNameForgeEntry(name,generator);const note=prompt('Private note for '+name,old&&old.note||'');if(note!==null){updateNameNote(name,note);options.refresh&&options.refresh();}}
      else if(btn.dataset.action==='rate'){localStorage.setItem('nameforge_rating_'+name,btn.dataset.rating);btn.parentElement.querySelectorAll('button').forEach((b,i)=>b.textContent=i<Number(btn.dataset.rating)?'★':'☆');}
    }catch(e){console.error('NameForge action error',e);}
  }
  window.NameForge.generate=generate;
  window.NameForge.render=render;
  window.NameForge.copy=copy;
  window.NameForge.getData=getData;
})();
