"use client";
import { useState, useEffect } from "react";
const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbxRWQ549peyAyad2mVRv1jv8YiNw29s1pQSxxhH5sFW3weEMkXduqtkBv_Hj_vVJ8w9/exec";
const BALAI_DESA = { lat: -7.259344564316639, lng: 108.31042899681555, radius: 50 };
const DAFTAR_JABATAN = ["Sekretaris Desa","Kaur Keuangan","Kaur TU dan Umum","Kaur Perencanaan","Kasi Kesejahteraan","Kasi Pemerintahan","Kasi Pelayanan","Kadus Desa","Kadus Cikatomas","Kadus Cilopadang"];
function getDistance(a,b,c,d){const R=6371e3;const dLat=(c-a)*Math.PI/180;const dLon=(d-b)*Math.PI/180;const x=Math.sin(dLat/2)**2+Math.cos(a*Math.PI/180)*Math.cos(c*Math.PI/180)*Math.sin(dLon/2)**2;return R*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x));}

export default function AbsensiGunungsari(){
  const [nama,setNama]=useState("");const [terkunci,setTerkunci]=useState(false);const [jarak,setJarak]=useState(null);const [riwayat,setRiwayat]=useState([]);const [view,setView]=useState("absen");const [loading,setLoading]=useState(false);
  const [showIzin,setShowIzin]=useState(false);const [tipeIzin,setTipeIzin]=useState("KEGIATAN");const [kegiatanApa,setKegiatanApa]=useState("");const [kegiatanDimana,setKegiatanDimana]=useState("");const [sakitApa,setSakitApa]=useState("");

  const loadData = async () => {
    try { const res = await fetch(GOOGLE_SHEET_URL); const data = await res.json(); setRiwayat(data); localStorage.setItem("absensi_gunungsari", JSON.stringify(data)); } 
    catch { setRiwayat(JSON.parse(localStorage.getItem("absensi_gunungsari")||"[]")); }
  };

  useEffect(()=>{
    const device=localStorage.getItem("device_gunungsari");if(device){setNama(device);setTerkunci(true);}
    loadData();
    navigator.geolocation.getCurrentPosition(p=>setJarak(Math.round(getDistance(p.coords.latitude,p.coords.longitude,BALAI_DESA.lat,BALAI_DESA.lng))),()=>{}, {enableHighAccuracy:true});
  },[]);
  
  const cekGPS=()=>navigator.geolocation.getCurrentPosition(p=>setJarak(Math.round(getDistance(p.coords.latitude,p.coords.longitude,BALAI_DESA.lat,BALAI_DESA.lng))),()=>alert("Aktifkan GPS"),{enableHighAccuracy:true});
  const kunciDevice=(v)=>{if(!v)return;if(confirm(`Kunci HP ini untuk "${v}"?`)){localStorage.setItem("device_gunungsari",v);setNama(v);setTerkunci(true);}else setNama("");};
  const hariIni=new Date().toLocaleDateString("id-ID");
  const absenHariIni=riwayat.filter(r=>r.nama===nama&&r.tanggal===hariIni);
  const sudahMasuk=absenHariIni.some(r=>r.tipe==="MASUK");const sudahPulang=absenHariIni.some(r=>r.tipe==="PULANG");const sudahIzin=absenHariIni.some(r=>r.tipe.includes("IZIN"));

  const kirimKeSheet = async (data) => {
    setLoading(true);
    try {
      await fetch(GOOGLE_SHEET_URL, { method: "POST", mode: "no-cors", body: JSON.stringify(data) });
      // Optimistic update
      const baru=[data,...riwayat]; setRiwayat(baru); localStorage.setItem("absensi_gunungsari", JSON.stringify(baru));
      alert("✅ Berhasil! Data masuk ke Google Sheet desagunungsari207@gmail.com");
      setView("statistik");
    } catch(e){ alert("Gagal konek Sheet, tapi disimpan lokal: "+e); }
    setLoading(false);
  };

  const absen=(tipe)=>{
    if(!nama)return alert("Pilih jabatan!");if(jarak>BALAI_DESA.radius)return alert(`Di luar area ${jarak}m`);if(tipe==="MASUK"&&sudahMasuk)return alert("Sudah MASUK!");if(tipe==="PULANG"&&sudahPulang)return alert("Sudah PULANG!");if(tipe==="PULANG"&&!sudahMasuk)return alert("Harus MASUK dulu!");
    const data={nama,tipe,jam:new Date().toLocaleTimeString("id-ID"),tanggal:hariIni,tanggalFull:new Date().toLocaleString("id-ID"),jarak,keterangan:""};
    kirimKeSheet(data);
  };

  const kirimIzin=()=>{
    if(!nama)return alert("Pilih jabatan!");if(sudahIzin)return alert("Sudah izin hari ini!");if(sudahMasuk||sudahPulang)return alert("Sudah absen hari ini!");
    let keterangan=""; if(tipeIzin==="KEGIATAN"){if(!kegiatanApa||!kegiatanDimana)return alert("Isi kegiatan & dimana!");keterangan=`${kegiatanApa} @ ${kegiatanDimana}`;}else{if(!sakitApa)return alert("Isi sakit apa!");keterangan=sakitApa;}
    const data={nama,tipe:`IZIN ${tipeIzin}`,jam:new Date().toLocaleTimeString("id-ID"),tanggal:hariIni,tanggalFull:new Date().toLocaleString("id-ID"),jarak:jarak||0,keterangan};
    kirimKeSheet(data); setShowIzin(false); setKegiatanApa(""); setKegiatanDimana(""); setSakitApa("");
  };

  const diArea=jarak!==null&&jarak<=BALAI_DESA.radius; const riwayatSaya=riwayat.filter(r=>r.nama===nama);
  const dataBulanIni=riwayatSaya.filter(r=>{ try{const d=new Date(r.tanggalFull); return d.getMonth()===new Date().getMonth();}catch{return true;}});
  const totalMasuk=dataBulanIni.filter(r=>r.tipe==="MASUK").length; const totalIzinK=dataBulanIni.filter(r=>r.tipe==="IZIN KEGIATAN").length; const totalIzinS=dataBulanIni.filter(r=>r.tipe==="IZIN SAKIT").length;

  if(view==="statistik"&&nama){
    return(<div style={{maxWidth:440,margin:"0 auto",padding:16,fontFamily:"system-ui",background:"#f8fafc",minHeight:"100vh"}}>
      <div style={{display:"flex",justifyContent:"space-between"}}><h2 style={{margin:0}}>📊 Statistik</h2><button onClick={()=>{loadData(); setView("absen");}} style={{padding:"8px 12px",borderRadius:8,border:"1px solid #ddd",background:"white"}}>← Absen</button></div>
      <div style={{background:"#111",color:"white",padding:16,borderRadius:16,marginTop:16}}><div style={{fontSize:12,opacity:0.7}}>Online Sheet • desagunungsari207@gmail.com</div><div style={{fontSize:18,fontWeight:"bold"}}>{nama}</div><div style={{fontSize:11,marginTop:8,background:"rgba(255,255,255,0.15)",display:"inline-block",padding:"4px 10px",borderRadius:20}}>📅 {hariIni} • Total Saya: {riwayatSaya.length}</div></div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginTop:12}}><div style={{background:"white",padding:12,borderRadius:12,textAlign:"center"}}><div style={{fontSize:20,fontWeight:"bold",color:"#16a34a"}}>{totalMasuk}</div><div style={{fontSize:10}}>MASUK</div></div><div style={{background:"white",padding:12,borderRadius:12,textAlign:"center"}}><div style={{fontSize:20,fontWeight:"bold",color:"#f59e0b"}}>{totalIzinK}</div><div style={{fontSize:10}}>KEGIATAN</div></div><div style={{background:"white",padding:12,borderRadius:12,textAlign:"center"}}><div style={{fontSize:20,fontWeight:"bold",color:"#eab308"}}>{totalIzinS}</div><div style={{fontSize:10}}>SAKIT</div></div></div>
      <div style={{background:"white",padding:14,borderRadius:12,marginTop:12}}>{riwayatSaya.slice(0,20).map((r,i)=><div key={i} style={{display:"flex",gap:10,padding:"10px 0",borderBottom:"1px solid #f1f5f9"}}><div style={{width:36,height:36,borderRadius:10,background:r.tipe==="MASUK"?"#dcfce7":r.tipe==="PULANG"?"#fee2e2":"#fef3c7",display:"flex",alignItems:"center",justifyContent:"center"}}>{r.tipe==="MASUK"?"✅":r.tipe==="PULANG"?"🏠":"📝"}</div><div><div style={{fontSize:12,fontWeight:"bold"}}>{r.tipe} • {r.jam}</div><div style={{fontSize:11,color:"#555"}}>{r.tanggal} • {r.keterangan||r.jarak+"m"}</div></div></div>)}</div>
    </div>);
  }

  return(<div style={{maxWidth:420,margin:"0 auto",padding:20,fontFamily:"system-ui"}}><h2>Absensi Desa Gunungsari</h2><p style={{fontSize:11,color:"#16a34a",fontWeight:"bold"}}>🟢 ONLINE Google Sheet • desagunungsari207@gmail.com</p><p style={{fontSize:11,color:"#666"}}>1 Device = 1 Jabatan • {hariIni}</p>
    {!terkunci?(<select value={nama} onChange={e=>kunciDevice(e.target.value)} style={{width:"100%",padding:14,borderRadius:8,margin:"10px 0",border:"2px solid #111"}}><option value="">-- Pilih Jabatan --</option>{DAFTAR_JABATAN.map(p=><option key={p} value={p}>{p}</option>)}</select>):(<div style={{padding:12,background:"#111",color:"white",borderRadius:8,margin:"10px 0",textAlign:"center"}}>🔒 {nama}</div>)}
    <div style={{padding:14,background:diArea?"#dcfce7":"#fee2e2",borderRadius:10,marginBottom:12}}><b>{jarak!==null?`${jarak}m`:"Cek GPS..."}</b> - {diArea?"✅ Di Area":"❌ Di Luar"} <button onClick={cekGPS} style={{marginLeft:8}}>🔄</button></div>
    <div style={{display:"flex",gap:10}}><button disabled={!diArea||!nama||sudahMasuk||loading} onClick={()=>absen("MASUK")} style={{flex:1,padding:16,background:sudahMasuk?"#9ca3af":diArea&&nama?"#16a34a":"#9ca3af",color:"white",border:0,borderRadius:10,fontWeight:"bold"}}>{loading?"...":sudahMasuk?"SUDAH MASUK":"MASUK"}</button><button disabled={!diArea||!nama||sudahPulang||!sudahMasuk||loading} onClick={()=>absen("PULANG")} style={{flex:1,padding:16,background:sudahPulang?"#9ca3af":diArea&&nama&&sudahMasuk?"#dc2626":"#9ca3af",color:"white",border:0,borderRadius:10,fontWeight:"bold"}}>{loading?"...":sudahPulang?"SUDAH PULANG":"PULANG"}</button></div>
    <button disabled={!nama||sudahIzin||sudahMasuk||loading} onClick={()=>setShowIzin(true)} style={{width:"100%",marginTop:10,padding:12,background:sudahIzin||sudahMasuk?"#9ca3af":"#f59e0b",color:"white",border:0,borderRadius:10,fontWeight:"bold"}}>{sudahIzin?"SUDAH IZIN":"📝 IZIN KEGIATAN / SAKIT (Boleh di Luar GPS)"}</button>
    {showIzin&&(<div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",padding:20,zIndex:99}}><div style={{background:"white",padding:20,borderRadius:12,width:"100%",maxWidth:400}}><h3 style={{marginTop:0}}>Form Izin</h3><div style={{display:"flex",gap:8,margin:"12px 0"}}><button onClick={()=>setTipeIzin("KEGIATAN")} style={{flex:1,padding:10,background:tipeIzin==="KEGIATAN"?"#111":"#eee",color:tipeIzin==="KEGIATAN"?"white":"#111",border:0,borderRadius:8}}>Kegiatan</button><button onClick={()=>setTipeIzin("SAKIT")} style={{flex:1,padding:10,background:tipeIzin==="SAKIT"?"#111":"#eee",color:tipeIzin==="SAKIT"?"white":"#111",border:0,borderRadius:8}}>Sakit</button></div>{tipeIzin==="KEGIATAN"?(<><input value={kegiatanApa} onChange={e=>setKegiatanApa(e.target.value)} placeholder="Kegiatan apa?" style={{width:"100%",padding:12,borderRadius:8,border:"1px solid #ccc",marginBottom:8}}/><input value={kegiatanDimana} onChange={e=>setKegiatanDimana(e.target.value)} placeholder="Dimana?" style={{width:"100%",padding:12,borderRadius:8,border:"1px solid #ccc"}}/></>):(<input value={sakitApa} onChange={e=>setSakitApa(e.target.value)} placeholder="Sakit apa?" style={{width:"100%",padding:12,borderRadius:8,border:"1px solid #ccc"}}/>)}<div style={{display:"flex",gap:8,marginTop:15}}><button onClick={()=>setShowIzin(false)} style={{flex:1,padding:12,background:"#eee",border:0,borderRadius:8}}>Batal</button><button onClick={kirimIzin} style={{flex:1,padding:12,background:"#16a34a",color:"white",border:0,borderRadius:8,fontWeight:"bold"}}>{loading?"Mengirim...":"Kirim Izin"}</button></div></div></div>)}
    {terkunci&&<button onClick={()=>{loadData(); setView("statistik");}} style={{width:"100%",marginTop:12,padding:12,background:"#111",color:"white",borderRadius:10}}>📊 Statistik & Sinkron Sheet</button>}
  </div>);
}
