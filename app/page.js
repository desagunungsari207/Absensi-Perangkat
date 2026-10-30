"use client";
import { useState, useEffect } from "react";
const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbxRWQ549peyAyad2mVRv1jv8YiNw29s1pQSxxhH5sFW3weEMkXduqtkBv_Hj_vVJ8w9/exec";
const BALAI_DESA = { lat: -7.259344564316639, lng: 108.31042899681555, radius: 50 };
const DAFTAR_JABATAN = ["Sekretaris Desa","Kaur Keuangan","Kaur TU dan Umum","Kaur Perencanaan","Kasi Kesejahteraan","Kasi Pemerintahan","Kasi Pelayanan","Kadus Desa","Kadus Cikatomas","Kadus Cilopadang"];
const LOGO_URL = "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Lambang_Kabupaten_Ciamis.png/400px-Lambang_Kabupaten_Ciamis.png";
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
        const saved=localStorage.getItem("absensi_gunungsari");if(saved){ try{setRiwayat(JSON.parse(saved));}catch{} }
        const r=await fetch(GOOGLE_SHEET_URL+"?t="+Date.now(),{cache:"no-store"});
        const t=await r.text(); const data=JSON.parse(t);
        if(Array.isArray(data)){ setRiwayat(data); localStorage.setItem("absensi_gunungsari", JSON.stringify(data)); }
      }catch{} setDataReady(true);
    };
    load();
    if(navigator.geolocation){ navigator.geolocation.getCurrentPosition(p=>setJarak(Math.round(getDistance(p.coords.latitude,p.coords.longitude,BALAI_DESA.lat,BALAI_DESA.lng))),()=>{}, {enableHighAccuracy:true}); }
  },[]);
  
  const cekGPS=()=>{ navigator.geolocation.getCurrentPosition(p=>setJarak(Math.round(getDistance(p.coords.latitude,p.coords.longitude,BALAI_DESA.lat,BALAI_DESA.lng))),()=>alert("Aktifkan GPS"),{enableHighAccuracy:true}); };
  const kunciDevice=async(v)=>{
    if(!v)return; if(!confirm(`Kunci HP ini untuk "${v}"?`)) {setNama(""); return;}
    setLoading(true);
    try{ await fetch(GOOGLE_SHEET_URL, {method:"POST", mode:"no-cors", body: JSON.stringify({action:"register_device", deviceId, jabatan:v})}); localStorage.setItem("device_gunungsari",v); setNama(v); alert("✅ Terkunci"); }catch(e){ alert(e.message); } setLoading(false);
  };
  const hariIni=new Date().toLocaleDateString("id-ID"); const absenHariIni=riwayat.filter(r=>r && r.nama===nama && r.tanggal===hariIni);
  const sudahMasuk=absenHariIni.some(r=>r.tipe==="MASUK");const sudahPulang=absenHariIni.some(r=>r.tipe==="PULANG");const sudahIzin=absenHariIni.some(r=>r.tipe && r.tipe.includes("IZIN"));
  const kirimKeSheet = async (data) => {
    if(!dataReady) return alert("Tunggu..."); const cek=riwayat.filter(r=>r.nama===data.nama && r.tanggal===data.tanggal && r.tipe===data.tipe); if(cek.length>0) return alert(`Sudah ${data.tipe}!`);
    setLoading(true); try{ await fetch(GOOGLE_SHEET_URL, { method: "POST", mode: "no-cors", body: JSON.stringify(data) }); const baru=[data,...riwayat]; setRiwayat(baru); localStorage.setItem("absensi_gunungsari", JSON.stringify(baru)); alert("✅ Berhasil!"); setView("statistik"); }catch(e){ alert(e.message); } setLoading(false);
  };
  const absen=(tipe)=>{
    if(!nama)return alert("Pilih jabatan!");if(jarak!==null && jarak>BALAI_DESA.radius)return alert(`Di luar area ${jarak}m`);if(tipe==="MASUK"&&sudahMasuk)return alert("Sudah MASUK!");if(tipe==="PULANG"&&sudahPulang)return alert("Sudah PULANG!");if(tipe==="PULANG"&&!sudahMasuk)return alert("Harus MASUK dulu!");
    kirimKeSheet({nama,tipe,jam:new Date().toLocaleTimeString("id-ID"),tanggal:hariIni,tanggalFull:new Date().toLocaleString("id-ID"),jarak:jarak||0,keterangan:""});
  };
  const kirimIzin=()=>{
    if(!nama)return alert("Pilih jabatan!");if(sudahIzin)return alert("Sudah izin!");if(sudahMasuk||sudahPulang)return alert("Sudah absen!");
    let keterangan=""; if(tipeIzin==="KEGIATAN"){if(!kegiatanApa||!kegiatanDimana)return alert("Isi!");keterangan=`${kegiatanApa} @ ${kegiatanDimana}`;}else{if(!sakitApa)return alert("Isi!");keterangan=sakitApa;}
    kirimKeSheet({nama,tipe:`IZIN ${tipeIzin}`,jam:new Date().toLocaleTimeString("id-ID"),tanggal:hariIni,tanggalFull:new Date().toLocaleString("id-ID"),jarak:jarak||0,keterangan}); setShowIzin(false);
  };
  if(!mounted) return <div style={{padding:20}}>Loading...</div>;
  const diArea=jarak!==null&&jarak<=BALAI_DESA.radius; const riwayatSaya=riwayat.filter(r=>r && r.nama===nama);

  return(
  <div style={{minHeight:"100vh",background:"linear-gradient(180deg,#6b21a8 0%,#9333ea 18%,#f8fafc 45%)",fontFamily:"system-ui",paddingBottom:30}}>
    <div style={{padding:"28px 20px 18px",textAlign:"center",color:"white"}}>
      {/* LOGO FIX - pakai URL Wikipedia, pasti muncul */}
      <div style={{width:92,height:92,background:"white",borderRadius:22,margin:"0 auto 14px",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 12px 28px rgba(0,0,0,0.22)",padding:8,border:"3px solid rgba(255,255,255,0.6)"}}>
        <img src={LOGO_URL} alt="Logo Ciamis" style={{width:"100%",height:"100%",objectFit:"contain"}} />
      </div>
      <h1 style={{margin:"0",fontSize:20,lineHeight:1.25,fontWeight:800,textShadow:"0 2px 12px rgba(0,0,0,0.25)"}}>Daftar Kehadiran<br/>Perangkat Desa Gunungsari</h1>
      <p style={{margin:"8px 0 0",fontSize:12,opacity:0.95,fontWeight:600,letterSpacing:"0.04em"}}>KAB. CIAMIS • Mahayunan Ayuna Kadatuan</p>
      <p style={{margin:"4px 0 0",fontSize:10,opacity:0.75}}>{new Date().toLocaleDateString("id-ID",{weekday:"long",day:"numeric",month:"long",year:"numeric"})} • {deviceId}</p>
    </div>

    <div style={{maxWidth:440,margin:"0 auto",padding:"0 14px"}}>
      <div style={{background:"white",borderRadius:22,padding:14,boxShadow:"0 12px 32px rgba(0,0,0,0.09)",border:"1px solid #f1f5f9"}}>
        {!dataReady && <div style={{padding:10,background:"#fef3c7",borderRadius:12,fontSize:12,marginBottom:10,textAlign:"center"}}>⏳ Mengecek status absen...</div>}
        {!nama?(
          <select value={nama} onChange={e=>kunciDevice(e.target.value)} disabled={!dataReady} style={{width:"100%",padding:"14px 14px",borderRadius:14,border:"1.5px solid #e2e8f0",background:"#f8fafc",fontWeight:700,fontSize:14}}><option value="">-- Pilih Jabatan Anda --</option>{DAFTAR_JABATAN.map(p=><option key={p} value={p}>{p}</option>)}</select>
        ):(
          <div style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",background:"linear-gradient(135deg,#0f172a 0%,#1e293b 100%)",borderRadius:14,color:"white"}}><div style={{width:42,height:42,background:"#9333ea",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800}}>{nama[0]}</div><div style={{flex:1}}><div style={{fontSize:11,opacity:0.6}}>Terhubung sebagai</div><div style={{fontWeight:700,fontSize:14}}>{nama}</div></div><div style={{fontSize:10,background:sudahMasuk?"#16a34a":"#dc2626",padding:"4px 10px",borderRadius:20,fontWeight:700}}>{sudahMasuk?"HADIR":"BELUM"}</div></div>
        )}
        <div style={{marginTop:12,padding:"12px 14px",background:diArea?"#dcfce7":"#fee2e2",borderRadius:14,display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><div style={{fontSize:10,fontWeight:700,opacity:0.6}}>LOKASI</div><div style={{fontSize:13,fontWeight:800}}>{jarak!==null?`${jarak}m dari Balai`:"Mendeteksi..."} • {diArea?"✅ Di Area":"❌ Luar Area"}</div></div><button onClick={cekGPS} style={{width:36,height:36,borderRadius:10,border:0,background:"white"}}>🔄</button></div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:12}}>
          <button disabled={!dataReady||!diArea||!nama||sudahMasuk||loading} onClick={()=>absen("MASUK")} style={{padding:16,background:sudahMasuk?"#0f172a":diArea&&nama?"#16a34a":"#e2e8f0",color:sudahMasuk||diArea&&nama?"white":"#64748b",border:0,borderRadius:14,fontWeight:800}}>{sudahMasuk?"✅ MASUK":"📥 MASUK"}</button>
          <button disabled={!dataReady||!diArea||!nama||sudahPulang||!sudahMasuk||loading} onClick={()=>absen("PULANG")} style={{padding:16,background:sudahPulang?"#0f172a":diArea&&sudahMasuk?"#dc2626":"#e2e8f0",color:sudahPulang||diArea&&sudahMasuk?"white":"#64748b",border:0,borderRadius:14,fontWeight:800}}>{sudahPulang?"✅ PULANG":"📤 PULANG"}</button>
        </div>
        <button disabled={!dataReady||!nama||sudahIzin||sudahMasuk} onClick={()=>setShowIzin(true)} style={{width:"100%",marginTop:10,padding:14,background:sudahIzin||sudahMasuk?"#0f172a":"#f59e0b",color:"white",border:0,borderRadius:14,fontWeight:700,fontSize:12}}>{sudahIzin||sudahMasuk?"🔒 SUDAH ABSEN HARI INI":"📝 IZIN KEGIATAN / SAKIT"}</button>
        <div style={{display:"flex",gap:8,marginTop:10}}><button onClick={()=>setView(view==="absen"?"statistik":"absen")} style={{flex:1,padding:12,background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:12,fontSize:12,fontWeight:600}}>{view==="absen"?"📊 Lihat Statistik":"← Kembali"}</button><a href="/admin" style={{flex:1,padding:12,background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:12,fontSize:12,fontWeight:600,textAlign:"center",textDecoration:"none",color:"#111"}}>👑 Admin</a></div>
        {view==="statistik"&&(<div style={{marginTop:14,borderTop:"1px solid #f1f5f9",paddingTop:10}}>{riwayatSaya.slice(0,20).map((r,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid #f8fafc",fontSize:12}}><b>{r.tipe}</b><span>{r.jam} {r.tanggal} {r.keterangan?`• ${r.keterangan}`:""}</span></div>)}</div>)}
      </div>
      <p style={{textAlign:"center",fontSize:10,color:"#94a3b8",marginTop:14}}>Desa Gunungsari • Kec. Sadananya • Kab. Ciamis</p>
    </div>
    {showIzin&&(<div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",padding:20,zIndex:99}}><div style={{background:"white",padding:20,borderRadius:18,width:"100%",maxWidth:360}}><h3 style={{margin:0}}>Form Izin</h3><div style={{display:"flex",gap:8,margin:"12px 0"}}><button onClick={()=>setTipeIzin("KEGIATAN")} style={{flex:1,padding:12,background:tipeIzin==="KEGIATAN"?"#0f172a":"#f1f5f9",color:tipeIzin==="KEGIATAN"?"white":"#111",border:0,borderRadius:10}}>Kegiatan</button><button onClick={()=>setTipeIzin("SAKIT")} style={{flex:1,padding:12,background:tipeIzin==="SAKIT"?"#0f172a":"#f1f5f9",color:tipeIzin==="SAKIT"?"white":"#111",border:0,borderRadius:10}}>Sakit</button></div>{tipeIzin==="KEGIATAN"?(<><input value={kegiatanApa} onChange={e=>setKegiatanApa(e.target.value)} placeholder="Kegiatan apa?" style={{width:"100%",padding:12,borderRadius:10,border:"1px solid #e2e8f0",marginBottom:8,boxSizing:"border-box"}}/><input value={kegiatanDimana} onChange={e=>setKegiatanDimana(e.target.value)} placeholder="Dimana?" style={{width:"100%",padding:12,borderRadius:10,border:"1px solid #e2e8f0",boxSizing:"border-box"}}/></>):(<input value={sakitApa} onChange={e=>setSakitApa(e.target.value)} placeholder="Sakit apa?" style={{width:"100%",padding:12,borderRadius:10,border:"1px solid #e2e8f0",boxSizing:"border-box"}}/>)}<div style={{display:"flex",gap:8,marginTop:14}}><button onClick={()=>setShowIzin(false)} style={{flex:1,padding:12,background:"#f1f5f9",border:0,borderRadius:10}}>Batal</button><button onClick={kirimIzin} style={{flex:1,padding:12,background:"#16a34a",color:"white",border:0,borderRadius:10,fontWeight:700}}>Kirim</button></div></div></div>)}
  </div>);
}
