/**
 * Tarbiya platformasi: diagnostika natijalarini Google Sheets jadvaliga yozish.
 * O‘rnatish tartibi README.md faylida.
 */
var SHEET_NAME = "Natijalar";
var HEADERS = ["Sana", "F.I.Sh.", "Maktab", "Sinf", "Guruh", "Bosqich", "Test (%)", "So‘rovnoma (%)", "Umumiy (%)", "Daraja", "Javoblar"];

function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS);
  sheet.appendRow([
    new Date(data.date), data.name, data.school, data.cls, data.group, data.stage,
    data.test, data.survey, data.total, data.level, JSON.stringify(data.answers)
  ]);
  return ContentService.createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
