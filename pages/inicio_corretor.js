import Head from 'next/head'
import { withRouter } from 'next/router'
import Router from 'next/router'
import styles from '../styles/Home.module.css'
import { useState } from 'react';
import Lottie from 'react-lottie';
import loadingJson from "./lotties/loading.json";
import cookies from 'next-cookies'
import React from 'react'

class Page extends React.Component {

  static async getInitialProps(ctx) {
    //const res = await fetch('https://api.github.com/repos/vercel/next.js')
    //const json = await res.json()

    const sessionToken = cookies(ctx).sessionToken;
    console.log("SessionToken: " + sessionToken);
    
    if (sessionToken == null) {
      ctx.res.writeHead(301, {
        Location: './'
      });
      ctx.res.end();
    }

    const res = await fetch("http://localhost:3000/api/tabeladevendas?tabeladevendaspassword=$%PLUS2021$%");
    const json = await res.json()
    console.log("TabelaDeVendasArr.Length: " + json["tabelaDeVendasArr"].length);

    function adicionaZero(numero) {
      if (numero <= 9)
        return "0" + numero;
      else
        return numero;
    }

    var data = new Date();
    data.toLocaleDateString("pt-BR");
    let dataFormatada = (adicionaZero(data.getDate()) + "/" + adicionaZero(((data.getMonth() + 1))) + "/" + (data.getFullYear()));
    var atualizadoEm = "Tabela atualizada às " + adicionaZero(data.getHours()) + ":" + adicionaZero(data.getMinutes()) + " - " + dataFormatada;

    return { tabelaDeVendasArr: json["tabelaDeVendasArr"], atualizadoEm: atualizadoEm, sessionToken: sessionToken };
  }

