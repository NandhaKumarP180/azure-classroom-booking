const { CosmosClient } = require('@azure/cosmos');

// ✅ Initialize Cosmos DB client
const client = new CosmosClient({
  endpoint: process.env.COSMOS_ENDPOINT,
  key: process.env.COSMOS_KEY
});

const db = client.database(process.env.COSMOS_DB || 'classroom-booking');
const rooms = db.container(process.env.ROOMS_CONTAINER || 'rooms');
const bookings = db.container(process.env.BOOKINGS_CONTAINER || 'bookings');

// ✅ Utility: Get UTC start/end of a given date
function dayRangeUtc(d) {
  const s = new Date(`${d}T00:00:00.000Z`);
  const e = new Date(`${d}T23:59:59.999Z`);
  return { startIso: s.toISOString(), endIso: e.toISOString() };
}

// ✅ Admin check logic (hardcoded passphrase for local + Azure use)
function isAdmin(context, req) {
  const headerPass = req.headers['x-admin-passphrase'];
  const hardcodedPass = 'changeme'; // 🔒 your fixed admin passphrase

  // Logging for visibility (won’t leak actual passphrase)
  context.log('🔐 Admin header received:', !!headerPass);

  if (headerPass && headerPass === hardcodedPass) {
    context.log('✅ Admin verified successfully');
    return { ok: true };
  } else {
    context.log('❌ Invalid or missing admin passphrase');
    return { ok: false };
  }
}

module.exports = { client, rooms, bookings, dayRangeUtc, isAdmin };
