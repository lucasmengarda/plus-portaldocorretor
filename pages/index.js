import Head from 'next/head'
import Router from 'next/router'
import styles from '../styles/Home.module.css'
import { useState } from 'react';
import Lottie from 'react-lottie';
import loadingJson from "./lotties/loading.json";

export async function getStaticProps() {

  //var Functions = require('./api/functions');
  //const propostas = await Functions.login();
  const propostas = {};

  // By returning { props: { posts } }, the Blog component
  // will receive `posts` as a prop at build time
  return {
    props: {
      propostas
    },
  }
}

export default function Home({ propostas }) {

  const [usuario, setUsuario] = useState('')
  const [senha, setSenha] = useState('')
  const [showMe, setShowMe] = useState(false);
  const [showMeErro, setshowMeErro] = useState(false);
  const [mensagemErro1, setMensagemErro1] = useState('');

  const handleParam = setValue => e => setValue(e.target.value)

  //Lottie Options
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: loadingJson,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice"
    }
  };

  async function loginFunction() {

    if (usuario.length == 0) {
      alert("Por favor, digite um usuário!");
      return;
    }

    if (senha.length == 0) {
      alert("Por favor, digite uma senha!");
      return;
    }

    setShowMe(true);
    setMensagemErro1("");
    setshowMeErro(false);

    //var loginReq = await fetch("./api/login?usuario=" + usuario + "&pass=" + senha);
    //const data = await loginReq.json();

    var Parse = require('parse');
    var Statics = require('./api/statics');
    Parse.initialize(Statics.APPLICATION_ID, "");
    Parse.serverURL = Statics.SERVER_URL;
    Parse.javaScriptKey = Statics.JAVASCRIPT_KEY;

    var tipousuario = "";
    try {
      const user = await Parse.User.logIn(usuario, senha);
      tipousuario = "corretor";

      //SETAR UM COOKIE
      var date = new Date()
      date.setTime(date.getTime() + 7 * 24 * 60 * 60 * 1000);
      var expString = "; expires=" + date.toGMTString();
      document.cookie = "sessionToken" + "=" + user.getSessionToken() + expString;
      document.cookie = "userId" + "=" + user.id + expString;

      console.log("SESSION TOKEN: " + user.getSessionToken());
      console.log("USERID: " + user.id);

      if (tipousuario === "corretor") {
        Router.replace('/inicio_corretor').then(() => {
          setMensagemErro1("");
          setshowMeErro(false);
          setShowMe(false);

        });
      }

    } catch (e) {
      setMensagemErro1("Usuário ou senha inválidos! Tente novamente.");
      setShowMe(false);
      setshowMeErro(true);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.supersizer} />
      <Head>
        <title>Residencial Plus - Portal Inteligente de Propostas</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <img className={styles.logoplus} src="/logo_plus.png" alt="Residencial Plus Portão"></img>

        <p className={styles.description}>
          Por favor, realize seu login com seu cadastro de corretor, coordenador ou despachante:
        </p>

        <div className={styles.login_holder}>
          <div className={styles.login_subholder}>
            <div>
              <input className={styles.inputusuario} placeholder="usuário" type="text" name="email" value={usuario}
                onChange={handleParam(setUsuario)}></input>
            </div>

            <div>
              <input className={styles.inputsenha} placeholder="senha" type="password" name="pass" value={senha}
                onChange={handleParam(setSenha)}></input>
            </div>

            <div>
              <button onClick={loginFunction}>Entrar</button>
              <div style={{ display: showMeErro ? "block" : "none" }}>
                <p className={styles.carregando_erro}>{mensagemErro1}</p>
              </div>
              <div style={{ display: showMe ? "block" : "none" }}>
                <div className={styles.carregando_holder}>
                  <Lottie options={defaultOptions} className={styles.carregando_lottie} height={50} width={50} />
                  <p className={styles.carregando}>Carregando...</p>
                </div>
              </div>
            </div>

            <p className={styles.description2}>
              Ainda não tem cadastro de corretor? Converse com seu coordenador de vendas e realize seu cadastro.
            </p>
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        <img src="https://www.inicioempreendimentos.com.br/img/logo-inicio.svg" alt="Início Empreendimentos" className={styles.logo} />
        <img src="/logo_lmm_transparente.png" alt="LMM Construção Civil Ltda" className={styles.logo} />
      </footer>
    </div>
  )
}
