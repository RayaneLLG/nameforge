window.NameForge=window.NameForge||{};
(function(){
 function randomItem(a){return a&&a.length?a[Math.floor(Math.random()*a.length)]:'';}
 function cap(v){v=String(v||'').trim();return v?v.charAt(0).toUpperCase()+v.slice(1):v;}
 function dataFor(generator,style){return NameForgeStyles.resolve(generator,style,window.NameForgeData||{});}
 function normalize(s){return cap(String(s||'').replace(/[^A-Za-zÀ-ÿ0-9' -]/g,'').replace(/\s+/g,' ').trim());}
 function buildBase(d,length){
  var p=randomItem(d.prefixes)||'Ael',s=randomItem(d.suffixes)||'dor',m=randomItem(d.middle||[]),n;
  if(length==='short') n=p+(s.length>4?s.slice(0,Math.max(2,Math.ceil(s.length/2))):s);
  else if(length==='long') n=p+m+s;
  else n=p+s;
  n=normalize(n.replace(/([aeiou])\1{2,}/gi,'$1').replace(/([A-Za-z])\1{2,}/gi,'$1$1'));
  return n;
 }
 function generateName(d,length,format,gender){
  var n=buildBase(d,length);
  if(format==='full'){
   var last=buildBase(d,length==='short'?'medium':length);
   var guard=0;while(last===n&&guard++<5)last=buildBase(d,length==='short'?'medium':length);
   n=n+' '+last;
  }else if(format==='group'){
   var g=randomItem(d.groupTypes||['Clan','House','Order','Guild','Realm']);n=g+' '+n;
  }else if(Math.random()<.32){
   n=n+' '+randomItem(d.titles||['the Brave','the Ancient','the Silent','the Wise','the Guardian']);
  }
  if(gender==='female') n=randomItem(d.femaleStarts||['Ael','Ela','Lira','Mira','Sera','Nyla','Yuna','Aria'])+(n.length>4?n.slice(Math.min(3,n.length-1)):n);
  if(gender==='male') n=randomItem(d.maleStarts||['Kael','Ryn','Thar','Aren','Darin','Kian'])+(n.length>4?n.slice(Math.min(3,n.length-1)):n);
  return normalize(n);
 }
 function generate(o){
  o=o||{};var d=dataFor(o.generator||'fantasy',o.style||'warrior'),out=[],seen=new Set(),tries=0,q=o.quantity||9;
  while(out.length<q&&tries<q*150){
   tries++;var n=generateName(d,o.length||'medium',o.format||'title',o.gender||'any');
   if(!n||seen.has(n))continue;seen.add(n);
   out.push({name:n,description:randomItem(d.descriptions)||'✨ A unique NameForge name shaped for this style.',style:d.label||o.style,icon:d.icon||'✨',bestFor:d.bestFor||'characters and fictional worlds',tone:d.tone||'Distinctive • memorable • thematic'});
  }
  return out;
 }
 function copy(n){if(navigator.clipboard&&navigator.clipboard.writeText)return navigator.clipboard.writeText(n);var t=document.createElement('textarea');t.value=n;document.body.appendChild(t);t.select();document.execCommand('copy');t.remove();return Promise.resolve();}
 function esc(v){return String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\"/g,'&quot;').replace(/'/g,'&#39;');}
 function actions(item,generator,style){
  var e=typeof findNameForgeEntry==='function'?findNameForgeEntry(item.name,generator):null,liked=!!(e&&e.liked),saved=!!(e&&e.saved),rating=localStorage.getItem('nameforge_rating_'+item.name)||0;
  return `<div class="nf-actions"><button class="nf-action" data-action="save" data-name="${esc(item.name)}">${saved?'🔖 Saved':'🔖 Save'}</button><button class="nf-action" data-action="like" data-name="${esc(item.name)}">${liked?'❤️ Liked':'🤍 Like'}</button></div><div class="nf-note-row"><button class="nf-action" data-action="note" data-name="${esc(item.name)}">📝 Note</button><div class="nf-rating"><span>Rate:</span><span class="nf-stars">${[1,2,3,4,5].map(i=>`<button data-action="rate" data-rating="${i}" data-name="${esc(item.name)}">${i<=Number(rating)?'★':'☆'}</button>`).join('')}</span></div></div>`;
 }
 function render(c,items,o){
  if(!c)return;c.innerHTML=items.map(i=>`<article class="result"><div class="result-name">${esc(i.name)}</div><div class="result-style">${i.icon} ${esc(i.style)}</div><div class="result-tone">${esc(i.tone)}</div><p class="result-description">${esc(i.description)}</p><div class="best-for"><strong>Ideal for:</strong> ${esc(i.bestFor)}</div>${actions(i,o.generator,o.style)}<button class="copy" data-action="copy" data-name="${esc(i.name)}">📋 Copy name</button></article>`).join('');c.querySelectorAll('[data-action]').forEach(b=>b.addEventListener('click',function(){handle(b,o);}));
 }
 function handle(b,o){
  var n=b.dataset.name,g=o.generator,s=o.style;try{
   if(b.dataset.action==='copy')copy(n).then(function(){b.textContent='✓ Copied';setTimeout(function(){b.textContent='📋 Copy name';},1200);});
   else if(b.dataset.action==='save'&&typeof saveName==='function'){var e=findNameForgeEntry(n,g);e&&e.saved?unsaveName(n,g):saveName(n,g,s);o.refresh&&o.refresh();}
   else if(b.dataset.action==='like'&&typeof likeName==='function'){likeName(n,g,s);o.refresh&&o.refresh();}
   else if(b.dataset.action==='note'&&typeof updateNameNote==='function'){var e=findNameForgeEntry(n,g),note=prompt('Private note for '+n,e&&e.note||'');if(note!==null)updateNameNote(n,note);o.refresh&&o.refresh();}
   else if(b.dataset.action==='rate'){localStorage.setItem('nameforge_rating_'+n,b.dataset.rating);b.parentElement.querySelectorAll('button').forEach(function(x,i){x.textContent=i<Number(b.dataset.rating)?'★':'☆';});}
  }catch(e){console.error(e);}
 }
 window.NameForge.generate=generate;window.NameForge.render=render;window.NameForge.copy=copy;
})();