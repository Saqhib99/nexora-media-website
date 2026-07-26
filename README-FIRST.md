# Nexora Media Premium Website

A production-ready static website for Nexora Media.

## Files

- `index.html`
- `styles.css`
- `script.js`
- `images/logo.png`
- `images/logo-dark.png`
- `images/favicon.svg`
- `robots.txt`
- `sitemap.xml`
- `site.webmanifest`
- `CNAME`

## Start in VS Code

1. Extract the zip.
2. Open the extracted folder in VS Code.
3. Install the VS Code extension **Live Server**.
4. Right-click `index.html` and select **Open with Live Server**.
5. Test Home, About, Services, Portfolio, FAQ, Contact, dark/light mode, mobile menu, and contact form.

## Web3Forms Status

The Web3Forms access key has already been added to:

- `index.html`
- `script.js`

The form submits through:

```text
https://api.web3forms.com/submit
```

Test from Live Server. After submitting, check the inbox, spam, or promotions folder of:

```text
teamnexoramediain@gmail.com
```

If you ever create a new Web3Forms key later, replace the old key in both `index.html` and `script.js`.

## How To Change The Logo Later

This website supports separate logos for light and dark mode.

Replace these two files while keeping the same names:

```text
images/logo.png
images/logo-dark.png
```

Use `images/logo.png` for light mode.
Use `images/logo-dark.png` for dark mode.

If your logo works on both light and dark backgrounds, you can use the same design for both filenames.

## Portfolio Videos

The portfolio videos are intentionally in a horizontal row layout on desktop.

Replace each iframe `src` in `index.html` with your real YouTube embed links.

Example:

```html
<iframe src="YOUR_YOUTUBE_EMBED_LINK"></iframe>
```

## Replace Placeholder Domain Before Going Live

Before final publishing, replace placeholder domain values:

```text
https://www.yourdomain.com/
www.yourdomain.com
```

Update these files:

- `index.html`
- `sitemap.xml`
- `robots.txt`
- `CNAME`

## GitHub Pages Deployment

1. Create a new GitHub repository.
2. Upload/push all project files to the repository root.
3. Go to repository **Settings**.
4. Open **Pages**.
5. Under **Build and deployment**, select:
   - Source: `Deploy from a branch`
   - Branch: `main`
   - Folder: `/root`
6. Save.
7. GitHub will provide a Pages URL.

## Connect GoDaddy Domain to GitHub Pages

For apex/root domain:

```text
Type: A
Name: @
Value: 185.199.108.153

Type: A
Name: @
Value: 185.199.109.153

Type: A
Name: @
Value: 185.199.110.153

Type: A
Name: @
Value: 185.199.111.153
```

For www:

```text
Type: CNAME
Name: www
Value: YOUR-GITHUB-USERNAME.github.io
```

Then go back to GitHub Pages settings, add your custom domain, wait for DNS check, and enable **Enforce HTTPS**.

## Latest Fixes Included

- Contact form access key added.
- FAQ accordion spacing fixed.
- FAQ open/close behavior fixed for mobile and desktop.
- Logo visibility improved in dark mode.
- Separate dark-mode logo added.
- Header logo no longer appears squeezed.
- Custom cursor changed to a cleaner premium dot/ring style.
- Portfolio remains a horizontal video row.
- About, Portfolio, FAQ, and Contact reveal animations fixed.