  async componentDidMount() {
    this.state.simulacao_placeholder = "Entrada mínima de " + this.construirCurrency(10000);

    const { pathname, query } = this.props.router
    if (query.apartamento != null) {

      var espelhoParaTabela = this.prepararTabela(this.props.tabelaDeVendasArr);
      var aptoEscolhido = {};

      for (var y = 0; y < espelhoParaTabela.length; y++) {
        for (var x = 0; x < espelhoParaTabela[y].length; x++) {
          var apartamentoShown = espelhoParaTabela[y][x]["apto"];
          if (apartamentoShown == ("" + query.apartamento)) {
            aptoEscolhido = espelhoParaTabela[y][x];
            continue;
          }
        }
      }

      var setarOEstado = {};
      setarOEstado["apartamento_numero"] = aptoEscolhido["apto"];
      setarOEstado["apartamento_endereco"] = "Avenida República Argentina, 3165, apto " + aptoEscolhido["apto"] + " - bairro Portão, Curitiba, Paraná. CEP 80.610-260";
      setarOEstado["apartamento_andar"] = aptoEscolhido["andar"];

      const pavimento = aptoEscolhido["andar"];
      if (pavimento == 3) {
        setarOEstado["apartamento_plantaandar"] = "/3andar.png"
      } else if (pavimento > 3 & pavimento < 10) {
        setarOEstado["apartamento_plantaandar"] = "/4_5_6_7_8_9andar.png"
      } else if (pavimento == 10) {
        setarOEstado["apartamento_plantaandar"] = "/10andar.png"
      } else if (pavimento > 10 & pavimento < 15) {
        setarOEstado["apartamento_plantaandar"] = "/11_12_13_14andar.png"
      } else if (pavimento == 15) {
        setarOEstado["apartamento_plantaandar"] = "/15andar.png"
      } else if (pavimento == 16) {
        setarOEstado["apartamento_plantaandar"] = "/16andar.png"
      } else if (pavimento > 16 & pavimento < 19) {
        setarOEstado["apartamento_plantaandar"] = "/16_17_18andar.png"
      } else {
        setarOEstado["apartamento_plantaandar"] = "/19andar.png"
      }

      setarOEstado["apartamento_tipo"] = aptoEscolhido["dorms"];

      var areaPrivativaStr = aptoEscolhido["areaprivativa"];
      var terracosacadaStr = aptoEscolhido["terracosacada"];

      setarOEstado["apartamento_subtitulo"] = areaPrivativaStr + "m² privativos";
      setarOEstado["apartamento_areaprivativa"] = areaPrivativaStr + "m²";
      setarOEstado["apartamento_terraco"] = terracosacadaStr + "m²";

      const areappp = areaPrivativaStr.replaceAll(",", ".");
      const terracoppp = terracosacadaStr.replaceAll(",", ".");

      var areaprivfl = parseFloat(areappp);
      var areaterrfl = parseFloat(terracoppp);

      var areaTotal = areaprivfl + areaterrfl;
      var numeral = require('numeral');
      var areaTotalStr = numeral(areaTotal).format('0.00');
      areaTotalStr = areaTotalStr.replaceAll(".", ",");

      setarOEstado["apartamento_areatotal"] = areaTotalStr + "m²";
      setarOEstado["apartamento_planta"] = "/planta_" + aptoEscolhido["planta"] + ".png";
      var valorDeVenda = aptoEscolhido["valorvenda"];
      if (aptoEscolhido["vendido"]){
        setarOEstado["apartamento_valorvenda"] = "Unid. vendida";
        valorDeVenda = 0.0;
      } else {
        setarOEstado["apartamento_valorvenda"] = this.construirCurrency(valorDeVenda);
      }

      var precoPorm2 = valorDeVenda / areaTotal;

      setarOEstado["apartamento_precoporm2"] = this.construirCurrency(precoPorm2);
      setarOEstado["apartamento_pi_entrada"] = this.construirCurrency((valorDeVenda * 0.15));
      setarOEstado["apartamento_pi_balao1"] = this.construirCurrency((valorDeVenda * 0.10));
      setarOEstado["apartamento_pi_balao2"] = this.construirCurrency((valorDeVenda * 0.10));
      setarOEstado["apartamento_pi_chaves"] = this.construirCurrency((valorDeVenda * 0.20));

      const fimdaobra = new Date(2024, 0, 1, 12, 0, 0, 0);
      const hoje = new Date();
      var meses = (fimdaobra.getFullYear() - hoje.getFullYear()) * 12;
      meses -= hoje.getMonth();
      meses += fimdaobra.getMonth();

      setarOEstado["apartamento_pi_qntparcelas"] = meses;
      setarOEstado["apartamento_pi_vlrparcela"] = this.construirCurrency(((valorDeVenda * 0.45) / meses));

      setarOEstado["apartamento_cef_sinal"] = "R$ 10.000,00";
      var financimentoCef = aptoEscolhido["financiamentocef"];
      var jurosDeObra = (financimentoCef * 0.0725) / 12;
      var saldoFinanciavelIncorp = 0.0;
      if ((financimentoCef + 10000) > valorDeVenda) {
        saldoFinanciavelIncorp = 0.0;
        setarOEstado["apartamento_cef_saldoincorp"] = "Sem saldo"
      } else {
        saldoFinanciavelIncorp = (valorDeVenda - 10000 - financimentoCef);
        setarOEstado["apartamento_cef_saldoincorp"] = "12x " + this.construirCurrency((saldoFinanciavelIncorp) / 12);
      }



      setarOEstado["apartamento_cef_jurosdeobra"] = this.construirCurrency(jurosDeObra);
      setarOEstado["apartamento_cef_finanmax"] = this.construirCurrency(financimentoCef);

      setarOEstado["simulacao_placeholder"] = this.construirCurrency((valorDeVenda * 0.1));

      /*
      apartamento_caracteristicas: [],
      */

      this.setState(setarOEstado);
    }

    if (query.entrada != null) {
      if (query.chaves != null) {

        //Previsao para o fim da obra: jan/2024
        const fimdaobra = new Date(2024, 0, 1, 12, 0, 0, 0);
        const hoje = new Date();
        var meses = (fimdaobra.getFullYear() - hoje.getFullYear()) * 12;
        meses -= hoje.getMonth();
        meses += fimdaobra.getMonth();

        var saldo = 328289.9 - (query.entrada / 100) - (query.chaves / 100);
        var primeiraparcsb = saldo / meses;
        var ultimaparcsb = primeiraparcsb * Math.pow(1.004472, meses);

        const balaoSemCorrecao = saldo * 0.12;
        var saldoComBaloes = 328289.9 - (query.entrada / 100) - (query.chaves / 100) - (balaoSemCorrecao * 2);
        const balao1Corrigido = balaoSemCorrecao * Math.pow(1.004472, 12);
        const balao2Corrigido = balaoSemCorrecao * Math.pow(1.004472, 24);
        var primeiraparccb = saldoComBaloes / meses;
        var ultimaparccb = primeiraparccb * Math.pow(1.004472, meses);

        var chavesCorrigido = (query.chaves / 100) * Math.pow(1.004472, meses);



        this.setState({ simulacao_chaves: this.construirCurrency(chavesCorrigido), simularEntrada: this.construirCurrency((query.entrada / 100)), simularChaves: this.construirCurrency((query.chaves / 100)), simulacao_balao1: this.construirCurrency(balao1Corrigido), simulacao_balao2: this.construirCurrency(balao2Corrigido), simulacao_mesesamort: meses, simulacao_primeiraparcelacombalao: this.construirCurrency(primeiraparccb), simulacao_primeiraparcelasembalao: this.construirCurrency(primeiraparcsb), simulacao_ultimaparcelacombalao: this.construirCurrency(ultimaparccb), simulacao_ultimaparcelasembalao: this.construirCurrency(ultimaparcsb) });
      }
    }
  }

  componentDidUpdate(prevProps) {
    const { pathname, query } = this.props.router
    if (query.apartamento != prevProps.router.query.apartamento) {
      //call update
      this.componentDidMount();
    }
    if (query.espelhodevendas != prevProps.router.query.espelhodevendas) {
      //call update
      this.componentDidMount();
    }
    if (query.entrada != prevProps.router.query.entrada | query.chaves != prevProps.router.query.chaves) {
      //call update
      this.componentDidMount();
    }
  }

