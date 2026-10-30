"use client";
import { useState, useEffect } from "react";

const DAFTAR_JABATAN = [
  "Sekretaris Desa", "Kaur Keuangan", "Kaur TU dan Umum", "Kaur Perencanaan",
  "Kasi Kesejahteraan", "Kasi Pemerintahan", "Kasi Pelayanan",
  "Kadus Desa", "Kadus Cikatomas", "Kadus Cilopadang"
];

export default function AdminGunungsari() {
  const [riwayat, setRiwayat] = useState([]);
  const [filter, setFilter] = useState("Semua");

  useEffect(() => {
    setRiwayat(JSON.parse(localStorage.getItem("absensi_gunungsari") || "[]"));
  }, []);

  const downloadCSV = () => {
    if (riwayat.length === 0) return alert("Belum ada data");
    let csv = "Tanggal,Jam,Jabatan,Tipe,Keterangan,Jarak\n";
    riwayat.forEach(r => {
      csv += `"${r.tanggal}","${r.jam}","${r.nama}","${r.tipe}","${r.keterangan || ""}","${r.jarak}m"\n`;
    });
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Absensi-Gunungsari-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
  };

  const tampil = filter === "Semua" ? riwayat : riwayat.filter(r => r.nama === filter);

  return (
    <div style={{ maxWidth: 950, margin: "0 auto", padding: 20, fontFamily: "system-ui" }}>
      <h2>Admin - Desa Gunungsari</h2>
      <p style={{ fontSize: 12, color: "#666" }}>10 Jabatan • MASUK/PULANG pakai GPS 50m • IZIN boleh di luar GPS • Semua 1x sehari</p>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "15px 0" }}>
        <button onClick={downloadCSV} style={{ padding: "10px 14px", background: "#16a34a", color: "white", border: 0, borderRadius: 8 }}>📥 Download Excel</button>
        <button onClick={() => { if(confirm("Reset device HP ini?")) { localStorage.removeItem("device_gunungsari"); alert("Device di-reset"); } }} style={{ padding: "10px 14px", background: "#f59e0b", color: "white", border: 0, borderRadius: 8 }}>🔓 Reset Device</button>
        <button onClick={() => { if(confirm("Hapus semua data?")) { localStorage.removeItem("absensi_gunungsari"); setRiwayat([]); } }} style={{ padding: "10px 14px", background: "#fee2e2", color: "#dc2626", border: 0, borderRadius: 8 }}>🗑️ Hapus Data</button>
      </div>

      <select value={filter} onChange={e => setFilter(e.target.value)} style={{ padding: 8, borderRadius: 6, border: "1px solid #ccc", fontSize: 13, marginBottom: 10 }}>
        <option value="Semua">Filter: Semua ( {riwayat.length} )</option>
        {DAFTAR_JABATAN.map(j => <option key={j} value={j}>{j}</option>)}
      </select>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ background: "#111", color: "white", textAlign: "left" }}>
              <th style={{ padding: 8 }}>Tanggal</th>
              <th style={{ padding: 8 }}>Jabatan</th>
              <th style={{ padding: 8 }}>Tipe</th>
              <th style={{ padding: 8 }}>Keterangan (Izin)</th>
            </tr>
          </thead>
          <tbody>
            {tampil.length === 0 && <tr><td colSpan={4} style={{ padding: 20, textAlign: "center", color: "#999" }}>Belum ada data</td></tr>}
            {tampil.map((r, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #eee", background: r.tipe.includes("IZIN") ? "#fffbeb" : "white" }}>
                <td style={{ padding: 8 }}>{r.tanggal} {r.jam}<br/><span style={{ fontSize: 10, color: "#888" }}>{r.jarak}m {r.jarak > 50 && r.tipe.includes("IZIN") ? "(Di luar - Izin)" : ""}</span></td>
                <td style={{ padding: 8 }}><b>{r.nama}</b></td>
                <td style={{ padding: 8 }}><span style={{ padding: "2px 8px", borderRadius: 10, background: r.tipe === "MASUK" ? "#dcfce7" : r.tipe === "PULANG" ? "#fee2e2" : "#fef3c7", fontSize: 11 }}>{r.tipe}</span></td>
                <td style={{ padding: 8, maxWidth: 250 }}>{r.keterangan ? r.keterangan : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 15, fontSize: 11, background: "#f9fafb", padding: 10, borderRadius: 8 }}>
        <b>Aturan Final:</b><br/>
        - MASUK/PULANG: Wajib GPS 50m dari Balai, 1x sehari, PULANG harus MASUK dulu<br/>
        - IZIN KEGIATAN/SAKIT: Boleh di luar GPS, 1x sehari, Tidak bisa kalau sudah MASUK hari itu<br/>
        - 1 Device = 1 Jabatan (Terkunci)
      </div>

      <p style={{ marginTop: 15 }}><a href="/">← Kembali Absen</a></p>
    </div>
  );
}
