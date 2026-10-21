# NEONMART

Next.js 14 e-commerce. Colours: Jet Black #0A0A0A, Cerulean Blue #007BA7, Neon Rose #FF2D95.

## Vercel pe deploy
1. Folder ko GitHub repo me push karo, Vercel me Import karo (framework auto-detect hoga).
2. Vercel > Storage / Marketplace se **Upstash Redis** add karo (free). Ye KV_REST_API_URL aur KV_REST_API_TOKEN khud daal dega.
3. Environment Variables: `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` (.env.example dekho).
4. Deploy. `/login` pe admin email/password se login karo, ye seedha `/admin` pe le jayega.

ADMIN_EMAIL / ADMIN_PASSWORD sirf pehli baar (jab database khali ho) use hote hain.

## Local
```
npm install
npm run dev
```
Bina Redis ke data memory me rehta hai, server restart pe reset.

## Kya kya hai
- Home, product pages (SEO metadata, Open Graph, JSON-LD), sitemap.xml, robots.txt
- Register/Login (bcrypt + JWT httpOnly cookie)
- Cart, checkout (COD), user panel `/account` with order tracking
- Admin `/admin`: products CRUD, orders status, store/SEO settings, stats
