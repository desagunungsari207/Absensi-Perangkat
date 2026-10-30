"use client";
import { useState, useEffect } from "react";
const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbxRWQ549peyAyad2mVRv1jv8YiNw29s1pQSxxhH5sFW3weEMkXduqtkBv_Hj_vVJ8w9/exec";
const ADMIN_PASSWORD = "Ch@dast1936";

export default function Admin() {
  const [ready, setReady] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const [pass, setPass] = useState("");
  const [absen, setAbsen] = useState([]);
  const [devices, setDevices] = useState([]);
  const [msg, setMsg] = useState("Siap");
  const [filter, setFilter] = useState("Semua");

  useEffect(() => {
    setReady(true);
    try {
      if (typeof window !== "undefined" && window.localStorage.getItem("admin_gunungsari") === "ok") {
        setIsLogin(true);
      }
    } catch {}
  }, []);

  const safeFetch = async (url) => {
    try {
      const res = await fetch(url, { cache: "no-store" });
      const text = await res.text();
      try {
        const json = JSON.parse(text);
        return Array.isArray(json) ? json : [];
      } catch {
        setMsg("Sheet return HTML, bukan JSON. Cek Deploy Anyone. Response: " + text.substring(0,100));
        return [];
      }
    } catch (e) {
      setMsg("Gagal fetch: " + e.message);
      return [];
    }
  };

  const loadData = async () => {
    setMsg("Loading...");
    const d1 = await safeFetch(GOOGLE_SHEET_URL + "?t=" + Date.now());
    setAbsen(d1);
    const d2 = await safeFetch(GOOGLE_SHEET_URL + "?action=devices&t=" + Date.now());
    setDevices(d2);
    setMsg(`Loaded: ${d1.length} absen, ${d2.length} device`);
  };

  useEffect(() => {
    if (isLogin && ready) loadData();
  }, [isLogin, ready]);

  const login = () => {
    if (pass === ADMIN_PASSWORD) {
      setIsLogin(true);
      try { window.localStorage.setItem("admin_gunungsari", "ok"); } catch {}
    } else {
      alert("Password salah!");
    }
  };

  const logout = () => {
    try { window.localStorage.removeItem("admin_gunungsari"); } catch {}
    setIsLogin(false);
    setPass("");
  };

  const hapusDevice = async (deviceId, jabatan) => {
    if (!window.confirm(`Hapus ${jabatan}?`)) return;
    setMsg("Menghapus...");
    try {
      await fetch(GOOGLE_SHEET_URL, { method: "POST", mode: "no-cors", body: JSON.stringify({ action: "delete_device", deviceId }) });
      setMsg("Device dihapus, refresh 2 detik...");
      setTimeout(loadData, 2500);
    } catch (e) {
      setMsg("Gagal hapus: " + e.message);
    }
  };

  if (!ready) return <div style={{padding:20}}>Loading...</div>;

  if (!isLogin) {
    return (
      <div style={{maxWidth:380,margin:"60px auto",padding:20,background:"#fff",borderRadius:12,boxShadow:"0 2px 10px #0001",fontFamily:"system-ui"}}>
        <h2>🔒 Admin Gunungsari</h2>
        <p style={{fontSize:12,color:"#666"}}>{msg}</p>
        <input type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="Password" style={{width:"100%",padding:12,marginTop:10,borderRadius:8,border:"1px solid #ccc",boxSizing:"border-box"}}/>
        <button onClick={login} style={{width:"100%",padding:12,marginTop:10,background:"#111",color:"#fff",border:0,borderRadius:8,fontWeight:"bold"}}>Masuk</button>
        <p style={{fontSize:10,color:"#999",marginTop:10}}>Password: Ch@dast1936</p>
      </div>
    );
  }

  const hariIni = new Date().toLocaleDateString("id-ID");
  const dataHariIni = absen.filter(r=>r && r.tanggal===hariIni);
  const tampil = filter==="Semua" ? absen : absen.filter(r=>r && r.nama===filter);

  return (
    <div style={{maxWidth:1000,margin:"0 auto",padding:12,fontFamily:"system-ui",background:"#f8fafc",minHeight:"100vh"}}>
      <div style={{background:"#111",color:"#fff",padding:16,borderRadius:12,display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
        <div><b>Admin Gunungsari</b><br/><span style={{fontSize:11,opacity:0.7}}>{msg}</span></div>
        <div style={{display:"flex",gap:6}}>
          <button onClick={loadData} style={{padding:"8px 12px",background:"#fff",color:"#111",border:0,borderRadius:8,fontSize:12}}>🔄 Refresh</button>
          <button onClick={logout} style={{padding:"8px 12px",background:"#dc2626",color:"#fff",border:0,borderRadius:8,fontSize:12}}>Logout</button>
          <a href="/" style={{padding:"8px 12px",background:"#22c55e",color:"#fff",borderRadius:8,fontSize:12,textDecoration:"none"}}>Absen</a>
        </div>
      </div>

      <div style={{background:"#fff",border:"2px solid #111",padding:12,borderRadius:12,marginTop:12}}>
        <b style={{fontSize:13}}>📱 Device Terdaftar (Bisa Hapus Jarak Jauh)</b>
        <div style={{marginTop:10,display:"grid",gap:6}}>
          {devices.length===0 ? <p style={{fontSize:12,color:"#999"}}>Belum ada device / gagal load Sheet Devices. Buat tab Devices di Sheet.</p> : devices.map(d=>(
            <div key={d.deviceId} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:8,background:"#f8fafc",borderRadius:6,border:"1px solid #eee"}}>
              <div><b style={{fontSize:12}}>{d.jabatan||d.nama||"Unknown"}</b><br/><span style={{fontSize:10,color:"#666"}}>{d.deviceId}</span></div>
              <button onClick={()=>hapusDevice(d.deviceId, d.jabatan)} style={{padding:"6px 10px",background:"#dc2626",color:"#fff",border:0,borderRadius:6,fontSize:11}}>Hapus</button>
            </div>
          ))}
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:12}}>
        <div style={{background:"#fff",padding:12,borderRadius:10}}><div style={{fontSize:11}}>MASUK Hari Ini</div><div style={{fontSize:24,fontWeight:"bold",color:"#16a34a"}}>{dataHariIni.filter(r=>r.tipe==="MASUK").length}</div></div>
        <div style={{background:"#fff",padding:12,borderRadius:10}}><div style={{fontSize:11}}>TOTAL DATA</div><div style={{fontSize:24,fontWeight:"bold"}}>{absen.length}</div></div>
      </div>

      <div style={{marginTop:12}}>
        <select value={filter} onChange={e=>setFilter(e.target.value)} style={{padding:8,borderRadius:6,border:"1px solid #ddd"}}>
          <option value="Semua">Semua Jabatan</option>
          <option value="Sekretaris Desa">Sekretaris Desa</option>
          <option value="Kaur Keuangan">Kaur Keuangan</option>
          <option value="Kaur TU dan Umum">Kaur TU dan Umum</option>
          <option value="Kaur Perencanaan">Kaur Perencanaan</option>
          <option value="Kasi Kesejahteraan">Kasi Kesejahteraan</option>
          <option value="Kasi Pemerintahan">Kasi Pemerintahan</option>
          <option value="Kasi Pelayanan">Kasi Pelayanan</option>
          <option value="Kadus Desa">Kadus Desa</option>
          <option value="Kadus Cikatomas">Kadus Cikatomas</option>
          <option value="Kadus Cilopadang">Kadus Cilopadang</option>
        </select>
      </div>

      <div style={{background:"#fff",borderRadius:10,marginTop:10,overflow:"hidden"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
          <thead><tr style={{background:"#f1f5f9"}}><th style={{padding:8,textAlign:"left"}}>Jam</th><th style={{padding:8,textAlign:"left"}}>Nama</th><th style={{padding:8,textAlign:"left"}}>Tipe</th></tr></thead>
          <tbody>
            {tampil.length===0 ? <tr><td colSpan={3} style={{padding:20,textAlign:"center",color:"#999"}}>Tidak ada data</td></tr> : tampil.slice(0,100).map((r,i)=>(
              <tr key={i} style={{borderBottom:"1px solid #f1f5f9"}}><td style={{padding:8}}>{r.jam}<br/><span style={{fontSize:10,color:"#888"}}>{r.tanggal}</span></td><td style={{padding:8}}>{r.nama}</td><td style={{padding:8}}>{r.tipe}<br/><span style={{fontSize:10}}>{r.keterangan||""}</span></td></tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{marginTop:12,fontSize:10,color:"#666",background:"#fff",padding:10,borderRadius:8}}>
        <b>Debug:</b> {msg}<br/>
        URL: {GOOGLE_SHEET_URL}<br/>
        Jika msg berisi HTML, berarti Deploy di Apps Script belum Anyone. Buka Apps Script → Deploy → Manage → Edit → Who has access = Anyone → New Version → Deploy.
      </div>
    </div>
  );
}
