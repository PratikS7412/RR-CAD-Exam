# RR Lisp Library Exam — Setup

Four files, all in this folder:
- `exam.html` — the exam app (what test-takers open)
- `exam_data.js` — all 1,750 questions + the roster from `User_Set_Assignment.md`
- `logo.png` — RR Global logo shown in the header
- `Code.gs` — Google Apps Script backend that records results to a Google Sheet

No local server, no API key in the page. Works from any machine with internet access.

## 1. Deploy the backend (one-time)

1. Go to [sheets.google.com](https://sheets.google.com) and create a new blank spreadsheet. Name it e.g. "RR Lisp Exam Results".
2. In the sheet, open **Extensions → Apps Script**.
3. Delete the placeholder code in the editor and paste the full contents of `Code.gs`.
4. Click **Deploy → New deployment**.
   - Type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Click **Deploy**, authorize when prompted, and copy the **Web app URL** (it ends in `/exec`).

That URL is not a secret — it can only append a row or read back a result for a given email, nothing else.

## 2. Point the exam at it

Open `exam_data.js`, find:
```js
apiBase: "",
```
and paste the Web app URL between the quotes:
```js
apiBase: "https://script.google.com/macros/s/XXXXXXXXXXXX/exec",
```
Save.

## 3. Host or distribute `exam.html`

Since it now needs no local server, you can:
- Upload the whole `RR_Exam_App` folder to any static host (SharePoint, a shared drive, GitHub Pages, etc.) and share the link to `exam.html`, or
- Just email/share the folder and have people open `exam.html` directly in a browser.

Either way, `exam.html` and `exam_data.js` must stay in the same folder.

## Notes

- Each email in `User_Set_Assignment.md` gets exactly one attempt — the Apps Script backend rejects a second submission for the same email, and the exam page also remembers completed attempts locally.
- Results land as rows in the "Results" sheet tab, including a `answersJson` column with the raw answer choices if you need to audit a specific attempt.
- The answer key lives inside `exam_data.js` in plain text — anyone who views page source can read it. Fine for an honor-system internal exam; don't reuse this question bank for anything higher-stakes without server-side grading.
- If `apiBase` is left blank, the exam still runs and scores locally, but results only save as a downloadable `.json` file the test-taker must send you manually.
