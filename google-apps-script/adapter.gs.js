/* ---- Google Sheets ombori va veb-ilova kirish nuqtasi ---- */

/* Skript jadvalga bog‘langan bo‘lsa, o‘sha jadval ishlatiladi.
   Mustaqil skript bo‘lsa, birinchi so‘rovda yangi jadval yaratilib, manzili saqlab qo‘yiladi. */
function spreadsheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (ss) return ss;
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty("SHEET_ID");
  if (id) return SpreadsheetApp.openById(id);
  ss = SpreadsheetApp.create("Allomalar merosi — natijalar");
  props.setProperty("SHEET_ID", ss.getId());
  return ss;
}

function sheetStore_() {
  var ss = spreadsheet_();
  var cache = {};
  function sheet(table) {
    var sh = ss.getSheetByName(table);
    if (!sh) {
      sh = ss.insertSheet(table);
      sh.getRange(1, 1, sh.getMaxRows(), TABLES[table].length).setNumberFormat("@");
      sh.getRange(1, 1, 1, TABLES[table].length).setValues([TABLES[table]]).setFontWeight("bold");
      sh.setFrozenRows(1);
    }
    return sh;
  }
  function load(table) {
    if (!cache[table]) {
      var cols = TABLES[table];
      var values = sheet(table).getDataRange().getValues().slice(1);
      cache[table] = values.map(function (row) {
        var o = {};
        cols.forEach(function (c, i) { o[c] = row[i] === undefined ? "" : String(row[i]); });
        return o;
      });
    }
    return cache[table];
  }
  function rowIndex(table, id) {
    var rows = load(table);
    for (var i = 0; i < rows.length; i++) if (rows[i].id === id) return i;
    return -1;
  }
  return {
    rows: function (table) { return load(table).map(function (r) { var o = {}; for (var k in r) o[k] = r[k]; return o; }); },
    add: function (table, rec) {
      var cols = TABLES[table];
      var sh = sheet(table);
      var row = cols.map(function (c) { return rec[c] == null ? "" : String(rec[c]); });
      sh.getRange(sh.getLastRow() + 1, 1, 1, cols.length).setNumberFormat("@").setValues([row]);
      var o = {};
      cols.forEach(function (c, i) { o[c] = row[i]; });
      load(table).push(o);
    },
    update: function (table, id, patch) {
      var i = rowIndex(table, id);
      if (i < 0) return;
      var cols = TABLES[table];
      var rec = load(table)[i];
      for (var k in patch) rec[k] = String(patch[k]);
      sheet(table).getRange(i + 2, 1, 1, cols.length).setValues([cols.map(function (c) { return rec[c]; })]);
    },
    remove: function (table, id) {
      var i = rowIndex(table, id);
      if (i < 0) return;
      sheet(table).deleteRow(i + 2);
      load(table).splice(i, 1);
    }
  };
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var req = JSON.parse(e.postData.contents);
    var handle = createCore(sheetStore_(), { now: function () { return Date.now(); }, random: Math.random });
    return json_(handle(req));
  } catch (err) {
    return json_({ ok: false, error: "Server xatosi: " + err.message });
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  try {
    var ss = spreadsheet_();
    return json_({ ok: true, service: "Allomalar merosi platformasi", sheet: ss.getUrl(), time: new Date().toISOString() });
  } catch (err) {
    return json_({ ok: false, error: "Server xatosi: " + err.message });
  }
}
