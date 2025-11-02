const base = '/api';

// ✅ Fetch all rooms
export async function getRooms() {
  const r = await fetch(`${base}/rooms`);
  if (!r.ok) throw new Error('rooms');
  return r.json();
}

// ✅ Fetch bookings (by room/date/email)
export async function getBookings({ roomId, date, email }) {
  const p = new URLSearchParams();
  if (roomId) p.set('roomId', roomId);
  if (date) p.set('date', date);
  if (email) p.set('email', email);

  const r = await fetch(`${base}/bookings?${p.toString()}`);
  if (!r.ok) throw new Error('bookings');
  return r.json();
}

// ✅ Create booking (with optional admin passphrase)
export async function createBooking(payload, adminPass) {
  const r = await fetch(`${base}/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(adminPass ? { 'x-admin-passphrase': adminPass } : {}),
    },
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

// ✅ Approve booking (now includes roomId)
export async function approve(id, roomId, adminPass) {
  const r = await fetch(`${base}/bookings/${id}/approve?roomId=${roomId}`, {
    method: 'PATCH',
    headers: {
      ...(adminPass ? { 'x-admin-passphrase': adminPass } : {}),
    },
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

// ✅ Deny booking (now includes roomId)
export async function deny(id, roomId, adminPass) {
  const r = await fetch(`${base}/bookings/${id}/deny?roomId=${roomId}`, {
    method: 'PATCH',
    headers: {
      ...(adminPass ? { 'x-admin-passphrase': adminPass } : {}),
    },
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}
