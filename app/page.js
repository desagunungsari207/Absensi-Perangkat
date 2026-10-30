"use client";
import { useState, useEffect } from "react";
const BALAI_DESA = { lat: -7.259344564316639, lng: 108.31042899681555, radius: 50 };
const DAFTAR_JABATAN = [
  "Sekretaris Desa", "Kaur Keuangan", "Kaur TU dan Umum", "Kaur Perencanaan",
  "Kasi Kesejahteraan", "Kasi Pemerintahan", "Kasi Pelayanan",
  "Kadus Desa", "Kadus Cikatomas", "Kadus Cilopadang"
];

function getDistance(a,b,c,d){const R=6371e3;const dLat=(c-a)*Math.PI/180;const dLon=(d-b)*Math.PI/180;const x=Math.sin(dLat/2)**2+Math.cos(a*Math.PI/180)*Math.cos(c*Math.PI/180)*Math.sin(dLon/2)**2;return R*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x));}

export default function AbsensiGunungsari(){
  const [nama,setNama]=useState("");const [terkunci,setTerkunci]=useState(false);const [jarak,setJarak]=useState(null);const [riwayat,setRiwayat]=useState([]);const [view,setView]=useState("absen");

  useEffect(()=>{
    const device = localStorage.getItem("device_gunungsari");
    if(device){ setNama(device); setTerkunci(true); }
    setRiwayat(JSON.parse(localStorage.getItem("absensi_gunungsari")||"[]"));
    navigator.geolocation.getCurrentPosition(p=>setJarak(Math.round(getDistance(p.coords.latitude,p.coords.longitude,BALAI_DESA.lat,BALAI_DESA.lng))),()=>{}, {enableHighAccuracy:true});
  },[]);

  const cekGPS=()=>navigator.geolocation.getCurrentPosition(p=>setJarak(Math.round(getDistance(p.coords.latitude,p.coords.longitude,BALAI_DESA.lat,BALAI_DESA.lng))),()=>alert("Aktifkan GPS"),{enableHighAccuracy:true});
  
  const kunciDevice=(namaPilih)=>{
    if(!namaPilih) return;
    if(confirm(`Kunci HP ini untuk "${namaPilih}"? HP ini nanti tidak bisa dipakai untuk jabatan lain.`)){
      localStorage.setItem("device_gunungsari", namaPilih);
      setNama(namaPilih); setTerkunci(true);
    } else { setNama(""); }
  };

  const hariIni=new Date().toLocaleDateString("id-ID");
  const absenHariIni=riwayat.filter(r=>r.nama===nama&&r.tanggal===hariIni);
  const sudahMasuk=absenHariIni.some(r=>r.tipe==="MASUK");const sudahPulang=absenHariIni.some(r=>r.tipe==="PULANG");

  const absen=(tipe)=>{
    if(!nama)return alert("Pilih jabatan!");if(jarak>BALAI_DESA.radius)return alert(`Di luar area ${jarak}m`);
    if(tipe==="MASUK"&&sudahMasuk)return alert("Sudah MASUK hari ini!");if(tipe==="PULANG"&&sudahPulang)return alert("Sudah PULANG!");if(tipe==="PULANG"&&!sudahMasuk)return alert("Harus MASUK dulu!");
    const data={nama,tipe,jam:new Date().toLocaleTimeString("id-ID"),tanggal:hariIni,tanggalFull:new Date().toLocaleString("id-ID"),jarak};
    const baru=[data,...riwayat];setRiwayat(baru);localStorage.setItem("absensi_gunungsari",JSON.stringify(baru));setView("statistik");
  };

  const diArea=jarak!==null&&jarak<=BALAI_DESA.radius;const riwayatSaya=riwayat.filter(r=>r.nama===nama);

  if(view==="statistik"&&nama){
    return(<div style={{maxWidth:420,margin:"0 auto",padding:20,fontFamily:"system-ui"}}><h2>Statistik {nama}</h2><p style={{fontSize:12}}>Device ini terkunci untuk {nama}</p><div style={{background:"#f0fdf4",padding:14,borderRadius:10,margin:"15px 0"}}>Hari ini: MASUK {sudahMasuk?"✅":"❌"} | PULANG {sudahPulang?"✅":"❌"}<br/>Total: {riwayatSaya.length} kali</div>{riwayatSaya.map((r,i)=><div key={i} style={{padding:"8px 0",borderBottom:"1px solid #eee",fontSize:13}}>{r.tanggal} {r.jam} - {r.tipe} ({r.jarak}m)</div>)}<button onClick={()=>setView("absen")} style={{width:"100%",marginTop:20,padding:14,background:"#111",color:"white",borderRadius:10}}>← Kembali Absen</button></div>);
  }

  return(<div style={{maxWidth:420,margin:"0 auto",padding:20,fontFamily:"system-ui"}}><h2>Absensi Desa Gunungsari</h2><p style={{fontSize:12,color:"#666"}}>1 Device = 1 Jabatan • GPS 50m • {hariIni}</p>
    {!terkunci ? (
      <select value={nama} onChange={e=>kunciDevice(e.target.value)} style={{width:"100%",padding:14,borderRadius:8,margin:"15px 0 10px",border:"2px solid #111"}}><option value="">-- Pilih Jabatan Anda (Sekali Kunci) --</option>{DAFTAR_JABATAN.map(p=><option key={p} value={p}>{p}</option>)}</select>
    ) : (
      <div style={{padding:12,background:"#111",color:"white",borderRadius:8,margin:"15px 0 10px",textAlign:"center"}}>🔒 HP ini: <b>{nama}</b><br/><span style={{fontSize:11}}>Terkunci 1 device 1 orang</span></div>
    )}
    {nama&&<div style={{fontSize:12,padding:8,background:"#f3f4f6",borderRadius:6,marginBottom:10}}>Status: MASUK {sudahMasuk?"✅":"❌"} | PULANG {sudahPulang?"✅":"❌"}</div>}
    <div style={{padding:14,background:diArea?"#dcfce7":"#fee2e2",borderRadius:10,marginBottom:15}}><b>{jarak!==null?`${jarak}m dari Balai`:"Cek GPS..."}</b> - {diArea?"✅ Di Area":"❌ Di Luar"}<br/><button onClick={cekGPS} style={{marginTop:8,fontSize:12}}>🔄 Refresh GPS</button></div>
    <div style={{display:"flex",gap:12}}><button disabled={!diArea||!nama||sudahMasuk} onClick={()=>absen("MASUK")} style={{flex:1,padding:16,background:sudahMasuk?"#9ca3af":diArea&&nama?"#16a34a":"#9ca3af",color:"white",border:0,borderRadius:10,fontWeight:"bold"}}>{sudahMasuk?"SUDAH MASUK":"MASUK"}</button><button disabled={!diArea||!nama||sudahPulang||!sudahMasuk} onClick={()=>absen("PULANG")} style={{flex:1,padding:16,background:sudahPulang?"#9ca3af":diArea&&nama&&sudahMasuk?"#dc2626":"#9ca3af",color:"white",border:0,borderRadius:10,fontWeight:"bold"}}>{sudahPulang?"SUDAH PULANG":"PULANG"}</button></div>
    {terkunci&&<button onClick={()=>setView("statistik")} style={{width:"100%",marginTop:12,padding:10,background:"white",border:"1px solid #ddd",borderRadius:8}}>📊 Lihat Statistik Saya</button>}
    <p style={{fontSize:10,color:"#999",marginTop:20,textAlign:"center"}}>Jika salah pilih, hubungi admin untuk reset device di /admin</p>
  </div>);
}
