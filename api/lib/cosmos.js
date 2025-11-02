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

// ✅ Admin check logic (works for both SWA Auth and shared passphrase)
function isAdmin(context, req) {
  const useSwa = (process.env.USE_SWA_AUTH || 'false').toLowerCase() === 'true';
  const admins = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);

  if (useSwa) {
    // 🔹 Using SWA authentication (roles or email check)
    const p = req.headers['x-ms-client-principal'];
    if (!p) return { ok: false };

    try {
      const d = JSON.parse(Buffer.from(p, 'base64').toString('utf8'));
      const email =
        d?.userDetails?.toLowerCase() ||
        d?.claims?.find(c => c.typ?.includes('email'))?.val?.toLowerCase();
      const roles = d?.userRoles || [];
      return {
        ok: roles.includes('admin') || (email && admins.includes(email)),
        email
      };
    } catch (err) {
      context.log('⚠️ Error decoding SWA principal:', err);
      return { ok: false };
    }
  } else {
    // 🔹 Manual admin mode using shared passphrase
    const headerPass = req.headers['x-admin-passphrase'];
    const envPass = process.env.ADMIN_PASSPHRASE;

    context.log('🔐 Admin check:', {
      provided: headerPass ? '[REDACTED]' : 'none',
      envSet: !!envPass
    });

    if (!envPass) {
      context.log('⚠️ ADMIN_PASSPHRASE not set in Azure Configuration.');
    }

    return { ok: headerPass && envPass && headerPass === envPass };
  }
}

module.exports = { client, rooms, bookings, dayRangeUtc, isAdmin };
