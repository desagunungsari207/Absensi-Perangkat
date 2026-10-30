"use client";
import { useState, useEffect } from "react";

const BALAI_DESA = {
  lat: -7.259344564316639,
  lng: 108.31042899681555,
  radius: 50, // 50 meter dari Balai Desa Gunungsari
};

const PERANGKAT = ["Kades", "Sekdes", "Kaur Keuangan", "Kaur Umum", "Kasi Pemerintahan", "Kasi Kesra", "Kasi Pelayanan", "Operator Desa", "Kadus 1", "Kadus 2", "Kadus 3"];

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

export default function AbsensiGunungsari() {
  const [nama, setNama] = useState("");
  const [jarak, setJarak] = useState(null);
  const [riwayat, setRiwayat] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("absensi_gunungsari") || "[]");
    setRiwayat(saved);
    cekGPS();
  }, []);

  const cekGPS = () => {
    navigator.geolocation.getCurrentPosition(pos => {
      const d = getDistance(pos.coords.latitude, pos.coords.longitude, BALAI_DESA.lat, BALAI_DESA.lng);
      setJarak(Math.round(d));
    }, () => alert("Aktifkan GPS & Lokasi Akurat!"), { enableHighAccuracy: true });
  };

  const absen = (tipe) => {
    if (!nama) return alert("Pilih nama dulu!");
    if (jarak > BALAI_DESA.radius) return alert(`Gagal! Anda di luar area. Jarak ${jarak}m dari balai`);
    const data = { nama, tipe, jam: new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" }), jarak };
    const baru = [data, ...riwayat];
    setRiwayat(baru);
    localStorage.setItem("absensi_gunungsari", JSON.stringify(baru));
    alert(`${tipe} Berhasil - ${nama}`);
  };

  const diArea = jarak !== null && jarak <= BALAI_DESA.radius;

  return (
    <div style={{ maxWidth: 420, margin: "0 auto", padding: 20, fontFamily: "system-ui" }}>
      <h2 style={{ marginBottom: 4 }}>Absensi Desa Gunungsari</h2>
      <p style={{ fontSize: 12, color: "#666", marginTop: 0 }}>Kec. Sadananya - GPS 50m dari Balai Desa</p>
      
      <select value={nama} onChange={e=>setNama(e.target.value)} style={{ width: "100%", padding: 14, margin: "15px 0 10px", borderRadius: 8, border: "1px solid #ccc" }}>
        <option value="">-- Pilih Nama Perangkat --</option>
        {PERANGKAT.map(p=> <option key={p} value={p}>{p}</option>)}
      </select>

      <div style={{ padding: 14, background: diArea ? "#dcfce7" : "#fee2e2", borderRadius: 10, marginBottom: 15, border: `1px solid ${diArea ? "#86efac" : "#fca5a5"}` }}>
        <div style={{ fontWeight: "bold" }}>Jarak dari Balai: {jarak !== null ? `${jarak} m` : "Mengecek GPS..."}</div>
        <div style={{ fontSize: 14, marginTop: 4 }}>{jarak===null ? "Aktifkan GPS..." : diArea ? "✅ Di Dalam Area - Boleh Absen" : "❌ Di Luar Area 50m"}</div>
        <button onClick={cekGPS} style={{ marginTop: 10, padding: "6px 12px", fontSize: 12, borderRadius: 6, border: "1px solid #ccc", background: "white" }}>🔄 Refresh GPS</button>
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        <button disabled={!diArea || !nama} onClick={()=>absen("MASUK")} style={{ flex:1, padding: 16, background: diArea && nama ? "#16a34a" : "#9ca3af", color: "white", border: 0, borderRadius: 10, fontWeight: "bold", fontSize: 16 }}>MASUK</button>
        <button disabled={!diArea || !nama} onClick={()=>absen("PULANG")} style={{ flex:1, padding: 16, background: diArea && nama ? "#dc2626" : "#9ca3af", color: "white", border: 0, borderRadius: 10, fontWeight: "bold", fontSize: 16 }}>PULANG</button>
      </div>

      <h3 style={{ marginTop: 25, fontSize: 16 }}>📋 Riwayat Hari Ini</h3>
      <div style={{ maxHeight: 300, overflowY: "auto" }}>
        {riwayat.length === 0 && <div style={{ fontSize: 14, color: "#999" }}>Belum ada absen</div>}
        {riwayat.map((r,i)=> <div key={i} style={{ borderBottom: "1px solid #f0f0f0", padding: "10px 0", fontSize: 13 }}><b>{r.nama}</b> - {r.tipe} <br/><span style={{ color: "#666" }}>{r.jam} • {r.jarak}m dari balai</span></div>)}
      </div>
      
      <button onClick={()=>{ if(confirm("Hapus semua riwayat?")) { setRiwayat([]); localStorage.removeItem("absensi_gunungsari"); } }} style={{ marginTop: 20, fontSize: 12, color: "#999", background: "none", border: 0, textDecoration: "underline" }}>Hapus Riwayat</button>
    </div>
  );
}
