function advancedLinkMonitor() {

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Links");
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return;

  const data = sheet.getRange(2, 1, lastRow - 1, 1).getValues();

  const statusOut = [];
  const timestampOut = [];
  const now = new Date();

  data.forEach((row, i) => {

    let url = row[0];

    if (!url) {
      statusOut.push([""]);
      timestampOut.push([""]);
      return;
    }

    if (!/^https?:\/\//i.test(url)) {
      url = "https://" + url;
    }

    const api = "https://api.microlink.io/?url=" + encodeURIComponent(url);

    let status = "Warning";
    let code = "Error";

    try {
      const res = UrlFetchApp.fetch(api, {
        muteHttpExceptions: true
      });

      const json = JSON.parse(res.getContentText());

      if (json.status === "success") {
        code = 200;
        status = "Active";
      } else if (json.status === "fail") {
        code = 404;
        status = "Broken";
      }

    } catch (e) {
      status = "Warning";
      code = "Error";
    }

    statusOut.push([`${status} (${code})`]);
    timestampOut.push([now]);

    Logger.log(`${i + 2}: ${status} → ${url}`);
  });

