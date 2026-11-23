# Neurolink – Personal Study Wiki

A production-ready, single-user knowledge-base website where study notes are stored as interlinked hypertext pages (like Wikipedia). Built with a calm, tactile "Marginalia" visual design direction inspired by well-worn technical manuals and annotated textbooks.

---

## 1. Architecture and Tech Stack

- **Framework**: React 18 + TypeScript (strict mode) + Vite
- **Routing**: React Router v6
- **Styling**: Tailwind CSS + `@tailwindcss/typography`
- **Rich-text Editor**: Tiptap v2 (ProseMirror-based) with custom `[[wikiLink]]` nodes & suggestions
- **Database**: Firebase Firestore (modular v9+ SDK) with offline persistence (`persistentLocalCache`)
- **Authentication**: Firebase Authentication (Google sign-in) for owner-only editing
- **Client Search**: MiniSearch in-memory full-text index cached in IndexedDB (`idb-keyval`)
- **Data Caching**: TanStack Query (React Query) v5 with 5-minute stale-times
- **Typography**: Self-hosted via `@fontsource`
  - Body & Headings: **Literata**
  - Interface text: **Atkinson Hyperlegible**
  - Code & Monospace: **IBM Plex Mono**

---

## 2. Marginalia Visual Direction

- **The Rail & Margins**: 3-column desktop layout (Left navigation & trail, center 66ch article, right "On this page" TOC and "Linked from" backlinks).
- **The Trail**: Persistent trail tracking topics followed during the session (last 8 visited nodes with slide-in entrance).
- **Wiki-links**:
  - Existing target: Biro blue (`--biro`), solid 1px underline with 3px offset (thickens on hover), 400ms hover preview showing summary.
  - Missing target: Redline (`--redline`), dashed underline. Clicking triggers the creation form with the title prefilled for the owner.
- **Marker Highlight**: Marker yellow (`--marker`) on user highlights and search match terms with clone box-decoration.

---

## 3. Setup and Installation

### 3.1 Install Dependencies
```bash
npm install
```

### 3.2 Firebase Configuration
1. Create a project at [Firebase Console](https://console.firebase.google.com).
2. Enable **Authentication** and add the **Google** sign-in provider.
3. Enable **Cloud Firestore** in production mode.
4. Copy your web app configuration into `.env` (refer to `.env.example`):
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_OWNER_UID=your_auth_uid_here
```

### 3.3 Finding Your Owner UID
1. Sign in once using Google in your app (at `/login`).
2. Go to Firebase Console -> **Authentication** -> **Users** table.
3. Copy the **User UID** string for your Google account.
4. Paste it into `VITE_OWNER_UID` in `.env` and replace `'REPLACE_WITH_OWNER_UID'` in `firestore.rules`.
5. Deploy rules: `firebase deploy --only firestore:rules`.

---

## 4. Running Locally

### Development Server
```bash
npm run dev
```

### Using Firebase Emulators (Optional)
```bash
npm run emulators
```
Set `VITE_USE_FIREBASE_EMULATOR=true` in your `.env` when developing against local emulators.

### Seeding Initial Study Notes
```bash
npm run seed
```
Seeds 10 interconnected computer science study notes (Binary Search, Big-O Notation, Arrays, Recursion, Hash Tables, etc.).

---

## 5. Testing and Linting

- **Run Unit Tests**: `npm run test`
- **Build Production Bundle**: `npm run build`
- **Preview Production Build**: `npm run preview`

---

## 6. Deployment to Firebase Hosting

```bash
npm run build
firebase deploy
```

---

## 7. Future Considerations (Out of Scope for MVP)
- Automatic topic renaming with link refactoring across existing notes.
- Historical revision diffing / version history.
- Image uploads and diagram rendering.
- Interactive link graph visualizer.
- Markdown and PDF export.
