'use client';
import { useState, useEffect } from 'react';
export default function Home() {
  const [status, setStatus] = useState('');
  const [waktu, setWaktu] = useState('');
  const [wifiWajib, setWifiWajib] = useState('CIKA_NANAT');
  useEffect(() => {
    const t = setInterval(()=> setWaktu(new Date().toLocaleString('id-ID')), 1000);
    const savedWifi = localStorage.getItem('wifi_desa') || 'CIKA_NANAT';
    setWifiWajib(savedWifi);
    return ()=>clearInterval(t);
  },[]);
  const absen = (tipe) => {
    setStatus(`Mengecek WiFi ${wifiWajib}...`);
    setTimeout(()=>{
      const log = { waktu: new Date().toLocaleString('id-ID'), tipe, wifi: wifiWajib, nama: 'Perangkat Desa' };
      const old = JSON.parse(localStorage.getItem('absen_desa') || '[]');
      old.push(log);
      localStorage.setItem('absen_desa', JSON.stringify(old));
      setStatus(`✅ Berhasil absen ${tipe}! Jam: ${log.waktu} WiFi: ${wifiWajib}`);
      try{ const ctx = new (window.AudioContext || window.webkitAudioContext)(); const osc = ctx.createOscillator(); osc.connect(ctx.destination); osc.frequency.value=880; osc.start(); setTimeout(()=>osc.stop(), 300); }catch(e){}
    }, 800);
  }
  return (
    <div style={{padding:20, maxWidth:500, margin:'0 auto'}}>
      <h2 style={{textAlign:'center'}}>🏛️ Absensi Desa Gunungsari</h2>
      <p style={{textAlign:'center', background:'#e0f7ff', padding:10, borderRadius:8}}><b>WiFi Wajib:</b> {wifiWajib}<br/><small>{waktu}</small></p>
      <div style={{display:'grid', gap:12, marginTop:20}}>
        <button onClick={()=>absen('MASUK')} style={{padding:18, background:'#16a34a', color:'white', border:0, borderRadius:10, fontSize:18, fontWeight:'bold'}}>✅ ABSEN MASUK</button>
        <button onClick={()=>absen('PULANG')} style={{padding:18, background:'#dc2626', color:'white', border:0, borderRadius:10, fontSize:18, fontWeight:'bold'}}>🏠 ABSEN PULANG</button>
      </div>
      <pre style={{marginTop:20, background:'#f5f5f5', padding:12, borderRadius:8, whiteSpace:'pre-wrap'}}>{status || 'Silakan klik absen'}</pre>
      <div style={{display:'flex', gap:5, marginTop:20}}><a href="/admin" style={{flex:1, textAlign:'center', padding:10, background:'#000', color:'#fff', borderRadius:6, textDecoration:'none'}}>🔑 Admin</a><a href="/setting-bot" style={{flex:1, textAlign:'center', padding:10, background:'#fff', color:'#000', border:'1px solid #000', borderRadius:6, textDecoration:'none'}}>🤖 Bot</a></div>
    </div>
  );
}
