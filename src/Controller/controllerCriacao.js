const express = require('express');
const router =  express.Router();
const pool = require('../Database/db')
const servico = require('../services/Services');

function controllerCriacao(){
    return (req,res,next)=>{
        next();
    }
}
//cria estoque
router.post("/", async (req, res) => {
    const { nome, endereco, telefone } = req.body;
    const empresa = await pool.query(
      "SELECT name FROM estoques WHERE name = $1",
      [nome]
    );
    if (empresa.rows.length == 0) {
      const newEmpresa = await pool.query(
        "INSERT INTO estoques (name, endereco,telefone) VALUES($1,$2,$3)",
        [nome, endereco, telefone]
      );
      res.json(newEmpresa);
    } else {
      res.status(400).send({ error: "Ja tem essa empresa cadastrada!" });
    }
});
//ve toda os estoques empresas
router.get("/", async (req, res) => {
    const empresasBD = await pool.query("SELECT * FROM estoques");
    res.send(empresasBD);
});
//verifica todos os produtos disponiveis para certa empreas
router.get("/estoque/:id", async (req, res) => {
    try {
      console.log(req.params.id);
      const result = await pool.query(
        "SELECT nome, quantidade, custo FROM produtos WHERE idestoques = $1",
        [req.params.id]
      );
      res.send(result.rows);
    } catch (err) {
      res.status(401).send(err);
    }
});
//pega produto a partir do id
router.get("/produto:id", async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT 'nome' 'qnt' from produtoswhere idprodutos = $1`,
        [req.param.id]
      );
      res.send(result.json());
    } catch (err) {
      console.error(err);
    }
});
module.exports = (controllerCriacao, (app) => app.use("/criacao", router));