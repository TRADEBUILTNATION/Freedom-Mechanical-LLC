## Freedom Mechanical LLC — Website Starter

This is a lightweight static starter focused on a modern, animated navigation.

### Online booking → send to your email (free + simple)

This project is a **static website** (no server), so the simplest free option is to use a form‑to‑email service.
This site is already set up to send completed booking details via **FormSubmit**.

Works the same on **Cloudflare Pages**: the browser submits the booking details to FormSubmit, and FormSubmit forwards it to your email.

- **Step 1 — Set your email**
  - Open `script.js`
  - Find:
    - `const BOOKING_EMAIL_TO = "YOUR_EMAIL_HERE@example.com";`
  - Replace it with your business email, for example:
    - `const BOOKING_EMAIL_TO = "freedommechanicalcompany@gmail.com";`

- **Step 2 — Do a test booking**
  - Open the site and click **“Schedule Online Here!”**
  - Fill out all steps and finish scheduling
  - FormSubmit will email you a **one-time confirmation** link — click **Confirm**

- **Step 3 — Done**
  - After confirmation, every completed booking will automatically email you the customer’s:
    - name, phone, email
    - system + equipment
    - service type
    - address
    - symptom/details
    - date/time window

Notes:
- **Photos**: browsers don’t allow re-sending selected photo files automatically after the step changes, so the email includes the **photo file names** only. If you want photo attachments in the email, that requires a paid service or a small backend.
- **First-time activation**: FormSubmit sends a **one-time confirmation email** the first time you submit. Check spam/junk and click **Confirm**, or you won’t receive submissions.
- **Spam protection**: FormSubmit includes a basic “honeypot” field; if you get spam, we can turn on captcha or add an extra verification step.

### Run it

- **Quickest**: open `index.html` in your browser.
- **Recommended** (local server):

```powershell
cd "C:\Users\kenth\Desktop\Fredom Mechanical LLC"
python -m http.server 5173
```

Then visit `http://localhost:5173`.

### Customize

- **Navigation links**: `index.html`
- **Look & feel**: `styles.css`
- **Menu behavior**: `script.js`


