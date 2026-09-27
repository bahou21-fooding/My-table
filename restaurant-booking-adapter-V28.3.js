/* My Table — Reservation Adapter V29.0
 * Clean mobile map/detail-sheet bridge + reservation bridge.
 *
 * IMPORTANT:
 * - Drop-in replacement for the existing restaurant-booking-adapter-V28.3.js
 * - Keep this filename when installing in GitHub unless index.html is also updated.
 * - No provider secret belongs here.
 */
window.MyTableBooking = window.MyTableBooking || {};

(function(NS){
  NS.version="29.0";

  /* ---------------- Reservation bridge ---------------- */

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

  /* ---------------- Mobile map/detail UI ---------------- */

  function mobile(){
    return window.matchMedia && window.matchMedia("(max-width:850px)").matches;
  }

  function installStyle(){
    if(document.getElementById("mytable-v29-mobile-style")) return;

    const style=document.createElement("style");
    style.id="mytable-v29-mobile-style";
    style.textContent=`
      @media(max-width:850px){
        .detail.mytable-v29-sheet{
          bottom:58px!important;
          left:0!important;
          right:0!important;
          width:100%!important;
          max-width:none!important;
          min-height:0!important;
          height:auto!important;
          max-height:36vh!important;
          overflow:hidden!important;
          padding:12px 18px 16px!important;
          border:0!important;
          border-radius:24px 24px 0 0!important;
          box-shadow:0 -10px 34px rgba(0,0,0,.18)!important;
          background:rgba(255,255,255,.985)!important;
          transition:max-height .24s ease,box-shadow .24s ease!important;
          overscroll-behavior:contain!important;
          touch-action:pan-y!important;
        }

        .detail.mytable-v29-sheet.mytable-v29-expanded{
          max-height:82vh!important;
          overflow-y:auto!important;
          -webkit-overflow-scrolling:touch!important;
        }

        .detail.mytable-v29-sheet .mytable-v29-handle{
          display:block!important;
          width:48px!important;
          height:5px!important;
          border-radius:999px!important;
          background:#cbd5e1!important;
          margin:0 auto 10px!important;
        }

        .detail.mytable-v29-sheet .mytable-v29-secondary{
          display:none!important;
        }

        .detail.mytable-v29-sheet.mytable-v29-expanded .mytable-v29-secondary{
          display:block!important;
        }

        .detail.mytable-v29-sheet .detail-actions{
          margin-top:11px!important;
        }

        .detail.mytable-v29-sheet .detail-actions .reservation{
          background:#111827!important;
          color:#fff!important;
          border-color:#111827!important;
          font-weight:700!important;
        }

        .detail.mytable-v29-sheet .detail-actions .reservation.disabled{
          background:#f3f4f6!important;
          color:#6b7280!important;
          border-color:#e5e7eb!important;
          font-weight:500!important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function currentRestaurant(){
    const detail=document.getElementById("detail");
    const h=detail && detail.querySelector("h2");
    if(!h) return null;

    const name=(h.textContent||"").trim();
    const line=detail.querySelector("h2 + p");
    const city=((line?.textContent||"").split("·")[0]||"").trim();
    const arr=window.RESTAURANTS||[];

    return arr.find(p =>
      String(p.name||"").trim()===name &&
      (!city || String(p.city||"").trim()===city)
    ) || arr.find(p=>String(p.name||"").trim()===name) || null;
  }

  function secondaryNodes(detail){
    return [...detail.querySelectorAll("p")].filter(node=>{
      const t=(node.textContent||"").trim();
      return /^Guides\s*:/i.test(t) ||
             /^Budget\s*:/i.test(t) ||
             /^Niveau actuel\s*:/i.test(t) ||
             /adresse géocodée|position manuelle|position approximative/i.test(t);
    });
  }

  function compact(detail){
    detail.classList.add("mytable-v29-sheet");
    detail.classList.remove("mytable-v29-expanded");
    secondaryNodes(detail).forEach(n=>n.classList.add("mytable-v29-secondary"));
  }

  function expanded(detail){
    detail.classList.add("mytable-v29-sheet","mytable-v29-expanded");
    secondaryNodes(detail).forEach(n=>n.classList.add("mytable-v29-secondary"));
  }

  function installHandle(detail){
    if(detail.querySelector(".mytable-v29-handle")) return;

    const handle=document.createElement("div");
    handle.className="mytable-v29-handle";
    handle.setAttribute("role","button");
    handle.setAttribute("aria-label","Afficher ou réduire les détails");
    handle.title="Toucher pour afficher les détails";
    detail.insertBefore(handle,detail.firstChild);

    handle.addEventListener("click",function(){
      if(detail.classList.contains("mytable-v29-expanded")) compact(detail);
      else expanded(detail);
    });

    let startY=0,startX=0,tracking=false;

    /* Capture phase intentionally takes ownership of the sheet gesture.
       This prevents the old V28 close-on-swipe listener from fighting it. */
    detail.addEventListener("touchstart",function(e){
      if(!mobile() || !e.touches?.[0]) return;
      startY=e.touches[0].clientY;
      startX=e.touches[0].clientX;
      tracking=true;
    },{passive:true,capture:true});

    detail.addEventListener("touchend",function(e){
      if(!tracking || !mobile() || !e.changedTouches?.[0]) return;
      tracking=false;

      const dy=e.changedTouches[0].clientY-startY;
      const dx=e.changedTouches[0].clientX-startX;

      if(Math.abs(dy)<35 || Math.abs(dy)<=Math.abs(dx)) return;

      e.preventDefault();
      e.stopImmediatePropagation();

      if(dy<0) expanded(detail);
      else compact(detail);
    },{passive:false,capture:true});
  }

  function addReservationButton(){
    const detail=document.getElementById("detail");
    if(!detail || !detail.classList.contains("open")) return;

    installHandle(detail);

    const actions=detail.querySelector(".detail-actions");
    if(!actions) return;

    const p=currentRestaurant();
    if(!p) return;

    if(actions.querySelector(".reservation")) return;

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

    secondaryNodes(detail).forEach(n=>n.classList.add("mytable-v29-secondary"));
    compact(detail);
  }

  /* Replace the old V28 focus behavior:
     the restaurant is centered in the visible map area ABOVE the sheet,
     rather than centered underneath the sheet. */
  function installFocusOverride(){
    if(window.__myTableV29FocusInstalled) return;
    if(typeof window.focusRestaurant!=="function") return;

    window.__myTableV29FocusInstalled=true;

    window.focusRestaurant=async function(p){
      try{
        const hasKnown=typeof window.manualCoords==="function" && !!window.manualCoords(p) ||
                       typeof window.cachedCoords==="function" && !!window.cachedCoords(p) ||
                       (Number.isFinite(p?.lat)&&Number.isFinite(p?.lng));

        if(!hasKnown && typeof window.geocode==="function"){
          const ok=await window.geocode(p);
          if(ok && typeof window.renderMarkers==="function") window.renderMarkers();
        }

        const cc=typeof window.coordsFor==="function"
          ? window.coordsFor(p)
          : [Number(p.lat),Number(p.lng)];

        const z=typeof window.zoomFor==="function" ? window.zoomFor(p) : 14;

        if(typeof window.showSelectedPin==="function") window.showSelectedPin(p);

        const mapRef=map;
        const detail=document.getElementById("detail");
        if(!mapRef || !detail) return;

        mapRef.invalidateSize();
        mapRef.setView(cc,z,{animate:true});

        const reveal=()=>{
          if(!mobile()) return;

          const marker=p.__marker;
          if(marker?.bringToFront) marker.bringToFront();

          const mapRect=mapRef.getContainer().getBoundingClientRect();
          const sheetRect=detail.getBoundingClientRect();

          const sheetTop=Math.max(0,sheetRect.top-mapRect.top);
          const topSafe=115;
          const visibleTop=topSafe;
          const visibleBottom=Math.max(visibleTop+80,sheetTop-14);
          const targetY=visibleTop+(visibleBottom-visibleTop)*0.52;

          const current=mapRef.latLngToContainerPoint(cc);
          const deltaY=current.y-targetY;

          if(Math.abs(deltaY)>8){
            mapRef.panBy([0,deltaY],{animate:true,duration:.24});
          }

          setTimeout(()=>{
            if(p.__marker?.bringToFront) p.__marker.bringToFront();
          },280);
        };

        requestAnimationFrame(()=>requestAnimationFrame(reveal));
      }catch(e){
        console.error("My Table V29: focusRestaurant",e);
      }
    };
  }

  function start(){
    installStyle();
    installFocusOverride();

    const detail=document.getElementById("detail");
    if(!detail) return;

    const observer=new MutationObserver(()=>{
      setTimeout(()=>{
        installFocusOverride();
        addReservationButton();
      },0);
    });

    observer.observe(detail,{
      childList:true,
      subtree:true,
      attributes:true,
      attributeFilter:["class"]
    });

    setTimeout(addReservationButton,300);
  }

  if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded",start);
  }else{
    start();
  }

})(window.MyTableBooking);
