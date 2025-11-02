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

// ✅ Create a new booking (students/faculty)
export async function createBooking(payload, adminPass) {
  const headers = {
    'Content-Type': 'application/json'
  };
  if (adminPass) headers['x-admin-passphrase'] = adminPass;

  const r = await fetch(`${base}/bookings`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
  });

  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

// ✅ Approve booking (admin only)
export async function approve(id, adminPass) {
  if (!adminPass) throw new Error('Admin passphrase required!');
  const r = await fetch(`${base}/bookings/${id}/approve`, {
    method: 'PATCH',
    headers: { 'x-admin-passphrase': adminPass }
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

// ✅ Deny booking (admin only)
export async function deny(id, adminPass) {
  if (!adminPass) throw new Error('Admin passphrase required!');
  const r = await fetch(`${base}/bookings/${id}/deny`, {
    method: 'PATCH',
    headers: { 'x-admin-passphrase': adminPass }
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}
