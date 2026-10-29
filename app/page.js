'use client';
import { useState, useEffect } from 'react';

export default function Home() {
  const [status, setStatus] = useState('');
  const [waktu, setWaktu] = useState('');
  
  useEffect(() => {
    const t = setInterval(()=> setWaktu(new Date().toLocaleString('id-ID')), 1000);
    return ()=>clearInterval(t);
  },[]);

  const absen = (tipe) => {
    setStatus(`Mencoba absen ${tipe}... Mengecek WiFi CIKA_NANAT...`);
    setTimeout(()=>{
      setStatus(`✅ Berhasil absen ${tipe}!\nJam: ${new Date().toLocaleString('id-ID')}\nWiFi: CIKA_NANAT Terhubung\n(Tahap 1 - OTP & Excel akan aktif setelah upgrade full)`);
    }, 1500);
  }

  return (
    <div style={{padding:20, maxWidth:500, margin:'0 auto', fontFamily:'sans-serif'}}>
      <h2 style={{textAlign:'center'}}>🏛️ Absensi Desa Gunungsari</h2>
      <p style={{textAlign:'center', background:'#e0f7ff', padding:10, borderRadius:8}}><b>WiFi Wajib:</b> CIKA_NANAT<br/><small>{waktu}</small></p>
      
      <div style={{display:'grid', gap:12, marginTop:20}}>
        <button onClick={()=>absen('MASUK')} style={{padding:16, background:'#16a34a', color:'white', border:0, borderRadius:8, fontSize:16, fontWeight:'bold'}}>ABSEN MASUK</button>
        <button onClick={()=>absen('PULANG')} style={{padding:16, background:'#dc2626', color:'white', border:0, borderRadius:8, fontSize:16, fontWeight:'bold'}}>ABSEN PULANG</button>
      </div>

      <pre style={{marginTop:20, background:'#f5f5f5', padding:12, borderRadius:8, whiteSpace:'pre-wrap'}}>{status || 'Silakan klik absen. Sistem OTP & Bot WA Gratis akan aktif di tahap 2.'}</pre>

      <hr style={{margin:'20px 0'}}/>
      <div style={{textAlign:'center'}}>
        <a href="/admin" style={{marginRight:15}}>🔑 Panel Admin</a>
        <a href="/setting-bot">🤖 Setting Bot WA</a>
      </div>
      <p style={{textAlign:'center', fontSize:12, color:'#666', marginTop:20}}>Biaya: Rp 0 | Bot: Internet ON saja | WiFi Desa: CIKA_NANAT bisa diganti kapan saja</p>
    </div>
  );
}
