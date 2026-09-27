/* My Table — Reservation Adapter V28.3
 * Frontend-safe. No provider secret belongs here.
 * Live availability must come from MyTable backend/provider.
 */
window.MyTableBooking = window.MyTableBooking || {};
(function(NS){
  NS.version="28.3";
  NS.buttonFor=function(p){
    const r=p?.reservation||{};
    if(r.supports_live_availability && r.provider) return {
      label:"Voir les disponibilités", action:"live_availability", provider:r.provider,
      live:true, verified:true
    };
    if(r.supports_direct_booking && r.booking_url) return {
      label:r.provider==="direct"?"Réserver sur le site":"Réserver", action:"external_booking",
      url:r.booking_url, live:false, verified:true
    };
    if(r.supports_direct_booking) return {
      label:"Réserver", action:"reservation_contact", live:false, verified:true
    };
    return {label:"Réservation non disponible",action:"none",live:false,verified:false};
  };

  NS.buildAvailabilityRequest=function(p,{date,time,partySize}={}){
    if(!p?.reservation?.supports_live_availability || !p.reservation.provider)
      return {status:"not_configured",message:"Aucune disponibilité temps réel configurée."};
    return {
      status:"backend_required",
      provider:p.reservation.provider,
      restaurant_id:p.reservation.restaurant_id||null,
      date:date||null,time:time||null,party_size:partySize||null,
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
      date:date||null,time:time||null,party_size:partySize||null,
      customer:customer||{},
      endpoint:"/api/booking/reservation"
    };
  };
})(window.MyTableBooking);
