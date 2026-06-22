# Frontend Environment Variable Guide (`VITE_API_BASE_URL`)

This guide explains how the `VITE_API_BASE_URL` environment variable works across different stages of the CommodityGH development lifecycle.

---

## The Core Concept: Build-Time Ingestion

> [!IMPORTANT]
> **Vite environment variables are baked into static files at build time.**
> They do **not** run dynamically at runtime. When you run `npm run build`, Vite scans the source code for references to `import.meta.env.VITE_API_BASE_URL` and replaces them with the actual literal string defined in the environment.
>
> If you change your backend endpoint in production, you **must** rebuild and redeploy the frontend. Simply changing environment variables on S3 or CloudFront has no effect because the frontend runs entirely in the user's browser, not on a server.

---

## 1. Local Development Stage

During local development, you run a local Vite server (`npm run dev`).

- **Config File:** `.env` or `.env.local`
- **Default Value:** `http://localhost:8080/api/v1`
- **Mechanism:** Vite reads `.env` files automatically on server start. Any change requires a restart of the dev server (`npm run dev`) if Vite doesn't hot-reload it.
- **Symbolic usage:**
  ```ts
  const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL, // Resolves to local backend
  });
  ```

---

## 2. CI/CD Pipeline Build Stage

When code is pushed to the `main` branch, the GitHub Actions pipeline builds the frontend.

- **Config Source:** GitHub Repository Secret named `APP_RUNNER_URL`
- **Execution:** Inside [.github/workflows/deploy-frontend.yml](file:///.github/workflows/deploy-frontend.yml):
  ```yaml
        env:
          VITE_API_BASE_URL: ${{ secrets.APP_RUNNER_URL }}
        run: |
          npm ci
          npm run build
  ```
- **Result:** The resulting HTML/JS/CSS files in the `dist` folder will have all API endpoints hardcoded to the value of your App Runner URL (e.g. `https://xxxxxx.us-east-1.awsapprunner.com/api/v1`).

---

## 3. Production Deployment Stage

Once built, the static bundle in the `dist` folder is synced to Amazon S3 and served via CloudFront.

- **No Runtime Variables:** S3 only stores static files.
- **Cache-Control:**
  - `index.html` is cached with `no-store, no-cache`, ensuring browser checks for new updates on every request.
  - Assets (`/assets/*`) are cached with `max-age=31536000, immutable` because they are versioned by name.
- **Browser Fetching:** When users load `https://<your-domain>`, their browser downloads the JavaScript which automatically sends API requests directly to the pre-compiled `VITE_API_BASE_URL` (AWS App Runner).

---

## Checklist for New Environments

If you need to stand up a staging or test environment:
1. Obtain the backend App Runner URL.
2. In GitHub, go to **Settings > Secrets and variables > Actions** and update or add the secret `APP_RUNNER_URL`.
3. Trigger a push to `main` or run the workflow manually to trigger a rebuild.
4. Verify the frontend makes requests to the new backend by opening the browser DevTools Network tab.
