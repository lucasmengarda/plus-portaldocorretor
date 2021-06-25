// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

var Parse = require('parse');
var Statics = require('./statics');

Parse.initialize(Statics.APPLICATION_ID, "");
Parse.serverURL = Statics.SERVER_URL;
Parse.javaScriptKey = Statics.JAVASCRIPT_KEY;

export async function getPropostas() {

  var Propostas = Parse.Object.extend("Propostas");
  var query2 = new Parse.Query(Propostas);

  try {
    const propostas = await query2.find();
    return propostas[0].get("nomeCliente");
  } catch (e){
    console.log(e);
    return "";
  }

  //res.setHeader('Content-Type', 'application/json')
  //res.statusCode = 200
  //res.end(JSON.stringify({ propostas: propostas }))

  //res.json({ propostas: propostas })
}