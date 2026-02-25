# 🦷 UniDent Care Mobile

<p align="center">
<h1 align="center">🦷 UniDent Care Mobile</h1>
<p align="center">
A professional cross-platform mobile application for dental healthcare management.
Built with React Native & Expo to serve Patients, Doctors, and Dental Students.
</p>
</p>

<p align="center">
<img src="[https://img.shields.io/badge/Expo-52-black?logo=expo](https://www.google.com/search?q=https://img.shields.io/badge/Expo-52-black%3Flogo%3Dexpo)" alt="Expo" />
<img src="[https://img.shields.io/badge/React_Native-0.76-61DAFB?logo=react](https://www.google.com/search?q=https://img.shields.io/badge/React_Native-0.76-61DAFB%3Flogo%3Dreact)" alt="React Native" />
<img src="[https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)" alt="TypeScript" />
<img src="[https://img.shields.io/badge/NativeWind-4-06B6D4?logo=tailwindcss](https://www.google.com/search?q=https://img.shields.io/badge/NativeWind-4-06B6D4%3Flogo%3Dtailwindcss)" alt="NativeWind" />
</p>

---

## ⚡ Quick Start

```bash
# Install dependencies
npm install

# Start development server
npx expo start -c

```

Scan the QR code with **Expo Go** (Android/iOS) to view the app.

---

## 🛠️ Mobile Tech Stack

<table>
<tr>
<td><b>Framework</b></td>
<td>React Native (Expo SDK 52)</td>
</tr>
<tr>
<td><b>Navigation</b></td>
<td>Expo Router (File-based Routing)</td>
</tr>
<tr>
<td><b>Styling</b></td>
<td>NativeWind v4 (Tailwind CSS)</td>
</tr>
<tr>
<td><b>State</b></td>
<td>Redux Toolkit + RTK Query</td>
</tr>
<tr>
<td><b>Validation</b></td>
<td>Zod + React Hook Form</td>
</tr>
<tr>
<td><b>HTTP Client</b></td>
<td>Axios</td>
</tr>
<tr>
<td><b>Icons</b></td>
<td>Lucide React Native</td>
</tr>
<tr>
<td><b>Storage</b></td>
<td>Expo Secure Store / MMKV</td>
</tr>
</table>

---

## 📁 Project Structure (Feature-First)

The mobile app uses a hybrid structure between **Expo Router** for navigation and **Feature-based** logic for scalability:

```
src/
├── app/                          # 🚏 Expo Router (File-based Routing)
│   ├── (auth)/                   # Authentication Group
│   │   ├── login.tsx
│   │   ├── signup/               # Multi-role Signup
│   │   └── forget-password.tsx
│   ├── (tabs)/                   # Main App Navigation
│   │   ├── dashboard/            # Role-based Dashboards
│   │   ├── cases/                # Case Management
│   │   └── profile/              # User Settings
│   └── _layout.tsx               # Root Layout & Providers
│
├── features/                     # 🧠 Business Logic Modules
│   ├── auth/                     # Auth Logic, Hooks & Services
│   ├── cases/                    # Case handling & forms
│   ├── dashboard/                # Analytics & Stats logic
│   └── students/                 # Student-Doctor relationship
│
├── components/                   # 🧩 Shared UI Components
│   ├── ui/                       # Atom components (Buttons, Inputs)
│   └── shared/                   # Common Layout components
│
├── store/                        # 🏪 Redux Global State
├── services/                     # 🌐 Base API & Axios config
├── styles/                       # 🎨 Tailwind Global CSS
├── hooks/                        # 🛠️ Global Custom Hooks
└── types/                        # 🏷️ Global TypeScript Definitions

```

---

## 🧩 Feature Module Pattern

Each feature in `src/features/` is self-contained:

```
feature/
├── components/      # UI components specific to this feature
├── hooks/           # Feature-specific logic (e.g., useCaseSubmit)
├── schemas/         # Zod validation (Shared with Web)
├── screens/         # Main Screen UI
├── services/        # API calls (Axios/RTK Query)
└── types/           # Feature-specific types

```

---

## 🔗 Main Routes

| Route | Description |
| --- | --- |
| `/(auth)/login` | Secure User Login |
| `/(tabs)/dashboard` | Role-based Dashboard (Patient/Dr/Student) |
| `/(tabs)/cases` | List of Dental Cases |
| `/cases/[id]` | Detailed Case View |
| `/add-case` | Multi-step Case Creation |
| `/(tabs)/profile` | User Profile & App Settings |

---

## 📦 Key Dependencies

| Package | Purpose |
| --- | --- |
| `expo-router` | Modern file-based navigation |
| `nativewind` | Utility-first styling (Tailwind) |
| `@reduxjs/toolkit` | Global state management |
| `react-hook-form` | High-performance form handling |
| `lucide-react-native` | Beautiful & consistent icons |
| `axios` | Robust HTTP requests |