import React, { useEffect, useMemo, useState } from 'react'
import { getRooms, getBookings, createBooking, approve, deny } from './api'

function isoDate(d) { return new Date(d).toISOString() }
function yyyyMMdd(d) { return new Date(d).toISOString().slice(0,10) }

export default function App() {
  const [tab, setTab] = useState('search')
  const [rooms, setRooms] = useState([])
  const [filters, setFilters] = useState({ minCap: 1, date: yyyyMMdd(new Date()), start: '09:00', end: '10:00', features: [] })
  const [email, setEmail] = useState(localStorage.getItem('email') || '')
  const [adminPass, setAdminPass] = useState(localStorage.getItem('adminPass') || '')
  const [adminDate, setAdminDate] = useState(yyyyMMdd(new Date()))
  const [adminMode, setAdminMode] = useState(!!adminPass)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => { (async () => { setRooms(await getRooms()) })() }, [])
  useEffect(() => { localStorage.setItem('email', email) }, [email])
  useEffect(() => { localStorage.setItem('adminPass', adminPass); setAdminMode(!!adminPass) }, [adminPass])

  const filteredRooms = useMemo(() => rooms.filter(r => r.active && r.capacity >= (Number(filters.minCap)||1) && filters.features.every(f=>r.features?.includes(f))), [rooms, filters])

  async function handleCreate(roomId) {
    setLoading(true); setMsg('')
    try {
      const startIso = isoDate(`${filters.date}T${filters.start}:00`)
      const endIso = isoDate(`${filters.date}T${filters.end}:00`)
      const payload = { roomId, requesterEmail: email, requesterName: email.split('@')[0]||'Guest', purpose: 'Class/Session', startIso, endIso }
      const res = await createBooking(payload, adminMode ? adminPass : undefined)
      setMsg(`Created booking with status: ${res.status}`)
    } catch (e) { setMsg(String(e)) } finally { setLoading(false) }
  }

  function FeatureChecks() {
    const opts = ['projector','ac','whiteboard']
    return (
      <div className="row">
        {opts.map(f => (
          <label key={f}><input type="checkbox"
            checked={filters.features.includes(f)}
            onChange={e=> setFilters(s=> ({...s, features: e.target.checked ? [...s.features,f] : s.features.filter(x=>x!==f)}))} /> {f}
          </label>
        ))}
      </div>
    )
  }

  function RoomsList() {
    return (
      <div>
        {filteredRooms.map(r => (
          <div key={r.id} className="card">
            <div className="row"><b>{r.name}</b><span className="badge">Cap {r.capacity}</span><span>{r.building}</span></div>
            <div className="help">Features: {r.features?.join(', ')||'—'}</div>
            <div className="row">
              <button className="primary" disabled={!email||loading} onClick={()=>handleCreate(r.id)}>Book</button>
            </div>
          </div>
        ))}
      </div>
    )
  }

  function SearchCard() {
    return (
      <div className="card">
        <div className="row">
          <div><label>Date</label><input type="date" value={filters.date} onChange={e=>setFilters(s=>({...s, date:e.target.value}))} /></div>
          <div><label>Start</label><input type="time" value={filters.start} onChange={e=>setFilters(s=>({...s, start:e.target.value}))} /></div>
          <div><label>End</label><input type="time" value={filters.end} onChange={e=>setFilters(s=>({...s, end:e.target.value}))} /></div>
          <div><label>Min Capacity</label><input type="number" min="1" value={filters.minCap} onChange={e=>setFilters(s=>({...s, minCap:e.target.value}))} /></div>
        </div>
        <label>Features</label>
        <FeatureChecks />
        <hr />
        <div className="row">
          <div><label>Your Email</label><input type="email" placeholder="you@college.edu" value={email} onChange={e=>setEmail(e.target.value)} /></div>
          <div><label>Admin Mode Passphrase (optional)</label><input type="password" placeholder="••••••" value={adminPass} onChange={e=>setAdminPass(e.target.value)} /></div>
        </div>
        {msg && <p className="help">{msg}</p>}
      </div>
    )
  }

  function MyBookings() {
    const [items, setItems] = useState([])
    useEffect(() => { (async()=> { if(email) setItems(await getBookings({ email })) })() }, [email])
    return (
      <div className="card">
        <div className="row"><div><label>Email</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} /></div></div>
        <table className="table"><thead><tr><th>Room</th><th>Start</th><th>End</th><th>Status</th></tr></thead>
        <tbody>
          {items.map(b => (<tr key={b.id}><td>{b.roomId}</td><td>{new Date(b.startIso).toLocaleString()}</td><td>{new Date(b.endIso).toLocaleString()}</td><td>{b.status}</td></tr>))}
        </tbody></table>
      </div>
    )
  }

  function Admin() {
    const [items, setItems] = useState([])
    async function load() {
      const res = await getBookings({ date: adminDate })
      setItems(res)
    }
    useEffect(() => { load() }, [adminDate])
    async function act(fn, id) { try { await fn(id, adminPass); await load() } catch(e){ alert(e) } }
    return (
      <div className="card">
        <div className="row">
          <div><label>Date</label><input type="date" value={adminDate} onChange={e=>setAdminDate(e.target.value)} /></div>
          <div><label>Admin Passphrase</label><input type="password" value={adminPass} onChange={e=>setAdminPass(e.target.value)} /></div>
        </div>
        <table className="table"><thead><tr><th>Room</th><th>Requester</th><th>Start</th><th>End</th><th>Status</th><th>Action</th></tr></thead>
        <tbody>
          {items.map(b => (
            <tr key={b.id}>
              <td>{b.roomId}</td>
              <td>{b.requesterName} <div className="help">{b.requesterEmail}</div></td>
              <td>{new Date(b.startIso).toLocaleString()}</td>
              <td>{new Date(b.endIso).toLocaleString()}</td>
              <td>{b.status}</td>
              <td className="row">
                <button onClick={()=>act(approve,b.id)} disabled={!adminPass||b.status==='approved'}>Approve</button>
                <button onClick={()=>act(deny,b.id)} disabled={!adminPass||b.status==='denied'}>Deny</button>
              </td>
            </tr>
          ))}
        </tbody></table>
      </div>
    )
  }

  return (
    <>
      <header><div className="container"><h2>Classroom Booking</h2></div></header>
      <div className="container">
        <div className="tabs">
          {['search','my','admin'].map(t => (
            <div key={t} className={`tab ${tab===t?'active':''}`} onClick={()=>setTab(t)}>
              {t==='search'?'Search/Book':t==='my'?'My Bookings':'Admin'}
            </div>
          ))}
        </div>
        {tab==='search' && (<><SearchCard /><RoomsList /></>)}
        {tab==='my' && <MyBookings />}
        {tab==='admin' && <Admin />}
      </div>
    </>
  )
}
