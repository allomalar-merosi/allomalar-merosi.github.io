/* google-apps-script/Code.gs faylini yig‘adi: node tools/build-gs.js */
var fs = require("fs");
var path = require("path");
var root = path.join(__dirname, "..");
var core = fs.readFileSync(path.join(root, "assets/core.js"), "utf8").replace(/\nif \(typeof module[^\n]*\n?/, "\n");
var adapter = fs.readFileSync(path.join(root, "google-apps-script/adapter.gs.js"), "utf8");
var head = "/* Allomalar merosi platformasi — server (Google Apps Script).\n" +
  "   Bu fayl avtomatik yig‘ilgan: assets/core.js + google-apps-script/adapter.gs.js.\n" +
  "   O‘rnatish tartibi README.md da. */\n\n";
fs.writeFileSync(path.join(root, "google-apps-script/Code.gs"), head + core + "\n" + adapter);
console.log("Code.gs yig‘ildi");
