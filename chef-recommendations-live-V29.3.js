/* My Table — Chef Recommendations Expansion V29.3
   Sources: Condé Nast Traveller — Where the Chefs Eat
   Published 2026-08-26 to 2026-09-13.

   Purpose:
   - Add verified chef/restaurant relationships without duplicating canonical restaurants.
   - If a restaurant already exists in window.RESTAURANTS, enrich that canonical record.
   - If it does not exist, add one minimal canonical record; no coordinates are invented.
   - Loaded AFTER chefs-guide-data-V26.62.js and BEFORE chefs-live-test-V1.js.
*/
(function(){
  'use strict';

  function norm(s){
    return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
  }
  function key(name,city){return norm(name)+'|'+norm(city)}
  function slug(s){return norm(s).replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}

  const DATA=window.CHEF_GUIDE_DATA=window.CHEF_GUIDE_DATA||{};
  DATA.chefs=Array.isArray(DATA.chefs)?DATA.chefs:[];
  DATA.recommendations=Array.isArray(DATA.recommendations)?DATA.recommendations:[];
  window.RESTAURANTS=Array.isArray(window.RESTAURANTS)?window.RESTAURANTS:[];

  const source='Condé Nast Traveller — Where the Chefs Eat';
  const sourceDate='2026-09-28';

  const chefs=[
    {chef_id:'chef:shelina-permalloo',chef_name:'Shelina Permalloo'},
    {chef_id:'chef:mario-carbone',chef_name:'Mario Carbone'},
    {chef_id:'chef:tamar-adler',chef_name:'Tamar Adler'}
  ];

  const recs=[
    // Shelina Permalloo — 13 September 2026
    {chef_id:'chef:shelina-permalloo',chef_name:'Shelina Permalloo',restaurant_id:'restaurant:grenada:dre-flavours',restaurant_name:'Dre Flavours',city:'Grenada',country:'Grenada',comment:'Permalloo highlights Dre Flavours for its personal take on Grenadian flavours and spice-driven cooking.',dish:'Pumpkin-coconut soup',source,source_url:'https://www.cntraveller.com/article/where-the-chefs-eat-shelina-permalloo-on-the-secret-beach-gate-that-leads-to-romes-best-pasta',source_date:'2026-09-13',status:'verified'},
    {chef_id:'chef:shelina-permalloo',chef_name:'Shelina Permalloo',restaurant_id:'restaurant:marrakech:al-fassia',restaurant_name:'Al Fassia',city:'Marrakech',country:'Morocco',comment:'Permalloo recommends Al Fassia for its female-run kitchen and broad expression of Moroccan culinary traditions.',dish:'Slow-roasted lamb; Moroccan small plates',source,source_url:'https://www.cntraveller.com/article/where-the-chefs-eat-shelina-permalloo-on-the-secret-beach-gate-that-leads-to-romes-best-pasta',source_date:'2026-09-13',status:'verified'},
    {chef_id:'chef:shelina-permalloo',chef_name:'Shelina Permalloo',restaurant_id:'restaurant:ostia:cancello-numero-7',restaurant_name:'Cancello Numero 7',city:'Ostia',country:'Italy',comment:'Permalloo recommends this seaside Ostia restaurant for its Roman coastal atmosphere and pasta.',dish:'Vongole',source,source_url:'https://www.cntraveller.com/article/where-the-chefs-eat-shelina-permalloo-on-the-secret-beach-gate-that-leads-to-romes-best-pasta',source_date:'2026-09-13',status:'verified'},
    {chef_id:'chef:shelina-permalloo',chef_name:'Shelina Permalloo',restaurant_id:'restaurant:trou-deau-douce:chez-tino',restaurant_name:'Chez Tino',city:'Trou d\'Eau Douce',country:'Mauritius',comment:'Permalloo recommends the family-run Chez Tino on Mauritius\' east coast for its hospitality and multicultural Mauritian cooking.',dish:'Fried noodles; Creole prawns; octopus curry',source,source_url:'https://www.cntraveller.com/article/where-the-chefs-eat-shelina-permalloo-on-the-secret-beach-gate-that-leads-to-romes-best-pasta',source_date:'2026-09-13',status:'verified'},
    {chef_id:'chef:shelina-permalloo',chef_name:'Shelina Permalloo',restaurant_id:'restaurant:accra:lancaster-accra',restaurant_name:'Lancaster Accra',city:'Accra',country:'Ghana',comment:'Permalloo recommends Lancaster Accra for its local Ghanaian buffet and traditional flavours.',dish:'Fufu; goat soup',source,source_url:'https://www.cntraveller.com/article/where-the-chefs-eat-shelina-permalloo-on-the-secret-beach-gate-that-leads-to-romes-best-pasta',source_date:'2026-09-13',status:'verified'},

    // Mario Carbone — 2 September 2026
    {chef_id:'chef:mario-carbone',chef_name:'Mario Carbone',restaurant_id:'restaurant:new-york:katzs-delicatessen',restaurant_name:"Katz's Delicatessen",city:'New York',country:'United States',comment:'Carbone recommends Katz\'s for its classic New York deli cooking and pastrami.',dish:'Pastrami',source,source_url:'https://www.cntraveller.com/article/where-the-chefs-eat-mario-carbones-favourite-restaurants-in-the-world',source_date:'2026-09-02',status:'verified'},
    {chef_id:'chef:mario-carbone',chef_name:'Mario Carbone',restaurant_id:'restaurant:miami:joes-stone-crab',restaurant_name:"Joe's Stone Crab",city:'Miami',country:'United States',comment:'Carbone recommends Joe\'s Stone Crab for its consistency, service and broad menu.',dish:'Chopped salad; coconut shrimp; blackened grouper',source,source_url:'https://www.cntraveller.com/article/where-the-chefs-eat-mario-carbones-favourite-restaurants-in-the-world',source_date:'2026-09-02',status:'verified'},
    {chef_id:'chef:mario-carbone',chef_name:'Mario Carbone',restaurant_id:'restaurant:ischia:mezzatorre-hotel',restaurant_name:'Mezzatorre Hotel',city:'Ischia',country:'Italy',comment:'Carbone highlights the casual poolside restaurant at Mezzatorre overlooking the sea.',dish:'Chickpea salad; rigatoni with lobster',source,source_url:'https://www.cntraveller.com/article/where-the-chefs-eat-mario-carbones-favourite-restaurants-in-the-world',source_date:'2026-09-02',status:'verified'},
    {chef_id:'chef:mario-carbone',chef_name:'Mario Carbone',restaurant_id:'restaurant:hong-kong:ho-lee-fook',restaurant_name:'Ho Lee Fook',city:'Hong Kong',country:'Hong Kong',comment:'Carbone recommends Ho Lee Fook for its balance, execution, atmosphere and Cantonese-inspired cooking.',dish:'Chef\'s choice',source,source_url:'https://www.cntraveller.com/article/where-the-chefs-eat-mario-carbones-favourite-restaurants-in-the-world',source_date:'2026-09-02',status:'verified'},
    {chef_id:'chef:mario-carbone',chef_name:'Mario Carbone',restaurant_id:'restaurant:los-angeles:apl-by-adam-perry-lang',restaurant_name:'APL by Adam Perry Lang',city:'Marina del Rey',country:'United States',comment:'Carbone recommends the weekend barbecue pop-up APL by Adam Perry Lang at Gin Rummy in Marina del Rey.',dish:'Ribs; brisket; smoked tuna; Peking duck',source,source_url:'https://www.cntraveller.com/article/where-the-chefs-eat-mario-carbones-favourite-restaurants-in-the-world',source_date:'2026-09-02',status:'verified'},

    // Tamar Adler — 26 August 2026
    {chef_id:'chef:tamar-adler',chef_name:'Tamar Adler',restaurant_id:'restaurant:madrid:dolores',restaurant_name:'Dolores',city:'Madrid',country:'Spain',address:'Pl. de Jesús, 4, Centro, 28012 Madrid, Spain',comment:'Adler recommends Dolores for its house-cured anchovies and boquerones.',dish:'Matrimonio',source,source_url:'https://www.cntraveller.com/article/where-the-chefs-eat-tamar-adlers-favourite-restaurants-in-madrid',source_date:'2026-08-26',status:'verified'},
    {chef_id:'chef:tamar-adler',chef_name:'Tamar Adler',restaurant_id:'restaurant:madrid:farah',restaurant_name:'Farah',city:'Madrid',country:'Spain',address:'C. de los Mancebos, 2, Centro, 28005 Madrid, Spain',comment:'Adler recommends Farah for its Palestinian cooking and whole fish.',dish:'Lubina with tahini sauce',source,source_url:'https://www.cntraveller.com/article/where-the-chefs-eat-tamar-adlers-favourite-restaurants-in-madrid',source_date:'2026-08-26',status:'verified'},
    {chef_id:'chef:tamar-adler',chef_name:'Tamar Adler',restaurant_id:'restaurant:madrid:sacha',restaurant_name:'Restaurant Sasha',city:'Madrid',country:'Spain',address:'C. de Juan Hurtado de Mendoza, 11, Posterior, Chamartín, 28036 Madrid, Spain',comment:'Adler recommends Sasha for its highly seasonal, frequently changing menu.',dish:'Tortilla vaga; fried artichokes',source,source_url:'https://www.cntraveller.com/article/where-the-chefs-eat-tamar-adlers-favourite-restaurants-in-madrid',source_date:'2026-08-26',status:'verified'},
    {chef_id:'chef:tamar-adler',chef_name:'Tamar Adler',restaurant_id:'restaurant:madrid:ton-ton',restaurant_name:'Ton Ton',city:'Madrid',country:'Spain',address:'Calle de Jordán, 7, Chamberí, 28010 Madrid, Spain',comment:'Adler recommends Ton Ton for its intimate atmosphere and small plates.',dish:'Artichoke; beef tartare',source,source_url:'https://www.cntraveller.com/article/where-the-chefs-eat-tamar-adlers-favourite-restaurants-in-madrid',source_date:'2026-08-26',status:'verified'},
    {chef_id:'chef:tamar-adler',chef_name:'Tamar Adler',restaurant_id:'restaurant:madrid:opazo',restaurant_name:"O'Pazo",city:'Madrid',country:'Spain',address:'C. de la Reina Mercedes, 20, Tetuán, 28020 Madrid, Spain',comment:'Adler recommends O\'Pazo for its seafood and very fresh fish selection.',dish:'Percebes; pink shrimp; oysters; clams',source,source_url:'https://www.cntraveller.com/article/where-the-chefs-eat-tamar-adlers-favourite-restaurants-in-madrid',source_date:'2026-08-26',status:'verified'}
  ];

  const chefById=new Map(DATA.chefs.map(c=>[c.chef_id,c]));
  chefs.forEach(c=>{
    if(!chefById.has(c.chef_id)){
      const full={...c,source,source_url:'https://www.cntraveller.com/topic/where-the-chefs-eat'};
      DATA.chefs.push(full);
      chefById.set(c.chef_id,full);
    }
  });

  const placeByKey=new Map();
  window.RESTAURANTS.forEach(p=>placeByKey.set(key(p.name,p.city),p));

  let addedRestaurants=0, enrichedRestaurants=0, addedRecommendations=0;

  recs.forEach(r=>{
    const k=key(r.restaurant_name,r.city);
    let p=placeByKey.get(k);
    if(!p){
      p={
        id:r.restaurant_id,
        restaurant_id:r.restaurant_id,
        name:r.restaurant_name,
        city:r.city,
        country:r.country,
        address:r.address||'',
        budget:null,
        categories:[],
        guides:{},
        sources:[],
        chef_recommendations:[],
        maps_url:'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(r.restaurant_name+' '+r.city),
        geolocation:null,
        data_status:'supplemental_chef_recommendation',
        last_verified:r.source_date
      };
      window.RESTAURANTS.push(p);
      placeByKey.set(k,p);
      addedRestaurants++;
    }else{
      if(!Array.isArray(p.chef_recommendations))p.chef_recommendations=[];
      enrichedRestaurants++;
    }

    if(!Array.isArray(p.chef_recommendations))p.chef_recommendations=[];
    const relKey=(r.chef_id||'')+'|'+key(r.restaurant_name,r.city);
    if(!p.chef_recommendations.some(x=>(x.chef_id||'')+'|'+key(x.restaurant_name||p.name,x.city||p.city)===relKey)){
      p.chef_recommendations.push({...r});
    }

    const recKey=(r.chef_id||'')+'|'+key(r.restaurant_name,r.city);
    if(!DATA.recommendations.some(x=>(x.chef_id||'')+'|'+key(x.restaurant_name,x.city)===recKey)){
      DATA.recommendations.push({...r});
      addedRecommendations++;
    }

    /* Do not overwrite the canonical record's existing source schema.
       The chef relationship itself is stored in chef_recommendations. */
  });

  DATA.version='V29.3';
  DATA.methodology=DATA.methodology||{};
  DATA.methodology.last_update=sourceDate;
  DATA.methodology.latest_expansion='Condé Nast Traveller — Shelina Permalloo, Mario Carbone, Tamar Adler (Aug–Sep 2026).';

  window.__MYTABLE_CHEF_EXPANSION_V293={
    version:'V29.3',
    addedRestaurants,
    enrichedRestaurants,
    addedRecommendations,
    chefs:3
  };

  console.info('[My Table] Chef expansion V29.3',window.__MYTABLE_CHEF_EXPANSION_V293);
})();
