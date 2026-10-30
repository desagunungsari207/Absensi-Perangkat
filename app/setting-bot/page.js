'use client';
import { useState, useEffect } from 'react';
export default function BotSetting(){
  const [apikey, setApikey] = useState('');
  const [nomorTest, setNomorTest] = useState('');
  const [status, setStatus] = useState('');
  useEffect(()=>{
    setApikey(localStorage.getItem('callmebot_apikey') || '');
    setNomorTest(localStorage.getItem('nomor_kades') || '');
  },[]);
  const save = ()=>{
    localStorage.setItem('callmebot_apikey', apikey);
    localStorage.setItem('nomor_kades', nomorTest);
    setStatus('✅ APIKEY disimpan - Bot WA Gratis Aktif');
  }
  const testKirim = ()=>{
    if(!apikey || !nomorTest) return alert('Isi apikey & nomor');
    setStatus('⏳ Mengirim test...');
    fetch(`https://api.callmebot.com/whatsapp.php?phone=${nomorTest}&text=${encodeURIComponent('Test Bot Desa Gunungsari - WA Gratis Aktif ✅')}&apikey=${apikey}`)
      .then(r=>r.text()).then(t=>{ setStatus(`Hasil: ${t}. Jika 'Message queued', cek WA`); }).catch(e=> setStatus('Error cek apikey'));
  }
  return (
    <div style={{maxWidth:500, margin:'20px auto', padding:20, fontFamily:'sans-serif', background:'white', borderRadius:12, border:'1px solid #ddd'}}>
      <h2>🤖 Bot WA Gratis</h2>
      <p style={{fontSize:12, background:'#ecfdf5', padding:10, borderRadius:8}}>Gratis, tanpa QR, pakai CallMeBot. Sesuai poin 4.</p>
      <h4 style={{marginTop:20}}>Cara dapat APIKEY Gratis:</h4>
      <ol style={{fontSize:12}}><li>Save nomor <b>+34 644 10 55 84</b> nama CallMeBot</li><li>Kirim WA ke nomor itu: <code>I allow callmebot to send me messages</code></li><li>Bot balas kasih APIKEY 6 digit</li><li>Paste di bawah</li></ol>
      <label style={{fontSize:12}}>APIKEY:</label>
      <input value={apikey} onChange={e=>setApikey(e.target.value)} placeholder="123456" style={{width:'100%', padding:10, borderRadius:6, border:'1px solid #ccc', marginBottom:10}}/>
      <label style={{fontSize:12}}>Nomor Kades 62812...:</label>
      <input value={nomorTest} onChange={e=>setNomorTest(e.target.value)} placeholder="62812xxxx" style={{width:'100%', padding:10, borderRadius:6, border:'1px solid #ccc', marginBottom:10}}/>
      <button onClick={save} style={{width:'100%', padding:12, background:'black', color:'white', borderRadius:8, marginBottom:8}}>💾 Simpan</button>
      <button onClick={testKirim} style={{width:'100%', padding:12, background:'#25D366', color:'white', borderRadius:8, border:0}}>📱 Test Kirim WA</button>
      {status && <div style={{marginTop:15, padding:10, background:'#f1f5f9', borderRadius:8, fontSize:12}}>{status}</div>}
      <div style={{marginTop:20, fontSize:11, color:'#64748b'}}><b>Kondisi Broadcast:</b><br/>- WiFi Only: Pengingat absen, cuma di kantor<br/>- Semua: Kegiatan/libur, kirim WA ke 10 user dimana saja via APIKEY gratis<br/>- Absen otomatis → WA ke Kades</div>
      <br/><a href="/admin">← Kembali Admin</a> | <a href="/">Absen</a>
    </div>
  )
}
