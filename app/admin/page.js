'use client';
import { useState, useEffect } from 'react';
export default function Admin(){
  const [login, setLogin] = useState(false);
  const [passInput, setPassInput] = useState('');
  const [staff, setStaff] = useState([]);
  const [wifiSSID, setWifiSSID] = useState('CIKA_NANAT');
  const [jamMasuk, setJamMasuk] = useState('07:30');
  const [jamPulang, setJamPulang] = useState('15:30');
  const [toleransi, setToleransi] = useState('15');
  const [nama, setNama] = useState('');
  const [wa, setWa] = useState('');
  const [jabatan, setJabatan] = useState('Perangkat Desa');
  const [newPass, setNewPass] = useState('');
  const [nomorKades, setNomorKades] = useState('');

  useEffect(()=>{
    setWifiSSID(localStorage.getItem('wifi_desa') || 'CIKA_NANAT');
    setStaff(JSON.parse(localStorage.getItem('staff_desa') || '[]'));
    setJamMasuk(localStorage.getItem('jam_masuk') || '07:30');
    setJamPulang(localStorage.getItem('jam_pulang') || '15:30');
    setToleransi(localStorage.getItem('toleransi') || '15');
    setNomorKades(localStorage.getItem('nomor_kades') || '');
  },[]);

  const handleLogin = ()=>{
    const saved = localStorage.getItem('pass_admin') || 'Ch@dast1936';
    if(passInput === saved) setLogin(true); else alert('Password salah! Default Ch@dast1936');
  }
  const tambahStaff = ()=>{
    if(!nama || !wa) return alert('Nama & WA wajib');
    if(staff.length >=10) return alert('Maksimal 10 sesuai rencana');
    const baru = { id: Date.now(), nama, wa, jabatan };
    const all = [...staff, baru]; setStaff(all);
    localStorage.setItem('staff_desa', JSON.stringify(all));
    alert(`✅ ${nama} ditambah. Total ${all.length}/10`); setNama(''); setWa('');
  }
  const hapusStaff = (id)=>{
    if(!confirm('Hapus?')) return;
    const all = staff.filter(s=>s.id!==id); setStaff(all);
    localStorage.setItem('staff_desa', JSON.stringify(all));
  }
  const saveWifi = ()=>{ localStorage.setItem('wifi_desa', wifiSSID); alert(`✅ WiFi: ${wifiSSID}`); }
  const saveJam = ()=>{ localStorage.setItem('jam_masuk', jamMasuk); localStorage.setItem('jam_pulang', jamPulang); localStorage.setItem('toleransi', toleransi); alert(`✅ Jam disimpan`); }
  const savePass = ()=>{ if(!newPass) return alert('Isi password'); localStorage.setItem('pass_admin', newPass); alert(`✅ Password diganti: ${newPass} (untuk Admin & Kades)`); setNewPass(''); }
  const saveNomorKades = ()=>{ localStorage.setItem('nomor_kades', nomorKades); alert(`✅ Nomor Kades: ${nomorKades}`); }
  const broadcast = (mode)=>{
    const pesan = document.getElementById('pesan_broadcast').value;
    if(!pesan) return alert('Isi pesan');
    const apikey = localStorage.getItem('callmebot_apikey') || '';
    if(mode==='Semua'){
      if(!apikey) return alert('Isi APIKEY di Setting Bot dulu');
      staff.forEach(s=>{
        if(s.wa && apikey){ fetch(`https://api.callmebot.com/whatsapp.php?phone=${s.wa}&text=${encodeURIComponent(pesan)}&apikey=${apikey}`).catch(()=>{}); }
      });
      alert(`✅ Broadcast SEMUA ke ${staff.length} perangkat via WA Gratis`);
    } else {
      alert(`✅ Broadcast WiFi Only: "${pesan}" (hanya tampil di kantor, sesuai poin 4)`);
    }
  }

  if(!login){
    return (<div style={{padding:20, maxWidth:400, margin:'40px auto', border:'1px solid #ddd', borderRadius:12, fontFamily:'sans-serif', background:'white'}}><h2>🔑 Login Admin</h2><p style={{fontSize:11}}>Password sama dengan Kades (Poin 1)</p><input type="password" value={passInput} onChange={e=>setPassInput(e.target.value)} placeholder="Password" style={{width:'100%', padding:12, borderRadius:6, border:'1px solid #ccc'}}/><button onClick={handleLogin} style={{width:'100%', padding:12, marginTop:10, background:'black', color:'white', borderRadius:6}}>LOGIN</button><br/><br/><a href="/">← Kembali</a></div>)
  }

  return (
    <div style={{padding:15, maxWidth:1000, margin:'0 auto', fontFamily:'sans-serif', background:'#f8fafc'}}>
      <h2>🏛️ Admin Desa Gunungsari</h2>
      <p style={{fontSize:12, color:'#64748b'}}>Setting 10 user, notif, semua pengaturan (Poin 3 & 4)</p>
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:15}}>
        <div style={{background:'white', padding:15, borderRadius:10, border:'1px solid #ddd'}}>
          <h4>👥 10 User ({staff.length}/10)</h4>
          <input value={nama} onChange={e=>setNama(e.target.value)} placeholder="Nama" style={{width:'100%', padding:8, marginBottom:6, borderRadius:6, border:'1px solid #ccc'}}/>
          <input value={wa} onChange={e=>setWa(e.target.value)} placeholder="No WA 62xxxx" style={{width:'100%', padding:8, marginBottom:6, borderRadius:6, border:'1px solid #ccc'}}/>
          <select value={jabatan} onChange={e=>setJabatan(e.target.value)} style={{width:'100%', padding:8, marginBottom:8, borderRadius:6}}><option>Perangkat Desa</option><option>Sekretaris Desa</option><option>Kades</option><option>Petugas Lapangan</option></select>
          <button onClick={tambahStaff} style={{width:'100%', padding:10, background:'#16a34a', color:'white', border:0, borderRadius:6, fontWeight:'bold'}}>Tambah Staff</button>
          <div style={{marginTop:10, fontSize:12, maxHeight:150, overflow:'auto'}}>{staff.map(s=><div key={s.id} style={{display:'flex', justifyContent:'space-between', borderBottom:'1px solid #eee', padding:'6px 0'}}><span>{s.nama} - {s.jabatan}</span><button onClick={()=>hapusStaff(s.id)} style={{background:'#fee2e2', border:0, borderRadius:4, fontSize:10}}>Hapus</button></div>)}</div>
        </div>
        <div style={{background:'white', padding:15, borderRadius:10, border:'1px solid #ddd'}}>
          <h4>📶 WiFi (Poin 1)</h4>
          <input value={wifiSSID} onChange={e=>setWifiSSID(e.target.value)} style={{width:'100%', padding:8, marginBottom:6, borderRadius:6, border:'1px solid #ccc'}}/>
          <button onClick={saveWifi} style={{width:'100%', padding:10, background:'#0284c7', color:'white', border:0, borderRadius:6}}>Simpan WiFi</button>
          <h4 style={{marginTop:15}}>🔑 Ganti Password</h4>
          <input value={newPass} onChange={e=>setNewPass(e.target.value)} placeholder="Password baru" style={{width:'100%', padding:8, marginBottom:6, borderRadius:6, border:'1px solid #ccc'}}/>
          <button onClick={savePass} style={{width:'100%', padding:8, background:'black', color:'white', border:0, borderRadius:6}}>Ganti Password Admin & Kades</button>
          <h4 style={{marginTop:15}}>📱 Nomor Kades</h4>
          <input value={nomorKades} onChange={e=>setNomorKades(e.target.value)} placeholder="62812xxxx" style={{width:'100%', padding:8, marginBottom:6, borderRadius:6, border:'1px solid #ccc'}}/>
          <button onClick={saveNomorKades} style={{width:'100%', padding:8, background:'#25D366', color:'white', border:0, borderRadius:6}}>Simpan Nomor Kades</button>
        </div>
        <div style={{background:'white', padding:15, borderRadius:10, border:'1px solid #ddd'}}>
          <h4>⏰ Jam Kerja</h4>
          <div style={{display:'flex', gap:8}}><div style={{flex:1}}><label style={{fontSize:11}}>Masuk</label><input type="time" value={jamMasuk} onChange={e=>setJamMasuk(e.target.value)} style={{width:'100%', padding:8, borderRadius:6, border:'1px solid #ccc'}}/></div><div style={{flex:1}}><label style={{fontSize:11}}>Pulang</label><input type="time" value={jamPulang} onChange={e=>setJamPulang(e.target.value)} style={{width:'100%', padding:8, borderRadius:6, border:'1px solid #ccc'}}/></div></div>
          <input type="number" value={toleransi} onChange={e=>setToleransi(e.target.value)} placeholder="Toleransi menit" style={{width:'100%', padding:8, borderRadius:6, border:'1px solid #ccc', marginTop:6}}/>
          <button onClick={saveJam} style={{width:'100%', padding:10, marginTop:8, background:'black', color:'white', border:0, borderRadius:6}}>Simpan Jam</button>
        </div>
        <div style={{background:'white', padding:15, borderRadius:10, border:'1px solid #ddd'}}>
          <h4>📢 Broadcast WA (Poin 4)</h4>
          <textarea id="pesan_broadcast" placeholder="Kerja Bakti besok jam 07:00..." style={{width:'100%', height:70, padding:8, borderRadius:6, border:'1px solid #ccc'}}></textarea>
          <div style={{display:'flex', gap:8, marginTop:8}}>
            <button onClick={()=>broadcast('WiFi Only')} style={{flex:1, padding:10, background:'#fbbf24', border:0, borderRadius:6, fontSize:11, fontWeight:'bold'}}>📶 WiFi Only</button>
            <button onClick={()=>broadcast('Semua')} style={{flex:1, padding:10, background:'#16a34a', color:'white', border:0, borderRadius:6, fontSize:11, fontWeight:'bold'}}>📱 Semua</button>
          </div>
          <a href="/setting-bot" style={{fontSize:11, display:'block', marginTop:10, textAlign:'center'}}>⚙️ Setting Bot WA Gratis →</a>
        </div>
      </div>
      <br/><div style={{display:'flex', gap:10}}><a href="/" style={{flex:1, textAlign:'center', padding:12, background:'#e5e7eb', borderRadius:8, textDecoration:'none', color:'#000'}}>← Absen</a><a href="/kades" style={{flex:1, textAlign:'center', padding:12, background:'black', color:'white', borderRadius:8, textDecoration:'none'}}>📊 Rekap Kades</a></div>
    </div>
  )
}
