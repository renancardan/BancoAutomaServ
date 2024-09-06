const express = require('express');
const cors = require('cors');
//const sequelize = require('./db');
const mysql = require('mysql2');

const app = express();
app.use(cors());
app.use(express.json());

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


// Defina suas rotas aqui
app.get('/', (req, res) => {
    connection.query('SELECT * FROM produtos', (error, results, fields) => {
        if (error) throw error;
        res.json(results);
      });
});

app.post('/VerList', async (req, res) => {
  var Temp = new Date().getTime() - 21600000;
    connection.query(`SELECT * FROM list_pedido WHERE Telefone = ? AND Status != 'concluido' AND Id_Emp = ? AND DataPed > ?`, [req.body.Tel, req.body.IdEmp, Temp], (error, results) => {
      if (error) return reject(error);
      console.log(results)
      res.json(results);
  });
  
  });
app.post('/dadoEmpresa', async (req, res) => {
  connection.query('SELECT * FROM empresa WHERE idEmp = ?', [req.body.IdEmp], (error, results) => {
    if (error) return reject(error);
    res.json(results);
});

});

app.post('/Pedido', async (req, res) => {
   // console.log(req.body)
   let jsonStringPed = JSON.stringify(req.body.Pedido);
  var DataPed = new Date().getTime()
    connection.query('INSERT INTO list_pedido (DataPed, Pedido, id_Emp, Telefone, Nome, End_Rua, End_Numero, End_Bairro, End_Comp, End_Cidade, End_Estado, Pg_Pix, Pg_CartDeb, Pg_CartCred, Pg_Cheque, Pg_Boleto, Pg_Dinheiro, Pg_Troco, Rec_Buscar, Rec_Consumoloc, Rec_Entregar, Rec_ValorEnt, Status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [DataPed, jsonStringPed, req.body.IdEmp, req.body.Tel, req.body.Nome, req.body.Rua , req.body.Numero , req.body.Bairro , req.body.Complemento , req.body.Cidade , req.body.Estado, req.body.Pix , req.body.CartDebi , req.body.CartCred , req.body.Cheque, req.body.Boleto , req.body.Dinheiro , req.body.Troco, req.body.Buscar, req.body.Consumo, req.body.Entreg, req.body.ValorEnt, "Pedido Enviado para Empresa"], (error, results) => {
        if (error) return reject(error);
       // console.log(results)
        res.json(results);
    });
//     connection.query('INSERT INTO list_pedido (Pedido, id_Emp, Telefone, Nome, End_Rua, End_Numero, End_Bairro, End_Comp, End_Cidade, End_Estado, Pg_Pix, Pg_CartDeb, Pg_CartCred, Pg_Cheque, Pg_Boleto, Pg_Dinheiro, Pg_Troco, Rec_Buscar, Rec_Consumo, Rec_Entregar) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [req.body.Pedido, req.body.IdEmp, req.body.Tel, req.body.Nome , req.body.Rua , req.body.Numero , req.body.Bairro , req.body.Complemento , req.body.Cidade , req.body.Estado , req.body.Pix , req.body.CartDebi , req.body.CartCred , req.body.Cheque , req.body.Boleto , req.body.Dinheiro , req.body.Troco , req.body.Buscar , req.body.Consumo , req.body.Entreg ], (error, results) => {
//       if (error) return reject(error);
//       res.json(results);
//   });
  
  });
  


app.post('/produtos', async (req, res) => {
  try {
      const ListSessao = [];
      
      const sessoes = await new Promise((resolve, reject) => {
          connection.query('SELECT id, Nome, Statu_Disp FROM sessao WHERE IdEmpresa = ?', [req.body.IdEmp], (error, results) => {
              if (error) return reject(error);
              resolve(results);
          });
      });

      for (let sessao of sessoes) {
          if (sessao.Statu_Disp === 1) {
              const produtosDaSessao = await new Promise((resolve, reject) => {
                  connection.query('SELECT id_prod FROM sessao_prod WHERE id_sessao = ?', [sessao.id], (error, results) => {
                      if (error) return reject(error);
                      resolve(results);
                  });
              });

              const LisProd = [];
              for (let produtoRef of produtosDaSessao) {
                  const produto = await new Promise((resolve, reject) => {
                      connection.query('SELECT * FROM produtos WHERE id = ?', [produtoRef.id_prod], (error, results) => {
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



// app.post('/produtos',  (req, res) => {

 
//   var ListSessao = [];
// connection.query('SELECT id, Nome, Statu_Disp FROM sessao WHERE IdEmpresa = ?', [req.body.IdEmp], (error, results, fields) => {
//     if (error) throw error;
    
//      for(let i in results){
//       if(results[i].Statu_Disp === 1){
//         connection.query('SELECT id_prod FROM sessao_prod WHERE id_sessao = ?', [results[i].id], (error, results1, fields) => {
//           if (error) throw error;
//          var LisProd = []
//            for(let j in results1){
//             connection.query('SELECT * FROM produtos WHERE id = ?', [results1[j].id_prod], (error, results2, fields) => {
//               if (error) throw error;

//              for(let l in results2){

//               if(results2[l].Status_Disp === 1){
//                 LisProd.push(results2[l])
//               }
//              }
             
//             });
//            }
//            ListSessao.push(
//             {
//               Secao:results[i].Nome,
//               Itens:LisProd
//             }
//           )
         
//         });
//        }
//      }
    
 
//   });
//  console.log(ListSessao)
// res.json(ListSessao);
// });

app.listen(5555, () => {
  console.log('Server is running on port 5555');
});