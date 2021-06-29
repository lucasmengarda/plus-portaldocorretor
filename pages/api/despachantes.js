// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

var Parse = require('parse/node');

var Statics = require('./statics');

Parse.initialize(Statics.APPLICATION_ID, "");
Parse.serverURL = Statics.SERVER_URL;
Parse.javaScriptKey = Statics.JAVASCRIPT_KEY;

export default async (req, res) => {

  var despachantes = [{nome: "DESPACHANTE A", codigoDespachante: "RxcRU51GmU", contato: "DESP A | 41 99231-2812"}, {nome: "DESPACHANTE B", codigoDespachante: "RxcRU51GmU", contato: "DESP B | 41 99231-2812"}, {nome: "DESPACHANTE C", codigoDespachante: "RxcRU51GmU", contato: "DESP C | 41 99231-2812"}]

  const despachanteAleatorio = despachantes[Math.floor(Math.random() * despachantes.length)];
  res.statusCode = 200
  res.json({ erro: false, despachante: despachanteAleatorio });
}
