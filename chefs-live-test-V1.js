/* My Table — Chef Discovery Live Test V1
   Drop this file after chefs-guide-data-V26.62.js in index.html:
   <script src="chefs-live-test-V1.js"></script>
*/
(function(){
  'use strict';

  function norm(s){
    return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
  }
  function esc(s){
    return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }
  function boot(){
    const data=window.CHEF_GUIDE_DATA||{};
    const places=Array.isArray(window.RESTAURANTS)?window.RESTAURANTS:[];
    const chefs=Array.isArray(data.chefs)?data.chefs:[];
    const recs=Array.isArray(data.recommendations)?data.recommendations:[];
    if(!chefs.length && !recs.length)return;

    const byKey=new Map();
    function key(name,city){return norm(name)+'|'+norm(city)}
    function recsFor(p){
      const out=[];
      if(Array.isArray(p.chef_recommendations))out.push(...p.chef_recommendations);
      const extra=byKey.get(key(p.name,p.city))||[];
      out.push(...extra);
      const seen=new Set();
      return out.filter(r=>{
        const k=(r.chef_id||r.chef_name||'')+'|'+key(r.restaurant_name||p.name,r.city||p.city);
        if(seen.has(k))return false; seen.add(k); return true;
      });
    }
    recs.forEach(r=>{
      const k=key(r.restaurant_name,r.city);
      if(!byKey.has(k))byKey.set(k,[]);
      byKey.get(k).push(r);
    });

    const chefMap=new Map();
    chefs.forEach(c=>chefMap.set(c.chef_id,c));
    recs.forEach(r=>{if(r.chef_id&&!chefMap.has(r.chef_id))chefMap.set(r.chef_id,{chef_id:r.chef_id,chef_name:r.chef_name||r.chef_id,source:r.source,source_url:r.source_url})});
    places.forEach(p=>recsFor(p).forEach(r=>{if(r.chef_id&&!chefMap.has(r.chef_id))chefMap.set(r.chef_id,{chef_id:r.chef_id,chef_name:r.chef_name||r.chef_id})}));

    const restaurantLookup=new Map();
    places.forEach(p=>restaurantLookup.set(key(p.name,p.city),p));

    const allRecByChef=new Map();
    recs.forEach(r=>{
      if(!r.chef_id)return;
      if(!allRecByChef.has(r.chef_id))allRecByChef.set(r.chef_id,[]);
      allRecByChef.get(r.chef_id).push(r);
    });
    places.forEach(p=>recsFor(p).forEach(r=>{
      if(!r.chef_id)return;
      if(!allRecByChef.has(r.chef_id))allRecByChef.set(r.chef_id,[]);
      const arr=allRecByChef.get(r.chef_id);
      const k=key(p.name,p.city)+'|'+r.chef_id;
      if(!arr.some(x=>key(x.restaurant_name,p.city||x.city)+'|'+x.chef_id===k))arr.push({...r,restaurant_name:p.name,city:p.city,country:p.country});
    }));

    const style=document.createElement('style');
    style.textContent=`
      #mytableChefBtn{border:1px solid #e5e7eb;background:#fff;border-radius:13px;padding:10px 12px;font:inherit;cursor:pointer}
      #mytableChefBtn:hover{background:#fafafa}
      #mytableChefOverlay{display:none;position:fixed;inset:0;background:rgba(17,24,39,.48);z-index:10000;align-items:flex-end;justify-content:center;padding:12px}
      #mytableChefOverlay.open{display:flex}
      #mytableChefCard{background:#fff;width:min(900px,100%);max-height:90vh;overflow:auto;border-radius:24px;padding:20px;box-shadow:0 20px 60px rgba(0,0,0,.25)}
      #mytableChefHead{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}
      #mytableChefHead h2{margin:0;font-size:25px}
      #mytableChefClose{border:0;background:#f3f4f6;border-radius:50%;width:34px;height:34px;font-size:20px;cursor:pointer}
      #mytableChefSearch{width:100%;box-sizing:border-box;border:1px solid #e5e7eb;border-radius:12px;padding:11px 13px;margin:14px 0}
      #mytableChefGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}
      .mytable-chef-card{border:1px solid #e5e7eb;background:#fff;border-radius:15px;padding:12px;text-align:left;cursor:pointer}
      .mytable-chef-card:hover{background:#fafafa}
      .mytable-chef-card strong{display:block;font-size:13px}
      .mytable-chef-card small{display:block;color:#6b7280;margin-top:4px;font-size:10px}
      #mytableChefResults{margin-top:14px}
      .mytable-chef-result{border-top:1px solid #eee;padding:12px 0}
      .mytable-chef-result strong{font-size:14px}
      .mytable-chef-result small{display:block;color:#6b7280;margin-top:3px}
      .mytable-chef-result p{margin:6px 0;color:#4b5563;font-size:12px}
      .mytable-chef-result a{color:#6d28d9;font-weight:700;text-decoration:none}
      @media(max-width:850px){
        #mytableChefBtn{display:none}
        #mytableChefGrid{grid-template-columns:1fr}
        #mytableChefCard{max-height:88vh;padding:16px}
      }
    `;
    document.head.appendChild(style);

    const btn=document.createElement('button');
    btn.id='mytableChefBtn';
    btn.textContent='👨‍🍳 Chefs';
    const top=document.querySelector('.topbar');
    if(top)top.insertBefore(btn,document.getElementById('addBtn')||null);

    const overlay=document.createElement('div');
    overlay.id='mytableChefOverlay';
    overlay.innerHTML=`
      <div id="mytableChefCard">
        <div id="mytableChefHead"><div><h2>👨‍🍳 Chefs</h2><div style="color:#6b7280;font-size:12px;margin-top:4px">Les recommandations chefs déjà présentes dans My Table, reliées au restaurant canonique.</div></div><button id="mytableChefClose">×</button></div>
        <input id="mytableChefSearch" placeholder="Rechercher un chef…">
        <div id="mytableChefGrid"></div>
        <div id="mytableChefResults"></div>
      </div>`;
    document.body.appendChild(overlay);

    const grid=overlay.querySelector('#mytableChefGrid');
    const results=overlay.querySelector('#mytableChefResults');
    const search=overlay.querySelector('#mytableChefSearch');

    function chefRows(){
      const q=norm(search.value);
      return [...chefMap.values()]
        .map(c=>({c,count:(allRecByChef.get(c.chef_id)||[]).length}))
        .filter(x=>!q||norm(x.c.chef_name).includes(q))
        .sort((a,b)=>b.count-a.count||xname(a.c.chef_name).localeCompare(xname(b.c.chef_name),'fr'));
    }
    function xname(s){return String(s||'')}
    function renderChefCards(){
      grid.innerHTML='';
      chefRows().forEach(({c,count})=>{
        const b=document.createElement('button');
        b.className='mytable-chef-card';
        b.innerHTML='<strong>👨‍🍳 '+esc(c.chef_name)+'</strong><small>'+count+' recommandation'+(count>1?'s':'')+'</small>';
        b.onclick=()=>showChef(c.chef_id);
        grid.appendChild(b);
      });
    }
    function showChef(id){
      const c=chefMap.get(id);
      const rr=allRecByChef.get(id)||[];
      results.innerHTML='<div style="font-weight:800;margin-bottom:4px">Sélection de '+esc(c?.chef_name||id)+'</div>'+
        (rr.length?rr.map(r=>{
          const p=restaurantLookup.get(key(r.restaurant_name,r.city));
          const mapUrl=p?.maps_url||('https://www.google.com/maps/search/?api=1&query='+encodeURIComponent((r.restaurant_name||'')+' '+(r.city||'')));
          return '<div class="mytable-chef-result"><strong>'+esc(r.restaurant_name||'Restaurant')+'</strong><small>'+esc(r.city||'')+(r.country?' · '+esc(r.country):'')+'</small>'+
            (r.comment?'<p>'+esc(r.comment)+'</p>':'')+
            (r.dish?'<p><em>À goûter : '+esc(r.dish)+'</em></p>':'')+
            (p?'<button class="mytable-chef-open" data-name="'+esc(p.name)+'" data-city="'+esc(p.city)+'" style="border:0;background:#111;color:#fff;border-radius:9px;padding:7px 10px;cursor:pointer;font:inherit;font-size:11px">Ouvrir dans My Table</button> ':'')+
            '<a target="_blank" rel="noopener" href="'+mapUrl+'">Maps ↗</a>'+
            (r.source_url?' · <a target="_blank" rel="noopener" href="'+r.source_url+'">Source</a>':'')+
            '</div>';
        }).join(''):'<p style="color:#6b7280">Aucune recommandation structurée pour ce chef dans la version actuelle.</p>');
    }
    function open(){
      overlay.classList.add('open');
      search.value='';
      results.innerHTML='';
      renderChefCards();
      setTimeout(()=>search.focus(),50);
    }
    results.addEventListener('click',e=>{
      const b=e.target.closest('.mytable-chef-open');
      if(!b)return;
      const p=restaurantLookup.get(key(b.dataset.name,b.dataset.city));
      if(p && typeof window.openDetail==='function'){
        close();
        window.openDetail(p);
      }
    });
    function close(){overlay.classList.remove('open')}
    btn.onclick=open;
    overlay.querySelector('#mytableChefClose').onclick=close;
    overlay.addEventListener('click',e=>{if(e.target===overlay)close()});
    search.oninput=renderChefCards;

    /* Mobile: reuse the existing profile/navigation area without changing the core app. */
    const nav=document.querySelector('.mobile-bottom-nav');
    if(nav){
      const b=document.createElement('button');
      b.innerHTML='<span>♨</span><small>Chefs</small>';
      b.onclick=open;
      nav.insertBefore(b,nav.lastElementChild);
    }

    /* Add a small chef indicator to currently rendered restaurant cards. */
    function decorateCards(){
      document.querySelectorAll('.item').forEach(el=>{
        if(el.dataset.mytableChefDecorated)return;
        const parts=(el.dataset.key||'').split('|');
        if(parts.length<2)return;
        const p=restaurantLookup.get(key(parts[0],parts[1]));
        if(!p)return;
        const names=[...new Set(recsFor(p).map(r=>r.chef_name||chefMap.get(r.chef_id)?.chef_name).filter(Boolean))];
        if(!names.length)return;
        const badges=el.querySelector('.badges');
        if(badges){
          const span=document.createElement('span');
          span.className='badge';
          span.style='background:#f5f3ff;color:#6d28d9';
          span.textContent='👨‍🍳 '+names.slice(0,2).join(' · ')+(names.length>2?' +'+(names.length-2):'');
          badges.appendChild(span);
        }
        el.dataset.mytableChefDecorated='1';
      });
    }
    function decorateDetail(){
      const detail=document.getElementById('detail');
      if(!detail || !detail.classList.contains('open'))return;
      if(detail.querySelector('.mytable-chef-detail'))return;
      const h=detail.querySelector('h2');
      if(!h)return;
      const p=places.find(x=>norm(x.name)===norm(h.textContent));
      if(!p)return;
      const rr=recsFor(p);
      if(!rr.length)return;
      const block=document.createElement('div');
      block.className='chef-recs mytable-chef-detail';
      block.innerHTML='<strong>👨‍🍳 Recommandé par un chef</strong>'+
        rr.map(r=>'<div class="chef-rec" style="padding:7px 0;border-top:1px solid #e9dffb;margin-top:6px"><strong>'+esc(r.chef_name||chefMap.get(r.chef_id)?.chef_name||'Chef')+'</strong>'+
          (r.comment?' — '+esc(r.comment):'')+
          (r.dish?' <em>('+esc(r.dish)+')</em>':'')+
          (r.source_url?' <a target="_blank" rel="noopener" href="'+r.source_url+'">Source ↗</a>':'')+
        '</div>').join('');
      detail.appendChild(block);
    }
    const observer=new MutationObserver(()=>{decorateCards();decorateDetail()});
    observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
    decorateCards();
    decorateDetail();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();