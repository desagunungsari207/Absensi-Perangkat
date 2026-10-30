"use client";
import { useState, useEffect, useMemo } from "react";

const DAFTAR_JABATAN = [
  "Sekretaris Desa", "Kaur Keuangan", "Kaur TU dan Umum", "Kaur Perencanaan",
  "Kasi Kesejahteraan", "Kasi Pemerintahan", "Kasi Pelayanan",
  "Kadus Desa", "Kadus Cikatomas", "Kadus Cilopadang"
];

export default function AdminCantikGunungsari() {
  const [riwayat, setRiwayat] = useState([]);
  const [filter, setFilter] = useState("Semua");
  const [tab, setTab] = useState("hariIni"); // hariIni | semua | rekap

  useEffect(() => {
    setRiwayat(JSON.parse(localStorage.getItem("absensi_gunungsari") || "[]"));
  }, []);

  const hariIni = new Date().toLocaleDateString("id-ID");
  const dataHariIni = useMemo(() => riwayat.filter(r => r.tanggal === hariIni), [riwayat, hariIni]);
  const dataTampil = filter === "Semua" ? (tab === "hariIni" ? dataHariIni : riwayat) : (tab === "hariIni" ? dataHariIni : riwayat).filter(r => r.nama === filter);

  const stat = {
    masuk: dataHariIni.filter(r=>r.tipe==="MASUK").length,
    pulang: dataHariIni.filter(r=>r.tipe==="PULANG").length,
    izinKeg: dataHariIni.filter(r=>r.tipe==="IZIN KEGIATAN").length,
    izinSakit: dataHariIni.filter(r=>r.tipe==="IZIN SAKIT").length,
  };
  const belumAbsen = DAFTAR_JABATAN.filter(j => !dataHariIni.some(r => r.nama === j));

  const rekapBulan = useMemo(() => {
    return DAFTAR_JABATAN.map(j => {
      const dataJ = riwayat.filter(r=>r.nama===j);
      return { jabatan: j, masuk: dataJ.filter(r=>r.tipe==="MASUK").length, pulang: dataJ.filter(r=>r.tipe==="PULANG").length, izinK: dataJ.filter(r=>r.tipe==="IZIN KEGIATAN").length, izinS: dataJ.filter(r=>r.tipe==="IZIN SAKIT").length, total: dataJ.length };
    });
  }, [riwayat]);

  const downloadCSV = () => {
    if(riwayat.length===0) return alert("Belum ada data");
    let csv="Tanggal,Jam,Jabatan,Tipe,Keterangan,Jarak\n";
    riwayat.forEach(r=> csv+=`"${r.tanggal}","${r.jam}","${r.nama}","${r.tipe}","${r.keterangan||""}","${r.jarak}m"\n`);
    const blob=new Blob([csv],{type:"text/csv"}); const url=URL.createObjectURL(blob);
    const a=document.createElement("a"); a.href=url; a.download=`Gunungsari-${new Date().toISOString().slice(0,10)}.csv`; a.click();
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 16, fontFamily: "system-ui", background: "#f8fafc", minHeight: "100vh" }}>
      
      <div style={{ background: "#111", color: "white", padding: 20, borderRadius: 16, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
        <div><h2 style={{ margin: 0 }}>Admin Desa Gunungsari</h2><p style={{ margin: "4px 0 0 0", fontSize: 12, opacity: 0.7 }}>Balai -7.259344, 108.310428 • 50m • 1 Device = 1 Jabatan</p></div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={downloadCSV} style={{ padding: "10px 14px", background: "#22c55e", color: "white", border: 0, borderRadius: 10, fontSize: 12, fontWeight: "bold" }}>📥 Excel</button>
          <a href="/" style={{ padding: "10px 14px", background: "white", color: "#111", borderRadius: 10, fontSize: 12, textDecoration: "none", fontWeight: "bold" }}>← Absen</a>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
        <button onClick={()=>setTab("hariIni")} style={{ padding: "10px 16px", borderRadius: 10, border: 0, background: tab==="hariIni"?"#111":"white", color: tab==="hariIni"?"white":"#111", fontSize: 13, fontWeight: "bold", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>Hari Ini ({hariIni})</button>
        <button onClick={()=>setTab("semua")} style={{ padding: "10px 16px", borderRadius: 10, border: 0, background: tab==="semua"?"#111":"white", color: tab==="semua"?"white":"#111", fontSize: 13, fontWeight: "bold" }}>Semua Data</button>
        <button onClick={()=>setTab("rekap")} style={{ padding: "10px 16px", borderRadius: 10, border: 0, background: tab==="rekap"?"#111":"white", color: tab==="rekap"?"white":"#111", fontSize: 13, fontWeight: "bold" }}>Rekap Bulanan</button>
      </div>

      {tab !== "rekap" && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 10, marginTop: 16 }}>
            <div style={{ background: "white", padding: 14, borderRadius: 14, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}><div style={{ fontSize: 11, color: "#666" }}>MASUK Hari Ini</div><div style={{ fontSize: 28, fontWeight: "bold", color: "#16a34a" }}>{stat.masuk}</div><div style={{ fontSize: 10, color: "#999" }}>dari 10</div></div>
            <div style={{ background: "white", padding: 14, borderRadius: 14 }}><div style={{ fontSize: 11, color: "#666" }}>PULANG</div><div style={{ fontSize: 28, fontWeight: "bold", color: "#dc2626" }}>{stat.pulang}</div><div style={{ fontSize: 10, color: "#999" }}>dari {stat.masuk} masuk</div></div>
            <div style={{ background: "white", padding: 14, borderRadius: 14 }}><div style={{ fontSize: 11, color: "#666" }}>IZIN KEGIATAN</div><div style={{ fontSize: 28, fontWeight: "bold", color: "#f59e0b" }}>{stat.izinKeg}</div><div style={{ fontSize: 10, color: "#999" }}>boleh luar GPS</div></div>
            <div style={{ background: "white", padding: 14, borderRadius: 14 }}><div style={{ fontSize: 11, color: "#666" }}>IZIN SAKIT</div><div style={{ fontSize: 28, fontWeight: "bold", color: "#eab308" }}>{stat.izinSakit}</div><div style={{ fontSize: 10, color: "#999" }}>perlu ket.</div></div>
          </div>

          {belumAbsen.length > 0 && tab === "hariIni" && (
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", padding: 12, borderRadius: 12, marginTop: 12, fontSize: 12 }}>
              <b>⚠️ Belum Absen Hari Ini ({belumAbsen.length}):</b> {belumAbsen.join(", ")}
            </div>
          )}

          <div style={{ display: "flex", gap: 8, marginTop: 16, alignItems: "center", flexWrap: "wrap" }}>
            <select value={filter} onChange={e=>setFilter(e.target.value)} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #ddd", fontSize: 12 }}>
              <option value="Semua">Semua Jabatan ({(tab==="hariIni"?dataHariIni:riwayat).length})</option>
              {DAFTAR_JABATAN.map(j=> <option key={j} value={j}>{j}</option>)}
            </select>
            <span style={{ fontSize: 11, color: "#888" }}>Menampilkan: {dataTampil.length} data</span>
          </div>

          <div style={{ background: "white", borderRadius: 14, marginTop: 12, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead><tr style={{ background: "#f8fafc", textAlign: "left", borderBottom: "1px solid #eee" }}><th style={{ padding: 12 }}>Waktu</th><th style={{ padding: 12 }}>Jabatan</th><th style={{ padding: 12 }}>Tipe</th><th style={{ padding: 12 }}>Keterangan</th></tr></thead>
                <tbody>
                  {dataTampil.length===0 && <tr><td colSpan={4} style={{ padding: 20, textAlign: "center", color: "#999" }}>Tidak ada data</td></tr>}
                  {dataTampil.map((r,i)=>(
                    <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: 10 }}><b>{r.jam}</b><br/><span style={{ fontSize: 10, color: "#888" }}>{r.tanggal} • {r.jarak}m</span></td>
                      <td style={{ padding: 10 }}><b>{r.nama}</b></td>
                      <td style={{ padding: 10 }}><span style={{ padding: "4px 10px", borderRadius: 20, fontSize: 10, fontWeight: "bold", background: r.tipe==="MASUK"?"#dcfce7":r.tipe==="PULANG"?"#fee2e2":"#fef3c7", color: r.tipe==="MASUK"?"#166534":r.tipe==="PULANG"?"#991b1b":"#92400e" }}>{r.tipe}</span></td>
                      <td style={{ padding: 10, maxWidth: 260, fontSize: 11, color: "#444" }}>{r.keterangan || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {tab === "rekap" && (
        <div style={{ background: "white", borderRadius: 14, marginTop: 16, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <div style={{ padding: 14, borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between" }}><h3 style={{ margin: 0, fontSize: 14 }}>Rekap Total Semua Bulan</h3><span style={{ fontSize: 11, color: "#888" }}>{riwayat.length} total record</span></div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead><tr style={{ background: "#f8fafc", textAlign: "left" }}><th style={{ padding: 12 }}>Jabatan</th><th style={{ padding: 12 }}>Masuk</th><th style={{ padding: 12 }}>Pulang</th><th style={{ padding: 12 }}>Izin Keg</th><th style={{ padding: 12 }}>Sakit</th><th style={{ padding: 12 }}>Total</th></tr></thead>
              <tbody>
                {rekapBulan.map((r,i)=>(
                  <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: 10 }}><b>{r.jabatan}</b></td>
                    <td style={{ padding: 10 }}><span style={{ background: "#dcfce7", padding: "2px 8px", borderRadius: 10 }}>{r.masuk}</span></td>
                    <td style={{ padding: 10 }}>{r.pulang}</td>
                    <td style={{ padding: 10 }}>{r.izinK}</td>
                    <td style={{ padding: 10 }}>{r.izinS}</td>
                    <td style={{ padding: 10 }}><b>{r.total}</b></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button onClick={()=>{ if(confirm("Reset device HP ini?")) { localStorage.removeItem("device_gunungsari"); alert("Reset OK"); } }} style={{ padding: "8px 12px", fontSize: 11, background: "white", border: "1px solid #ddd", borderRadius: 8 }}>🔓 Reset Device HP Ini</button>
        <button onClick={()=>{ if(confirm("Hapus SEMUA data absensi?")) { localStorage.removeItem("absensi_gunungsari"); setRiwayat([]); } }} style={{ padding: "8px 12px", fontSize: 11, background: "#fee2e2", color: "#991b1b", border: 0, borderRadius: 8 }}>🗑️ Hapus Semua Data</button>
      </div>
    </div>
  );
}
