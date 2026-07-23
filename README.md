# Coffee House POS System

A premium, enterprise-style Cafe POS web app built with React 19, Vite, Tailwind CSS, Framer Motion, React Router, React Hook Form, React Hot Toast and Recharts. Arabic-first with full RTL support and an English toggle.

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL (default `http://localhost:5173`).

Login screen is pre-filled with demo credentials — just click **Sign In** (any email/password works, it's mocked).

## Build

```bash
npm run build
npm run preview
```

## Project structure

```
src/
  components/
    ui/          reusable primitives (Button, Card, Modal, DataTable, StatCard, Toggle, Skeletons, ...)
    layout/      Sidebar, Navbar, MainLayout, ProtectedRoute
  context/       AuthContext, LanguageContext (RTL/EN), AppDataContext (CRUD mock state), OrderContext (POS cart)
  data/          mock data: categories, products, tables (dynamic generator), orders, employees, translations
  pages/         Login, Dashboard, POS, Orders, Tables, MenuItems, Categories, Reports, Employees, Settings, NotFound
  utils/         formatting helpers
```

## Notes

- All data is in-memory mock data (see `src/data`) wired through `AppDataContext` — wire up `axios` calls to your backend by replacing the state setters with API calls.
- Language/RTL toggle is in the navbar (globe icon) and login screen; it flips `dir`/`lang` on `<html>` and swaps all UI strings.
- Tables page renders however many tables exist in state — add/delete freely, the grid reflows automatically (`auto-fill` grid).
- Colors, radii, shadows and spacing are centralized in `tailwind.config.js` to keep every page visually consistent.
- Toast notifications use `react-hot-toast`, mounted once in `App.jsx`.
