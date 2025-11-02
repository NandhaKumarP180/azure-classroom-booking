import { CosmosClient } from '@azure/cosmos'
const client = new CosmosClient({ endpoint: process.env.COSMOS_ENDPOINT, key: process.env.COSMOS_KEY })
const db = client.database(process.env.COSMOS_DB || 'classroom-booking')
export const rooms = db.container(process.env.ROOMS_CONTAINER || 'rooms')
export const bookings = db.container(process.env.BOOKINGS_CONTAINER || 'bookings')
export function dayRangeUtc(d){ const s=new Date(`${d}T00:00:00.000Z`); const e=new Date(`${d}T23:59:59.999Z`); return {startIso:s.toISOString(),endIso:e.toISOString()} }
export function isAdmin(context, req){
  const useSwa = (process.env.USE_SWA_AUTH||'false').toLowerCase()==='true'
  const admins = (process.env.ADMIN_EMAILS||'').split(',').map(s=>s.trim().toLowerCase()).filter(Boolean)
  if(useSwa){
    const p=req.headers['x-ms-client-principal']; if(!p) return {ok:false}
    try{
      const d=JSON.parse(Buffer.from(p,'base64').toString('utf8'))
      const email = d?.userDetails?.toLowerCase() || d?.claims?.find(c=>c.typ?.includes('email'))?.val?.toLowerCase()
      const roles = d?.userRoles || []
      return { ok: roles.includes('admin') || (email && admins.includes(email)), email }
    }catch{ return {ok:false} }
  } else {
    return { ok: req.headers['x-admin-passphrase'] === process.env.ADMIN_PASSPHRASE }
  }
}
