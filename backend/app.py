from flask import Flask, render_template, request, jsonify
import sqlite3
import csv
import os

app = Flask(__name__)

# Caminho para o banco de dados
DATABASE = 'db.sqlite3'

# Rota para a página inicial
@app.route('/')
def index():
    return render_template('index.html')

# Rota para obter os dados de tráfego
@app.route('/api/trafego', methods=['GET', 'POST'])
def api_trafego():
    if request.method == 'POST':
        # Salvar o arquivo CSV no servidor
        file = request.files['file']
        if file and file.filename.endswith('.csv'):
            file_path = os.path.join('uploads', file.filename)
            file.save(file_path)

            # Ler os dados do CSV e inserir no banco de dados
            try:
                with open(file_path, newline='', encoding='utf-8') as csvfile:
                    reader = csv.reader(csvfile)
                    next(reader)  # Pula o cabeçalho

                    conn = sqlite3.connect(DATABASE)
                    cursor = conn.cursor()
                    for row in reader:
                        if len(row) == 3:  # Certifique-se de que há 3 colunas
                            cursor.execute("INSERT INTO trafego (latitude, longitude, volume) VALUES (?, ?, ?)", (float(row[0]), float(row[1]), int(row[2])))  # Converte os tipos
                    conn.commit()
                    conn.close()

                return jsonify({'message': 'Dados carregados com sucesso!'})
            except Exception as e:
                return jsonify({'message': f'Erro ao processar o arquivo: {str(e)}'}), 400
        else:
            return jsonify({'message': 'Formato de arquivo inválido! Apenas arquivos CSV são permitidos.'}), 400

    # Método GET para retornar os dados de tráfego do banco de dados
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    
    cursor.execute("SELECT latitude, longitude, volume FROM trafego")
    rows = cursor.fetchall()
    conn.close()

    return jsonify(rows)

# Inicializa o banco de dados se não existir
def init_db():
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS trafego (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            latitude REAL,
            longitude REAL,
            volume INTEGER
        )
    ''')
    conn.commit()
    conn.close()

if __name__ == '__main__':
    # Cria a pasta uploads se não existir
    if not os.path.exists('uploads'):
        os.makedirs('uploads')
    
    init_db()
    app.run(debug=True)
