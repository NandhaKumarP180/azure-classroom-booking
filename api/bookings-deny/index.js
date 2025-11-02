const { bookings, isAdmin } = require('../lib/cosmos.js');

module.exports = async function (context, req) {
  const admin = isAdmin(context, req);
  if (!admin.ok) {
    context.res = { status: 401, body: 'Admin required' };
    return;
  }

  const id = context.bindingData.id;
  const roomId = req.query.roomId || req.body?.roomId;

  if (!roomId) {
    context.res = { status: 400, body: 'roomId required' };
    return;
  }

  // ✅ Use roomId as the partition key when reading the booking
  const { resource } = await bookings.item(id, roomId).read();

  if (!resource) {
    context.res = { status: 404, body: 'Not found' };
    return;
  }

  // ✅ Update status to denied
  resource.status = 'denied';
  await bookings.items.upsert(resource);

  context.res = { status: 200, body: resource };
};
