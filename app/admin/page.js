'use client';
import { useState, useEffect } from 'react';

export default function Admin(){
  const [login, setLogin] = useState(false);
  const [passInput, setPassInput] = useState('');
  const [wifi, setWifi] = useState('CIKA_NANAT');
  const [passAdmin, setPassAdmin] = useState('Ch@dast1936');
  const [data, setData] = useState([]);
  const [pesan, setPesan] = useState('');

  useEffect(()=>{
    const savedWifi = localStorage.getItem('wifi_desa') || 'CIKA_NANAT';
    const savedPass = localStorage.getItem('pass_admin') || 'Ch@dast1936';
    const savedAbsen = JSON.parse(localStorage.getItem('absen_desa') || '[]');
    setWifi(savedWifi); setPassAdmin(savedPass); setData(savedAbsen);
  },[]);

  const handleLogin = ()=>{
    if(passInput === passAdmin){ setLogin(true); } else { alert('Password salah! Default: Ch@dast1936'); }
  }

  const saveWifi = ()=>{
    localStorage.setItem('wifi_desa', wifi);
    setPesan('✅ WiFi berhasil diganti jadi: '+wifi);
  }
  const savePass = ()=>{
    localStorage.setItem('pass_admin', passAdmin);
    setPesan('✅ Password admin berhasil diganti!');
  }

  const downloadExcel = ()=>{
    let csv = 'Nama,Waktu,Tipe,WiFi\n';
    data.forEach(d=>{ csv+=`${d.nama||'Perangkat'},${d.waktu},${d.tipe},${d.wifi}\n`; });
    const blob = new Blob([csv], {type:'text/csv'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href=url; a.download=`rekap-${new Date().toISOString().slice(0,10)}.csv`; a.click();
  }

  if(!login){
    return (
      <div style={{padding:20, maxWidth:400, margin:'0 auto', fontFamily:'sans-serif'}}>
        <h2>Login Admin</h2>
        <p>Password Default: <b>Ch@dast1936</b></p>
        <input type="password" value={passInput} onChange={e=>setPassInput(e.target.value)} placeholder="Password" style={{width:'100%', padding:12, marginBottom:10}}/>
        <button onClick={handleLogin} style={{width:'100%', padding:12, background:'black', color:'white'}}>LOGIN</button>
        <br/><br/><a href="/">Kembali</a>
      </div>
    )
  }

  return (
    <div style={{padding:20, fontFamily:'sans-serif', maxWidth:600, margin:'0 auto'}}>
      <h2>Panel Kades/Sekdes</h2>
      <p style={{color:'green'}}>{pesan}</p>
      
      <div style={{border:'1px solid #ddd', padding:15, borderRadius:8, marginBottom:15}}>
        <h4>1. Setting WiFi (bisa diganti kapan saja)</h4>
        <input value={wifi} onChange={e=>setWifi(e.target.value)} style={{width:'70%', padding:8}}/>
        <button onClick={saveWifi} style={{padding:8, marginLeft:5}}>Simpan</button>
      </div>

      <div style={{border:'1px solid #ddd', padding:15, borderRadius:8, marginBottom:15}}>
        <h4>2. Ganti Password Admin</h4>
        <input value={passAdmin} onChange={e=>setPassAdmin(e.target.value)} style={{width:'70%', padding:8}}/>
        <button onClick={savePass} style={{padding:8, marginLeft:5}}>Simpan</button>
      </div>

      <div style={{border:'1px solid #ddd', padding:15, borderRadius:8, marginBottom:15}}>
        <h4>3. Rekap Absen: {data.length} data</h4>
        <button onClick={downloadExcel} style={{padding:10, background:'#16a34a', color:'white', border:0}}>📥 Download Excel (CSV)</button>
        <div style={{maxHeight:200, overflow:'auto', marginTop:10, background:'#f9f9f9', padding:10}}>
          {data.slice(-20).reverse().map((d,i)=><div key={i} style={{fontSize:12, borderBottom:'1px solid #eee'}}>{d.waktu} - {d.tipe} - {d.wifi}</div>)}
        </div>
      </div>

      <div style={{border:'1px solid #ddd', padding:15, borderRadius:8}}>
        <h4>4. Bot WA Gratis (Rp 0)</h4>
        <p>Bot tidak wajib WiFi desa, cukup internet ON. Jika offline, absen masuk antrian otomatis + lonceng web bunyi.</p>
        <a href="/setting-bot" style={{display:'inline-block', padding:10, background:'black', color:'white', textDecoration:'none'}}>Buka Setting Bot</a>
      </div>
      <br/><a href="/">Kembali ke Absen</a>
    </div>
  )
}
