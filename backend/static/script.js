document.addEventListener('DOMContentLoaded', function () {
    var map = L.map('map').setView([-16.6869, -49.2648], 12);  // Centraliza o mapa em Goiânia

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Função para carregar os dados do tráfego
    let pontos = [];
    function carregarDados() {
        fetch('/api/trafego')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro ao carregar dados');
                }
                return response.json();
            })
            .then(data => {
                // Limpar os marcadores anteriores
                pontos.forEach(ponto => map.removeLayer(ponto));
                pontos = [];
    
                // Adiciona novos pontos no mapa
                if (data.length === 0) {
                    alert('Nenhum dado disponível. Por favor, faça o upload de um arquivo CSV.');
                    return; // Se não houver dados, não faça nada
                }
    
                data.forEach(item => {
                    const [latitude, longitude, volume] = item;
                    const marker = L.circleMarker([latitude, longitude], {
                        radius: Math.sqrt(volume) / 5, // Ajuste do tamanho do círculo
                        color: 'red',
                        fillColor: 'red',
                        fillOpacity: 0.5,
                    }).addTo(map);
                    pontos.push(marker);
                });
            })
            .catch(error => {
                console.error('Erro:', error);
                alert('Erro ao carregar dados: ' + error.message);
            });
    }
    
    // Evento para upload do arquivo CSV
    document.getElementById('uploadForm').addEventListener('submit', function (e) {
        e.preventDefault();
        var input = document.getElementById('fileInput');
        var formData = new FormData();
        formData.append('file', input.files[0]);

        // Realiza o upload para o servidor Flask
        fetch('/api/trafego', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(result => {
            document.getElementById('message').innerHTML = `<div class="alert alert-success">${result.message}</div>`;
            carregarDados();  // Recarrega os dados para exibir no mapa
        })
        .catch(error => {
            document.getElementById('message').innerHTML = `<div class="alert alert-danger">Erro ao carregar dados: ${error.message}</div>`;
        });
    });

    carregarDados();  // Carrega os dados iniciais ao abrir a página
});
