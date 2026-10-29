'use client';
export default function SettingBot(){
  return (
    <div style={{padding:20, fontFamily:'sans-serif', maxWidth:600, margin:'0 auto'}}>
      <h2>🤖 Bot WA Gratis - Desa Gunungsari</h2>
      <div style={{background:'#dcfce7', padding:15, borderRadius:8}}>
        <b>Biaya: Rp 0</b><br/>
        - Tidak perlu server berbayar<br/>
        - Tidak perlu saldo<br/>
        - Bot cukup internet ON (tidak wajib WiFi desa)<br/>
        - Jika bot offline → absen masuk antrian otomatis
      </div>
      <h4>Cara Aktifkan (1x saja):</h4>
      <ol>
        <li>Download aplikasi <b>WhatsApp Business</b> di HP admin (jangan HP pribadi Kades)</li>
        <li>Nanti di sini akan muncul QR untuk scan (butuh deploy di Render.com gratis - saya bisa bantu)</li>
        <li>Untuk SEMENTARA (tanpa bot), sistem sudah jalan dengan <b>Lonceng Web</b>: Setiap ada yang absen, HP admin yang buka halaman /admin akan bunyi "beep"</li>
      </ol>
      <p><b>Solusi Rp 0 Hari Ini:</b> Admin cukup buka halaman <a href="/admin">/admin</a> di HP dan biarkan terbuka, jika ada yang absen akan ada bunyi + antrian tersimpan.</p>
      <p>Mau saya bantu pasang Bot WA yang QR-nya muncul di halaman ini? (Gratis pakai Render.com)</p>
      <a href="/admin">Kembali ke Admin</a>
    </div>
  )
}
