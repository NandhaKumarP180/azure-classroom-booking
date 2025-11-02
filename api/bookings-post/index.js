import { bookings } from '../lib/cosmos.js'
import { hasConflict } from '../lib/conflicts.js'
import { isAdmin } from '../lib/cosmos.js'
function uuid(){return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,c=>{const r=Math.random()*16|0,v=c==='x'?r:(r&0x3|0x8);return v.toString(16)})}
export default async function (context, req){
  const b=req.body||{}, need=['roomId','requesterEmail','requesterName','purpose','startIso','endIso']
  for(const k of need) if(!b[k]) { context.res={status:400, body:`${k} required`}; return }
  if(new Date(b.startIso) >= new Date(b.endIso)) { context.res={status:400, body:'start < end required'}; return }
  const cand={ id:uuid(), roomId:b.roomId, requesterEmail:String(b.requesterEmail).toLowerCase(), requesterName:b.requesterName, purpose:b.purpose, startIso:b.startIso, endIso:b.endIso, status:'pending', createdAtIso:new Date().toISOString() }
  const { resources: same } = await bookings.items.query({
    query:'SELECT * FROM c WHERE c.roomId=@r AND c.startIso < @end AND c.endIso > @start',
    parameters:[{name:'@r',value:cand.roomId},{name:'@start',value:cand.startIso},{name:'@end',value:cand.endIso}]
  }).fetchAll()
  if(hasConflict(same,cand)){ context.res={status:409, body:'Conflicts with an approved booking.'}; return }
  if(isAdmin(context,req).ok) cand.status='approved'
  await bookings.items.create(cand)
  context.res={status:200, body:cand}
}
