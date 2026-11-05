/* RR Lisp Library Exam — Google Apps Script backend
   Deploy this bound to a Google Sheet (see SETUP.md). No API key is
   ever exposed to the exam page — the deployed Web App URL is the
   only thing the client talks to, and it only ever appends/reads rows.
*/

var SHEET_NAME = 'Results';
var HEADERS = [
  'name','employeeId','email','set','total','correct','wrong','unanswered',
  'percent','pass','startedAt','submittedAt','durationSeconds','durationLabel',
  'autoSubmitted','submitted','answersJson'
];

function getSheet_(){
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet){
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
  }
  return sheet;
}

function respond_(obj){
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function findRowByEmail_(sheet, email){
  var data = sheet.getDataRange().getValues();
  var emailCol = HEADERS.indexOf('email');
  for (var i = 1; i < data.length; i++){
    if (String(data[i][emailCol]).toLowerCase().trim() === email){
      var obj = {};
      HEADERS.forEach(function(h, idx){ obj[h] = data[i][idx]; });
      return obj;
    }
  }
  return null;
}

// GET ?email=... -> existing result for duplicate-attempt check, or {found:false}
function doGet(e){
  var email = String((e.parameter && e.parameter.email) || '').toLowerCase().trim();
  if (!email) return respond_({ error: 'missing_email' });
  var sheet = getSheet_();
  var existing = findRowByEmail_(sheet, email);
  if (existing) return respond_(existing);
  return respond_({ found: false });
}

// POST body: JSON result payload (sent as text/plain to avoid CORS preflight)
function doPost(e){
  var payload;
  try{
    payload = JSON.parse(e.postData.contents);
  }catch(err){
    return respond_({ error: 'invalid_payload' });
  }
  if (!payload || !payload.email){
    return respond_({ error: 'invalid_payload' });
  }
  payload.email = String(payload.email).toLowerCase().trim();

  var sheet = getSheet_();
  if (findRowByEmail_(sheet, payload.email)){
    return respond_({ error: 'already_submitted' });
  }

  var row = HEADERS.map(function(h){
    if (h === 'answersJson') return JSON.stringify(payload.answers || []);
    return payload[h] !== undefined ? payload[h] : '';
  });
  sheet.appendRow(row);
  return respond_({ ok: true });
}
