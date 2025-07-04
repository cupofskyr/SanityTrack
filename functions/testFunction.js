const functions = require("firebase-functions");

exports.testFunction = functions.https.onRequest((req, res) => {
  res.send("Hello from testFunction!");
});