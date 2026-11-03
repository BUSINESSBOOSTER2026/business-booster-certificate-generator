# Business Booster – Certificate Generator

Plain HTML, CSS and JavaScript. No backend, no build step.

## Run
1. Open the `certificate-generator` folder in VS Code.
2. Right-click `index.html` → **Open with Live Server**.
3. Fill in the form. The preview updates as you type. Click **Download PDF**.

> Use Live Server (or any local web server) – opening `index.html` directly with `file://` blocks the background image from being exported.
> An internet connection is needed for Google Fonts and the PDF libraries (html2canvas, jsPDF, loaded from cdnjs).

## Form fields
Student name, certificate number, date of issue (calendar), duration, internship period (optional, the date range under the duration), description, QR code image, signature 1 and signature 2.

Description: wrap words in `**double asterisks**` to make them bold, e.g. `**Web Development**`.

## Files
- `assets/certificate-background.png` – original artwork with the personal details removed
- `index.html`, `styles.css`, `app.js`

## Tuning positions
All certificate text and image boxes are positioned in pixels on a 1600 × 1131 canvas at the bottom of `styles.css` (`.name`, `.desc`, `.duration`, `.qr`, `.sig1`, …). The PDF is rendered from the same canvas at 3× (4800 × 3393 px) onto an A4-landscape page.
