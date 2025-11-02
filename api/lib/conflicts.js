export function overlaps(aStart, aEnd, bStart, bEnd){
  return new Date(aStart) < new Date(bEnd) && new Date(aEnd) > new Date(bStart)
}
export function hasConflict(list, cand){
  return list.some(e => e.status==='approved' && overlaps(cand.startIso,cand.endIso,e.startIso,e.endIso))
}
