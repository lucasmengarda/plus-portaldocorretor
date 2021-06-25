// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

var Parse = require('parse/node');

var Statics = require('./statics');

Parse.initialize(Statics.APPLICATION_ID, "");
Parse.serverURL = Statics.SERVER_URL;
Parse.javaScriptKey = Statics.JAVASCRIPT_KEY;

export default async (req, res) => {

  console.log("Usuário: " + req.query.usuario);
  console.log("Senha: " + req.query.pass);

  try {
    const user = await Parse.User.logIn(req.query.usuario, req.query.pass);
    res.statusCode = 200;
    console.log(user.getSessionToken().toString());
    res.json({ erro: false, tipousuario: "corretor", sessionToken: user.getSessionToken().toString() });
  } catch (e) {
    res.statusCode = 200
    res.json({ erro: true });
    return;
  }
}
