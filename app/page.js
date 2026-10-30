"use client";
import { useState, useEffect } from "react";
const BALAI_DESA = { lat: -7.259344564316639, lng: 108.31042899681555, radius: 50 };
const DAFTAR_JABATAN = ["Sekretaris Desa","Kaur Keuangan","Kaur TU dan Umum","Kaur Perencanaan","Kasi Kesejahteraan","Kasi Pemerintahan","Kasi Pelayanan","Kadus Desa","Kadus Cikatomas","Kadus Cilopadang"];
function getDistance(a,b,c,d){const R=6371e3;const dLat=(c-a)*Math.PI/180;const dLon=(d-b)*Math.PI/180;const x=Math.sin(dLat/2)**2+Math.cos(a*Math.PI/180)*Math.cos(c*Math.PI/180)*Math.sin(dLon/2)**2;return R*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x));}

export default function AbsensiGunungsari(){
  const [nama,setNama]=useState("");const [terkunci,setTerkunci]=useState(false);const [jarak,setJarak]=useState(null);const [riwayat,setRiwayat]=useState([]);const [view,setView]=useState("absen");
  const [showIzin,setShowIzin]=useState(false);const [tipeIzin,setTipeIzin]=useState("KEGIATAN");
  const [kegiatanApa,setKegiatanApa]=useState("");const [kegiatanDimana,setKegiatanDimana]=useState("");const [sakitApa,setSakitApa]=useState("");

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

  const absen=(tipe)=>{
    if(!nama)return alert("Pilih jabatan!");if(jarak>BALAI_DESA.radius)return alert(`Di luar area ${jarak}m`);
    if(tipe==="MASUK"&&sudahMasuk)return alert("Sudah MASUK!");if(tipe==="PULANG"&&sudahPulang)return alert("Sudah PULANG!");if(tipe==="PULANG"&&!sudahMasuk)return alert("Harus MASUK dulu!");
    const data={nama,tipe,jam:new Date().toLocaleTimeString("id-ID"),tanggal:hariIni,tanggalFull:new Date().toLocaleString("id-ID"),jarak,keterangan:""};
    const baru=[data,...riwayat];setRiwayat(baru);localStorage.setItem("absensi_gunungsari",JSON.stringify(baru));setView("statistik");
  };

  const kirimIzin=()=>{
    if(!nama)return alert("Pilih jabatan!");if(sudahIzin)return alert("Sudah izin hari ini!");
    if(sudahMasuk||sudahPulang)return alert("Sudah absen masuk/pulang hari ini, tidak bisa izin!");
    let keterangan="";
    if(tipeIzin==="KEGIATAN"){if(!kegiatanApa||!kegiatanDimana)return alert("Isi kegiatan apa & dimana!");keterangan=`Kegiatan: ${kegiatanApa} | Lokasi: ${kegiatanDimana}`;}
    else {if(!sakitApa)return alert("Isi sakit apa!");keterangan=`Sakit: ${sakitApa}`;}
    const data={nama,tipe:`IZIN ${tipeIzin}`,jam:new Date().toLocaleTimeString("id-ID"),tanggal:hariIni,tanggalFull:new Date().toLocaleString("id-ID"),jarak:jarak||0,keterangan};
    const baru=[data,...riwayat];setRiwayat(baru);localStorage.setItem("absensi_gunungsari",JSON.stringify(baru));
    setShowIzin(false);setKegiatanApa("");setKegiatanDimana("");setSakitApa("");setView("statistik");
  };

  const diArea=jarak!==null&&jarak<=BALAI_DESA.radius;const riwayatSaya=riwayat.filter(r=>r.nama===nama);

  if(view==="statistik"&&nama){
    return(<div style={{maxWidth:420,margin:"0 auto",padding:20,fontFamily:"system-ui"}}><h2>Statistik {nama}</h2><div style={{background:"#f0fdf4",padding:14,borderRadius:10,margin:"15px 0",fontSize:13}}>MASUK {sudahMasuk?"✅":"❌"} | PULANG {sudahPulang?"✅":"❌"} | IZIN {sudahIzin?"✅":"❌"}<br/>Total: {riwayatSaya.length} kali</div>{riwayatSaya.map((r,i)=><div key={i} style={{padding:"10px 0",borderBottom:"1px solid #eee",fontSize:13}}><b>{r.tanggal} {r.jam} - {r.tipe}</b><br/><span style={{color:"#555"}}>{r.keterangan?r.keterangan:`${r.jarak}m`}</span></div>)}<button onClick={()=>setView("absen")} style={{width:"100%",marginTop:20,padding:14,background:"#111",color:"white",borderRadius:10}}>← Kembali Absen</button></div>);
  }

  return(<div style={{maxWidth:420,margin:"0 auto",padding:20,fontFamily:"system-ui"}}><h2>Absensi Desa Gunungsari</h2><p style={{fontSize:11,color:"#666"}}>1 Device = 1 Jabatan • {hariIni}</p>
    {!terkunci?(<select value={nama} onChange={e=>kunciDevice(e.target.value)} style={{width:"100%",padding:14,borderRadius:8,margin:"15px 0 10px",border:"2px solid #111"}}><option value="">-- Pilih Jabatan (Sekali Kunci) --</option>{DAFTAR_JABATAN.map(p=><option key={p} value={p}>{p}</option>)}</select>):(<div style={{padding:12,background:"#111",color:"white",borderRadius:8,margin:"15px 0 10px",textAlign:"center"}}>🔒 {nama}</div>)}
    {nama&&<div style={{fontSize:11,padding:8,background:"#f3f4f6",borderRadius:6,marginBottom:10}}>MASUK {sudahMasuk?"✅":"❌"} | PULANG {sudahPulang?"✅":"❌"} | IZIN {sudahIzin?"✅":"❌"}</div>}
    <div style={{padding:14,background:diArea?"#dcfce7":"#fee2e2",borderRadius:10,marginBottom:15}}><b>{jarak!==null?`${jarak}m`:"Cek GPS..."}</b> - {diArea?"✅ Di Area":"❌ Di Luar"} <button onClick={cekGPS} style={{marginLeft:8,fontSize:11}}>🔄</button></div>

    <div style={{display:"flex",gap:10}}><button disabled={!diArea||!nama||sudahMasuk} onClick={()=>absen("MASUK")} style={{flex:1,padding:16,background:sudahMasuk?"#9ca3af":diArea&&nama?"#16a34a":"#9ca3af",color:"white",border:0,borderRadius:10,fontWeight:"bold"}}>{sudahMasuk?"SUDAH MASUK":"MASUK"}</button><button disabled={!diArea||!nama||sudahPulang||!sudahMasuk} onClick={()=>absen("PULANG")} style={{flex:1,padding:16,background:sudahPulang?"#9ca3af":diArea&&nama&&sudahMasuk?"#dc2626":"#9ca3af",color:"white",border:0,borderRadius:10,fontWeight:"bold"}}>{sudahPulang?"SUDAH PULANG":"PULANG"}</button></div>

    <button disabled={!nama||sudahIzin||sudahMasuk} onClick={()=>setShowIzin(true)} style={{width:"100%",marginTop:10,padding:12,background:sudahIzin?"#9ca3af":"#f59e0b",color:"white",border:0,borderRadius:10,fontWeight:"bold"}}>{sudahIzin?"SUDAH IZIN HARI INI":"📝 IZIN KEGIATAN / SAKIT"}</button>

    {showIzin&&(<div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",padding:20,zIndex:99}}><div style={{background:"white",padding:20,borderRadius:12,width:"100%",maxWidth:400}}><h3 style={{marginTop:0}}>Form Izin - {nama}</h3><p style={{fontSize:12,color:"#666"}}>{hariIni} • Boleh di luar area</p>
      <div style={{display:"flex",gap:8,margin:"12px 0"}}><button onClick={()=>setTipeIzin("KEGIATAN")} style={{flex:1,padding:10,background:tipeIzin==="KEGIATAN"?"#111":"#eee",color:tipeIzin==="KEGIATAN"?"white":"#111",border:0,borderRadius:8}}>Kegiatan</button><button onClick={()=>setTipeIzin("SAKIT")} style={{flex:1,padding:10,background:tipeIzin==="SAKIT"?"#111":"#eee",color:tipeIzin==="SAKIT"?"white":"#111",border:0,borderRadius:8}}>Sakit</button></div>
      {tipeIzin==="KEGIATAN"?(
        <><input value={kegiatanApa} onChange={e=>setKegiatanApa(e.target.value)} placeholder="Kegiatan apa? (Contoh: Rapat di Kecamatan)" style={{width:"100%",padding:12,borderRadius:8,border:"1px solid #ccc",marginBottom:8}}/><input value={kegiatanDimana} onChange={e=>setKegiatanDimana(e.target.value)} placeholder="Dimana? (Contoh: Kantor Kecamatan Cikatomas)" style={{width:"100%",padding:12,borderRadius:8,border:"1px solid #ccc"}}/></>
      ):(
        <><input value={sakitApa} onChange={e=>setSakitApa(e.target.value)} placeholder="Sakit apa? (Contoh: Demam, kontrol dokter)" style={{width:"100%",padding:12,borderRadius:8,border:"1px solid #ccc"}}/></>
      )}
      <div style={{display:"flex",gap:8,marginTop:15}}><button onClick={()=>setShowIzin(false)} style={{flex:1,padding:12,background:"#eee",border:0,borderRadius:8}}>Batal</button><button onClick={kirimIzin} style={{flex:1,padding:12,background:"#16a34a",color:"white",border:0,borderRadius:8,fontWeight:"bold"}}>Kirim Izin</button></div>
    </div></div>)}

    {terkunci&&<button onClick={()=>setView("statistik")} style={{width:"100%",marginTop:12,padding:10,background:"white",border:"1px solid #ddd",borderRadius:8,fontSize:12}}>📊 Lihat Statistik Saya</button>}
  </div>);
}
