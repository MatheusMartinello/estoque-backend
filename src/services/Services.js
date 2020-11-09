const controllerCompras = require("../Controller/controllerCompras");
const pool = require("../Database/db");
const service = {
  geraData() {
    const d = new Date();
    return d.toLocaleString();
  },
  async qntProdutos({ idprodutos, idestoques }) {
    const qnt = await pool.query(
      "SELECT quantidade FROM produtos WHERE idprodutos = $1 and idestoques = $2",
      [idprodutos, idestoques]
    );
    return qnt.rows[0];
  },
  // Verifica Produto base de dados
  async verificaNaBase(idEmpresa, nome) {
    try {
      const produto = await pool.query(
        "SELECT * FROM produtos WHERE nome like $1 and idestoques = $2",
        [nome, parseInt(idEmpresa, 10)]
      );
      console.log(produto.rows.length);
      if (produto.rows.length === 0) return null;
      else return produto.rows[0];
    } catch (error) {
      console.error(error);
    }
  },
  //gera nota fiscal e qual o tipo da nota
  async geraNota(tipo) {
    pool.query("INSERT INTO notafiscal(data,tipo) values($1,$2)", [
      service.geraData(),
      tipo,
    ]);
    const result = await pool.query("SELECT MAX(idnotafiscal) from notafiscal");
    return result.rows[0].max;
  },
  //pega valores dos produtos do fornecedor
  async pegaValoresProdutoF({ idfornecedor, idprodutof }) {
    const result = await pool.query(
      'select * from "produtosFornecedor" pf where "idProdutosE" = $1 and idfornecedor = $2',
      [idfornecedor, idprodutof]
    );
    return result;
  },
  //gera produto
  async criaProduto(objeto, idestoques) {
    const validaProduto = await pool.query(
      "SELECT * from produtos where nome like $1 and idestoques = $2",
      [objeto.nome.toUpperCase(), idestoques]
    );
    if (validaProduto.rows.length === 0) {
      const result = await pool.query(
        "INSERT INTO produtos(nome,quantidade,custo,idestoques,medida) VALUES ($1,$2,$3,$4,$5)",
        [
          objeto.nome.toUpperCase(),
          objeto.qnt,
          objeto.custo,
          idestoques,
          medida,
        ]
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
  },
  //pega produto pelo ID
  async getIdProduto(objeto, idestoques) {
    const validaProduto = await pool.query(
      "SELECT * from produtos where nome like $1 and idestoques = $2",
      [objeto.nome.toUpperCase(), idestoques]
    );
    return validaProduto.rows[0].idprodutos;
  },
  async getProdutoId(idproduto, idestoques) {
    const produto = await pool.query(
      "SELECT * from produtos where idprodutos = $1 and idestoques = $2",
      [idproduto, idestoques]
    );
    return produto.rows[0];
  },
  //gera Compras no fornecedor
  async geraComprasF(objeto, req, idnotafiscal) {
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
  },
  getRandomInt() {
    return Math.random() * (45 - 20) + 20;
  },
  geraPrazo() {
    const days = getRandomInt();
    let date = new Date();
    date.setDate(date.getDate() + days);
    return date;
  },
  async geraPedidoCotacao(idusuario) {
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
  },
  async geraCotacoesNosEstoques(idproduto, idusuario, idcotacao) {
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
  },
  async pegaMelhorProposta(idproposta) {
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
  },
  vitrine(objeto) {
    for (let index = 0; index < objeto.length - 1; index++) {
      for (let j = 0; j < objeto.length - 1; j++) {
        if (objeto[j].quantidade > objeto[j + 1].quantidade) {
          let temp = objeto.rows[j];
          objeto[j] = objeto.rows[j + 1];
          objeto[j + 1] = temp;
        }
      }
    }

    return objeto;
  },
  async diminuiProduto(array) {
    try {
      const produto = await pool.query(
        "SELECT quantidade FROM produtos WHERE idprodutos = $1 and idestoques = $2",
        [array[0], array[1]]
      );
      const n_quantidade = parseInt(produto.rows[0].quantidade) - array[2];
      await pool.query(
        "update produtos set quantidade = $1 where idprodutos = $2 and idestoques = $3",
        [n_quantidade, array[0], array[1]]
      );
    } catch (error) {
      console.error(error);
    }
  },
  async pegaVendaId() {
    const idvenda = await pool.query("SELECT MAX(IDVENDAS) from venda");
    console.log(idvenda.rows[0]);
    if (idvenda.rows[0].max === null) {
      return 1;
    } else return parseInt(idvenda.rows[0].max) + 1;
  },
  async adicionarVenda(
    array,
    idnotafiscal,
    idusuario,
    frete,
    tributos,
    formapagamento,
    valortotal,
    idvenda
  ) {
    try {
      for (let index = 0; index < array.length - 1; index++) {
        const element = array[index];
      }
      await pool.query(
        "INSERT INTO venda(idprodutos,idestoques,idnotafiscal,idusuario,frete,tributos,formapagamento,valortotal,idvendas)" +
          "values($1,$2,$3,$4,$5,$6,$7,$8,$9)",
        [
          array[0],
          array[1],
          await idnotafiscal,
          idusuario,
          frete,
          tributos,
          formapagamento,
          valortotal,
          await idvenda,
        ]
      );
    } catch (error) {
      console.log(error);
    }
  },
  async adicionaFornecedor(objeto) {
    const { nome, telefone, endereco } = objeto;
    try {
      const verificaExistente = await pool.query(
        "SELECT nome,idfornecedor FROM forncedor WHERE nome = $1",
        [nome.toUpperCase()]
      );
      if ((verificaExistente.rows.length = 0)) {
        await pool.query(
          "INSERT INTO fornecedor(nome,telefone,endereco)values($1,$2,$3)",
          [nome.toUpperCase(), telefone, endereco]
        );
        return "Fornecedor adicionado com sucesso";
      } else
        return (
          "Fornecedor ja cadastrado no banco de dados com id = " +
          verificaExistente.rows[0].idfornecedor
        );
    } catch (error) {
      console.log(error);
      return error;
    }
  },
  async adicionaProdutoFornecedor(objeto) {
    const {
      idfornecedor,
      nome,
      quantidade,
      custo,
      codigobarras,
      url,
      medida,
    } = objeto;
    try {
      await pool.query(
        'insert into "produtosFornecedor"(idfornecedor,nome,quantidade,custo,codigobarras,url,medida)values($1,$2,$3,$4,$5,$6,$7)',
        [idfornecedor, nome, quantidade, custo, codigobarras, url, medida]
      );
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  },
  //testar
  async adionaReserva(objeto) {
    try {
      await pool.query(
        "INSERT INTO RESERVA(idprodutos,idestoques,quantidade)values($1,$2,$3)",
        [objeto.idprodutos, objeto.idestoques, objeto.quantidade]
      );
      const quantidade =
        parseInt(this.qntProdutos(objeto)) - parseInt(objeto.quantidade);
      await pool.query(
        "UPDATE produtos SET quantidade = $1 where idprotudos = $2 AND idestoques = $3",
        [quantidade, idprodutos, idestoques]
      );
    } catch (error) {
      console.log(error);
      return error;
    }
  },
  //testar
  async cancelaReserva(objeto) {
    try {
      const quantidade = await pool.query(
        "SELECT quantidade from reserva where idestoques = $1 and idprodutos = $2",
        [objetos.idestoques, objetos.idprodutos]
      );
      const atual =
        parseInt(this.qntProdutos(objeto)) - parseInt(quantidade.rows[0]);
      await pool.query(
        "DELETE FROM reserva WHERE idestoques = $1 and idprodutos = $2",
        [objeto.idestoques, objeto.idprodutos]
      );
      await pool.query(
        "UPDATE produtos SET quantidade = $1 where idestoques = $2 and idprotudos = $3",
        [atual, objeto.idestoques, objeto.idprodutos]
      );
    } catch (error) {
      console.error(error);
    }
  },
  //testar
  async inventario({ idestoques }) {
    try {
      const qntProdutos = await pool.query(
        "SELECT idproduto,quantidade FROM produtos WHERE idestoques = $1 ",
        [idestoques]
      );
      const qntReserva = await pool.query(
        "SELECT idprodutos,idestoques from reserva where idestoques = $1",
        [idestoques]
      );
      for (let i = 0; i < array.length; i++) {
        for (let j = 0; j < array.length; j++) {
          if (qntProdutos.rows[i].idprodutos === qntReserva.rows[j].idprodutos)
            qntProdutos.rows[i].quantidade =
              parseInt(qntProdutos.rows[i].quantidade) +
              parseInt(qntReserva.rows[j].quantidade);
        }
      }
      return qntProdutos;
    } catch (error) {
      console.log(error);
    }
  },
  async contasAhPagar({
    idestoques,
    idusuario,
    valor,
    data_venda,
    notaFiscal = 0,
    ordemDeServico = 0,
    folhaPagamento = 0,
  }) {},
};
module.exports = service;
