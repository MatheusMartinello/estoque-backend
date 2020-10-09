  function geraData() {
    const d = new Date();
    return d.toLocaleString();
  }
  // Verifica Produto base de dados
  async function verificaNaBase({ idEmpresa, nome, idprodutos }) {
    console.log(nome);
    console.log(idEmpresa);
    try {
      const produto = await pool.query(
        "SELECT * FROM produtos WHERE nome like $1 and idestoques = $2",
        [nome.toUpperCase(), parseInt(idEmpresa, 10)]
      );
      if (produto.rows.length === 0) return produto;
      else return produto;
    } catch (error) {
      console.error(error);
    }
  }
  //gera nota fiscal e qual o tipo da nota
  async function geraNota(tipo) {
    pool.query("INSERT INTO notafiscal(datavenda,tipo) values($1,$2)", [
      geraData(),
      tipo,
    ]);
    const result = await pool.query("SELECT MAX(idnotafiscal) from notafiscal");
    return result.rows[0].max;
  }
  //pega valores dos produtos do fornecedor
  async function pegaValoresProdutoF({ idfornecedor, idprodutof }) {
    const result = await pool.query(
      'select * from "produtosFornecedor" pf where "idProdutosE" = $1 and idfornecedor = $2',
      [idfornecedor, idprodutof]
    );
    return result;
  }
  //gera produto
  async function criaProduto(objeto, idestoques) {
    const validaProduto = await pool.query(
      "SELECT * from produtos where nome like $1 and idestoques = $2",
      [objeto.nome.toUpperCase(), idestoques]
    );
    if (validaProduto.rows.length === 0) {
      const result = await pool.query(
        "INSERT INTO produtos(nome,quantidade,custo,idestoques,medida) VALUES ($1,$2,$3,$4,$5)",
        [objeto.nome.toUpperCase(), objeto.qnt, objeto.custo, idestoques, medida]
      );
      console.log(result.rows);
    } else {
      objeto.qnt =
        parseInt(validaProduto.rows[0].quantidade) + parseInt(objeto.qnt);
      const valorMedio =
        (validaProduto.rows[0].qnt * validaProduto.rows[0].custo +
          objeto.custo * objeto.qnt) /
        (validaProduto.rows[0].qnt + objeto.qnt);
      const result = await pool.query(
        "update produtos set quantidade = $1, custo = $2, createat = $3, mediadevalor = $4",
        [objeto.qnt, objeto.custo, geraData(), valorMedio]
      );
      return result.rows;
    }
  }
  //pega produto pelo ID 
  async function getIdProduto(objeto, idestoques) {
    const validaProduto = await pool.query(
      "SELECT * from produtos where nome like $1 and idestoques = $2",
      [objeto.nome.toUpperCase(), idestoques]
    );
    return validaProduto.rows[0].idprodutos;
  }
  //gera Compras no fornecedor
  async function geraComprasF(objeto, req, idnotafiscal) {
    const { idestoques, idfornecedor, idprodutof, qnt, custo } = req.body;
    console.log("Aqui estamos");
    await pool.query(
      'insert into "comprasFornecedor"("idProdutosE",idfornecedor,idprodutos,idestoques,idnotafiscal,quantidade,custo)values($1,$2,$3,$4,$5,$6,$7)',
      [
        idprodutof,
        idfornecedor,
        await getIdProduto(objeto, idestoques),
        idestoques,
        idnotafiscal,
        qnt,
        custo,
      ]
    );
    return true;
  }

  function getRandomInt() {
    return Math.random() * (45 - 20) + 20;
  }
  function geraPrazo() {
    const days = getRandomInt();
    let date = new Date();
    date.setDate(date.getDate() + days);
    return date;
  }
  async function geraPedidoCotacao(idusuario) {
    try {
      await pool.query("insert into cotacoes(idusuario,data)values($1,$2)", [
        idusuario,
        geraDataAtual(),
      ]);
      const result = await pool.query("SELECT MAX(idcotacoes) from cotacoes");
      return result;
    } catch (error) {
      console.error(error);
    }
  }
  async function geraCotacoesNosEstoques(idproduto, idusuario, idcotacao) {
    let resultadoV = [];
    try {
      const validaProdutosDisponiveis = await pool.query(
        "SELECT idestoques, custo FROM produtos WHERE idprodutos = $1",
        [idproduto]
      );
      if (validaProdutosDisponiveis.rows.length >= 2) {
        for (const element of validaProdutosDisponiveis.rows) {
          resultadoV.push(
            await pool.query(
              "INSERT INTO cotacoes_produtos(idcotacoes,idusuario,idprodutos,idestoques,valortotal,prazoentrega,prazopagamento)values($1,$2,$3,$4,$5,$6,$7)",
              [
                idcotacao,
                idusuario,
                idproduto,
                element.idestoques,
                element.custo,
                geraPrazo(),
                geraPrazo(),
              ]
            )
          );
        }
      } else throw "Existe menos de 3 estoques para consulta desse produto!";
    } catch (error) {
      console.error(error);
    }
  }
  async function pegaMelhorProposta(idproposta) {
    const pegaProposta = await pool.query(
      "SELECT * from cotacoes_produtos where idcotacoes = $1",
      [idproposta]
    );
    let aux = pegaProposta.rows[0];
    for (const element of pegaProposta.rows) {
      if (parseFloat(aux.valortotal) > parseFloat(element.valortotal))
        aux = element;
    }
    return aux;
  }

  module.exports = service;