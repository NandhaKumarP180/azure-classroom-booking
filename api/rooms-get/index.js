const { rooms } = require('../lib/cosmos.js');

module.exports = async function (context, req) {
  const { resources } = await rooms.items
    .query('SELECT * FROM c WHERE c.active = true')
    .fetchAll();

  context.res = { status: 200, body: resources };
};
