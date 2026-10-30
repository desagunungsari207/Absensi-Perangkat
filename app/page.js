'use client';
import { useState, useEffect } from 'react';
export default function AbsenPanel(){
  const [wifiRequired, setWifiRequired] = useState('CIKA_NANAT');
  const [ssidInput, setSsidInput] = useState('');
  const [isWifiOk, setIsWifiOk] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState('');
  const [msg, setMsg] = useState('');
  useEffect(()=>{
    setWifiRequired(localStorage.getItem('wifi_desa') || 'CIKA_NANAT');
    setStaffList(JSON.parse(localStorage.getItem('staff_desa') || '[]'));
  },[]);
  const cekWifi = ()=>{
    if(ssidInput.trim().toUpperCase() === wifiRequired.toUpperCase()){
      setIsWifiOk(true); localStorage.setItem('wifi_ok_session','true'); setMsg('');
    } else { setMsg(`❌ Harus konek ${wifiRequired}`); setIsWifiOk(false); }
  };
  const absen = (tipe)=>{
    if(!selectedStaff) return alert('Pilih nama');
    const now=new Date(); const jam=now.toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'}); const tanggal=now.toLocaleDateString('id-ID');
    const data=JSON.parse(localStorage.getItem('absen_desa')||'[]'); data.push({id:Date.now(),nama:selectedStaff,tipe,jam,tanggal,status:'Hadir'}); localStorage.setItem('absen_desa',JSON.stringify(data));
    const apikey=localStorage.getItem('callmebot_apikey'); const nomorKades=localStorage.getItem('nomor_kades')||'';
    if(apikey && nomorKades){ fetch(`https://api.callmebot.com/whatsapp.php?phone=${nomorKades}&text=${encodeURIComponent(`ABSEN ${tipe}: ${selectedStaff} jam ${jam}`)}&apikey=${apikey}`).catch(()=>{}); }
    alert(`✅ ${selectedStaff} ABSEN ${tipe} jam ${jam}`); if(navigator.vibrate) navigator.vibrate(200);
  };
  return (<div style={{minHeight:'100vh',background:'#f1f5f9',padding:15,fontFamily:'sans-serif'}}><div style={{maxWidth:400,margin:'0 auto',background:'white',borderRadius:16,padding:20}}><h2 style={{textAlign:'center'}}>🏛️ Absensi Desa</h2><div style={{background:'#fef3c7',padding:10,borderRadius:8,fontSize:12,marginTop:15}}>WiFi Wajib: <b>{wifiRequired}</b> {isWifiOk?'✅':''}</div>{!isWifiOk?(<div style={{marginTop:20}}><p style={{fontSize:13}}>Ketik SSID WiFi:</p><input value={ssidInput} onChange={e=>setSsidInput(e.target.value)} placeholder={wifiRequired} style={{width:'100%',padding:12,borderRadius:8,border:'1px solid #cbd5e1'}}/><button onClick={cekWifi} style={{width:'100%',padding:12,marginTop:10,background:'black',color:'white',borderRadius:8}}>🔍 CEK WIFI</button>{msg && <p style={{color:'red',fontSize:12}}>{msg}</p>}</div>):(<div style={{marginTop:20}}><label style={{fontSize:12}}>Pilih Nama:</label><select value={selectedStaff} onChange={e=>setSelectedStaff(e.target.value)} style={{width:'100%',padding:12,borderRadius:8,border:'1px solid #cbd5e1',marginTop:4}}><option value="">-- Pilih --</option>{staffList.map(s=><option key={s.id} value={s.nama}>{s.nama}</option>)}{staffList.length===0 && <option>Isi di Admin dulu</option>}</select><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginTop:20}}><button onClick={()=>absen('MASUK')} style={{padding:20,background:'#16a34a',color:'white',border:0,borderRadius:12,fontWeight:'bold'}}>🟢 MASUK</button><button onClick={()=>absen('PULANG')} style={{padding:20,background:'#dc2626',color:'white',border:0,borderRadius:12,fontWeight:'bold'}}>🔴 PULANG</button></div><button onClick={()=>{setIsWifiOk(false);localStorage.removeItem('wifi_ok_session')}} style={{width:'100%',padding:8,marginTop:15,background:'transparent',border:'1px solid #e2e8f0',borderRadius:8,fontSize:11}}>Logout WiFi</button></div>)}<div style={{textAlign:'center',marginTop:30}}><a href="/kades" style={{fontSize:11,color:'#64748b',textDecoration:'none',marginRight:15}}>📊 Panel Kades</a><a href="/admin" style={{fontSize:11,color:'#94a3b8',textDecoration:'none'}}>Admin</a></div></div></div>)
}