  constructor(props) {
    super(props);
    this.state = {
      espelhoParaTabela: [],
      aptoEscolhido: {},
      simularEntrada: "",
      simularChaves: "",
      simulacao_primeiraparcelacombalao: "",
      simulacao_ultimaparcelacombalao: "",
      simulacao_primeiraparcelasembalao: "",
      simulacao_ultimaparcelasembalao: "",
      simulacao_balao1: "",
      simulacao_balao2: "",
      simulacao_mesesamort: 0,
      simulacao_chaves: "",
      simulacao_placeholder: "",
      apartamento_numero: "",
      apartamento_endereco: "",
      apartamento_plantaandar: "",
      apartamento_andar: "",
      apartamento_tipo: "",
      apartamento_subtitulo: "",
      apartamento_areaprivativa: "",
      apartamento_terraco: "",
      apartamento_areatotal: "",
      apartamento_planta: "",
      apartamento_caracteristicas: [],
      apartamento_valorvenda: "",
      apartamento_precoporm2: "",
      apartamento_pi_entrada: "",
      apartamento_pi_balao1: "",
      apartamento_pi_balao2: "",
      apartamento_pi_qntparcelas: 0,
      apartamento_pi_vlrparcela: "",
      apartamento_pi_chaves: "",
      apartamento_cef_sinal: "",
      apartamento_cef_saldoincorp: "",
      apartamento_cef_jurosdeobra: "",
      apartamento_cef_finanmax: ""
    };
  }

  prepararTabela(tabelaDeVendasArr) {
    var espelhodevendasPorAndar = {};
    for (var y = 0; y < tabelaDeVendasArr.length; y++) {
      var itemTabelaDeVenda = tabelaDeVendasArr[y];
      var andar = itemTabelaDeVenda["andar"];

      var espelhoDoAndar = [];
      if (espelhodevendasPorAndar[andar] != null) {
        espelhoDoAndar = espelhodevendasPorAndar[andar];
      }

      var apartamento = itemTabelaDeVenda["apartamento"];
      var areaprivativa = itemTabelaDeVenda["areaprivativa"];
      var terracosacada = itemTabelaDeVenda["terracosacada"];
      var dorms = itemTabelaDeVenda["dorms"];
      var final = itemTabelaDeVenda["final"];
      var face = itemTabelaDeVenda["face"];
      var aptoid = itemTabelaDeVenda["objectId"];

      var reservado = false;
      var vendido = false;
      if ("reservado" in itemTabelaDeVenda) {
        reservado = itemTabelaDeVenda["reservado"];
      }
      if ("vendido" in itemTabelaDeVenda) {
        vendido = itemTabelaDeVenda["vendido"];
      }

      var planta = itemTabelaDeVenda["planta"];
      var financiamentocef = itemTabelaDeVenda["financiamentocef"];
      var areatotal = itemTabelaDeVenda["areatotal"];
      var fracaoideal = itemTabelaDeVenda["fracaoideal"];

      //construido dentro da API!
      var valorvenda = itemTabelaDeVenda["valorvenda"];

      const obj = { aptoid: aptoid, fracaoideal: fracaoideal, areatotal: areatotal, financiamentocef: financiamentocef, andar: andar, planta: planta, dorms: dorms, reservado: reservado, vendido: vendido, apto: apartamento, final: final, codigoproposta: null, areaprivativa: areaprivativa, terracosacada: terracosacada, face: face, valorvenda: valorvenda };
      espelhoDoAndar.push(obj);

      espelhodevendasPorAndar[andar] = espelhoDoAndar;
    }

    var espelhoParaTabela = [];
    for (var key in espelhodevendasPorAndar) {
      espelhoParaTabela.push(espelhodevendasPorAndar[key])
    }

    espelhoParaTabela.reverse()

    return espelhoParaTabela;
  }

  renderTableData() {

    //vindo do server
    var espelhoParaTabela = this.prepararTabela(this.props.tabelaDeVendasArr);

    return espelhoParaTabela.map((andar, index) => {
      return (
        <tr>
          <table>
            <tr>
              {this.renderTableDataPorAndar(andar)}
            </tr>
          </table>
        </tr>
      )
    })
  }

  renderTableDataPorAndar(andar) {

    return andar.map((apartamento, index) => {
      const { aptoid, vendido, reservado, apto } = apartamento //destructuring
      if (vendido) {
        return (
          <td className={styles.espelhodevendasvendido}>{apto}</td>
        )
      } else if (reservado) {
        return (
          <td className={styles.espelhodevendasreservado}>{apto}</td>
        )
      } else {
        return (
          <td className={styles.espelhodevendasnulo} onClick={this.onClick} cellid={apto}>{apto}</td>
        )
      }
    })
  }

  renderTableDataEstiloTabela() {

    var espelhoParaTabela = this.prepararTabela(this.props.tabelaDeVendasArr);
    espelhoParaTabela.reverse();
    return espelhoParaTabela.map((andar, index) => {
      return andar.map((apartamento, index) => {
        return (
          this.renderTableDataPorApartamento(apartamento, index)
        )
      })
    })
  }

