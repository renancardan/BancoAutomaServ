const express = require('express');
const mysql = require('mysql2');

const app = express();
const port = 3000;

// Configuração da conexão MySQL
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'cardan',
  database: 'automaserv'
});

connection.connect((err) => {
  if (err) {
    console.error('Erro conectando ao MySQL:', err.stack);
    return;
  }
  console.log('Conectado ao MySQL como id ' + connection.threadId);
});

app.get('/', (req, res) => {
  connection.query('SELECT * FROM produtos', (error, results, fields) => {
    if (error) throw error;
    res.json(results);
    console.log("Entrou aqui")
  });
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});