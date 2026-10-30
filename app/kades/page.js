'use client';
import { useState, useEffect } from 'react';
export default function KadesPanel(){
  const [login, setLogin] = useState(false);
  const [passInput, setPassInput] = useState('');
  const [absen, setAbsen] = useState([]);
  const [filterTanggal, setFilterTanggal] = useState(new Date().toLocaleDateString('id-ID'));
  useEffect(()=>{ setAbsen(JSON.parse(localStorage.getItem('absen_desa') || '[]')); },[]);
  const handleLogin = ()=>{
    const saved = localStorage.getItem('pass_admin') || 'Ch@dast1936';
    if(passInput === saved) setLogin(true); else alert('Password salah! Default Ch@dast1936');
  }
  const downloadExcel = ()=>{
    const rows = [['Tanggal','Nama','Tipe','Jam','Status']];
    absen.forEach(a=> rows.push([a.tanggal, a.nama, a.tipe, a.jam, a.status]));
    const csv = rows.map(r=>r.join(',')).join('\n');
    const blob = new Blob([csv], {type:'text/csv'}); const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href=url; a.download=`rekap_${filterTanggal}.csv`; a.click();
  }
  const todayAbsen = absen.filter(a=>a.tanggal === filterTanggal);
  const sudahMasuk = todayAbsen.filter(a=>a.tipe==='MASUK');
  const belumAbsen = ()=>{
    const staff = JSON.parse(localStorage.getItem('staff_desa') || '[]');
    return staff.filter(s=>!todayAbsen.some(a=>a.nama===s.nama && a.tipe==='MASUK')).map(s=>s.nama);
  }
  if(!login){
    return (<div style={{padding:20, maxWidth:400, margin:'40px auto', border:'1px solid #ddd', borderRadius:12, fontFamily:'sans-serif', background:'white'}}><h2>📊 Panel Kades & Sekdes</h2><p style={{fontSize:12, color:'#666'}}>Hanya rekap kehadiran (Poin 2) - Password sama dengan Admin</p><input type="password" value={passInput} onChange={e=>setPassInput(e.target.value)} placeholder="Password" style={{width:'100%', padding:12, borderRadius:6, border:'1px solid #ccc'}}/><button onClick={handleLogin} style={{width:'100%', padding:12, marginTop:10, background:'black', color:'white', borderRadius:6}}>LIHAT REKAP</button><br/><br/><a href="/">← Kembali Absen</a></div>)
  }
  return (<div style={{padding:15, maxWidth:800, margin:'0 auto', fontFamily:'sans-serif'}}><h2>📊 Rekap Kades & Sekdes</h2><div style={{display:'flex', gap:10, marginBottom:15}}><input value={filterTanggal} onChange={e=>setFilterTanggal(e.target.value)} style={{padding:8, borderRadius:6, border:'1px solid #ccc'}}/><button onClick={downloadExcel} style={{padding:8, background:'#16a34a', color:'white', border:0, borderRadius:6}}>⬇️ Excel</button></div><div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginBottom:20}}><div style={{background:'white', padding:15, borderRadius:10, border:'1px solid #ddd', textAlign:'center'}}><b style={{fontSize:24}}>{sudahMasuk.length}</b><br/><span style={{fontSize:12}}>Sudah Masuk</span></div><div style={{background:'white', padding:15, borderRadius:10, border:'1px solid #ddd', textAlign:'center'}}><b style={{fontSize:24, color:'orange'}}>{todayAbsen.filter(a=>a.status==='Terlambat').length}</b><br/><span style={{fontSize:12}}>Terlambat</span></div><div style={{background:'white', padding:15, borderRadius:10, border:'1px solid #ddd', textAlign:'center'}}><b style={{fontSize:24, color:'red'}}>{belumAbsen().length}</b><br/><span style={{fontSize:12}}>Belum Absen</span></div></div>{belumAbsen().length>0 && <div style={{background:'#fee2e2', padding:10, borderRadius:8, marginBottom:15, fontSize:12}}>Belum Absen: {belumAbsen().join(', ')}</div>}<div style={{background:'white', borderRadius:10, border:'1px solid #ddd', overflow:'hidden'}}><table style={{width:'100%', fontSize:12, borderCollapse:'collapse'}}><thead style={{background:'#f1f5f9'}}><tr><th style={{padding:8, textAlign:'left'}}>Nama</th><th>Tipe</th><th>Jam</th><th>Status</th></tr></thead><tbody>{todayAbsen.map(a=><tr key={a.id} style={{borderTop:'1px solid #eee'}}><td style={{padding:8}}>{a.nama}</td><td>{a.tipe}</td><td>{a.jam}</td><td>{a.status}</td></tr>)}</tbody></table></div><br/><a href="/">← Absen</a> | <a href="/admin">Admin</a></div>)
}