  renderTableDataPorApartamento(apartamento, index) {
    const { andar, final, dorms, face, areaprivativa, terracosacada, reservado, vendido, apto, fracaoideal, areatotal, financiamentocef, valorvenda } = apartamento //destructuring

    var faceVisivel = "";
    if (face == "O") {
      faceVisivel = "OESTE";
    } else if (face == "N") {
      faceVisivel = "NORTE";
    } else if (face == "S") {
      faceVisivel = "SUL";
    } else {
      faceVisivel = "LESTE";
    }

    var escritaReservaVendido = "EM TESTES";
    if (reservado) {
      escritaReservaVendido = "RESERVADO";
    } else if (vendido) {
      escritaReservaVendido = "VENDIDO";
    } else {
      escritaReservaVendido = "";
    }

    const areappp = areaprivativa.replace(",", ".");
    const terracoppp = terracosacada.replace(",", ".");
    var areaprivfl = parseFloat(areappp);
    var areaterrfl = parseFloat(terracoppp);

    var areaTotal = areaprivfl + areaterrfl;
    var numeral = require('numeral');
    var areaTotalStr = numeral(areaTotal).format('0.00');
    areaTotalStr = areaTotalStr.replace(".", ",");

    var valorMostravelDeFinanciamento = "";
    var valorMostravelDeVenda = "";
    var numeral = require('numeral');
    valorMostravelDeFinanciamento = numeral(financiamentocef).format('$0,0.00');
    valorMostravelDeFinanciamento = valorMostravelDeFinanciamento.replace(".", "/");
    valorMostravelDeFinanciamento = valorMostravelDeFinanciamento.replace(",", ".");
    valorMostravelDeFinanciamento = valorMostravelDeFinanciamento.replace(",", ".");
    valorMostravelDeFinanciamento = valorMostravelDeFinanciamento.replace("/", ",");
    valorMostravelDeFinanciamento = valorMostravelDeFinanciamento.replace("$", "R$");

    valorMostravelDeVenda = numeral(valorvenda).format('$0,0.00');
    valorMostravelDeVenda = valorMostravelDeVenda.replace(".", "/");
    valorMostravelDeVenda = valorMostravelDeVenda.replace(",", ".");
    valorMostravelDeVenda = valorMostravelDeVenda.replace(",", ".");
    valorMostravelDeVenda = valorMostravelDeVenda.replace("/", ",");
    valorMostravelDeVenda = valorMostravelDeVenda.replace("$", "R$");

    if (vendido){
      return (
        <tr className={styles.tabeladevendasvendido} onClick={this.onClick} cellid={apto}>
          <td>
            <bu>{apto}</bu>
          </td>
          <td>
            {final}
          </td>
          <td>
            {dorms}
          </td>
          <td>
            {faceVisivel}
          </td>
          <td>
            {areaprivativa + "m²"}
          </td>
          <td>
            {terracosacada + "m²"}
          </td>
          <td>
            <b>{areaTotalStr + "m²"}</b>
          </td>
          <td>
            {areatotal + "m²"}
          </td>
          <td>
            <i>{valorMostravelDeFinanciamento}</i>
          </td>
          <td>
            <bu></bu>
          </td>
          <td className={styles.tabeladevendasprimeiratd2}>
            <b>{escritaReservaVendido}</b>
          </td>
        </tr>
      )
    } else if (reservado){
      return (
        <tr className={styles.tabeladevendasreservado} onClick={this.onClick} cellid={apto}>
          <td>
            <bu>{apto}</bu>
          </td>
          <td>
            {final}
          </td>
          <td>
            {dorms}
          </td>
          <td>
            {faceVisivel}
          </td>
          <td>
            {areaprivativa + "m²"}
          </td>
          <td>
            {terracosacada + "m²"}
          </td>
          <td>
            <b>{areaTotalStr + "m²"}</b>
          </td>
          <td>
            {areatotal + "m²"}
          </td>
          <td>
            <i>{valorMostravelDeFinanciamento}</i>
          </td>
          <td>
            <bu>{valorMostravelDeVenda}</bu>
          </td>
          <td className={styles.tabeladevendasprimeiratd2}>
            <b>{escritaReservaVendido}</b>
          </td>
        </tr>
      )
    } else {
      return (
        <tr className={styles.tabeladevendasnulo} onClick={this.onClick} cellid={apto}>
          <td>
            <bu>{apto}</bu>
          </td>
          <td>
            {final}
          </td>
          <td>
            {dorms}
          </td>
          <td>
            {faceVisivel}
          </td>
          <td>
            {areaprivativa + "m²"}
          </td>
          <td>
            {terracosacada + "m²"}
          </td>
          <td>
            <b>{areaTotalStr + "m²"}</b>
          </td>
          <td>
            {areatotal + "m²"}
          </td>
          <td>
            <i>{valorMostravelDeFinanciamento}</i>
          </td>
          <td>
            <bu>{valorMostravelDeVenda}</bu>
          </td>
          <td className={styles.tabeladevendasprimeiratd2}>
            <b>{escritaReservaVendido}</b>
          </td>
        </tr>
      )
    }
  }

