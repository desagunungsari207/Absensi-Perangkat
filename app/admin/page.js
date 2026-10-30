"use client";
import { useState, useEffect } from "react";

const DAFTAR_JABATAN = [
  "Sekretaris Desa",
  "Kaur Keuangan",
  "Kaur TU dan Umum",
  "Kaur Perencanaan",
  "Kasi Kesejahteraan",
  "Kasi Pemerintahan",
  "Kasi Pelayanan",
  "Kadus Desa",
  "Kadus Cikatomas",
  "Kadus Cilopadang"
];

export default function AdminGunungsari() {
  const [riwayat, setRiwayat] = useState([]);
  const [filter, setFilter] = useState("Semua");

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("absensi_gunungsari") || "[]");
    setRiwayat(data);
  }, []);

  const hapusSemua = () => {
    if (confirm("Hapus SEMUA data absensi?")) {
      localStorage.removeItem("absensi_gunungsari");
      setRiwayat([]);
    }
  };

  const resetDevice = () => {
    if (confirm("Reset kunci device di HP ini? Nanti bisa pilih jabatan ulang di halaman absen.")) {
      localStorage.removeItem("device_gunungsari");
      alert("Device berhasil di-reset. Silakan buka halaman absen / untuk pilih ulang.");
    }
  };

  const downloadCSV = () => {
    if (riwayat.length === 0) return alert("Belum ada data");
    let csv = "Tanggal,Jam,Nama Jabatan,Tipe,Jarak\n";
    riwayat.forEach(r => {
      csv += `"${r.tanggal}","${r.jam}","${r.nama}","${r.tipe}","${r.jarak}m"\n`;
    });
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Absensi-Gunungsari-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
  };

  const tampil = filter === "Semua" ? riwayat : riwayat.filter(r => r.nama === filter);
  const hariIni = new Date().toLocaleDateString("id-ID");

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 20, fontFamily: "system-ui" }}>
      <h2>Admin - Desa Gunungsari</h2>
      <p style={{ fontSize: 13, color: "#666" }}>Balai: -7.259344, 108.310428 • Radius 50m • 1 Device = 1 Jabatan • {hariIni}</p>

      <div style={{ background: "#f9fafb", padding: 15, borderRadius: 10, margin: "15px 0", border: "1px solid #eee" }}>
        <h3 style={{ margin: "0 0 10px 0", fontSize: 14 }}>Daftar Jabatan (10 Orang - Fix)</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, fontSize: 13 }}>
          {DAFTAR_JABATAN.map((j, i) => <div key={i}>{i+1}. {j}</div>)}
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 15 }}>
        <button onClick={downloadCSV} style={{ padding: "10px 14px", background: "#16a34a", color: "white", border: 0, borderRadius: 8, fontSize: 13 }}>📥 Download Excel</button>
        <button onClick={resetDevice} style={{ padding: "10px 14px", background: "#f59e0b", color: "white", border: 0, borderRadius: 8, fontSize: 13 }}>🔓 Reset Device Ini</button>
        <button onClick={hapusSemua} style={{ padding: "10px 14px", background: "#fee2e2", color: "#dc2626", border: 0, borderRadius: 8, fontSize: 13 }}>🗑️ Hapus Data Absen</button>
      </div>

      <div style={{ marginBottom: 10 }}>
        <select value={filter} onChange={e => setFilter(e.target.value)} style={{ padding: 8, borderRadius: 6, border: "1px solid #ccc", fontSize: 13 }}>
          <option value="Semua">-- Filter: Semua Jabatan --</option>
          {DAFTAR_JABATAN.map(j => <option key={j} value={j}>{j}</option>)}
        </select>
        <span style={{ fontSize: 12, marginLeft: 10, color: "#666" }}>Total: {tampil.length} data</span>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#f3f4f6", textAlign: "left" }}>
              <th style={{ padding: 10, border: "1px solid #ddd" }}>Tanggal & Jam</th>
              <th style={{ padding: 10, border: "1px solid #ddd" }}>Jabatan</th>
              <th style={{ padding: 10, border: "1px solid #ddd" }}>Tipe</th>
              <th style={{ padding: 10, border: "1px solid #ddd" }}>Jarak</th>
            </tr>
          </thead>
          <tbody>
            {tampil.length === 0 && <tr><td colSpan={4} style={{ padding: 20, textAlign: "center", color: "#999" }}>Belum ada data absensi</td></tr>}
            {tampil.map((r, i) => (
              <tr key={i}>
                <td style={{ padding: 8, border: "1px solid #eee" }}>{r.tanggal} {r.jam}</td>
                <td style={{ padding: 8, border: "1px solid #eee" }}><b>{r.nama}</b></td>
                <td style={{ padding: 8, border: "1px solid #eee" }}><span style={{ padding: "2px 8px", borderRadius: 12, background: r.tipe === "MASUK" ? "#dcfce7" : "#fee2e2", fontSize: 12 }}>{r.tipe}</span></td>
                <td style={{ padding: 8, border: "1px solid #eee" }}>{r.jarak}m</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p style={{ marginTop: 20, fontSize: 13 }}><a href="/" style={{ color: "#111" }}>← Kembali ke Halaman Absen</a></p>
    </div>
  );
}
