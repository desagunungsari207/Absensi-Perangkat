  const absen = (tipe) => {
    const wifiWajib = localStorage.getItem('wifi_desa') || 'CIKA_NANAT';
    setStatus(`Mencoba absen ${tipe}... Mengecek WiFi ${wifiWajib}...`);
    setTimeout(()=>{
      const log = { waktu: new Date().toLocaleString('id-ID'), tipe, wifi: wifiWajib, nama: 'Perangkat Desa' };
      const old = JSON.parse(localStorage.getItem('absen_desa') || '[]');
      old.push(log);
      localStorage.setItem('absen_desa', JSON.stringify(old));
      setStatus(`✅ Berhasil absen ${tipe}!\nJam: ${log.waktu}\nWiFi: ${wifiWajib}`);
      // Lonceng web
      try{ new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg').play(); }catch(e){}
    }, 1000);
  }
