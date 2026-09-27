/* My Table DB Adapter V28.2 */
window.MyTableDB = window.MyTableDB || {};
MyTableDB.version = "28.2";
MyTableDB.restaurants = () => window.RESTAURANTS || [];
MyTableDB.findByIntent = (q, opts) => window.MyTableIntent.findByIntent(q, opts);
MyTableDB.isBookable = p => !!(p && p.reservation && p.reservation.supports_direct_booking);
MyTableDB.hasLiveAvailability = p => !!(p && p.reservation && p.reservation.supports_live_availability);
MyTableDB.geoReady = p => !!(p && p.geolocation && p.geolocation.lat != null && p.geolocation.lng != null);
MyTableDB.dataQuality = () => ({
  restaurants: MyTableDB.restaurants().length,
  geocoded: MyTableDB.restaurants().filter(MyTableDB.geoReady).length,
  withBudget: MyTableDB.restaurants().filter(p=>p.budget).length,
  withCategories: MyTableDB.restaurants().filter(p=>(p.categories||[]).length).length
});
