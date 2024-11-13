document.addEventListener('DOMContentLoaded', function () {
    // Inicializar o mapa
    var map = L.map('map').setView([-23.5505, -46.6333], 12); // Coordenadas para São Paulo

    // Adicionar camada de mapa base (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Função para carregar dados de tráfego e adicionar ao mapa
    function carregarDados() {
        fetch('/api/trafego')
            .then(response => response.json())
            .then(data => {
                data.forEach(ponto => {
                    var latitude = ponto[0];
                    var longitude = ponto[1];
                    var volume = ponto[2];
                    L.circle([latitude, longitude], {
                        color: 'red',
                        fillColor: '#f03',
                        fillOpacity: 0.5,
                        radius: volume * 10
                    }).addTo(map).bindPopup(`Volume de tráfego: ${volume}`);
                });
            });
    }

    // Evento de upload de arquivo CSV
    document.getElementById('uploadForm').addEventListener('submit', function (e) {
        e.preventDefault();
        var input = document.getElementById('fileInput');
        var formData = new FormData();
        formData.append('file', input.files[0]);

        fetch('/api/trafego', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(result => {
            alert(result.message);
            carregarDados();  // Recarregar os dados após o upload
        });
    });

    // Carregar dados ao iniciar
    carregarDados();
});
