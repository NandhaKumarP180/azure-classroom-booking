import { bookings, dayRangeUtc } from '../lib/cosmos.js'
export default async function (context, req){
  const roomId=req.query.roomId, date=req.query.date, email=req.query.email?.toLowerCase()
  if(email){
    const q={ query:'SELECT * FROM c WHERE LOWER(c.requesterEmail)=@e', parameters:[{name:'@e',value:email}] }
    const { resources } = await bookings.items.query(q).fetchAll()
    context.res = { status:200, body: resources }; return
  }
  if(!date){ context.res={status:400, body:'date=YYYY-MM-DD required (or email=)'}; return }
  const { startIso, endIso } = dayRangeUtc(date)
  const params=[{name:'@start',value:startIso},{name:'@end',value:endIso}]
  let where='WHERE c.startIso < @end AND c.endIso > @start'
  if(roomId){ where+=' AND c.roomId = @room'; params.push({name:'@room',value:roomId}) }
  const { resources } = await bookings.items.query({ query:`SELECT * FROM c ${where}`, parameters:params }).fetchAll()
  context.res = { status:200, body: resources }
}