  onClickBotoesMenu = event => {
    const id = event.currentTarget.getAttribute("botaoid");

    if (id == "espelhodevendas") {
      Router.push('?espelhodevendas=1', undefined, { shallow: true, scroll: true })
    } else if (id == "sair") {
      var Parse = require('parse');
      var Statics = require('./api/statics');
      Parse.initialize(Statics.APPLICATION_ID, "");
      Parse.serverURL = Statics.SERVER_URL;
      Parse.javaScriptKey = Statics.JAVASCRIPT_KEY;
      Parse.User.become(this.props.sessionToken);
      Parse.User.logOut();
      document.cookie = `sessionToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT`;
      Router.push('/', undefined, { shallow: true, scroll: true })
    } else {
      alert("Botão sem função ainda.");
    }

  };

  //abre informações do apartamento
  onClick = event => {
    const id = event.currentTarget.getAttribute("cellid");
    //this.props.router.push('?apartamento=1901')
    Router.push('?apartamento=' + id, undefined, { shallow: true, scroll: true }).then(() => window.scrollTo(0, 0));
  };

  onClickEspelhoTabela = event => {
    const id = event.currentTarget.getAttribute("botaoid");
    if (id == "espelho"){
      Router.push('?espelhodevendas=1', undefined, { shallow: true, scroll: true })
    } else {
      Router.push('?espelhodevendas=2', undefined, { shallow: true, scroll: true })
    }
  };

  onClickSimularFluxo = event => {

    if (this.currencyParaValor(this.state.simularEntrada) == 0.0) {
      alert("Insira um valor de entrada!");
      return;
    }

    if ((this.currencyParaValor(this.state.simularEntrada) / 100) < (328289.9 * 0.1)) {
      alert("O valor mínimo de entrada para esta unidade é de " + this.construirCurrency((328289.9 * 0.1)));
      return;
    }

    if (this.currencyParaValor(this.state.simularChaves) == 0.0) {
      alert("Insira um valor para pagamento nas chaves!");
      return;
    }

    const { pathname, query } = this.props.router
    Router.push('?apartamento=' + query.apartamento + '&entrada=' + this.currencyParaValor(this.state.simularEntrada) + "&chaves=" + this.currencyParaValor(this.state.simularChaves), undefined, { shallow: true })
  };

  currencyParaValor(str) {
    if (str.length == 0) {
      return 0.0;
    }
    var numeros = str.replaceAll(",", "");
    numeros = numeros.replaceAll("R$", "");
    numeros = numeros.replaceAll("$", "");
    numeros = numeros.replaceAll(" ", "");
    numeros = numeros.replaceAll("NaN", "");
    numeros = numeros.replaceAll(".", "");
    var atual = parseFloat(numeros);
    return atual;
  }

  construirCurrency(str) {
    var numeros = 0.0;
    if (typeof str === 'string') {
      var numeros = str.replaceAll(",", "");
      numeros = numeros.replaceAll("R$", "");
      numeros = numeros.replaceAll("$", "");
      numeros = numeros.replaceAll(" ", "");
      numeros = numeros.replaceAll("NaN", "");
      numeros = numeros.replaceAll(".", "");
    } else {
      numeros = str * 100;
    }
    var atual = parseFloat(numeros);
    atual = atual / 100;
    if (atual == 0.0) {
      return "";
    }
    var numeral = require('numeral');
    var string = numeral(atual).format('$0,0.00');
    string = string.replaceAll(".", "/");
    string = string.replaceAll(",", ".");
    string = string.replaceAll("/", ",");
    string = string.replaceAll("$", "R$");
    return string;
  }

  handleEntradaChange = e => {
    const { value } = e.target;
    this.setState({ simularEntrada: this.construirCurrency(value) });
  };

  handleChavesChange = e => {
    const { value } = e.target;
    this.setState({ simularChaves: this.construirCurrency(value) });
  };

