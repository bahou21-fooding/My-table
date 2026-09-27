/* My Table — Enrichment Runtime V28.4 — Google independent */
window.MyTableEnrichment=window.MyTableEnrichment||{};
(function(NS){
 const norm=s=>String(s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
 const key=(n,c)=>norm(n)+"|"+norm(c);
 NS.apply=()=>{
  const places=window.RESTAURANTS||[], idx=new Map();
  places.forEach(p=>idx.set(key(p.name,p.city),p));
  let chefRelations=0;
  const cd=window.CHEF_GUIDE_DATA||{};
  (cd.recommendations||[]).forEach(r=>{
   const p=idx.get(key(r.restaurant_name,r.city)); if(!p)return;
   p.chef_recommendations=Array.isArray(p.chef_recommendations)?p.chef_recommendations:[];
   if(!p.chef_recommendations.some(x=>x.chef_id===r.chef_id&&norm(x.restaurant_name)===norm(r.restaurant_name)&&norm(x.city)===norm(r.city))){
    p.chef_recommendations.push(r); chefRelations++;
   }
  });
  places.forEach(p=>{
    p.source_count=Math.max(Number(p.source_count||0),
      Array.isArray(p.guides)?p.guides.length:0,
      Array.isArray(p.sources)?p.sources.length:0);
  });
  NS.version="28.4";
  NS.stats={restaurants:places.length,chef_relations_added:chefRelations,google_required:false,coordinates_preserved_only:true};
  return places;
 };
})(window.MyTableEnrichment);
