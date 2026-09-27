/* My Table — Reservation Adapter V28.3
 * Replacement build — UI + reservation bridge
 * Mobile bottom-sheet test: compact + swipe expand
 * No provider secret belongs here.
 */
window.MyTableBooking = window.MyTableBooking || {};

(function(NS){
  NS.version="28.3";

  NS.buttonFor=function(p){
    const r=p?.reservation||{};
    if(r.supports_live_availability && r.provider) return {
      label:"Voir les disponibilités",
      action:"live_availability",
      provider:r.provider,
      live:true,
      verified:true
    };
    if(r.supports_direct_booking && r.booking_url) return {
      label:r.provider==="direct"?"Réserver sur le site":"Réserver",
      action:"external_booking",
      url:r.booking_url,
      live:false,
      verified:true
    };
    if(r.supports_direct_booking) return {
      label:"Réserver",
      action:"reservation_contact",
      live:false,
      verified:true
    };
    return {
      label:"Réservation non disponible",
      action:"none",
      live:false,
      verified:false
    };
  };

  NS.buildAvailabilityRequest=function(p,{date,time,partySize}={}){
    if(!p?.reservation?.supports_live_availability || !p.reservation.provider)
      return {status:"not_configured",message:"Aucune disponibilité temps réel configurée."};
    return {
      status:"backend_required",
      provider:p.reservation.provider,
      restaurant_id:p.reservation.restaurant_id||null,
      date:date||null,
      time:time||null,
      party_size:partySize||null,
      endpoint:"/api/booking/availability"
    };
  };

  NS.createReservationRequest=function(p,customer,{date,time,partySize}={}){
    if(!p?.reservation?.supports_direct_booking || !p.reservation.provider)
      return {status:"not_configured"};
    return {
      status:"backend_required",
      provider:p.reservation.provider,
      restaurant_id:p.reservation.restaurant_id||null,
      date:date||null,
      time:time||null,
      party_size:partySize||null,
      customer:customer||{},
      endpoint:"/api/booking/reservation"
    };
  };

  function installMobileFix(){
    if(document.getElementById("mytable-booking-v283-style")) return;

    const style=document.createElement("style");
    style.id="mytable-booking-v283-style";
    style.textContent=`
      @media(max-width:850px){
        .detail{
          max-height:38vh!important;
          min-height:0!important;
          height:auto!important;
          overflow-y:auto!important;
          background:rgba(255,255,255,.97)!important;
          transition:max-height .28s ease, height .28s ease!important;
          touch-action:pan-y!important;
        }

        .detail.mytable-sheet-expanded{
          max-height:82vh!important;
        }

        .detail .mytable-sheet-handle{
          display:block;
          width:52px;
          height:5px;
          border-radius:99px;
          background:#cbd5e1;
          margin:0 auto 12px;
          flex:0 0 auto;
        }

        .detail.mytable-sheet-compact .detail-secondary{
          display:none!important;
        }

        .detail.mytable-sheet-expanded .detail-secondary{
          display:block!important;
        }

        .detail-actions .reservation{
          background:#111827!important;
          color:#fff!important;
          border-color:#111827!important;
          font-weight:700!important;
        }

        .detail-actions .reservation.disabled{
          background:#f3f4f6!important;
          color:#6b7280!important;
          border-color:#e5e7eb!important;
          font-weight:500!important;
        }
      }

      @media(min-width:851px){
        .detail .mytable-sheet-handle{
          display:none!important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function findCurrentRestaurant(){
    const detail=document.getElementById("detail");
    const h=detail && detail.querySelector("h2");
    if(!h) return null;

    const name=(h.textContent||"").trim();
    const pLine=detail.querySelector("h2 + p");
    const city=((pLine?.textContent||"").split("·")[0]||"").trim();
    const arr=window.RESTAURANTS||[];

    return arr.find(p =>
      String(p.name||"").trim()===name &&
      (!city || String(p.city||"").trim()===city)
    ) || arr.find(p => String(p.name||"").trim()===name) || null;
  }

  function markCompact(detail){
    detail.classList.add("mytable-sheet-compact");
    detail.classList.remove("mytable-sheet-expanded");
  }

  function markExpanded(detail){
    detail.classList.remove("mytable-sheet-compact");
    detail.classList.add("mytable-sheet-expanded");
  }

  function installSheetInteractions(detail){
    if(detail.dataset.mytableSheetReady==="1") return;
    detail.dataset.mytableSheetReady="1";

    const handle=document.createElement("div");
    handle.className="mytable-sheet-handle";
    handle.setAttribute("aria-label","Faire glisser pour afficher les détails");

    const first=detail.firstChild;
    detail.insertBefore(handle,first);

    markCompact(detail);

    let startY=0;
    let startX=0;
    let moved=false;

    detail.addEventListener("touchstart",function(e){
      if(!e.touches || !e.touches[0]) return;
      startY=e.touches[0].clientY;
      startX=e.touches[0].clientX;
      moved=false;
    },{passive:true});

    detail.addEventListener("touchmove",function(e){
      if(!e.touches || !e.touches[0]) return;
      const dy=e.touches[0].clientY-startY;
      const dx=e.touches[0].clientX-startX;
      if(Math.abs(dy)>12 && Math.abs(dy)>Math.abs(dx)) moved=true;
    },{passive:true});

    detail.addEventListener("touchend",function(e){
      if(!moved || !e.changedTouches || !e.changedTouches[0]) return;
      const endY=e.changedTouches[0].clientY;
      const dy=endY-startY;

      if(dy < -35){
        markExpanded(detail);
      }else if(dy > 35){
        markCompact(detail);
      }
    },{passive:true});

    handle.addEventListener("click",function(){
      if(detail.classList.contains("mytable-sheet-expanded")) markCompact(detail);
      else markExpanded(detail);
    });
  }

  function addReservationButton(){
    const detail=document.getElementById("detail");
    if(!detail || !detail.classList.contains("open")) return;

    const actions=detail.querySelector(".detail-actions");
    if(!actions) return;

    installSheetInteractions(detail);

    if(actions.querySelector(".reservation")) return;

    const p=findCurrentRestaurant();
    if(!p) return;

    const booking=NS.buttonFor(p);
    let el;

    if(booking.action==="external_booking" && booking.url){
      el=document.createElement("a");
      el.href=booking.url;
      el.target="_blank";
      el.rel="noopener";
      el.textContent="🍽️ "+booking.label+" ↗";
    }else if(booking.action==="live_availability"){
      el=document.createElement("button");
      el.type="button";
      el.textContent="🍽️ "+booking.label;
      el.onclick=function(){
        alert("Les disponibilités en temps réel nécessitent encore la connexion du fournisseur de réservation.");
      };
    }else{
      el=document.createElement("button");
      el.type="button";
      el.textContent="🍽️ Réserver";
      el.className="disabled";
      el.title="Aucun lien de réservation configuré pour ce restaurant";
      el.onclick=function(){
        alert("Aucun lien de réservation configuré pour ce restaurant pour le moment.");
      };
    }

    el.classList.add("reservation");
    actions.insertBefore(el,actions.firstChild);

    const secondary=[
      ...detail.querySelectorAll("p")
    ].filter(node=>{
      const t=(node.textContent||"").trim();
      return /^Guides\s*:|^Budget\s*:|^Niveau actuel\s*:/i.test(t);
    });

    secondary.forEach(node=>{
      node.classList.add("detail-secondary");
    });

    const locationNode=detail.querySelector(".detail-actions")?.previousElementSibling;
    if(locationNode && /Adresse géocodée|Position/i.test(locationNode.textContent||"")){
      locationNode.classList.add("detail-secondary");
    }
  }

  function startUIBridge(){
    installMobileFix();

    const detail=document.getElementById("detail");
    if(!detail) return;

    const observer=new MutationObserver(function(){
      setTimeout(addReservationButton,0);
    });

    observer.observe(detail,{
      childList:true,
      subtree:true,
      attributes:true,
      attributeFilter:["class"]
    });

    setTimeout(addReservationButton,250);
  }

  if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded",startUIBridge);
  }else{
    startUIBridge();
  }

})(window.MyTableBooking);
