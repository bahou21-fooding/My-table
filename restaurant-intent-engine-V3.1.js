/* My Table — Intent Engine V3.1 */
window.MyTableIntent = window.MyTableIntent || {};
(function(NS){
  const norm=s=>String(s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
  const FOOD={
    viande:["viande","boeuf","steak","steakhouse","grill","grillade","bbq","barbecue","churrasco"],
    poisson:["poisson","fish","seafood","fruits de mer","huitres","crustaces"],
    pizza:["pizza","pizzeria"], sushi:["sushi","sashimi"],
    italien:["italien","italienne","italie","pasta","pates"],
    francais:["francais","francaise","bistrot","brasserie"],
    japonais:["japonais","japonaise","izakaya","ramen","sushi"],
    mexicain:["mexicain","mexicaine","tacos","taqueria"],
    asiatique:["asiatique","asian"]
  };
  const TAGS={
    groupe:["groupe","amis","entre amis","team"],date:["date","romantique","couple"],
    terrasse:["terrasse","patio","outdoor"],casual:["casual","decontracte"],
    gastronomique:["gastronomique","tasting menu"],brunch:["brunch"],
    dejeuner:["dejeuner","lunch"],diner:["diner","dinner","soir","soirée"],
    late_night:["late night","tard","nuit"]
  };
  const hay=p=>norm([
    p.name,p.city,p.address,
    ...(p.categories||[]),...(p.tags||[]),...(p.guides||[]),
    ...(p.chef_recommendations||[]).flatMap(x=>[x.chef_name,x.comment,x.dish])
  ].join(" "));
  const parse=text=>{
    const s=norm(text),q={raw:text,city:null,people:null,budget_max:null,food:[],occasion:null,style:null,meal:null,day:null};
    let m=s.match(/\b(\d{1,2})\s*(?:personnes|pers|pax)\b/); if(m)q.people=+m[1];
    m=s.match(/\b(?:pour|budget|max|maxi|maximum)\s*(?:de\s*)?(\d{2,4})\s*(?:€|euros)?\b/); if(m)q.budget_max=+m[1];
    if(!q.budget_max){m=s.match(/\b(\d{2,4})\s*(?:€|euros)\b/);if(m)q.budget_max=+m[1];}
    for(const c of ["Paris","Lyon","Marseille","Londres","London","New York","Tokyo","Madrid","Rome","Milan","Lisbonne","Barcelone","Amsterdam","Mexico City"])
      if(s.includes(norm(c))){q.city=c;break;}
    for(const [k,v] of Object.entries(FOOD))if(v.some(x=>s.includes(norm(x))))q.food.push(k);
    for(const [k,v] of Object.entries(TAGS)){
      if(!v.some(x=>s.includes(norm(x))))continue;
      if(["groupe","date"].includes(k))q.occasion=k;
      else if(["terrasse","casual","gastronomique"].includes(k))q.style=k;
      else if(["brunch","dejeuner","diner","late_night"].includes(k))q.meal=k;
    }
    const dm=s.match(/\b(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)\b/); if(dm)q.day=dm[1];
    return q;
  };
  const match=(h,w)=>(FOOD[w]||TAGS[w]||[w]).some(x=>h.includes(norm(x)));
  const budget=p=>{
    const v=p?.budget;
    if(typeof v==="number")return v;
    const m=String(v||"").match(/[€$£¥]/g); if(!m)return null;
    return m.length;
  };
  NS.parse=parse;
  NS.findByIntent=function(input,{limit=30}={}){
    const q=typeof input==="string"?parse(input):input||{};
    const rows=[];
    for(const p of (window.RESTAURANTS||[])){
      if(!p||p.data_status==="pending_verification")continue;
      if(q.city && norm(p.city)!==norm(q.city))continue;
      const h=hay(p), reasons=[]; let score=0;
      if(q.city){score+=20;reasons.push("ville correspondante");}
      if(q.food?.length){
        const n=q.food.filter(x=>match(h,x)).length;
        if(n){score+=20*n;reasons.push("envie/cuisine correspondante");} else score-=10;
      }
      if(q.occasion){if(match(h,q.occasion)){score+=10;reasons.push("occasion");}}
      if(q.style){if(match(h,q.style)){score+=8;reasons.push("style");}}
      if(q.meal){if(match(h,q.meal)){score+=5;reasons.push("moment");}}
      const b=budget(p);
      if(q.budget_max!=null && b!=null){
        if(typeof b==="number" && b<=q.budget_max){score+=8;reasons.push("budget compatible");}
        else if(typeof b==="number")score-=6;
      }
      const chefs=p.chef_recommendations||[];
      if(chefs.length){score+=Math.min(16,chefs.length*4);reasons.push(`${chefs.length} recommandation(s) de chef`);}
      if(Number(p.source_count||0)){score+=Math.min(8,Number(p.source_count));reasons.push("sources/guides");}
      if(q.people && q.people>=5 && match(h,"groupe")){score+=6;reasons.push("groupe");}
      if(score>0)rows.push({...p,_intent_score:score,_intent_reasons:reasons,_availability_checked:false});
    }
    rows.sort((a,b)=>b._intent_score-a._intent_score);
    return {query:q,results:rows.slice(0,limit),total:rows.length,availability_checked:false};
  };
})(window.MyTableIntent);
