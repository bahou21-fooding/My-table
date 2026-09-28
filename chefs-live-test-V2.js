/* My Table — Chef click navigation patch V2
   This file is loaded AFTER chefs-live-test-V1.js.
   Clicking a chef closes the chef modal and immediately filters My Table
   to that chef's recommended canonical restaurants.
*/
(function(){
  'use strict';

  function norm(s){
    return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
  }
  function key(name,city){return norm(name)+'|'+norm(city)}

  function install(){
    const overlay=document.getElementById('mytableChefOverlay');
    const grid=document.getElementById('mytableChefGrid');
    if(!overlay||!grid)return false;
    if(grid.dataset.chefNavV2==='1')return true;
    grid.dataset.chefNavV2='1';

    grid.addEventListener('click',function(e){
      const card=e.target.closest('.mytable-chef-card');
      if(!card)return;

      /* V1 also has a click handler on this grid. Stop it here so the
         modal does not remain in the foreground after selecting a chef. */
      e.preventDefault();
      e.stopImmediatePropagation();

      const strong=card.querySelector('strong');
      if(!strong)return;
      const chefName=strong.textContent.replace(/^👨‍🍳\s*/,'').trim();

      const data=window.CHEF_GUIDE_DATA||{};
      const chefs=Array.isArray(data.chefs)?data.chefs:[];
      const recs=Array.isArray(data.recommendations)?data.recommendations:[];
      const places=Array.isArray(window.RESTAURANTS)?window.RESTAURANTS:[];

      const chef=chefs.find(c=>norm(c.chef_name)===norm(chefName));
      const chefId=chef?.chef_id;
      if(!chefId)return;

      const wanted=new Set();
      recs.forEach(r=>{
        if(r.chef_id===chefId && r.restaurant_name){
          wanted.add(key(r.restaurant_name,r.city));
        }
      });

      /* Also include recommendations already attached to canonical records. */
      places.forEach(p=>{
        const rr=Array.isArray(p.chef_recommendations)?p.chef_recommendations:[];
        if(rr.some(r=>r.chef_id===chefId || norm(r.chef_name)===norm(chefName))){
          wanted.add(key(p.name,p.city));
        }
      });

      if(!wanted.size)return;

      window.__myTableSelectedChef={chef_id:chefId,chef_name:chefName};
      window.__myTableExternalFilter=function(p){
        return wanted.has(key(p.name,p.city));
      };

      overlay.classList.remove('open');

      /* Render through the existing My Table renderer. */
      if(typeof window.render==='function')window.render();

      /* On mobile, expand the restaurant sheet immediately. */
      const list=document.getElementById('list');
      if(list){
        list.classList.add('expanded');
        list.classList.remove('collapsed');
        list.scrollTop=0;
      }

      /* Make the result context explicit in the list header. */
      const head=document.querySelector('.list-head');
      const headStrong=head?.querySelector('strong');
      const headSpan=head?.querySelector('span');
      if(headStrong)headStrong.textContent=wanted.size+' restaurant'+(wanted.size>1?'s':'');
      if(headSpan)headSpan.textContent=' · recommandations de '+chefName;

      const status=document.getElementById('intentStatus');
      if(status){
        status.textContent=wanted.size+' restaurant'+(wanted.size>1?'s':'')+' recommandé'+(wanted.size>1?'s':'')+' par '+chefName;
      }

      /* Fit the map to the chef's restaurants. */
      setTimeout(function(){
        try{
          const selected=places.filter(p=>wanted.has(key(p.name,p.city)));
          if(typeof window.fitGlobalView==='function')window.fitGlobalView(selected);
        }catch(err){console.error('My Table Chef V2 map',err)}
      },120);
    },true);

    return true;
  }

  let tries=0;
  const timer=setInterval(function(){
    tries++;
    if(install()||tries>100)clearInterval(timer);
  },100);

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);
  else install();
})();
