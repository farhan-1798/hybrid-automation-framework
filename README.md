# Unified Hybrid Automation Framework (Web & Android)

A production-grade, platform-agnostic automation framework built with **TypeScript**, **Playwright**, and **WebdriverIO (Appium 2)**. 

Tests are written using pure business logic contracts with **zero platform-specific locators** in the test specifications. The framework dynamically binds either Playwright web locators or Appium native mobile locators at runtime based on the target execution environment.

---

## 🏛️ Architecture Overview

The framework decouples business test specifications from UI driver implementations using the **Adapter Pattern** and an **Abstract Page Factory**:

```
                       ┌────────────────────────────────────────┐
                       │        login.spec.ts                   │
                       │    (Agnostic Business Logic)           │
                       │  "await loginPage.login(u, p)"         │
                       └───────────────────┬────────────────────┘
                                           │
                                           ▼
                       ┌────────────────────────────────────────┐
                       │             PageFactory                │
                       │      (Reads process.env.PLATFORM)      │
                       └───────────┬────────────────┬───────────┘
              PLATFORM="web"       │                │    PLATFORM="android"
                                   ▼                ▼
     ┌──────────────────────────────────┐      ┌──────────────────────────────────┐
     │            WebLogin              │      │           MobileLogin            │
     │      (src/adapters/web/)         │      │      (src/adapters/mobile/)      │
     ├──────────────────────────────────┤      ├──────────────────────────────────┤
     │ Driver: Playwright (Page)        │      │ Driver: Appium / WebdriverIO     │
     │ Locators: CSS / data-test        │      │ Locators: Accessibility IDs      │
     │ Target: saucedemo.com            │      │ Target: SauceDemo RN APK         │
     └──────────────────────────────────┘      └──────────────────────────────────┘
```

### Key Highlights
* **Zero Locator Bleed:** Test specs talk only to TypeScript interfaces (`ILogin`, `IInventory`, `ICheckout`).
* **True Hybrid Execution:** The exact same spec (`tests/login.spec.ts`) runs on Google Chrome and the Android Emulator.
* **Auto-Reporting:** All test runs compile an interactive **Allure Report** and automatically open it in your default browser.
* **Smart Appium Auto-Start:** Android test commands automatically check and spin up the Appium 2 server on demand.

---

## 🚀 Quick Start

### 1. Prerequisites
* **Node.js** (v18 or higher)
* **Java Development Kit (JDK 17+)**
* **Android SDK & Command-Line Tools** (configured with hardware acceleration via KVM)

### 2. Installation
```bash
# Clone the repository
git clone <your-repository-url>
cd hybrid-automation-framework

# Install dependencies
npm install

# Fetch official SauceDemo APK (kept out of git history)
npm run fetch:apk
```

---

## 🧪 Running Tests

### Web Automation (Headed Mode)
Runs tests against `saucedemo.com` in Chromium and automatically opens the Allure dashboard upon completion:
```bash
npm run web
```

### Android Mobile Automation
Executes tests against the Sauce Labs Native Android Demo app on a running emulator or physical device:
```bash
npm run android
```

### Full Cross-Platform Suite
Executes both Web and Android suites sequentially and aggregates the results into a unified Allure report:
```bash
npm run all
```

### View Allure Report
Re-generates and launches the Allure HTML dashboard in your default browser at any time:
```bash
npm run getReport
```

---

## 📂 Project Structure

```text
├── apps/                        # Android APK storage (git-ignored)
├── scripts/
│   ├── download-apk.js          # Automated APK fetcher
│   ├── open-report.js           # Lightweight Allure report server & browser launcher
│   └── run-tests.js             # Cross-platform test orchestrator
├── src/
│   ├── adapters/
│   │   ├── web/                 # Playwright web page objects
│   │   │   ├── WebLogin.ts
│   │   │   ├── WebInventory.ts
│   │   │   └── WebCheckout.ts
│   │   └── mobile/              # Appium native Android page objects
│   │       ├── MobileLogin.ts
│   │       ├── MobileInventory.ts
│   │       └── MobileCheckout.ts
│   ├── config/
│   │   └── mobile.config.ts     # Appium capabilities & Android SDK path resolution
│   ├── contracts/               # Platform-agnostic TypeScript interfaces
│   │   ├── ILogin.ts
│   │   ├── IInventory.ts
│   │   └── ICheckout.ts
│   ├── factory/
│   │   └── PageFactory.ts       # Runtime platform router
│   └── fixtures/
│       └── testFixture.ts       # Playwright custom test fixture with lazy mobile driver
├── tests/
│   ├── login.spec.ts            # Agnostic authentication tests
│   └── checkout.spec.ts         # Agnostic end-to-end checkout tests
├── playwright.config.ts         # Playwright & Allure reporter configuration
├── tsconfig.json                # TypeScript NodeNext configuration
└── package.json
```

---

## 📄 License
MIT License. Created for test automation engineering portfolios.
