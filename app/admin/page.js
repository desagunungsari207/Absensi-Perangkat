"use client";
import { useState, useEffect } from "react";

export default function AdminGunungsari() {
  const [riwayat, setRiwayat] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("absensi_gunungsari") || "[]");
    setRiwayat(saved);
  }, []);

  const downloadCSV = () => {
    if(riwayat.length === 0) return alert("Belum ada data");
    let csv = "Tanggal,Nama,Tipe,Jarak\n";
    riwayat.forEach(r => csv += `"${r.jam}","${r.nama}","${r.tipe}","${r.jarak}m"\n`);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Absensi-Gunungsari-${new Date().toLocaleDateString()}.csv`;
    a.click();
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 20, fontFamily: "system-ui" }}>
      <h2>Admin - Desa Gunungsari</h2>
      <p style={{ fontSize: 13, color: "#666" }}>Balai: -7.259344, 108.310428 • Radius 50m • Tanpa WA Bot</p>
      
      <div style={{ display: "flex", gap: 10, margin: "15px 0" }}>
        <button onClick={downloadCSV} style={{ padding: "10px 16px", background: "#16a34a", color: "white", border: 0, borderRadius: 8 }}>📥 Download Excel (CSV)</button>
        <button onClick={()=>{ if(confirm("Hapus semua data absensi?")) { localStorage.removeItem("absensi_gunungsari"); setRiwayat([]); } }} style={{ padding: "10px 16px", background: "#fee2e2", color: "#dc2626", border: 0, borderRadius: 8 }}>🗑️ Hapus Semua</button>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
        <thead>
          <tr style={{ background: "#f3f4f6", textAlign: "left" }}>
            <th style={{ padding: 10, border: "1px solid #ddd" }}>Jam</th>
            <th style={{ padding: 10, border: "1px solid #ddd" }}>Nama</th>
            <th style={{ padding: 10, border: "1px solid #ddd" }}>Tipe</th>
            <th style={{ padding: 10, border: "1px solid #ddd" }}>Jarak</th>
          </tr>
        </thead>
        <tbody>
          {riwayat.length === 0 && <tr><td colSpan={4} style={{ padding: 20, textAlign: "center", color: "#999" }}>Belum ada data absensi</td></tr>}
          {riwayat.map((r,i)=> (
            <tr key={i}>
              <td style={{ padding: 10, border: "1px solid #eee" }}>{r.jam}</td>
              <td style={{ padding: 10, border: "1px solid #eee" }}><b>{r.nama}</b></td>
              <td style={{ padding: 10, border: "1px solid #eee" }}><span style={{ padding: "2px 8px", borderRadius: 10, background: r.tipe==="MASUK" ? "#dcfce7" : "#fee2e2" }}>{r.tipe}</span></td>
              <td style={{ padding: 10, border: "1px solid #eee" }}>{r.jarak}m</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p style={{ marginTop: 20, fontSize: 12 }}><a href="/">← Kembali ke Halaman Absen</a></p>
    </div>
  );
}
