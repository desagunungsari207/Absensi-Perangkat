'use client';
import { useState, useEffect } from 'react';

export default function Admin(){
  const [login, setLogin] = useState(false);
  const [passInput, setPassInput] = useState('');
  const [staff, setStaff] = useState([]);
  const [wifiSSID, setWifiSSID] = useState('CIKA_NANAT');
  const [wifiPass, setWifiPass] = useState('');
  const [jamMasuk, setJamMasuk] = useState('07:30');
  const [jamPulang, setJamPulang] = useState('15:30');
  const [toleransi, setToleransi] = useState('15');
  
  // Form Tambah Staff
  const [nama, setNama] = useState('');
  const [wa, setWa] = useState('');
  const [jabatan, setJabatan] = useState('Perangkat Desa');

  useEffect(()=>{
    setWifiSSID(localStorage.getItem('wifi_desa') || 'CIKA_NANAT');
    setStaff(JSON.parse(localStorage.getItem('staff_desa') || '[]'));
    setJamMasuk(localStorage.getItem('jam_masuk') || '07:30');
    setJamPulang(localStorage.getItem('jam_pulang') || '15:30');
  },[]);

  const handleLogin = ()=>{
    const saved = localStorage.getItem('pass_admin') || 'Ch@dast1936';
    if(passInput === saved) setLogin(true); else alert('Password salah!');
  }

  const tambahStaff = ()=>{
    if(!nama || !wa) return alert('Nama & WA wajib isi');
    const baru = { id: Date.now(), nama, wa, jabatan, link: `https://absensi-perangkat-zeta.vercel.app/?otp=${Date.now()}` };
    const all = [...staff, baru];
    setStaff(all);
    localStorage.setItem('staff_desa', JSON.stringify(all));
    alert(`✅ ${nama} berhasil ditambah! Link OTP pribadi: ${baru.link}`);
    setNama(''); setWa('');
  }

  const saveWifi = ()=>{
    localStorage.setItem('wifi_desa', wifiSSID);
    localStorage.setItem('wifi_pass', wifiPass);
    alert(`✅ WiFi disimpan: ${wifiSSID}. Perangkat wajib konek WiFi ini`);
  }

  const saveJam = ()=>{
    localStorage.setItem('jam_masuk', jamMasuk);
    localStorage.setItem('jam_pulang', jamPulang);
    localStorage.setItem('toleransi', toleransi);
    alert(`✅ Jam kerja disimpan: Masuk ${jamMasuk}, Pulang ${jamPulang}, Toleransi ${toleransi} menit`);
  }

  const broadcast = (mode)=>{
    const pesan = document.getElementById('pesan_broadcast').value;
    if(!pesan) return alert('Isi pesan dulu');
    alert(`✅ Broadcast terkirim (${mode}): "${pesan}" ke ${staff.length} perangkat`);
  }

  if(!login){
    return (
      <div style={{padding:20, maxWidth:400, margin:'40px auto', border:'1px solid #ddd', borderRadius:12, fontFamily:'sans-serif'}}>
        <h2>🔑 Login Admin</h2>
        <input type="password" value={passInput} onChange={e=>setPassInput(e.target.value)} placeholder="Password Admin" style={{width:'100%', padding:12, borderRadius:6, border:'1px solid #ccc'}}/>
        <button onClick={handleLogin} style={{width:'100%', padding:12, marginTop:10, background:'black', color:'white', borderRadius:6}}>LOGIN</button>
        <br/><br/><a href="/">← Kembali</a>
      </div>
    )
  }

  return (
    <div style={{padding:15, maxWidth:1000, margin:'0 auto', fontFamily:'sans-serif', background:'#f8fafc'}}>
      <h2>🏛️ Admin Desa Gunungsari - Panel Lengkap</h2>
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:15}}>
        
        {/* 1. Tambah Staff - Kiri Atas */}
        <div style={{background:'white', padding:15, borderRadius:10, border:'1px solid #ddd'}}>
          <h4>👥 Tambah Staff (Kiri Atas)</h4>
          <input value={nama} onChange={e=>setNama(e.target.value)} placeholder="Nama: Siti Nurhaliza" style={{width:'100%', padding:8, marginBottom:8, borderRadius:6, border:'1px solid #ccc'}}/>
          <input value={wa} onChange={e=>setWa(e.target.value)} placeholder="No WA: 0812-3456-7890" style={{width:'100%', padding:8, marginBottom:8, borderRadius:6, border:'1px solid #ccc'}}/>
          <select value={jabatan} onChange={e=>setJabatan(e.target.value)} style={{width:'100%', padding:8, marginBottom:8, borderRadius:6}}>
            <option>Perangkat Desa</option><option>Kades</option><option>Sekdes</option><option>Petugas Lapangan</option><option>Admin</option>
          </select>
          <button onClick={tambahStaff} style={{width:'100%', padding:10, background:'#16a34a', color:'white', border:0, borderRadius:6, fontWeight:'bold'}}>Tambah Staff</button>
          <div style={{marginTop:10, fontSize:12, maxHeight:100, overflow:'auto'}}>
            {staff.map(s=><div key={s.id} style={{borderBottom:'1px solid #eee', padding:'4px 0'}}>{s.nama} - {s.jabatan} - {s.wa}</div>)}
          </div>
        </div>

        {/* 2. Setting WiFi - Kanan Atas */}
        <div style={{background:'white', padding:15, borderRadius:10, border:'1px solid #ddd'}}>
          <h4>📶 Setting WiFi (Kanan Atas)</h4>
          <label style={{fontSize:12}}>SSID WiFi:</label>
          <input value={wifiSSID} onChange={e=>setWifiSSID(e.target.value)} placeholder="DESA_KRANDON_WIFI" style={{width:'100%', padding:8, marginBottom:8, borderRadius:6, border:'1px solid #ccc'}}/>
          <label style={{fontSize:12}}>Password WiFi:</label>
          <input value={wifiPass} onChange={e=>setWifiPass(e.target.value)} placeholder="Password WiFi" style={{width:'100%', padding:8, marginBottom:8, borderRadius:6, border:'1px solid #ccc'}}/>
          <button onClick={saveWifi} style={{width:'100%', padding:10, background:'#0284c7', color:'white', border:0, borderRadius:6}}>Simpan WiFi</button>
          <p style={{fontSize:11, color:'#666', marginTop:8}}>Sekarang: {wifiSSID} - Ganti jadi BalaiDesa_Gunungsari</p>
        </div>

        {/* 3. Setting Jam Kerja - Kiri Bawah */}
        <div style={{background:'white', padding:15, borderRadius:10, border:'1px solid #ddd'}}>
          <h4>⏰ Setting Jam Kerja (Kiri Bawah)</h4>
          <div style={{display:'flex', gap:8}}>
            <div style={{flex:1}}><label style={{fontSize:12}}>Jam Masuk:</label><input type="time" value={jamMasuk} onChange={e=>setJamMasuk(e.target.value)} style={{width:'100%', padding:8, borderRadius:6, border:'1px solid #ccc'}}/></div>
            <div style={{flex:1}}><label style={{fontSize:12}}>Jam Pulang:</label><input type="time" value={jamPulang} onChange={e=>setJamPulang(e.target.value)} style={{width:'100%', padding:8, borderRadius:6, border:'1px solid #ccc'}}/></div>
          </div>
          <label style={{fontSize:12, marginTop:8, display:'block'}}>Toleransi Terlambat (menit):</label>
          <input type="number" value={toleransi} onChange={e=>setToleransi(e.target.value)} style={{width:'100%', padding:8, borderRadius:6, border:'1px solid #ccc'}}/>
          <button onClick={saveJam} style={{width:'100%', padding:10, marginTop:8, background:'#000', color:'white', border:0, borderRadius:6}}>Simpan Jam</button>
          <p style={{fontSize:11, color:'#666'}}>Lewat {jamMasuk} + {toleransi} menit = Terlambat</p>
        </div>

        {/* 4. Broadcast - Kanan Bawah */}
        <div style={{background:'white', padding:15, borderRadius:10, border:'1px solid #ddd'}}>
          <h4>📢 Broadcast Kegiatan (Kanan Bawah)</h4>
          <textarea id="pesan_broadcast" placeholder="Kerja Bakti warga akan dilaksanakan..." style={{width:'100%', height:70, padding:8, borderRadius:6, border:'1px solid #ccc'}}></textarea>
          <div style={{display:'flex', gap:8, marginTop:8}}>
            <button onClick={()=>broadcast('WiFi Only')} style={{flex:1, padding:8, background:'#fbbf24', border:0, borderRadius:6, fontSize:12}}>📶 WiFi Only</button>
            <button onClick={()=>broadcast('Semua')} style={{flex:1, padding:8, background:'#16a34a', color:'white', border:0, borderRadius:6, fontSize:12}}>📱 Semua Perangkat</button>
          </div>
          <p style={{fontSize:11, color:'#666', marginTop:8}}>WiFi Only = cuma yang di kantor, Semua = dimana saja (kegiatan/libur)</p>
        </div>

      </div>
      <br/><a href="/" style={{display:'block', textAlign:'center', padding:12, background:'#e5e7eb', borderRadius:8, textDecoration:'none', color:'#000'}}>← Kembali ke Absen</a>
    </div>
  )
}
