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
        if(Array.isArray(data)){
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
    if(!dataReady) return alert("Tunggu cek absen...");
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
    if(!nama)return alert("Pilih jabatan!");if(jarak!==null && jarak>BALAI_DESA.radius)return alert(`Di luar area ${jarak}m`);if(tipe==="MASUK"&&sudahMasuk)return alert("Sudah MASUK!");if(tipe==="PULANG"&&sudahPulang)return alert("Sudah PULANG!");if(tipe==="PULANG"&&!sudahMasuk)return alert("Harus MASUK dulu!");
    const data={nama,tipe,jam:new Date().toLocaleTimeString("id-ID"),tanggal:hariIni,tanggalFull:new Date().toLocaleString("id-ID"),jarak:jarak||0,keterangan:""};
    kirimKeSheet(data);
  };

  const kirimIzin=()=>{
    if(!dataReady) return alert("Tunggu loading...");
    if(!nama)return alert("Pilih jabatan!");if(sudahIzin)return alert("Sudah izin!");if(sudahMasuk||sudahPulang)return alert("Sudah absen!");
    let keterangan=""; if(tipeIzin==="KEGIATAN"){if(!kegiatanApa||!kegiatanDimana)return alert("Isi!");keterangan=`${kegiatanApa} @ ${kegiatanDimana}`;}else{if(!sakitApa)return alert("Isi sakit!");keterangan=sakitApa;}
    const data={nama,tipe:`IZIN ${tipeIzin}`,jam:new Date().toLocaleTimeString("id-ID"),tanggal:hariIni,tanggalFull:new Date().toLocaleString("id-ID"),jarak:jarak||0,keterangan};
    kirimKeSheet(data); setShowIzin(false); setKegiatanApa(""); setKegiatanDimana(""); setSakitApa("");
  };

  if(!mounted) return <div style={{padding:20}}>Loading...</div>;
  const diArea=jarak!==null&&jarak<=BALAI_DESA.radius; 
  const riwayatSaya=riwayat.filter(r=>r && r.nama===nama);

  return(
  <div style={{minHeight:"100vh",background:"linear-gradient(180deg,#6b21a8 0%,#9333ea 18%,#f8fafc 45%)",fontFamily:"system-ui",paddingBottom:30}}>
    {/* HEADER ELEGAN */}
    <div style={{padding:"32px 20px 20px",textAlign:"center",color:"white"}}>
      <div style={{width:88,height:88,background:"white",borderRadius:20,margin:"0 auto 16px",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 10px 25px rgba(0,0,0,0.2)",padding:6}}>
        <img src="/logo-ciamis.png" alt="Logo Ciamis" style={{width:"100%",height:"100%",objectFit:"contain"}} onError={(e)=>{e.target.style.display='none'; e.target.parentElement.innerHTML='🏛️'}}/>
      </div>
      <h1 style={{margin:"0 0 4px",fontSize:20,lineHeight:"1.2",fontWeight:800,letterSpacing:"-0.02em",textShadow:"0 2px 10px rgba(0,0,0,0.2)"}}>Daftar Kehadiran<br/>Perangkat Desa Gunungsari</h1>
      <p style={{margin:"8px 0 0",fontSize:12,opacity:0.9,fontWeight:500,letterSpacing:"0.05em"}}>KAB. CIAMIS • Mahayunan Ayuna Kadatuan</p>
      <p style={{margin:"4px 0 0",fontSize:10,opacity:0.7}}>{new Date().toLocaleDateString("id-ID",{weekday:"long",day:"numeric",month:"long",year:"numeric"})} • ID: {deviceId}</p>
    </div>

    <div style={{maxWidth:440,margin:"0 auto",padding:"0 16px"}}>
      {/* STATUS CARD */}
      <div style={{background:"white",borderRadius:20,padding:16,boxShadow:"0 10px 30px rgba(0,0,0,0.08)",border:"1px solid #f1f5f9"}}>
        {!dataReady && <div style={{padding:10,background:"#fef3c7",borderRadius:12,fontSize:12,marginBottom:12,textAlign:"center",border:"1px solid #fde68a"}}>⏳ Mengecek status absen...</div>}
        
        {!nama?(
          <select value={nama} onChange={e=>kunciDevice(e.target.value)} disabled={!dataReady} style={{width:"100%",padding:"14px 16px",borderRadius:14,border:"1.5px solid #e2e8f0",background:"#f8fafc",fontWeight:600,fontSize:14}}>
            <option value="">-- Pilih Jabatan Anda --</option>{DAFTAR_JABATAN.map(p=><option key={p} value={p}>{p}</option>)}
          </select>
        ):(
          <div style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",background:"linear-gradient(135deg,#111827 0%,#1f2937 100%)",borderRadius:14,color:"white"}}>
            <div style={{width:44,height:44,background:"#9333ea",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800}}>{nama[0]}</div>
            <div style={{flex:1}}><div style={{fontSize:13,opacity:0.7}}>Terhubung sebagai</div><div style={{fontWeight:700,fontSize:15}}>{nama}</div></div>
            <div style={{textAlign:"right"}}><div style={{fontSize:10,background:sudahMasuk?"#16a34a":"#dc2626",padding:"3px 8px",borderRadius:20,fontWeight:700}}>{sudahMasuk?"HADIR":"BELUM"}</div><div style={{fontSize:9,marginTop:4,opacity:0.6}}>{sudahPulang?"✅ PULANG":""}</div></div>
          </div>
        )}

        {/* GPS */}
        <div style={{marginTop:12,padding:"12px 14px",background:diArea?"linear-gradient(135deg,#dcfce7,#f0fdf4)":"linear-gradient(135deg,#fee2e2,#fef2f2)",borderRadius:14,display:"flex",justifyContent:"space-between",alignItems:"center",border:diArea?"1px solid #bbf7d0":"1px solid #fecaca"}}>
          <div><div style={{fontSize:11,fontWeight:700,opacity:0.6}}>LOKASI</div><div style={{fontSize:14,fontWeight:800}}>{jarak!==null?`${jarak}m dari Balai`:"Mendeteksi GPS..."} • {diArea?"✅ Di Area":"❌ Di Luar Area"}</div></div>
          <button onClick={cekGPS} style={{width:36,height:36,borderRadius:10,border:0,background:"white",boxShadow:"0 2px 8px rgba(0,0,0,0.06)"}}>🔄</button>
        </div>

        {/* TOMBOL */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:14}}>
          <button disabled={!dataReady||!diArea||!nama||sudahMasuk||loading} onClick={()=>absen("MASUK")} style={{padding:"16px 12px",background:!dataReady?"#e2e8f0":sudahMasuk?"#111827":diArea&&nama?"linear-gradient(135deg,#16a34a,#15803d)":"#e2e8f0",color:!dataReady||(!diArea&&!sudahMasuk)?"#64748b":"white",border:0,borderRadius:14,fontWeight:800,fontSize:14,boxShadow:diArea&&nama&&!sudahMasuk?"0 6px 18px rgba(22,163,74,0.3)":"none"}}>
            {!dataReady?"⏳ CEK":sudahMasuk?"✅ MASUK":"📥 MASUK"}
          </button>
          <button disabled={!dataReady||!diArea||!nama||sudahPulang||!sudahMasuk||loading} onClick={()=>absen("PULANG")} style={{padding:"16px 12px",background:!dataReady?"#e2e8f0":sudahPulang?"#111827":diArea&&nama&&sudahMasuk?"linear-gradient(135deg,#dc2626,#b91c1c)":"#e2e8f0",color:!dataReady||(!sudahMasuk&&!sudahPulang)?"#64748b":"white",border:0,borderRadius:14,fontWeight:800,fontSize:14,boxShadow:diArea&&sudahMasuk&&!sudahPulang?"0 6px 18px rgba(220,38,38,0.3)":"none"}}>
            {!dataReady?"⏳ CEK":sudahPulang?"✅ PULANG":"📤 PULANG"}
          </button>
        </div>
        <button disabled={!dataReady||!nama||sudahIzin||sudahMasuk||loading} onClick={()=>setShowIzin(true)} style={{width:"100%",marginTop:10,padding:"14px",background:!dataReady?"#e2e8f0":sudahIzin||sudahMasuk?"#111827":"linear-gradient(135deg,#f59e0b,#d97706)",color:!dataReady||sudahIzin||sudahMasuk?"#e2e8f0":sudahIzin||sudahMasuk?"white":"white",border:0,borderRadius:14,fontWeight:700,fontSize:13}}>
          {!dataReady?"⏳ Mengecek...":sudahIzin?"✅ SUDAH IZIN HARI INI":sudahMasuk?"🔒 SUDAH ABSEN HARI INI":"📝 IZIN KEGIATAN / SAKIT"}
        </button>

        {/* MENU */}
        <div style={{display:"flex",gap:8,marginTop:12}}>
          <button onClick={()=>setView(view==="absen"?"statistik":"absen")} style={{flex:1,padding:12,background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:12,fontWeight:600,fontSize:12}}>{view==="absen"?"📊 Lihat Statistik":"← Kembali Absen"}</button>
          <a href="/admin" style={{flex:1,padding:"12px",background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:12,fontWeight:600,fontSize:12,textAlign:"center",textDecoration:"none",color:"#111"}}>👑 Admin</a>
        </div>

        {/* RIWAYAT */}
        {view==="statistik"&&(
          <div style={{marginTop:16,borderTop:"1px solid #f1f5f9",paddingTop:14}}>
            <div style={{fontWeight:800,fontSize:13,marginBottom:8}}>Riwayat {nama}</div>
            {riwayatSaya.length===0?<div style={{fontSize:12,color:"#64748b"}}>Belum ada data</div>:riwayatSaya.slice(0,15).map((r,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:"1px solid #f8fafc"}}><span style={{fontSize:12,fontWeight:600}}>{r.tipe}</span><span style={{fontSize:11,color:"#64748b"}}>{r.jam} • {r.tanggal}</span></div>)}
          </div>
        )}
      </div>

      <p style={{textAlign:"center",fontSize:10,color:"#94a3b8",marginTop:16}}>Desa Gunungsari • Kec. Sadananya • Kab. Ciamis<br/>Sistem Kehadiran Digital © 2026</p>
    </div>

    {/* MODAL IZIN */}
    {showIzin&&(<div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(15,23,42,0.6)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",padding:20,zIndex:99}}><div style={{background:"white",padding:22,borderRadius:20,width:"100%",maxWidth:380,boxShadow:"0 20px 60px rgba(0,0,0,0.2)"}}><h3 style={{margin:"0 0 4px",fontWeight:800}}>Form Izin</h3><p style={{margin:0,fontSize:12,color:"#64748b"}}>Isi sesuai kegiatan</p><div style={{display:"flex",gap:8,margin:"14px 0"}}><button onClick={()=>setTipeIzin("KEGIATAN")} style={{flex:1,padding:12,background:tipeIzin==="KEGIATAN"?"#111827":"#f1f5f9",color:tipeIzin==="KEGIATAN"?"white":"#111",border:0,borderRadius:12,fontWeight:700}}>Kegiatan</button><button onClick={()=>setTipeIzin("SAKIT")} style={{flex:1,padding:12,background:tipeIzin==="SAKIT"?"#111827":"#f1f5f9",color:tipeIzin==="SAKIT"?"white":"#111",border:0,borderRadius:12,fontWeight:700}}>Sakit</button></div>{tipeIzin==="KEGIATAN"?(<><input value={kegiatanApa} onChange={e=>setKegiatanApa(e.target.value)} placeholder="Kegiatan apa? (contoh: Rapat di Kecamatan)" style={{width:"100%",padding:14,borderRadius:12,border:"1.5px solid #e2e8f0",marginBottom:8,boxSizing:"border-box"}}/><input value={kegiatanDimana} onChange={e=>setKegiatanDimana(e.target.value)} placeholder="Lokasi dimana?" style={{width:"100%",padding:14,borderRadius:12,border:"1.5px solid #e2e8f0",boxSizing:"border-box"}}/></>):(<input value={sakitApa} onChange={e=>setSakitApa(e.target.value)} placeholder="Sakit apa? (contoh: Demam)" style={{width:"100%",padding:14,borderRadius:12,border:"1.5px solid #e2e8f0",boxSizing:"border-box"}}/>)}<div style={{display:"flex",gap:8,marginTop:16}}><button onClick={()=>setShowIzin(false)} style={{flex:1,padding:14,background:"#f1f5f9",border:0,borderRadius:12,fontWeight:600}}>Batal</button><button onClick={kirimIzin} style={{flex:1,padding:14,background:"#16a34a",color:"white",border:0,borderRadius:12,fontWeight:800}}>Kirim Izin</button></div></div></div>)}
  </div>);
}
