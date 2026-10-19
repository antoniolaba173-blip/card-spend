# Card Spend

A small phone app for logging every credit card payment. Both phones write to the same Google Sheet.

- Works on iPhone and Android: open the link, then "Add to Home Screen".
- Each entry has amount (AED), category, where, card, date, who, and an optional note.
- Shows the month total against your budget, the split between the two of you, and spend by category.
- Works offline. Entries wait on the phone and sync when you're back online.
- Data lives only in your Google Sheet. This repo holds code only, never your numbers or your PIN.

## One-time setup (about 10 minutes)

### 1. Google Sheet (the shared storage)
1. Create a new Google Sheet, e.g. "Card Spend".
2. Go to **Extensions → Apps Script**. Delete what's there and paste in `Code.gs`.
3. On the first line with `TOKEN`, change `CHANGE-ME-TO-A-SECRET` to a PIN only the two of you know.
4. Click **Deploy → New deployment**. Under type, choose **Web app**:
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Click **Deploy**, allow the permissions, and copy the **Web app URL** (it ends in `/exec`).

"Anyone" means the URL can be reached, but nothing gets read or written without the PIN.

### 2. GitHub Pages (the app)
1. Upload these files to a GitHub repo.
2. Go to **Settings → Pages**. Under Source choose **Deploy from a branch**, then branch `main` and folder `/ (root)`, then **Save**.
3. After about a minute the app is live at `https://<your-username>.github.io/<repo-name>/`.

### 3. Phones
1. Open the app link on your phone and tap **Settings**. Paste the Web app URL and the PIN, choose who the phone belongs to, then **Save**.
2. Tap **Copy setup link for the other phone** and send it privately to the other person. Opening it once sets up their phone. They then pick their own name in Settings.
3. On each phone, add the app to the home screen:
   - iPhone: Safari → Share → Add to Home Screen
   - Android: Chrome → ⋮ → Add to Home screen

## Changing things
- Categories: the `CATS` list near the top of the script in `index.html`.
- Cards, names and monthly budget: Settings in the app.
- If you edit `Code.gs`, deploy again with **Deploy → Manage deployments → Edit → New version**. The URL stays the same.
