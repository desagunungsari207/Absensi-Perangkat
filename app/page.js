"use client";
import { useState, useEffect } from "react";
const BALAI_DESA = { lat: -7.259344564316639, lng: 108.31042899681555, radius: 50 };
const DAFTAR_JABATAN = ["Sekretaris Desa","Kaur Keuangan","Kaur TU dan Umum","Kaur Perencanaan","Kasi Kesejahteraan","Kasi Pemerintahan","Kasi Pelayanan","Kadus Desa","Kadus Cikatomas","Kadus Cilopadang"];
function getDistance(a,b,c,d){const R=6371e3;const dLat=(c-a)*Math.PI/180;const dLon=(d-b)*Math.PI/180;const x=Math.sin(dLat/2)**2+Math.cos(a*Math.PI/180)*Math.cos(c*Math.PI/180)*Math.sin(dLon/2)**2;return R*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x));}

export default function AbsensiGunungsari(){
  const [nama,setNama]=useState("");const [terkunci,setTerkunci]=useState(false);const [jarak,setJarak]=useState(null);const [riwayat,setRiwayat]=useState([]);const [view,setView]=useState("absen");
  const [showIzin,setShowIzin]=useState(false);const [tipeIzin,setTipeIzin]=useState("KEGIATAN");const [kegiatanApa,setKegiatanApa]=useState("");const [kegiatanDimana,setKegiatanDimana]=useState("");const [sakitApa,setSakitApa]=useState("");

  useEffect(()=>{
    const device=localStorage.getItem("device_gunungsari");if(device){setNama(device);setTerkunci(true);}
    setRiwayat(JSON.parse(localStorage.getItem("absensi_gunungsari")||"[]"));
    navigator.geolocation.getCurrentPosition(p=>setJarak(Math.round(getDistance(p.coords.latitude,p.coords.longitude,BALAI_DESA.lat,BALAI_DESA.lng))),()=>{}, {enableHighAccuracy:true});
  },[]);
  const cekGPS=()=>navigator.geolocation.getCurrentPosition(p=>setJarak(Math.round(getDistance(p.coords.latitude,p.coords.longitude,BALAI_DESA.lat,BALAI_DESA.lng))),()=>alert("Aktifkan GPS"),{enableHighAccuracy:true});
  const kunciDevice=(v)=>{if(!v)return;if(confirm(`Kunci HP ini untuk "${v}"?`)){localStorage.setItem("device_gunungsari",v);setNama(v);setTerkunci(true);}else setNama("");};
  const hariIni=new Date().toLocaleDateString("id-ID");
  const absenHariIni=riwayat.filter(r=>r.nama===nama&&r.tanggal===hariIni);
  const sudahMasuk=absenHariIni.some(r=>r.tipe==="MASUK");const sudahPulang=absenHariIni.some(r=>r.tipe==="PULANG");const sudahIzin=absenHariIni.some(r=>r.tipe.includes("IZIN"));
  const absen=(tipe)=>{if(!nama)return alert("Pilih jabatan!");if(jarak>BALAI_DESA.radius)return alert(`Di luar area ${jarak}m`);if(tipe==="MASUK"&&sudahMasuk)return alert("Sudah MASUK!");if(tipe==="PULANG"&&sudahPulang)return alert("Sudah PULANG!");if(tipe==="PULANG"&&!sudahMasuk)return alert("Harus MASUK dulu!");const data={nama,tipe,jam:new Date().toLocaleTimeString("id-ID"),tanggal:hariIni,tanggalFull:new Date().toLocaleString("id-ID"),jarak,keterangan:""};const baru=[data,...riwayat];setRiwayat(baru);localStorage.setItem("absensi_gunungsari",JSON.stringify(baru));setView("statistik");};
  const kirimIzin=()=>{if(!nama)return alert("Pilih jabatan!");if(sudahIzin)return alert("Sudah izin hari ini!");if(sudahMasuk||sudahPulang)return alert("Sudah absen hari ini!");let keterangan="";if(tipeIzin==="KEGIATAN"){if(!kegiatanApa||!kegiatanDimana)return alert("Isi kegiatan & dimana!");keterangan=`${kegiatanApa} @ ${kegiatanDimana}`;}else{if(!sakitApa)return alert("Isi sakit apa!");keterangan=sakitApa;}const data={nama,tipe:`IZIN ${tipeIzin}`,jam:new Date().toLocaleTimeString("id-ID"),tanggal:hariIni,tanggalFull:new Date().toLocaleString("id-ID"),jarak:jarak||0,keterangan};const baru=[data,...riwayat];setRiwayat(baru);localStorage.setItem("absensi_gunungsari",JSON.stringify(baru));setShowIzin(false);setKegiatanApa("");setKegiatanDimana("");setSakitApa("");setView("statistik");};
  const diArea=jarak!==null&&jarak<=BALAI_DESA.radius;const riwayatSaya=riwayat.filter(r=>r.nama===nama);

  // HITUNG STATISTIK LENGKAP
  const bulanIni = new Date().getMonth(); const tahunIni = new Date().getFullYear();
  const dataBulanIni = riwayatSaya.filter(r=>{ const d=new Date(r.tanggalFull); return d.getMonth()===bulanIni && d.getFullYear()===tahunIni; });
  const totalMasuk = dataBulanIni.filter(r=>r.tipe==="MASUK").length;
  const totalPulang = dataBulanIni.filter(r=>r.tipe==="PULANG").length;
  const totalIzinKegiatan = dataBulanIni.filter(r=>r.tipe==="IZIN KEGIATAN").length;
  const totalIzinSakit = dataBulanIni.filter(r=>r.tipe==="IZIN SAKIT").length;
  const persenHadir = dataBulanIni.length ? Math.round((totalMasuk / 22)*100) : 0; // asumsi 22 hari kerja

  if(view==="statistik"&&nama){
    return(
      <div style={{maxWidth:440,margin:"0 auto",padding:16,fontFamily:"system-ui",background:"#f8fafc",minHeight:"100vh"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><h2 style={{margin:0}}>📊 Statistik</h2><button onClick={()=>setView("absen")} style={{padding:"8px 12px",borderRadius:8,border:"1px solid #ddd",background:"white"}}>← Absen</button></div>
        <div style={{background:"#111",color:"white",padding:16,borderRadius:16,marginTop:16}}>
          <div style={{fontSize:12,opacity:0.7}}>Jabatan Terkunci</div><div style={{fontSize:18,fontWeight:"bold"}}>{nama}</div>
          <div style={{marginTop:12,display:"flex",gap:8}}><div style={{background:"rgba(255,255,255,0.15)",padding:"6px 10px",borderRadius:20,fontSize:11}}>📅 {hariIni}</div><div style={{background: sudahMasuk?"#22c55e":"#ef4444",padding:"6px 10px",borderRadius:20,fontSize:11}}>{sudahMasuk?"✅ Sudah Masuk":"❌ Belum Masuk"}</div></div>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:8,marginTop:16}}>
          <div style={{background:"white",padding:12,borderRadius:12,textAlign:"center",boxShadow:"0 1px 2px rgba(0,0,0,0.05)"}}><div style={{fontSize:22,fontWeight:"bold",color:"#16a34a"}}>{totalMasuk}</div><div style={{fontSize:10,color:"#666"}}>MASUK</div></div>
          <div style={{background:"white",padding:12,borderRadius:12,textAlign:"center",boxShadow:"0 1px 2px rgba(0,0,0,0.05)"}}><div style={{fontSize:22,fontWeight:"bold",color:"#dc2626"}}>{totalPulang}</div><div style={{fontSize:10,color:"#666"}}>PULANG</div></div>
          <div style={{background:"white",padding:12,borderRadius:12,textAlign:"center",boxShadow:"0 1px 2px rgba(0,0,0,0.05)"}}><div style={{fontSize:22,fontWeight:"bold",color:"#f59e0b"}}>{totalIzinKegiatan}</div><div style={{fontSize:10,color:"#666"}}>IZIN KEG.</div></div>
          <div style={{background:"white",padding:12,borderRadius:12,textAlign:"center",boxShadow:"0 1px 2px rgba(0,0,0,0.05)"}}><div style={{fontSize:22,fontWeight:"bold",color:"#eab308"}}>{totalIzinSakit}</div><div style={{fontSize:10,color:"#666"}}>SAKIT</div></div>
        </div>

        <div style={{background:"white",padding:14,borderRadius:12,marginTop:12,boxShadow:"0 1px 2px rgba(0,0,0,0.05)"}}>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:6}}><span>Kehadiran Bulan Ini</span><span>{persenHadir}%</span></div>
          <div style={{height:8,background:"#eee",borderRadius:10}}><div style={{width:`${Math.min(persenHadir,100)}%`,height:8,background:"#16a34a",borderRadius:10}}></div></div>
          <div style={{fontSize:10,color:"#888",marginTop:6}}>{totalMasuk} dari ~22 hari kerja • Total record: {dataBulanIni.length}</div>
        </div>

        <div style={{background:"white",padding:14,borderRadius:12,marginTop:12,boxShadow:"0 1px 2px rgba(0,0,0,0.05)"}}>
          <h4 style={{margin:"0 0 10px 0",fontSize:13}}>Riwayat Lengkap {nama}</h4>
          {riwayatSaya.length===0&&<div style={{fontSize:12,color:"#999"}}>Belum ada data</div>}
          {riwayatSaya.map((r,i)=>(
            <div key={i} style={{display:"flex",gap:10,padding:"10px 0",borderBottom:"1px solid #f1f5f9"}}>
              <div style={{width:36,height:36,borderRadius:10,background: r.tipe==="MASUK"?"#dcfce7":r.tipe==="PULANG"?"#fee2e2":"#fef3c7",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>{r.tipe==="MASUK"?"✅":r.tipe==="PULANG"?"🏠":"📝"}</div>
              <div style={{flex:1}}><div style={{fontSize:12,fontWeight:"bold"}}>{r.tipe} <span style={{fontWeight:"normal",color:"#666"}}>• {r.jam}</span></div><div style={{fontSize:11,color:"#555"}}>{r.tanggal} • {r.keterangan?r.keterangan:`${r.jarak}m dari Balai`}</div></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return(<div style={{maxWidth:420,margin:"0 auto",padding:20,fontFamily:"system-ui"}}><h2>Absensi Desa Gunungsari</h2><p style={{fontSize:11,color:"#666"}}>10 Jabatan • 1 Device = 1 Orang • {hariIni}</p>
    {!terkunci?(<select value={nama} onChange={e=>kunciDevice(e.target.value)} style={{width:"100%",padding:14,borderRadius:8,margin:"15px 0 10px",border:"2px solid #111"}}><option value="">-- Pilih Jabatan (Sekali Kunci) --</option>{DAFTAR_JABATAN.map(p=><option key={p} value={p}>{p}</option>)}</select>):(<div style={{padding:12,background:"#111",color:"white",borderRadius:8,margin:"15px 0 10px",textAlign:"center"}}>🔒 {nama}</div>)}
    <div style={{padding:14,background:diArea?"#dcfce7":"#fee2e2",borderRadius:10,marginBottom:12}}><b>{jarak!==null?`${jarak}m`:"Cek GPS..."}</b> - {diArea?"✅ Di Area":"❌ Di Luar"} <button onClick={cekGPS} style={{marginLeft:8,fontSize:11}}>🔄</button></div>
    <div style={{display:"flex",gap:10}}><button disabled={!diArea||!nama||sudahMasuk} onClick={()=>absen("MASUK")} style={{flex:1,padding:16,background:sudahMasuk?"#9ca3af":diArea&&nama?"#16a34a":"#9ca3af",color:"white",border:0,borderRadius:10,fontWeight:"bold"}}>{sudahMasuk?"SUDAH MASUK":"MASUK"}</button><button disabled={!diArea||!nama||sudahPulang||!sudahMasuk} onClick={()=>absen("PULANG")} style={{flex:1,padding:16,background:sudahPulang?"#9ca3af":diArea&&nama&&sudahMasuk?"#dc2626":"#9ca3af",color:"white",border:0,borderRadius:10,fontWeight:"bold"}}>{sudahPulang?"SUDAH PULANG":"PULANG"}</button></div>
    <button disabled={!nama||sudahIzin||sudahMasuk} onClick={()=>setShowIzin(true)} style={{width:"100%",marginTop:10,padding:12,background:sudahIzin||sudahMasuk?"#9ca3af":"#f59e0b",color:"white",border:0,borderRadius:10,fontWeight:"bold"}}>{sudahIzin?"SUDAH IZIN HARI INI":"📝 IZIN KEGIATAN / SAKIT"}</button>
    {showIzin&&(<div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",padding:20,zIndex:99}}><div style={{background:"white",padding:20,borderRadius:12,width:"100%",maxWidth:400}}><h3 style={{marginTop:0}}>Form Izin - {nama}</h3><div style={{display:"flex",gap:8,margin:"12px 0"}}><button onClick={()=>setTipeIzin("KEGIATAN")} style={{flex:1,padding:10,background:tipeIzin==="KEGIATAN"?"#111":"#eee",color:tipeIzin==="KEGIATAN"?"white":"#111",border:0,borderRadius:8}}>Kegiatan</button><button onClick={()=>setTipeIzin("SAKIT")} style={{flex:1,padding:10,background:tipeIzin==="SAKIT"?"#111":"#eee",color:tipeIzin==="SAKIT"?"white":"#111",border:0,borderRadius:8}}>Sakit</button></div>{tipeIzin==="KEGIATAN"?(<><input value={kegiatanApa} onChange={e=>setKegiatanApa(e.target.value)} placeholder="Kegiatan apa?" style={{width:"100%",padding:12,borderRadius:8,border:"1px solid #ccc",marginBottom:8}}/><input value={kegiatanDimana} onChange={e=>setKegiatanDimana(e.target.value)} placeholder="Dimana?" style={{width:"100%",padding:12,borderRadius:8,border:"1px solid #ccc"}}/></>):(<><input value={sakitApa} onChange={e=>setSakitApa(e.target.value)} placeholder="Sakit apa?" style={{width:"100%",padding:12,borderRadius:8,border:"1px solid #ccc"}}/></>)}<div style={{display:"flex",gap:8,marginTop:15}}><button onClick={()=>setShowIzin(false)} style={{flex:1,padding:12,background:"#eee",border:0,borderRadius:8}}>Batal</button><button onClick={kirimIzin} style={{flex:1,padding:12,background:"#16a34a",color:"white",border:0,borderRadius:8,fontWeight:"bold"}}>Kirim Izin</button></div></div></div>)}
    {terkunci&&<button onClick={()=>setView("statistik")} style={{width:"100%",marginTop:12,padding:12,background:"#111",color:"white",borderRadius:10}}>📊 Lihat Statistik Lengkap Saya</button>}
  </div>);
}
