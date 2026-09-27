/* My Table — Reservation Adapter V28.3
 * Replacement build — UI + reservation bridge
 * No provider secret belongs here.
 *
 * This file is intentionally a drop-in replacement for the existing
 * restaurant-booking-adapter-V28.3.js, so index.html does NOT need editing.
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
          max-height:55vh!important;
          min-height:250px!important;
          background:rgba(255,255,255,.97)!important;
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

  function addReservationButton(){
    const detail=document.getElementById("detail");
    if(!detail || !detail.classList.contains("open")) return;

    const actions=detail.querySelector(".detail-actions");
    if(!actions || actions.querySelector(".reservation")) return;

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
