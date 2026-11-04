# Garviks store

Online store for Garviks Private Limited: projector screens, books, nuts and bolts, clothing and crackers.
Customers add products to a cart and place an order; the team confirms each order by phone or WhatsApp.

- `client/` – the website (React + Vite + Tailwind)
- `backend/` – the API (Express + MongoDB)

## Run locally

```bash
cd backend && cp .env.example .env   # fill in MONGO_URI, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
npm install && npm run dev            # API on http://localhost:5000
npm run seed                          # optional: adds the sample projector screen if the shop is empty

cd ../client && npm install && npm run dev   # site on http://localhost:5173
```

## Deploy on Vercel

Create **two** Vercel projects from this repo.

1. **Backend** – Root Directory `backend`. Environment variables:
   - `MONGO_URI` – connection string of the Garviks database (not the Imperial one)
   - `JWT_SECRET` – any long random string
   - `ADMIN_EMAIL`, `ADMIN_PASSWORD` – the admin login; the account is created automatically on first start
   - `CLIENT_URL` – the website address(es), comma separated, e.g. `https://garviks.vercel.app,https://www.garviks.com`
2. **Website** – Root Directory `client`, framework Vite. Environment variable:
   - `VITE_API_URL` – the backend address plus `/api`, e.g. `https://garviks-api.vercel.app/api`

Redeploy the website after changing `VITE_API_URL`, and the backend after changing its variables.
In MongoDB Atlas, allow network access from anywhere (0.0.0.0/0) so Vercel can connect.

## Admin

Go to `/admin-login` (also linked as "Staff login" in the footer). Only the admin account can add or edit
products and see orders and messages; the server checks this on every request.

To change the admin password: set the new `ADMIN_PASSWORD`, add `ADMIN_RESET_PASSWORD=true`, redeploy once, then remove `ADMIN_RESET_PASSWORD`.
