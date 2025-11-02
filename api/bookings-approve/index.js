const { bookings, isAdmin } = require('../lib/cosmos.js');

module.exports = async function (context, req) {
  const admin = isAdmin(context, req);
  if (!admin.ok) {
    context.res = { status: 401, body: 'Admin required' };
    return;
  }

  const id = context.bindingData.id;
  const { resource } = await bookings.item(id, undefined).read();

  if (!resource) {
    context.res = { status: 404, body: 'Not found' };
    return;
  }

  resource.status = 'approved';
  await bookings.items.upsert(resource);

  context.res = { status: 200, body: resource };
};
