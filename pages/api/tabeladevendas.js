// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

var Parse = require('parse/node');
var Statics = require('./statics');

Parse.initialize(Statics.APPLICATION_ID, "");
Parse.serverURL = Statics.SERVER_URL;
Parse.javaScriptKey = Statics.JAVASCRIPT_KEY;

export default async (req, res) => {

  console.log(req.query);
  if (req.query.tabeladevendaspassword == "PLUS2021_"){
    var Parse = require('parse/node');
    var Statics = require('./statics');

    Parse.initialize(Statics.APPLICATION_ID, "");
    Parse.serverURL = Statics.SERVER_URL;
    Parse.javaScriptKey = Statics.JAVASCRIPT_KEY;

    var TabelaDeVendas = Parse.Object.extend("TabelaDeVendas");
    var query2 = new Parse.Query(TabelaDeVendas);
    query2.limit(1000);
    query2.addAscending("apartamento");

    var EstrategiaDeVenda = Parse.Object.extend("EstrategiaDeVenda");
    var query3 = new Parse.Query(EstrategiaDeVenda);

    try {
      var tabelaDeVendasArr = await query2.find();
      var estrategiasDeVendaArr = await query3.find();

      var m2Base = 0.0;
      var indexadorGlobal = 0.0;
      var vagas = [];
      var comercial = [];
      var face = [];
      var planta = [];
      var deflator_gardenterraco = 0.0;
      var porandarArr = [];
      var porandarBase = 0.0;
      for (var x = 0; x < estrategiasDeVendaArr.length; x++){
        const tipo = estrategiasDeVendaArr[x].get("tipo");
        if (tipo == "m2base"){
          m2Base = estrategiasDeVendaArr[x].get("base");
        } else if (tipo == "indexadorglobal"){
          indexadorGlobal = estrategiasDeVendaArr[x].get("base");
        } else if (tipo == "vagas"){
          vagas = estrategiasDeVendaArr[x].get("dequeforma");
        } else if (tipo == "comercial"){
          comercial = estrategiasDeVendaArr[x].get("dequeforma");
        } else if (tipo == "face"){
          face = estrategiasDeVendaArr[x].get("dequeforma");
        } else if (tipo == "planta"){
          planta = estrategiasDeVendaArr[x].get("dequeforma");
        } else if (tipo == "deflator_gardenterraco"){
          deflator_gardenterraco = estrategiasDeVendaArr[x].get("base");
        } else if (tipo == "porandar"){
          porandarArr = estrategiasDeVendaArr[x].get("dequeforma");
          porandarBase = estrategiasDeVendaArr[x].get("base");
        }
      }
      
      var vgvpredio = 0.0;

      for (var y = 0; y < tabelaDeVendasArr.length; y++){

        var andarDoAp = tabelaDeVendasArr[y].get("andar");
        var faceDoAp = tabelaDeVendasArr[y].get("face");
        var dormsDoAp = tabelaDeVendasArr[y].get("dorms");

        var areaPrivativaStr = tabelaDeVendasArr[y].get("areaprivativa");
        var terracosacadaStr = tabelaDeVendasArr[y].get("terracosacada");

        const areappp = areaPrivativaStr.replace(",", ".");
        const terracoppp = terracosacadaStr.replace(",", ".");
        var areaprivfl = parseFloat(areappp);
        var areaterrfl = parseFloat(terracoppp);

        var areaVendavel = areaprivfl + areaterrfl;
        if (areaterrfl > 9){
          areaVendavel = areaprivfl + (areaterrfl*(1-deflator_gardenterraco));
        }

        var construcaoDoPrecoporm2 = 0.0;
        construcaoDoPrecoporm2 += m2Base;

        for (var z = 0; z < planta.length; z++){
          const dorms = planta[z]["dorms"];
          if (dorms == dormsDoAp){
            tabelaDeVendasArr[y].set("peso_porplanta", planta[z]["indexador"]);
            construcaoDoPrecoporm2 += planta[z]["indexador"]
            continue;
          }
        }

        for (var z = 0; z < face.length; z++){
          const fc = face[z]["face"];
          if (fc == faceDoAp){
            construcaoDoPrecoporm2 += (face[z]["indexador"] * m2Base)
            continue;
          }
        }

        for (var z = 0; z < porandarArr.length; z++){
          const porandar = porandarArr[z]["andar"];
          if (porandar == andarDoAp){
            construcaoDoPrecoporm2 += ((porandarArr[z]["peso"] * porandarBase) * m2Base)
            continue;
          }
        }

        var valorDoAp = (construcaoDoPrecoporm2 * areaVendavel);
        valorDoAp += (valorDoAp * indexadorGlobal);
        vgvpredio += valorDoAp;
        tabelaDeVendasArr[y].set("valorvenda", valorDoAp);

      }

      console.log("Indexador global: " + indexadorGlobal);
      console.log("VGV predio: " + vgvpredio);

      res.statusCode = 200
      res.json({ erro: false, tabelaDeVendasArr: tabelaDeVendasArr });
    } catch (e){
      console.log(e);
      res.statusCode = 200
      res.json({ erro: true });
    }
  } else {
    res.statusCode = 200
    res.json({ erro: true, motivo: "Senha incorreta!" });
  }
}
