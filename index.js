const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
app.use(cors());
app.use(express.json());

// Configuração do pool de conexões MySQL
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'cardan',
    database: 'automaserv',
    waitForConnections: true,
    connectionLimit: 10, // Número máximo de conexões simultâneas
    queueLimit: 0
});

// Configuração do pool de conexões MySQL VPS
// const pool = mysql.createPool({
//   host: 'localhost',
//   user: 'root',
//   password: 'm0110484',
//   database: 'automaserv',
//   waitForConnections: true,
//   connectionLimit: 10, 
//   queueLimit: 0
// });

// Defina suas rotas aqui
app.get('/', (req, res) => {
    pool.query('SELECT * FROM produtos', (error, results, fields) => {
        if (error) {
            console.error('Erro na consulta:', error);
            return res.status(500).json({ error: 'Erro no servidor' });
        }
        res.json(results);
    });
});

app.post('/VerList', async (req, res) => {
    var Temp = new Date().getTime() - 21600000;
    pool.query(`SELECT * FROM list_pedido WHERE Telefone = ? AND Status != 'concluido' AND Id_Emp = ? AND DataPed > ?`, [req.body.Tel, req.body.IdEmp, Temp], (error, results) => {
        if (error) {
            console.error('Erro na consulta:', error);
            return res.status(500).json({ error: 'Erro no servidor' });
        }
        console.log(results);
        res.json(results);
    });
});

app.post('/dadoEmpresa', async (req, res) => {
    pool.query('SELECT * FROM empresa WHERE idEmp = ?', [req.body.IdEmp], (error, results) => {
        if (error) {
            console.error('Erro na consulta:', error);
            return res.status(500).json({ error: 'Erro no servidor' });
        }
        res.json(results);
    });
});

app.post('/Pedido', async (req, res) => {
    let jsonStringPed = JSON.stringify(req.body.Pedido);
    var DataPed = new Date().getTime();
    pool.query('INSERT INTO list_pedido (DataPed, Pedido, id_Emp, Telefone, Nome, End_Rua, End_Numero, End_Bairro, End_Comp, End_Cidade, End_Estado, Pg_Pix, Pg_CartDeb, Pg_CartCred, Pg_Cheque, Pg_Boleto, Pg_Dinheiro, Pg_Troco, Rec_Buscar, Rec_Consumoloc, Rec_Entregar, Rec_ValorEnt, Status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [DataPed, jsonStringPed, req.body.IdEmp, req.body.Tel, req.body.Nome, req.body.Rua, req.body.Numero, req.body.Bairro, req.body.Complemento, req.body.Cidade, req.body.Estado, req.body.Pix, req.body.CartDebi, req.body.CartCred, req.body.Cheque, req.body.Boleto, req.body.Dinheiro, req.body.Troco, req.body.Buscar, req.body.Consumo, req.body.Entreg, req.body.ValorEnt, "Pedido Enviado para Empresa"], (error, results) => {
        if (error) {
            console.error('Erro na inserção:', error);
            return res.status(500).json({ error: 'Erro no servidor' });
        }
        res.json(results);
    });
});

app.post('/produtos', async (req, res) => {
    try {
        const ListSessao = [];
        const sessoes = await new Promise((resolve, reject) => {
            pool.query('SELECT id, Nome, Statu_Disp FROM sessao WHERE IdEmpresa = ?', [req.body.IdEmp], (error, results) => {
                if (error) return reject(error);
                resolve(results);
            });
        });

        for (let sessao of sessoes) {
            if (sessao.Statu_Disp === 1) {
                const produtosDaSessao = await new Promise((resolve, reject) => {
                    pool.query('SELECT id_prod FROM sessao_prod WHERE id_sessao = ?', [sessao.id], (error, results) => {
                        if (error) return reject(error);
                        resolve(results);
                    });
                });

                const LisProd = [];
                for (let produtoRef of produtosDaSessao) {
                    const produto = await new Promise((resolve, reject) => {
                        pool.query('SELECT * FROM produtos WHERE id = ?', [produtoRef.id_prod], (error, results) => {
                            if (error) return reject(error);
                            resolve(results);
                        });
                    });

                    if (produto.length > 0) {
                        LisProd.push(produto[0]);
                    }
                }

                ListSessao.push({
                    Secao: sessao.Nome,
                    Itens: LisProd
                });
            }
        }
        res.json(ListSessao);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ocorreu um erro ao processar a solicitação.' });
    }
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

//Configuração Vps
// app.listen(5555, () => {
//   console.log('Server is running on port 3000');
// });