/* My Table — BIG expansion V34.0
   Verified sources: Time Out London 2026 + Condé Nast Traveller Where the Chefs Eat 2026.
   Safe additive layer: one canonical restaurant per name+city; existing records are enriched.
*/
(function(){
'use strict';
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
const key=(n,c)=>norm(n)+'|'+norm(c);
const DATA=window.CHEF_GUIDE_DATA=window.CHEF_GUIDE_DATA||{};
DATA.chefs=Array.isArray(DATA.chefs)?DATA.chefs:[];
DATA.recommendations=Array.isArray(DATA.recommendations)?DATA.recommendations:[];
window.RESTAURANTS=Array.isArray(window.RESTAURANTS)?window.RESTAURANTS:[];
const timeout='https://www.timeout.com/london/restaurants/the-best-new-restaurants-in-london';
const cn='https://www.cntraveller.com/topic/where-the-chefs-eat';
const today='2026-09-28';

// 20 current Time Out London new-restaurant entries, verified on the September 2026 editorial list.
const london=[
 ['Impala','London','Egyptian'],['Maai by Nikita','London','British'],['Cue Point','London','Barbecue'],['The Victory','London','Gastropub'],['Hon’s BBQ','London','Barbecue'],['Holy Carrot Spitalfields','London','Vegetarian'],['The Wei','London','Chinese'],['The Golden Tooth','London','Gastropub'],['Bar Etna','London','Pizza'],['Vesper','London','Bistro'],['Tiella','London','Italian'],['Maza','London','Greek'],['Teal','London','British'],['Logma','London','Iraqi'],['Auguste','London','Italian'],['All Roads','London','Pan-Caribbean'],['Oudh 1722','London','Indian'],['Forza Wine Soho','London','Italian'],["YeYe's Noodle & Dumpling Soho",'London','Chinese'],['Cafe Kowloon','London','Chinese']
];

const timeoutMeta={
'Impala':'13-14 Dean Street, Soho, W1D 3RS','Maai by Nikita':'33-35 Abbeville Road, Clapham, SW4 9JW','Cue Point':'Garden Bar & Grill, 41 Bramley Road, Notting Hill, W10 6SZ','The Victory':'157 Lordship Lane, East Dulwich, SE22 8HX',"Hon’s BBQ":'First Floor, Unit 7, The White Building, Queen’s Yard, E9 5EN','Holy Carrot Spitalfields':'61-63 Brushfield Street, Spitalfields, E1 6AA','The Wei':'461-465 North End Road, Fulham, SW6 1NZ','The Golden Tooth':'79 Green Lanes, Newington Green, N16 9BU','Bar Etna':'47 Newington Green, N16 9PX','Vesper':'8-10 Exmouth Market, Clerkenwell, EC1R 4QA','Tiella':'109 Columbia Road, Bethnal Green, E2 7RL','Maza':'21-23 Bruton Place, Mayfair, W1J 6NB','Teal':'52 Wilton Way, London Fields, E8 1BG','Logma':'81 Goldsmiths Row, Haggerston, E2 8QR','Auguste':'373 Mentmore Terrace, London Fields, E8 3DQ','All Roads':'44 Atlantic Road, Brixton, SW9 8JN','Oudh 1722':'66 Union Street, Borough, SE1 1TD','Forza Wine Soho':'Unit 1, Ilona Rose House, Manette Street, Soho, W1D 4AL',"YeYe's Noodle & Dumpling Soho":'99 Wardour Street, Soho, W1F 0UF','Cafe Kowloon':'392-393 Mentmore Terrace, London Fields, E8 3PH'
};

// 10 explicit chef-to-restaurant relationships from Condé Nast Traveller 2026.
const chefs=[
 ['David Chang','chef:david-chang'],['Xavier Bramble','chef:xavier-bramble']
];
const placeByKey=new Map(window.RESTAURANTS.map(p=>[key(p.name,p.city),p]));
let addedRestaurants=0,enrichedRestaurants=0,addedRecommendations=0,addedTimeout=0;

const theforkPairs=[
['Quentin Bourdy & Noémie Honiat','Maison Seed'],['Nick Honeyman','Chez GN'],['François Adamski','La Grange aux Loups'],['Yoann Amado','Luna'],['Anthony Bonnet','Carbone'],['Christophe Aribert','Annata'],['Christophe Bacquié','ADN Bastia'],['Pascal Bardet','Le Jeu de Quilles'],['Alexandre Baumard','La Chapelle de Guiraud'],['Cédric Béchade','Brut, Table de saison'],['Thomas Belval-Sanna',"Schoup’s"],['Julien Binz','Gourmand Bistrot des plaisirs'],['Georges Blanc','Orizon'],['Julien Caligo','Aronde'],['Stéphane Carrade',"La Table de L'oléa"],['Amandine Chaignot','Occasion'],['Christophe Chiavola','Rouge'],['Yoann Conte','Saba'],['Camille Delcroix','IODALINE'],['Arnaud Donckele','Les Saisonniers'],['Sébastien Faramond','La rencontre'],['Fabien Ferré','Lou Patio'],['Louis Gachet','Restaurant Benjamin Linard - Hotel de la Poste'],['François Gagnaire','Lissit'],['Pierre Gagnaire','Poésie des Halles'],['Alexandre Gauthier','Saline'],['Jean-François Girardin','Café Armance'],['Gilles Goujon','Un Air de Bouchon'],['Jason Gouzy','Patsy'],['Mathieu Guibert','Entre Nous'],['Marc Haeberlin','La Salle des Fêtes'],['Christophe Hay','La Bécasse Heureuse'],['Eugène Hobraiche','Pulpe'],['Romain Hubert','Ba/C'],['David Ibarboure','La Palantxa'],['Denny Imbroisi','Noé'],['Chatchaï Klanklong','Bolan'],['Alexandre Koa','Les Négociants'],['Kei Kobayashi','Eskal'],['Thomas L’Hérisson','Côté Zinc'],['Arnaud Lallement','Maison Bellet'],['Christian Le Squer','Le Grand Gourmand'],['Fabien Lefebvre',"L'Auberge de Combes"],['Gilles Leininger','Kokken'],['Romain Mahi','Bund'],['Christophe Marguin','Trèfle'],['Nicolas Masse','Caroline'],['Nina Métayer','Loma'],['Tom Meyer','Le Café de La Fontaine'],['Flora Mikula','Kimono'],['Alexandre Miquel',"Pluriel'"],['Alessandra Montagne','Almas'],['Olivier Nasti','Brasserie Zahnacker'],['Bruno Oger','La table du presbytère'],['Emmanuel Perrodin','Bonnies'],['Florent Pietravalle','Jacquemard'],['Kelly Rangama','Rencontre'],['Christophe Raoux','Rouge'],['Emmanuel Renaut','Le Rechen'],['Mory Sacko','Ebène'],['Nadia Sammut','Dialogues'],['Guy Savoy','Restaurant Alt'],['Guillaume Scheer','Cueillette'],['Jean-Yves Schillinger','La Table de Jean-mi'],['Nicolas Seibold',"Pluriel'"],['Frédéric Simonin',"L’Ermitage Saint-Antoine"],['Thibaut Spiwack','Le Petit Brochant'],['Nicolas Stamm-Corby','Caveau chez bacchus'],['Paul Stradner','Les jardins du moulins'],['Tabata et Ludovic Mey','Murmures'],['Alan Taudon','FANA'],['Christian Têtedoie','Murmures'],['Laurent Trochain','Restaurant Galipettes'],['Ludovic Turac','Kosho'],['Glenn Viel',"Willny’s Café"],['Valérie Vrinat','Les Collonges']
];
theforkPairs.forEach(([chef,restaurant])=>{
 const chef_id='chef:thefork:'+norm(chef).replace(/[^a-z0-9]+/g,'-');
 const existing=window.RESTAURANTS.filter(p=>norm(p.name)===norm(restaurant));
 if(existing.length){
   if(!DATA.chefs.some(c=>c.chef_id===chef_id))DATA.chefs.push({chef_id,chef_name:chef,source:'TheFork Awards — Chefs parrains 2026',source_url:'https://theforkawards.fr/chefs-parrains/'});
   existing.forEach(p=>{
     const rel={chef_id,chef_name:chef,restaurant_id:p.restaurant_id||p.canonical_id,restaurant_name:p.name,city:p.city,country:p.country||'France',comment:'Sélectionné comme table coup de cœur par ce chef parrain/marraine dans les TheFork Awards 2026.',dish:'',source:'TheFork Awards — Chefs parrains 2026',source_url:'https://theforkawards.fr/chefs-parrains/',source_date:'2026',status:'verified'};
     p.chef_recommendations=Array.isArray(p.chef_recommendations)?p.chef_recommendations:[];
     if(!p.chef_recommendations.some(x=>(x.chef_id||'')+'|'+key(x.restaurant_name||p.name,x.city||p.city)===chef_id+'|'+key(p.name,p.city))){p.chef_recommendations.push(rel);addedRecommendations++}
     if(!DATA.recommendations.some(x=>(x.chef_id||'')+'|'+key(x.restaurant_name,x.city)===chef_id+'|'+key(p.name,p.city)))DATA.recommendations.push(rel);
   });
 } else {
   // The public awards page names the table but does not expose a reliable city in the source payload.
   // Keep it pending and non-discoverable rather than inventing a city or creating a duplicate.
   DATA.pending_recommendations=Array.isArray(DATA.pending_recommendations)?DATA.pending_recommendations:[];
   const pendingKey=chef_id+'|'+norm(restaurant);
   if(!DATA.pending_recommendations.some(x=>x.pending_key===pendingKey))DATA.pending_recommendations.push({pending_key:pendingKey,chef_id,chef_name:chef,restaurant_name:restaurant,country:'France',source:'TheFork Awards — Chefs parrains 2026',source_url:'https://theforkawards.fr/chefs-parrains/',source_date:'2026',status:'pending_city_verification'});
 }
});

const recs=[
 {chef_id:'chef:david-chang',chef_name:'David Chang',restaurant_id:'restaurant:paris:maison-sota',restaurant_name:'Maison Sota',city:'Paris',country:'France',comment:'Chang highlights Maison Sota as an under-recognised Paris restaurant and praises its cooking and value.',dish:'Rice with chestnuts and goji; scallops with cream and horseradish',source:"Condé Nast Traveller — Where the Chefs Eat",source_url:'https://www.cntraveller.com/article/where-the-chefs-eat-david-changs-favourite-restaurants-in-paris-and-new-york',source_date:'2026-05-20',status:'verified'},
 {chef_id:'chef:david-chang',chef_name:'David Chang',restaurant_id:'restaurant:new-jersey:sergeantsville-inn',restaurant_name:'The Sergeantsville Inn',city:'Sergeantsville',country:'United States',comment:'Chang recommends this centuries-old stone pub for a slice of old-country America.',dish:'Oysters; deviled eggs with caviar; pork shank',source:"Condé Nast Traveller — Where the Chefs Eat",source_url:'https://www.cntraveller.com/article/where-the-chefs-eat-david-changs-favourite-restaurants-in-paris-and-new-york',source_date:'2026-05-20',status:'verified'},
 {chef_id:'chef:david-chang',chef_name:'David Chang',restaurant_id:'restaurant:new-york:stretch-pizza',restaurant_name:'Stretch Pizza',city:'New York',country:'United States',comment:'Chang recommends the Gramercy Park-area Stretch Pizza for New York-style pizza and inventive pies.',dish:'Everything Bagel pizza; Nellie',source:"Condé Nast Traveller — Where the Chefs Eat",source_url:'https://www.cntraveller.com/article/where-the-chefs-eat-david-changs-favourite-restaurants-in-paris-and-new-york',source_date:'2026-05-20',status:'verified'},
 {chef_id:'chef:david-chang',chef_name:'David Chang',restaurant_id:'restaurant:paris:hanoi-1988',restaurant_name:'Hanoi 1988',city:'Paris',country:'France',comment:'Chang recommends Hanoi 1988 for northern Vietnamese cooking in Paris.',dish:'Pho with egg poached in the broth',source:"Condé Nast Traveller — Where the Chefs Eat",source_url:'https://www.cntraveller.com/article/where-the-chefs-eat-david-changs-favourite-restaurants-in-paris-and-new-york',source_date:'2026-05-20',status:'verified'},
 {chef_id:'chef:david-chang',chef_name:'David Chang',restaurant_id:'restaurant:new-york:balthazar',restaurant_name:'Balthazar',city:'New York',country:'United States',comment:'Chang recommends Balthazar as a classic French bistro that works for locals and visitors from breakfast through dinner.',dish:'',source:"Condé Nast Traveller — Where the Chefs Eat",source_url:'https://www.cntraveller.com/article/where-the-chefs-eat-david-changs-favourite-restaurants-in-paris-and-new-york',source_date:'2026-05-20',status:'verified'},
 {chef_id:'chef:xavier-bramble',chef_name:'Xavier Bramble',restaurant_id:'restaurant:london:khao-so-i',restaurant_name:'Khao So-i',city:'London',country:'United Kingdom',comment:'Bramble recommends Khao So-i for its intimate setting and Northern Thai-inspired bowls.',dish:'Beef shin khao soi',source:"Condé Nast Traveller — Where the Chefs Eat",source_url:'https://www.cntraveller.com/article/where-the-chefs-eat-xavier-bramble-favourite-restaurants-in-london',source_date:'2026-03-20',status:'verified'},
 {chef_id:'chef:xavier-bramble',chef_name:'Xavier Bramble',restaurant_id:'restaurant:london:osteria-romana',restaurant_name:'Osteria Romana',city:'London',country:'United Kingdom',comment:'Bramble calls Osteria Romana his most authentic Italian restaurant in London.',dish:'Coda alla vaccinara; cacio e pepe',source:"Condé Nast Traveller — Where the Chefs Eat",source_url:'https://www.cntraveller.com/article/where-the-chefs-eat-xavier-bramble-favourite-restaurants-in-london',source_date:'2026-03-20',status:'verified'},
 {chef_id:'chef:xavier-bramble',chef_name:'Xavier Bramble',restaurant_id:'restaurant:london:honest-greens-soho',restaurant_name:'Honest Greens',city:'London',country:'United Kingdom',comment:'Bramble recommends Honest Greens in Soho as a regular healthy-eating option.',dish:'Sweet potato fries; protein salad bowls',source:"Condé Nast Traveller — Where the Chefs Eat",source_url:'https://www.cntraveller.com/article/where-the-chefs-eat-xavier-bramble-favourite-restaurants-in-london',source_date:'2026-03-20',status:'verified'},
 {chef_id:'chef:xavier-bramble',chef_name:'Xavier Bramble',restaurant_id:'restaurant:london:andu-ethiopian',restaurant_name:'Andu Ethiopian',city:'London',country:'United Kingdom',comment:'Bramble recommends Andu Ethiopian for its communal atmosphere and vegan Ethiopian cooking.',dish:'Injera; shared vegan dishes',source:"Condé Nast Traveller — Where the Chefs Eat",source_url:'https://www.cntraveller.com/article/where-the-chefs-eat-xavier-bramble-favourite-restaurants-in-london',source_date:'2026-03-20',status:'verified'},
 {chef_id:'chef:xavier-bramble',chef_name:'Xavier Bramble',restaurant_id:'restaurant:london:berenjak-borough',restaurant_name:'Berenjak',city:'London',country:'United Kingdom',comment:'Bramble names Berenjak in Borough his number-one London restaurant and praises its Persian cooking.',dish:'Black hummus; stews; rice',source:"Condé Nast Traveller — Where the Chefs Eat",source_url:'https://www.cntraveller.com/article/where-the-chefs-eat-xavier-bramble-favourite-restaurants-in-london',source_date:'2026-03-20',status:'verified'}
];

const chefById=new Map(DATA.chefs.map(c=>[c.chef_id,c]));
function addChef(c){if(!chefById.has(c[1])){const x={chef_id:c[1],chef_name:c[0],source:'WE ARE ONA — Chefs',source_url:'https://weareona.co/chefs'};DATA.chefs.push(x);chefById.set(c[1],x)}}
chefs.forEach(addChef);
recs.forEach(r=>{
 const k=key(r.restaurant_name,r.city); let p=placeByKey.get(k);
 if(!p){p={id:r.restaurant_id,restaurant_id:r.restaurant_id,name:r.restaurant_name,city:r.city,country:r.country,address:'',address_verified:false,status:'À faire',tag:'chef-recommendation',mine:false,fooding:false,gault:false,oad:false,michelin:false,links:{maps:'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(r.restaurant_name+' '+r.city)},guides:{OAD:false,'Gault&Millau':false,'Le Fooding':false,Michelin:false,'50 Best':false,'50 Best Discovery':false,'Time Out Paris':false,'La Liste':false},guide_urls:{},maps_url:'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(r.restaurant_name+' '+r.city),guide_count:0,source_count:0,canonical_id:'mt-'+norm(r.restaurant_name+'-'+r.city).replace(/[^a-z0-9]+/g,'-'),data_status:'supplemental_chef_recommendation',categories:[],chef_recommendations:[],reservation:{provider:null,supports_live_availability:false,supports_direct_booking:false},geolocation:{lat:null,lng:null,precision:null,status:'needs_geocode',query:r.restaurant_name+', '+r.city},last_verified:r.source_date};window.RESTAURANTS.push(p);placeByKey.set(k,p);addedRestaurants++}else enrichedRestaurants++;
 p.chef_recommendations=Array.isArray(p.chef_recommendations)?p.chef_recommendations:[];
 if(!p.chef_recommendations.some(x=>(x.chef_id||'')+'|'+key(x.restaurant_name||p.name,x.city||p.city)===(r.chef_id||'')+'|'+k)){p.chef_recommendations.push({...r});addedRecommendations++}
 if(!DATA.recommendations.some(x=>(x.chef_id||'')+'|'+key(x.restaurant_name,x.city)===(r.chef_id||'')+'|'+k))DATA.recommendations.push({...r});
});

london.forEach(([name,city,cat])=>{
 const k=key(name,city); let p=placeByKey.get(k);
 if(!p){p={id:'restaurant:london:'+norm(name).replace(/[^a-z0-9]+/g,'-'),restaurant_id:'restaurant:london:'+norm(name).replace(/[^a-z0-9]+/g,'-'),name,city,country:'United Kingdom',address:timeoutMeta[name]||'',address_verified:!!timeoutMeta[name],status:'À faire',tag:'timeout-new-2026',mine:false,fooding:false,gault:false,oad:false,michelin:false,links:{maps:'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(name+' London')},guides:{OAD:false,'Gault&Millau':false,'Le Fooding':false,Michelin:false,'50 Best':false,'50 Best Discovery':false,'Time Out Paris':false,'La Liste':false},guide_urls:{},maps_url:'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(name+' London'),guide_count:0,source_count:0,canonical_id:'mt-'+norm(name+'-London').replace(/[^a-z0-9]+/g,'-'),data_status:'supplemental_timeout_2026',categories:[cat.toLowerCase()],chef_recommendations:[],sources:[{type:'guide_list',source:'Time Out London — Best New Restaurants 2026',source_url:timeout,source_date:'2026-09'}],reservation:{provider:null,supports_live_availability:false,supports_direct_booking:false},geolocation:{lat:null,lng:null,precision:null,status:'needs_geocode',query:name+', London'},last_verified:today};window.RESTAURANTS.push(p);placeByKey.set(k,p);addedRestaurants++}else enrichedRestaurants++;
 p.sources=Array.isArray(p.sources)?p.sources:[];
 if(!p.sources.some(s=>s.source==='Time Out London — Best New Restaurants 2026'))p.sources.push({type:'guide_list',source:'Time Out London — Best New Restaurants 2026',source_url:timeout,source_date:'2026-09'});
 p.timeout=true;p.time_out=true;p.timeout_category=cat;p.last_verified=p.last_verified||today;addedTimeout++;
});
DATA.version='V34.0';DATA.methodology=DATA.methodology||{};DATA.methodology.last_update=today;DATA.methodology.latest_expansion='Time Out London — Best New Restaurants 2026 + Condé Nast Traveller — Where the Chefs Eat (David Chang, Xavier Bramble).';
window.__MYTABLE_V34={version:'V34.0',addedRestaurants,enrichedRestaurants,addedRecommendations,addedTimeout,chefSources:2};
if(typeof window.render==='function')setTimeout(()=>window.render(),0);
console.info('[My Table] V34 expansion',window.__MYTABLE_V34);
})();