  render() {
    return <div className={styles.container}>
      <div className={styles.supersizersegundatela} />
      <Head>
        <title>Residencial Plus - Portal Inteligente de Propostas</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <img className={styles.logoplus} src="/logo_plus.png" alt="Residencial Plus Portão"></img>

        <p className={styles.description}>
          Lucas Mengarda de Oliveira | LUCAS MENGARDA NEGOCIOS IMOBILIARIOS LTDA | 05.684.460/0001-08
        </p>

        <div className={styles.botoesmenu}>
          <button onClick={this.onClickBotoesMenu} botaoid="materialdevendas">MATERIAL DIGITAL DE VENDAS</button>
          <button onClick={this.onClickBotoesMenu} botaoid="espelhodevendas">ESPELHO DE VENDAS</button>
          <button onClick={this.onClickBotoesMenu} botaoid="simulacaodecredito">SIMULAÇÃO DE CRÉDITO</button>
          <button onClick={this.onClickBotoesMenu} botaoid="minhaspropostas">MINHAS PROPOSTAS</button>
          <button onClick={this.onClickBotoesMenu} botaoid="novaspropostas">NOVA PROPOSTA +</button>
          <button onClick={this.onClickBotoesMenu} botaoid="sair">SAIR</button>
        </div>

        <div className={styles.divider}>
        </div>

        <div style={{ display: this.props.router.query.espelhodevendas != null ? "block" : "none" }}>
          <div className={styles.seletortabelaespelho}>
            <p>Visualizar como:</p>
            <button onClick={this.onClickEspelhoTabela} botaoid="espelho" style={{ backgroundColor: this.props.router.query.espelhodevendas == 1 ? "gray" : "#2f3b60" }}>ESPELHO</button>
            <button onClick={this.onClickEspelhoTabela} botaoid="tabela" style={{ backgroundColor: this.props.router.query.espelhodevendas == 2 ? "gray" : "#2f3b60" }}>TABELA</button>
          </div>
          <div style={{ display: this.props.router.query.espelhodevendas == 2 ? "block" : "none" }}>
            <div className={styles.textopaginas}>
              <h1>TABELA DE VENDAS</h1>
              <h2>{this.props.atualizadoEm}</h2>
              <h3>Aqui você encontra a tabela de vendas de nosso empreendimento, com todas as unidades vendidas e/ou reservadas! Clique sobre a unidade que deseja obter mais informações</h3>
            </div>

            <div className={styles.espelhodevendas}>
              <table>
                <tbody>
                  <tr>
                    <td className={styles.espelhodevendasnulo}>apto</td>
                    <td className={styles.legendaespelho}> --&gt; </td>
                    <td className={styles.legendaespelho}>unidade disponível</td>
                  </tr>
                  <tr>
                    <td className={styles.espelhodevendasvendido}>apto</td>
                    <td className={styles.legendaespelho}> --&gt; </td>
                    <td className={styles.legendaespelho}>unidade vendida</td>
                  </tr>
                  <tr>
                    <td className={styles.espelhodevendasreservado}>apto</td>
                    <td className={styles.legendaespelho}> --&gt; </td>
                    <td className={styles.legendaespelho}>unidade reservada</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className={styles.tabeladevendas}>
              <table>
                <tr>
                  <th>UNID.</th>
                  <th>FINAL</th>
                  <th>TIPO</th>
                  <th>FACE</th>
                  <th>ÁREA PRIVATIVA</th>
                  <th>ÁREA DE TERRAÇO OU SACADA</th>
                  <th>ÁREA PRIVATIVA REAL</th>
                  <th>ÁREA TOTAL</th>
                  <th>FINANC. MÁX.</th>
                  <th>VALOR DA UNID.</th>
                  <th>STATUS</th>
                </tr>
                {this.renderTableDataEstiloTabela()}
              </table>
            </div>

            <div className={styles.textopaginas}>
              <h3>A incorporadora se reserva no direito de realizar qualquer alteração nesta tabela/espelho de vendas sem aviso prévio.</h3>
            </div>
          </div>
          <div style={{ display: this.props.router.query.espelhodevendas == 1 ? "block" : "none" }}>
            <div className={styles.textopaginas}>
              <h1>ESPELHO DE VENDAS</h1>
              <h2>{this.props.atualizadoEm}</h2>
              <h3>Aqui você encontra o espelho de vendas de nosso empreendimento, com todas as unidades vendidas e/ou reservadas! Clique sobre a unidade que deseja obter mais informações</h3>
            </div>

            <div className={styles.espelhodevendas}>
              <table>
                <tbody>
                  <tr>
                    <td className={styles.espelhodevendasnulo}>apto</td>
                    <td className={styles.legendaespelho}> --&gt; </td>
                    <td className={styles.legendaespelho}>unidade disponível</td>
                  </tr>
                  <tr>
                    <td className={styles.espelhodevendasvendido}>apto</td>
                    <td className={styles.legendaespelho}> --&gt; </td>
                    <td className={styles.legendaespelho}>unidade vendida</td>
                  </tr>
                  <tr>
                    <td className={styles.espelhodevendasreservado}>apto</td>
                    <td className={styles.legendaespelho}> --&gt; </td>
                    <td className={styles.legendaespelho}>unidade reservada</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className={styles.espelhodevendas}>
              <table>
                <tbody>
                  {this.renderTableData()}
                </tbody>
              </table>
            </div>

            <div className={styles.textopaginas}>
              <h3>A incorporadora se reserva no direito de realizar qualquer alteração nesta tabela/espelho de vendas sem aviso prévio.</h3>
            </div>
          </div>
        </div>

        <div style={{ display: this.props.router.query.apartamento != null ? "block" : "none" }}>

          <div className={styles.textopaginas}>
            <h1>APARTAMENTO {this.state.apartamento_numero}</h1>
            <h2>{this.state.apartamento_endereco}</h2>
          </div>

          <div>
            <h3 className={styles.description3}>Planta do {this.state.apartamento_andar}º andar:</h3>
            <img src={this.state.apartamento_plantaandar} className={styles.plantaandar} alt={this.state.apartamento_andar + "º andar - Residencial Plus Portão"} />
            <img src="/orientacaodarua_plus.png" className={styles.bussolaandar} alt={this.state.apartamento_andar + "º andar - Residencial Plus Portão"} />
          </div>

          <div>
            <h3 className={styles.description3}>Planta da unidade:</h3>
            <table className={styles.tabelaplantaapto}>
              <tr>
                <td>
                  <img src={this.state.apartamento_planta} className={styles.plantaapto} alt={"Apto " + this.state.apartamento_numero + " - Residencial Plus Portão"} />
                </td>
                <td>
                  <table className={styles.tabelacaracteristicasapto}>
                    <tr>
                      <h1>{this.state.apartamento_tipo}</h1>
                    </tr>
                    <tr>
                      <h2>{this.state.apartamento_subtitulo}</h2>
                    </tr>
                    <tr>
                      <table className={styles.tabeladeareas}>
                        <tr>
                          <th className={styles.tabeladeareastitulo}>ÁREA PRIVATIVA</th>
                          <th className={styles.tabeladeareastitulo}>ÁREA TERRAÇO/SACADA</th>
                          <th className={styles.tabeladeareastitulo}>ÁREA DE USO PRIVATIVO</th>
                        </tr>
                        <tr>
                          <td>{this.state.apartamento_areaprivativa}</td>
                          <td>{this.state.apartamento_terraco}</td>
                          <td className={styles.tabeladeareasareatotal}>{this.state.apartamento_areatotal}</td>
                        </tr>
                      </table>
                    </tr>
                    <tr>
                      <div className={styles.textopaginas}><p>• Características do apartamento <b>{this.state.apartamento_numero}</b>:</p></div>
                      <table className={styles.tabelacaracteristicasaptosecundaria}>
                        <tr>
                          <td>
                            <img src="/compass.png"></img>
                            <div className={styles.textopaginasdemais}><p>1. Face <b>NORTE</b></p></div>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <img src="/wall.png"></img>
                            <div className={styles.textopaginasdemais}><p>2. Paredes removíveis em Drywall</p></div>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <img src="/heater.png"></img>
                            <div className={styles.textopaginasdemais}><p>3. Ponto de água quente no banheiro com aquecimento central</p></div>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <img src="/panoramic.png"></img>
                            <div className={styles.textopaginasdemais}><p>4. Vista panorâmica para a cidade</p></div>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <img src="/antique-balcony.png"></img>
                            <div className={styles.textopaginasdemais}><p>5. Infraestrutura para nivelamento sala-sacada</p></div>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <img src="/dollar.png"></img>
                            <div className={styles.textopaginasdemais}><p>6. Rentabilidade com aluguel estimada em 1,2%a.m.</p></div>
                          </td>
                        </tr>
                      </table>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </div>
          <div>
            <h3 className={styles.description3}>Valor de venda:</h3>
            <p className={styles.valordevenda}>{this.state.apartamento_valorvenda}*</p>
            <p className={styles.valordevendaporm2}>{this.state.apartamento_precoporm2}/m²</p>
            <p className={styles.valordevendaaviso}>*Valor sujeito a alteração a qualquer momento, sem aviso prévio.</p>

            <div className={styles.tabelainvestidorholder}>
              <h5>Plano investidor sugerido:</h5>
              <table className={styles.tabelainvestidor}>
                <tr>
                  <th className={styles.tabelainvestidortitulo + ' ' + styles.tabelainvestidornaosomar}>ENTRADA (15%)</th>
                  <th className={styles.tabelainvestidortitulo + ' ' + styles.tabelainvestidornaosomar}>BALÃO ANUAL (dezembro/22)</th>
                  <th className={styles.tabelainvestidortitulo + ' ' + styles.tabelainvestidornaosomar}>BALÃO ANUAL (dezembro/23)</th>
                  <th className={styles.tabelainvestidortitulo + ' ' + styles.tabelainvestidornaosomar}>PARCELAS MENSAIS ({this.state.apartamento_pi_qntparcelas}x)</th>
                  <th className={styles.tabelainvestidortitulo + ' ' + styles.tabelainvestidornaosomar}>CHAVES (20%)</th>
                </tr>
                <tr>
                  <td className={styles.tabelainvestidornaosomar}>{this.state.apartamento_pi_entrada}</td>
                  <td className={styles.tabelainvestidornaosomar}>{this.state.apartamento_pi_balao1}</td>
                  <td className={styles.tabelainvestidornaosomar}>{this.state.apartamento_pi_balao2}</td>
                  <td className={styles.tabelainvestidornaosomar}><b>{this.state.apartamento_pi_qntparcelas}x</b> {this.state.apartamento_pi_vlrparcela}</td>
                  <td className={styles.tabelainvestidornaosomar}>{this.state.apartamento_pi_chaves}</td>
                </tr>
              </table>
              <p className={styles.valordevendaavisoincc}>*Saldo corrigido mensalmente pelo INCC (Índice Nacional da Construção Civil).</p>
            </div>

            <div className={styles.tabelainvestidorholder}>
              <h5>Financiamento CAIXA sugerido (Apoio à Produção):</h5>
              <table className={styles.tabelainvestidor}>
                <tr>
                  <th className={styles.tabelainvestidortitulo + ' ' + styles.tabelainvestidornaosomar}>SINAL DE NEGÓCIO</th>
                  <th className={styles.tabelainvestidortitulo + ' ' + styles.tabelainvestidorsomar}>SALDO DIRETO COM A INCORPORADORA* (12x)</th>
                  <th className={styles.tabelainvestidortitulo + ' ' + styles.tabelainvestidorsomar}>JUROS DE OBRA CAIXA*</th>
                  <th className={styles.tabelainvestidortitulo + ' ' + styles.tabelainvestidornaosomar}>FINANCIAMENTO CAIXA MÁXIMO</th>
                </tr>
                <tr>
                  <td className={styles.tabelainvestidornaosomar}>{this.state.apartamento_cef_sinal}</td>
                  <td className={styles.tabelainvestidorsomar}>{this.state.apartamento_cef_saldoincorp}</td>
                  <td className={styles.tabelainvestidorsomar}>{this.state.apartamento_cef_jurosdeobra}</td>
                  <td className={styles.tabelainvestidornaosomar}><b>{this.state.apartamento_cef_finanmax}</b></td>
                </tr>
              </table>
              <p className={styles.valordevendaavisoincc}>*No finaciamento Caixa o cliente pagará <b>ao mesmo tempo</b> a parcela do saldo direito com a incorporadora e os juros de obras.</p>
              <p className={styles.valordevendaavisoincc}>**Durante a fase de obras (pré Habite-se) o cliente pagará apenas os juros de obras, pagando a parcela após a entrega das chaves.</p>
              <p className={styles.valordevendaavisoincc}>***Os juros de obra aqui apresentados são valores estimados.</p>
            </div>

            <div className={styles.botaofazerproposta}>
              <button>FAZER UMA PROPOSTA NESTA UNIDADE</button>
            </div>
          </div>
          <table className={styles.simulefluxo}>
            <tr>
              <td>
                <div>
                  <h3 className={styles.description3}>Simule um fluxo (investidor):</h3>
                  <h5>Valor presente de venda: {this.state.apartamento_valorvenda}</h5>
                  <itemfluxo className={styles.itemfluxogroup}>
                    <span>Valor da entrada (em reais):</span>
                    <input class={styles.formfield} placeholder={this.state.simulacao_placeholder} type="text" name="entrada" value={this.state.simularEntrada}
                      onChange={this.handleEntradaChange}></input>
                  </itemfluxo>
                  <itemfluxo className={styles.itemfluxogroup}>
                    <span>Pagamento nas chaves (valor presente):</span>
                    <input class={styles.formfield} placeholder="R$ 10.000,00" type="text" name="entrada" value={this.state.simularChaves}
                      onChange={this.handleChavesChange}></input>
                  </itemfluxo>
                  <button onClick={this.onClickSimularFluxo}>Simular fluxo</button>
                </div>
              </td>
              <td style={{ visibility: this.props.router.query.entrada != null ? "" : "hidden" }}>
                <resultado>RESULTADO:</resultado>
                <br></br>
                <numeroparcelas>primeira parcela:</numeroparcelas>
                <valorparcela>{this.state.simulacao_primeiraparcelacombalao}</valorparcela>
                <br></br>
                <numeroparcelas>última parcela:</numeroparcelas>
                <valorparcela>{this.state.simulacao_ultimaparcelacombalao}</valorparcela>
                <br></br>
                <baloes>2 balões anuais de</baloes>
                <valorbalao><b>{this.state.simulacao_balao1}</b> e <b>{this.state.simulacao_balao2}</b></valorbalao>
                <br></br>
                <mesesamortizacao>{this.state.simulacao_mesesamort} meses de amortização</mesesamortizacao>
                <p></p>
                <numeroparcelas>ou</numeroparcelas>
                <p></p>
                <numeroparcelas>primeira parcela:</numeroparcelas>
                <valorparcela>{this.state.simulacao_primeiraparcelasembalao}</valorparcela>
                <br></br>
                <numeroparcelas>última parcela:</numeroparcelas>
                <valorparcela>{this.state.simulacao_ultimaparcelasembalao}</valorparcela>
                <br></br>
                <mesesamortizacao>{this.state.simulacao_mesesamort} meses de amortização</mesesamortizacao>
                <br></br>
                <br></br>
                <saldochavestxt>Pagamento nas chaves (ambos):</saldochavestxt>
                <saldochaves>{this.state.simulacao_chaves}</saldochaves>
                <br></br>
                <br></br>
                <baloes>*Considerando um INCC médio de 5,5% a.a.</baloes>
              </td>
            </tr>
          </table>
        </div>

      </main>

      <footer className={styles.footer}>
        <img src="https://www.inicioempreendimentos.com.br/img/logo-inicio.svg" alt="Início Empreendimentos" className={styles.logo} />
        <img src="/logo_lmm_transparente.png" alt="LMM Construção Civil Ltda" className={styles.logo} />
      </footer>
    </div>
  }
}

export default withRouter(Page)