const map = L.map("map", {
  zoomSnap: 0.25,
  center: [-2.158855, 117.625977],
  zoom: 5,
});

// Menambahkan layer peta dasar
const tiles = L.tileLayer(
  "http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }
).addTo(map);

// Layer grup berdasarkan status
const layers = {
  registrasi: L.layerGroup().addTo(map), // Default ditampilkan
  valid: L.layerGroup().addTo(map), // Default ditampilkan
  ditolak: L.layerGroup(),
};

// Mendapatkan data dari API Laravel
$.getJSON("http://wilayah-adat.test/api/admin/wa-datas", function (response) {
  const data = response.data;

  data.forEach((item) => {
    // Warna berdasarkan status
    let color;
    if (item.status === "valid") color = "green";
    else if (item.status === "registrasi") color = "blue";
    else if (item.status === "ditolak") color = "red";

    // Membuat marker untuk wilayah adat
    const marker = L.circleMarker([item.latitude, item.longitude], {
      radius: 7,
      fillColor: color,
      color: "black",
      weight: 0.8,
      opacity: 1,
      fillOpacity: 0.7,
    });

    // Menambahkan popup
    marker.bindPopup(
      `
      <table class="custom-popup">
        <tr><th colspan="2">Informasi Wilayah Adat</th></tr>
        <tr><td><strong>Nama Satuan</strong></td><td>${item.nama_satuan}</td></tr>
        <tr><td><strong>Status</strong></td><td>${item.status}</td></tr>
        <tr><td><strong>Luas</strong></td><td>${item.luas} ha</td></tr>
        <tr><td><strong>Tanggal Pendaftaran</strong></td><td>${item.tanggal_pendaftaran}</td></tr>
        <tr><td><strong>Kabupaten</strong></td><td>${item.kabupaten}</td></tr>
        <tr><td><strong>Kecamatan</strong></td><td>${item.kecamatan}</td></tr>
        <tr><td><strong>Desa</strong></td><td>${item.desa}</td></tr>
      </table>
      `,
      { className: "custom-popup" }
    );

    // Menambahkan marker ke grup berdasarkan status
    layers[item.status].addLayer(marker);
  });
});

// Kontrol legenda untuk filter
const legend = L.control.layers(null, {
  "Status Registrasi (Biru)": layers.registrasi,
  "Status Valid (Hijau)": layers.valid,
  "Status Ditolak (Merah)": layers.ditolak,
}, {
  collapsed: false, // Legenda tetap terbuka
  position: "bottomleft",
}).addTo(map);

// Default, hanya menampilkan layer registrasi dan valid
map.removeLayer(layers.ditolak);
