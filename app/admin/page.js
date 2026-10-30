"use client";
import { useState, useEffect, useMemo } from "react";
const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbxRWQ549peyAyad2mVRv1jv8YiNw29s1pQSxxhH5sFW3weEMkXduqtkBv_Hj_vVJ8w9/exec";
const ADMIN_PASSWORD = "Ch@dast1936"; // <-- GANTI PASSWORD DISINI PAK
const DAFTAR_JABATAN = ["Sekretaris Desa","Kaur Keuangan","Kaur TU dan Umum","Kaur Perencanaan","Kasi Kesejahteraan","Kasi Pemerintahan","Kasi Pelayanan","Kadus Desa","Kadus Cikatomas","Kadus Cilopadang"];

export default function AdminOnline() {
  const [login,setLogin]=useState(false);const [passInput,setPassInput]=useState("");
  const [riwayat,setRiwayat]=useState([]);const [devices,setDevices]=useState([]);const [loading,setLoading]=useState(true);const [filter,setFilter]=useState("Semua");
  
  const load = async()=>{
    setLoading(true);
    try{
      const r1=await fetch(GOOGLE_SHEET_URL+"?t="+Date.now()); const d1=await r1.json(); setRiwayat(Array.isArray(d1)?d1:[]);
      const r2=await fetch(GOOGLE_SHEET_URL+"?action=devices&t="+Date.now()); const d2=await r2.json(); setDevices(Array.isArray(d2)?d2:[]);
    }catch(e){ console.log(e); }
    setLoading(false);
  };
  useEffect(()=>{ if(login) load(); },[login]);
  
  const handleLogin = () => { if(passInput===ADMIN_PASSWORD){ setLogin(true); localStorage.setItem("admin_gunungsari","ok"); } else alert("Password salah!"); };
  useEffect(()=>{ if(localStorage.getItem("admin_gunungsari")==="ok") setLogin(true); },[]);

  const hapusDevice = async (deviceId, jabatan) => {
    if(!confirm(`Hapus device ${jabatan} (${deviceId})? HP lama/rusak akan bisa daftar lagi di HP baru.`)) return;
    try{
      await fetch(GOOGLE_SHEET_URL, {method:"POST", mode:"no-cors", body: JSON.stringify({action:"delete_device", deviceId})});
      alert("✅ Device "+jabatan+" dihapus. Sekarang bisa daftar di HP baru.");
      load();
    }catch(e){ alert("Gagal: "+e); }
  };

  if(!login){
    return(<div style={{maxWidth:400,margin:"80px auto",padding:24,background:"white",borderRadius:16,boxShadow:"0 4px 20px rgba(0,0,0,0.1)",fontFamily:"system-ui",textAlign:"center"}}><h2>🔒 Admin Desa Gunungsari</h2><p style={{fontSize:12,color:"#666"}}>Masukkan password admin</p><input type="password" value={passInput} onChange={e=>setPassInput(e.target.value)} placeholder="Password" style={{width:"100%",padding:12,borderRadius:8,border:"1px solid #ccc",marginTop:12}}/><button onClick={handleLogin} style={{width:"100%",padding:12,background:"#111",color:"white",border:0,borderRadius:8,marginTop:12,fontWeight:"bold"}}>Masuk</button><p style={{fontSize:10,color:"#999",marginTop:12}}>Default: gunungsari2024</p></div>);
  }

  const hariIni=new Date().toLocaleDateString("id-ID"); const dataHariIni=useMemo(()=>riwayat.filter(r=>r.tanggal===hariIni),[riwayat]);
  const tampil = filter==="Semua"?riwayat:riwayat.filter(r=>r.nama===filter);
  const stat={masuk:dataHariIni.filter(r=>r.tipe==="MASUK").length, pulang:dataHariIni.filter(r=>r.tipe==="PULANG").length, izinK:dataHariIni.filter(r=>r.tipe==="IZIN KEGIATAN").length, izinS:dataHariIni.filter(r=>r.tipe==="IZIN SAKIT").length};

  return(<div style={{maxWidth:1100,margin:"0 auto",padding:16,fontFamily:"system-ui",background:"#f8fafc",minHeight:"100vh"}}>
    <div style={{background:"#111",color:"white",padding:20,borderRadius:16,display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:10}}><div><h2 style={{margin:0}}>Admin ONLINE + Password</h2><p style={{margin:"4px 0 0",fontSize:11,opacity:0.7}}>{riwayat.length} absen • {devices.length} device terdaftar</p></div><div style={{display:"flex",gap:8}}><button onClick={load} style={{padding:"10px 14px",background:"white",color:"#111",border:0,borderRadius:10,fontSize:12,fontWeight:"bold"}}>🔄 Refresh</button><button onClick={()=>{localStorage.removeItem("admin_gunungsari"); setLogin(false);}} style={{padding:"10px 14px",background:"#dc2626",color:"white",border:0,borderRadius:10,fontSize:12}}>Logout</button><a href="/" style={{padding:"10px 14px",background:"#22c55e",color:"white",borderRadius:10,fontSize:12,textDecoration:"none",fontWeight:"bold"}}>Absen</a></div></div>

    <div style={{background:"white",border:"2px solid #111",padding:16,borderRadius:14,marginTop:16}}>
      <h3 style={{margin:"0 0 12px"}}>📱 Kelola Device (Bisa Hapus Jarak Jauh Kalau HP Rusak)</h3>
      {loading?<p>Loading devices...</p>:devices.length===0?<p style={{fontSize:12,color:"#999"}}>Belum ada device terdaftar. Suruh perangkat absen pilih jabatan dulu.</p>:<div style={{display:"grid",gap:8}}>{devices.map(d=><div key={d.deviceId} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 12px",background:"#f8fafc",borderRadius:8,border:"1px solid #eee"}}><div><b style={{fontSize:12}}>{d.jabatan}</b><br/><span style={{fontSize:10,color:"#666"}}>{d.deviceId} • {d.tanggalDaftar}</span></div><button onClick={()=>hapusDevice(d.deviceId,d.jabatan)} style={{padding:"6px 12px",background:"#dc2626",color:"white",border:0,borderRadius:6,fontSize:11,fontWeight:"bold"}}>🗑️ Hapus</button></div>)}</div>}
      <p style={{fontSize:10,color:"#666",marginTop:8}}>Kalau HP Kaur Keuangan rusak, klik Hapus di baris Kaur Keuangan, maka HP baru bisa daftar lagi sebagai Kaur Keuangan.</p>
    </div>

    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:10,marginTop:16}}><div style={{background:"white",padding:14,borderRadius:14}}><div style={{fontSize:11,color:"#666"}}>MASUK Hari Ini</div><div style={{fontSize:28,fontWeight:"bold",color:"#16a34a"}}>{stat.masuk}</div></div><div style={{background:"white",padding:14,borderRadius:14}}><div style={{fontSize:11,color:"#666"}}>PULANG</div><div style={{fontSize:28,fontWeight:"bold",color:"#dc2626"}}>{stat.pulang}</div></div><div style={{background:"white",padding:14,borderRadius:14}}><div style={{fontSize:11,color:"#666"}}>KEGIATAN</div><div style={{fontSize:28,fontWeight:"bold",color:"#f59e0b"}}>{stat.izinK}</div></div><div style={{background:"white",padding:14,borderRadius:14}}><div style={{fontSize:11,color:"#666"}}>SAKIT</div><div style={{fontSize:28,fontWeight:"bold",color:"#eab308"}}>{stat.izinS}</div></div></div>

    <div style={{background:"white",borderRadius:14,marginTop:16,overflow:"hidden"}}><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}><thead><tr style={{background:"#f8fafc"}}><th style={{padding:12,textAlign:"left"}}>Waktu</th><th style={{padding:12,textAlign:"left"}}>Jabatan</th><th style={{padding:12,textAlign:"left"}}>Tipe</th><th style={{padding:12,textAlign:"left"}}>Ket</th></tr></thead><tbody>{tampil.map((r,i)=><tr key={i} style={{borderBottom:"1px solid #f1f5f9"}}><td style={{padding:10}}>{r.jam}<br/><span style={{fontSize:10,color:"#888"}}>{r.tanggal}</span></td><td style={{padding:10}}><b>{r.nama}</b></td><td style={{padding:10}}>{r.tipe}</td><td style={{padding:10}}>{r.keterangan||"-"}</td></tr>)}</tbody></table></div></div>
  </div>);
}
