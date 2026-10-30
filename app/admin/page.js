"use client";
import { useState, useEffect, useMemo } from "react";
const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbxRWQ549peyAyad2mVRv1jv8YiNw29s1pQSxxhH5sFW3weEMkXduqtkBv_Hj_vVJ8w9/exec";
const DAFTAR_JABATAN = ["Sekretaris Desa","Kaur Keuangan","Kaur TU dan Umum","Kaur Perencanaan","Kasi Kesejahteraan","Kasi Pemerintahan","Kasi Pelayanan","Kadus Desa","Kadus Cikatomas","Kadus Cilopadang"];

export default function AdminOnline() {
  const [riwayat,setRiwayat]=useState([]);const [loading,setLoading]=useState(true);const [filter,setFilter]=useState("Semua");const [error,setError]=useState("");
  const load = async()=>{
    setLoading(true); setError("");
    try{
      const r=await fetch(GOOGLE_SHEET_URL+"?t="+Date.now(), {method:"GET", cache:"no-store"});
      if(!r.ok) throw new Error("HTTP "+r.status);
      const d=await r.json();
      setRiwayat(Array.isArray(d)?d:[]); 
    }catch(e){
      setError("Gagal load Sheet: "+e.message+" | Coba buka URL Sheet langsung di browser, kalau minta login berarti Deploy nya belum Anyone");
      const local=JSON.parse(localStorage.getItem("absensi_gunungsari")||"[]");
      if(local.length>0) setRiwayat(local);
    }
    setLoading(false);
  };
  useEffect(()=>{load();},[]);
  const hariIni=new Date().toLocaleDateString("id-ID"); const dataHariIni=useMemo(()=>riwayat.filter(r=>r.tanggal===hariIni),[riwayat]);
  const tampil = filter==="Semua"?riwayat:riwayat.filter(r=>r.nama===filter);
  const stat={masuk:dataHariIni.filter(r=>r.tipe==="MASUK").length, pulang:dataHariIni.filter(r=>r.tipe==="PULANG").length, izinK:dataHariIni.filter(r=>r.tipe==="IZIN KEGIATAN").length, izinS:dataHariIni.filter(r=>r.tipe==="IZIN SAKIT").length};
  const belumAbsen=DAFTAR_JABATAN.filter(j=>!dataHariIni.some(r=>r.nama===j));

  return(<div style={{maxWidth:1100,margin:"0 auto",padding:16,fontFamily:"system-ui",background:"#f8fafc",minHeight:"100vh"}}>
    <div style={{background:"#111",color:"white",padding:20,borderRadius:16,display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:10}}><div><h2 style={{margin:0}}>Admin ONLINE</h2><p style={{margin:"4px 0 0",fontSize:11,opacity:0.7}}>Live Sheet • desagunungsari207@gmail.com • {riwayat.length} data</p>{error&&<p style={{fontSize:10,color:"#fca5a5",marginTop:6,background:"rgba(255,255,255,0.1)",padding:6,borderRadius:6}}>{error}</p>}</div><div style={{display:"flex",gap:8,alignItems:"center"}}><button onClick={load} style={{padding:"10px 14px",background:"white",color:"#111",border:0,borderRadius:10,fontSize:12,fontWeight:"bold"}}>{loading?"Loading...":"🔄 Refresh"}</button><a href="/" style={{padding:"10px 14px",background:"#22c55e",color:"white",borderRadius:10,fontSize:12,textDecoration:"none",fontWeight:"bold"}}>← Absen</a></div></div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:10,marginTop:16}}><div style={{background:"white",padding:14,borderRadius:14}}><div style={{fontSize:11,color:"#666"}}>MASUK</div><div style={{fontSize:28,fontWeight:"bold",color:"#16a34a"}}>{stat.masuk}</div></div><div style={{background:"white",padding:14,borderRadius:14}}><div style={{fontSize:11,color:"#666"}}>PULANG</div><div style={{fontSize:28,fontWeight:"bold",color:"#dc2626"}}>{stat.pulang}</div></div><div style={{background:"white",padding:14,borderRadius:14}}><div style={{fontSize:11,color:"#666"}}>KEGIATAN</div><div style={{fontSize:28,fontWeight:"bold",color:"#f59e0b"}}>{stat.izinK}</div></div><div style={{background:"white",padding:14,borderRadius:14}}><div style={{fontSize:11,color:"#666"}}>SAKIT</div><div style={{fontSize:28,fontWeight:"bold",color:"#eab308"}}>{stat.izinS}</div></div></div>
    {belumAbsen.length>0&&<div style={{background:"#fef2f2",border:"1px solid #fecaca",padding:12,borderRadius:12,marginTop:12,fontSize:12}}><b>Belum Absen:</b> {belumAbsen.join(", ")}</div>}
    <div style={{marginTop:16,display:"flex",gap:8,flexWrap:"wrap"}}><select value={filter} onChange={e=>setFilter(e.target.value)} style={{padding:"8px 12px",borderRadius:8,border:"1px solid #ddd",fontSize:12}}><option value="Semua">Semua ({riwayat.length})</option>{DAFTAR_JABATAN.map(j=><option key={j} value={j}>{j}</option>)}</select><a href="https://docs.google.com/spreadsheets/u/1/?authuser=desagunungsari207@gmail.com" target="_blank" style={{fontSize:12,padding:"8px 12px",background:"#16a34a",color:"white",borderRadius:8,textDecoration:"none"}}>📊 Buka Sheet</a><a href={GOOGLE_SHEET_URL} target="_blank" style={{fontSize:11,padding:"8px 12px",background:"#eee",color:"#333",borderRadius:8,textDecoration:"none"}}>Test URL Sheet</a></div>
    <div style={{background:"white",borderRadius:14,marginTop:12,overflow:"hidden"}}><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}><thead><tr style={{background:"#f8fafc",textAlign:"left"}}><th style={{padding:12}}>Waktu</th><th style={{padding:12}}>Jabatan</th><th style={{padding:12}}>Tipe</th><th style={{padding:12}}>Keterangan</th></tr></thead><tbody>{loading?<tr><td colSpan={4} style={{padding:20,textAlign:"center"}}>Loading...</td></tr>:tampil.length===0?<tr><td colSpan={4} style={{padding:20,textAlign:"center",color:"#999"}}>Belum ada data - Absen dulu di halaman utama</td></tr>:tampil.map((r,i)=><tr key={i} style={{borderBottom:"1px solid #f1f5f9"}}><td style={{padding:10}}><b>{r.jam}</b><br/><span style={{fontSize:10,color:"#888"}}>{r.tanggal} • {r.jarak}m</span></td><td style={{padding:10}}><b>{r.nama}</b></td><td style={{padding:10}}><span style={{padding:"4px 10px",borderRadius:20,fontSize:10,fontWeight:"bold",background:r.tipe==="MASUK"?"#dcfce7":r.tipe==="PULANG"?"#fee2e2":"#fef3c7"}}>{r.tipe}</span></td><td style={{padding:10,maxWidth:260,fontSize:11}}>{r.keterangan||"-"}</td></tr>)}</tbody></table></div></div>
  </div>);
}
