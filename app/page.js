export default function Home() {
  return (
    <div style={{padding:20, fontFamily:'sans-serif'}}>
      <h1>Absensi Desa Gunungsari</h1>
      <p><b>WiFi Wajib:</b> CIKA_NANAT</p>
      <p>Silakan konek WiFi CIKA_NANAT + buka link OTP pribadi (berlaku 2 menit) untuk absen masuk/pulang</p>
      <hr/>
      <p><b>Panel Admin:</b></p>
      <a href="/admin">Login Kades/Sekdes (Password: Ch@dast1936 - bisa diganti)</a>
      <br/><br/>
      <a href="/setting-bot">Setting Bot WA Gratis</a>
      <br/><br/>
      <small>Biaya: Rp 0 | Bot WA: internet ON saja (tidak wajib WiFi desa)</small>
    </div>
  );
}
