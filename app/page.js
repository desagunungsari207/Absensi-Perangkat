"use client";
import { useState, useEffect } from "react";
const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbxRWQ549peyAyad2mVRv1jv8YiNw29s1pQSxxhH5sFW3weEMkXduqtkBv_Hj_vVJ8w9/exec";
const BALAI_DESA = { lat: -7.259344564316639, lng: 108.31042899681555, radius: 50 };
const DAFTAR_JABATAN = ["Sekretaris Desa","Kaur Keuangan","Kaur TU dan Umum","Kaur Perencanaan","Kasi Kesejahteraan","Kasi Pemerintahan","Kasi Pelayanan","Kadus Desa","Kadus Cikatomas","Kadus Cilopadang"];
function getDistance(a,b,c,d){const R=6371e3;const dLat=(c-a)*Math.PI/180;const dLon=(d-b)*Math.PI/180;const x=Math.sin(dLat/2)**2+Math.cos(a*Math.PI/180)*Math.cos(c*Math.PI/180)*Math.sin(dLon/2)**2;return R*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x));}

export default function AbsensiGunungsari(){
  const [nama,setNama]=useState("");const [deviceId,setDeviceId]=useState("");const [jarak,setJarak]=useState(null);const [riwayat,setRiwayat]=useState([]);const [view,setView]=useState("absen");const [loading,setLoading]=useState(false);const [mounted,setMounted]=useState(false);const [dataReady,setDataReady]=useState(false);
  const [showIzin,setShowIzin]=useState(false);const [tipeIzin,setTipeIzin]=useState("KEGIATAN");const [kegiatanApa,setKegiatanApa]=useState("");const [kegiatanDimana,setKegiatanDimana]=useState("");const [sakitApa,setSakitApa]=useState("");

  useEffect(()=>{
    setMounted(true);
    try{
      const dId = localStorage.getItem("deviceId_gunungsari") || "DEV-"+Math.random().toString(36).substr(2,9).toUpperCase();
      localStorage.setItem("deviceId_gunungsari", dId); setDeviceId(dId);
      const device=localStorage.getItem("device_gunungsari");if(device){setNama(device);}
    }catch{}
    const load=async()=>{
      setDataReady(false);
      try{
        const saved=typeof window!=="undefined"?localStorage.getItem("absensi_gunungsari"):null;
        if(saved){ try{setRiwayat(JSON.parse(saved));}catch{} }
        const r=await fetch(GOOGLE_SHEET_URL+"?t="+Date.now(),{cache:"no-store"});
        const t=await r.text();
        const data=JSON.parse(t);
        if(Array.isArray(data) && data.length>=0){
          setRiwayat(data);
          try{localStorage.setItem("absensi_gunungsari", JSON.stringify(data));}catch{}
        }
      }catch{}
      setDataReady(true);
    };
    load();
    if(typeof navigator!=="undefined" && navigator.geolocation){
      navigator.geolocation.getCurrentPosition(p=>setJarak(Math.round(getDistance(p.coords.latitude,p.coords.longitude,BALAI_DESA.lat,BALAI_DESA.lng))),()=>{}, {enableHighAccuracy:true});
    }
  },[]);
  
  const cekGPS=()=>{ if(typeof navigator!=="undefined") navigator.geolocation.getCurrentPosition(p=>setJarak(Math.round(getDistance(p.coords.latitude,p.coords.longitude,BALAI_DESA.lat,BALAI_DESA.lng))),()=>alert("Aktifkan GPS"),{enableHighAccuracy:true}); };
  
  const kunciDevice=async(v)=>{
    if(!v)return;
    if(!window.confirm(`Kunci HP ini untuk "${v}"?`)) {setNama(""); return;}
    setLoading(true);
    try{
      await fetch(GOOGLE_SHEET_URL, {method:"POST", mode:"no-cors", body: JSON.stringify({action:"register_device", deviceId, jabatan:v, hpInfo:(typeof navigator!=="undefined"?navigator.userAgent:"").substr(0,60)})});
      try{ localStorage.setItem("device_gunungsari",v); }catch{}
      setNama(v); 
      alert("✅ HP terkunci untuk "+v);
    }catch(e){ alert("Gagal: "+e.message); }
    setLoading(false);
  };

  const hariIni=new Date().toLocaleDateString("id-ID");
  const absenHariIni=riwayat.filter(r=>r && r.nama===nama && r.tanggal===hariIni);
  const sudahMasuk=absenHariIni.some(r=>r.tipe==="MASUK");const sudahPulang=absenHariIni.some(r=>r.tipe==="PULANG");const sudahIzin=absenHariIni.some(r=>r.tipe && r.tipe.includes("IZIN"));
  
  const kirimKeSheet = async (data) => {
    if(!dataReady) return alert("Tunggu cek absen selesai...");
    // Double check lagi sebelum kirim
    const cekLagi = riwayat.filter(r=>r && r.nama===data.nama && r.tanggal===data.tanggal && r.tipe===data.tipe);
    if(cekLagi.length>0) return alert(`Sudah ${data.tipe} hari ini!`);
    
    setLoading(true); 
    try{
      await fetch(GOOGLE_SHEET_URL, { method: "POST", mode: "no-cors", body: JSON.stringify(data) }); 
      const baru=[data,...riwayat]; setRiwayat(baru);
      try{ localStorage.setItem("absensi_gunungsari", JSON.stringify(baru)); }catch{}
      alert("✅ Berhasil!"); 
      setView("statistik");
    }catch(e){ alert("Gagal: "+e.message); } 
    setLoading(false);
  };

  const absen=(tipe)=>{
    if(!dataReady) return alert("Tunggu loading...");
    if(!nama)return alert("Pilih jabatan!");if(jarak!==null && jarak>BALAI_DESA.radius)return alert(`Di luar area ${jarak}m`);if(tipe==="MASUK"&&sudahMasuk)return alert("Sudah MASUK hari ini!");if(tipe==="PULANG"&&sudahPulang)return alert("Sudah PULANG hari ini!");if(tipe==="PULANG"&&!sudahMasuk)return alert("Harus MASUK dulu!");
    const data={nama,tipe,jam:new Date().toLocaleTimeString("id-ID"),tanggal:hariIni,tanggalFull:new Date().toLocaleString("id-ID"),jarak:jarak||0,keterangan:""};
    kirimKeSheet(data);
  };

  const kirimIzin=()=>{
    if(!dataReady) return alert("Tunggu loading...");
    if(!nama)return alert("Pilih jabatan!");if(sudahIzin)return alert("Sudah izin hari ini!");if(sudahMasuk||sudahPulang)return alert("Sudah absen hari ini!");
    let keterangan=""; if(tipeIzin==="KEGIATAN"){if(!kegiatanApa||!kegiatanDimana)return alert("Isi!");keterangan=`${kegiatanApa} @ ${kegiatanDimana}`;}else{if(!sakitApa)return alert("Isi sakit!");keterangan=sakitApa;}
    const data={nama,tipe:`IZIN ${tipeIzin}`,jam:new Date().toLocaleTimeString("id-ID"),tanggal:hariIni,tanggalFull:new Date().toLocaleString("id-ID"),jarak:jarak||0,keterangan};
    kirimKeSheet(data); setShowIzin(false); setKegiatanApa(""); setKegiatanDimana(""); setSakitApa("");
  };

  if(!mounted) return <div style={{padding:20}}>Loading...</div>;
  const diArea=jarak!==null&&jarak<=BALAI_DESA.radius; 
  const riwayatSaya=riwayat.filter(r=>r && r.nama===nama);

  if(view==="statistik"&&nama){
    return(<div style={{maxWidth:440,margin:"0 auto",padding:16,fontFamily:"system-ui",background:"#f8fafc",minHeight:"100vh"}}>
      <div style={{display:"flex",justifyContent:"space-between"}}><h2 style={{margin:0}}>📊 Statistik</h2><button onClick={()=>setView("absen")} style={{padding:"8px 12px",borderRadius:8,border:"1px solid #ddd",background:"white"}}>← Absen</button></div>
      <div style={{background:"#111",color:"white",padding:16,borderRadius:16,marginTop:16}}><div style={{fontSize:11,opacity:0.7}}>ID: {deviceId}</div><div style={{fontSize:18,fontWeight:"bold"}}>{nama}</div><div style={{fontSize:11,marginTop:8}}>Status Hari Ini: {sudahMasuk?"✅ Sudah MASUK":"❌ Belum"} • {sudahPulang?"✅ Sudah PULANG":"❌ Belum Pulang"} • {sudahIzin?"📝 Sudah IZIN":""}</div></div>
      <div style={{background:"white",padding:14,borderRadius:12,marginTop:12}}>{riwayatSaya.slice(0,20).map((r,i)=><div key={i} style={{display:"flex",gap:10,padding:"10px 0",borderBottom:"1px solid #f1f5f9"}}><div style={{fontSize:12,fontWeight:"bold"}}>{r.tipe} • {r.jam} • {r.tanggal}</div></div>)}</div>
    </div>);
  }

  return(<div style={{maxWidth:420,margin:"0 auto",padding:20,fontFamily:"system-ui"}}><h2>Absensi Desa Gunungsari</h2><p style={{fontSize:11,color:"#16a34a",fontWeight:"bold"}}>🟢 ONLINE • ID: {deviceId}</p>
    {!dataReady && <div style={{padding:10,background:"#fef3c7",borderRadius:8,fontSize:12,marginBottom:10,textAlign:"center",border:"1px solid #fde68a"}}>⏳ Mengecek status absen hari ini... Tombol akan aktif setelah cek selesai</div>}
    {!nama?(<select value={nama} onChange={e=>kunciDevice(e.target.value)} disabled={!dataReady} style={{width:"100%",padding:14,borderRadius:8,margin:"10px 0",border:"2px solid #111"}}><option value="">-- Pilih Jabatan --</option>{DAFTAR_JABATAN.map(p=><option key={p} value={p}>{p}</option>)}</select>):(<div style={{padding:12,background:"#111",color:"white",borderRadius:8,margin:"10px 0",textAlign:"center"}}>🔒 {nama}<br/><span style={{fontSize:10,opacity:0.7}}>{deviceId}</span><br/><span style={{fontSize:10,background:sudahMasuk?"#16a34a":"#dc2626",padding:"2px 8px",borderRadius:10}}>{sudahMasuk?"SUDAH MASUK":"BELUM MASUK"} • {sudahPulang?"SUDAH PULANG":"BELUM PULANG"}</span></div>)}
    <div style={{padding:14,background:diArea?"#dcfce7":"#fee2e2",borderRadius:10,marginBottom:12}}><b>{jarak!==null?`${jarak}m`:"Cek GPS..."}</b> - {diArea?"✅ Di Area":"❌ Di Luar"} <button onClick={cekGPS} style={{marginLeft:8}}>🔄</button></div>
    <div style={{display:"flex",gap:10}}><button disabled={!dataReady||!diArea||!nama||sudahMasuk||loading} onClick={()=>absen("MASUK")} style={{flex:1,padding:16,background:!dataReady?"#9ca3af":sudahMasuk?"#111":diArea&&nama?"#16a34a":"#9ca3af",color:"white",border:0,borderRadius:10,fontWeight:"bold"}}>{!dataReady?"CEK...":loading?"...":sudahMasuk?"SUDAH MASUK":"MASUK"}</button><button disabled={!dataReady||!diArea||!nama||sudahPulang||!sudahMasuk||loading} onClick={()=>absen("PULANG")} style={{flex:1,padding:16,background:!dataReady?"#9ca3af":sudahPulang?"#111":diArea&&nama&&sudahMasuk?"#dc2626":"#9ca3af",color:"white",border:0,borderRadius:10,fontWeight:"bold"}}>{!dataReady?"CEK...":loading?"...":sudahPulang?"SUDAH PULANG":"PULANG"}</button></div>
    <button disabled={!dataReady||!nama||sudahIzin||sudahMasuk||loading} onClick={()=>setShowIzin(true)} style={{width:"100%",marginTop:10,padding:12,background:!dataReady?"#9ca3af":sudahIzin||sudahMasuk?"#111":"#f59e0b",color:"white",border:0,borderRadius:10,fontWeight:"bold"}}>{!dataReady?"CEK...":sudahIzin?"SUDAH IZIN HARI INI":sudahMasuk?"SUDAH ABSEN":"📝 IZIN KEGIATAN / SAKIT"}</button>
    {showIzin&&(<div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",padding:20,zIndex:99}}><div style={{background:"white",padding:20,borderRadius:12,width:"100%",maxWidth:400}}><h3 style={{marginTop:0}}>Form Izin</h3><div style={{display:"flex",gap:8,margin:"12px 0"}}><button onClick={()=>setTipeIzin("KEGIATAN")} style={{flex:1,padding:10,background:tipeIzin==="KEGIATAN"?"#111":"#eee",color:tipeIzin==="KEGIATAN"?"white":"#111",border:0,borderRadius:8}}>Kegiatan</button><button onClick={()=>setTipeIzin("SAKIT")} style={{flex:1,padding:10,background:tipeIzin==="SAKIT"?"#111":"#eee",color:tipeIzin==="SAKIT"?"white":"#111",border:0,borderRadius:8}}>Sakit</button></div>{tipeIzin==="KEGIATAN"?(<><input value={kegiatanApa} onChange={e=>setKegiatanApa(e.target.value)} placeholder="Kegiatan apa?" style={{width:"100%",padding:12,borderRadius:8,border:"1px solid #ccc",marginBottom:8,boxSizing:"border-box"}}/><input value={kegiatanDimana} onChange={e=>setKegiatanDimana(e.target.value)} placeholder="Dimana?" style={{width:"100%",padding:12,borderRadius:8,border:"1px solid #ccc",boxSizing:"border-box"}}/></>):(<input value={sakitApa} onChange={e=>setSakitApa(e.target.value)} placeholder="Sakit apa?" style={{width:"100%",padding:12,borderRadius:8,border:"1px solid #ccc",boxSizing:"border-box"}}/>)}<div style={{display:"flex",gap:8,marginTop:15}}><button onClick={()=>setShowIzin(false)} style={{flex:1,padding:12,background:"#eee",border:0,borderRadius:8}}>Batal</button><button onClick={kirimIzin} style={{flex:1,padding:12,background:"#16a34a",color:"white",border:0,borderRadius:8,fontWeight:"bold"}}>Kirim</button></div></div></div>)}
    {nama&&<button onClick={()=>setView("statistik")} style={{width:"100%",marginTop:12,padding:12,background:"#111",color:"white",borderRadius:10}}>📊 Statistik</button>}
  </div>);
}
