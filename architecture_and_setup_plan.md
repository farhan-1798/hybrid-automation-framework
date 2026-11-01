# Framework Decisions & Architecture Specification

## 1. Project Decision: Target Application
* **Selected Option:** Option A (The E-commerce Flow - Sauce Labs Swag Labs)
* **Web Application:** `https://www.saucedemo.com`
* **Mobile Application:** Sauce Labs React Native Demo App (`saucelabs/my-demo-app-rn`)
* **Rationale:** Both platforms share identical user journeys, authentication flows, product catalogs, and checkout steps. This creates 1:1 symmetry across business actions without idiosyncratic mobile workarounds (such as Wikipedia's complex onboarding tour and differing search mechanics).

---

## 2. Core Architecture: Adapter & Factory Pattern

```
                       +-----------------------------+
                       |     login.spec.ts           |
                       |  (Agnostic Business Logic)  |
                       +--------------+--------------+
                                      |
                                      v
                       +-----------------------------+
                       |         Factory.ts          |
                       |  (Resolves PLATFORM env)    |
                       +-------+-------------+-------+
                               |             |
           +-------------------+             +-------------------+
           |                                                     |
           v                                                     v
+-----------------------+                             +-----------------------+
|     WebLogin.ts       |                             |    MobileLogin.ts     |
|   (Playwright Page)   |                             |    (Appium / WDIO)    |
+-----------+-----------+                             +-----------+-----------+
            |                                                     |
            +------------------> [ ILogin.ts ] <------------------+
                               (Interface Contract)
```

1. **Interface Contract (`ILogin.ts`, `ICheckout.ts`, `IInventory.ts`):**
   Defines pure business capabilities without UI locators or framework references.
2. **Platform Adapters (`WebLogin.ts`, `MobileLogin.ts`):**
   Implement contracts using platform-specific drivers:
   * Web: Playwright locators and actions (`page.locator()`, `page.fill()`).
   * Mobile: WebdriverIO / Appium actions (`$('~test-Username')`, `browser.setValue()`).
3. **Page Factory (`Factory.ts`):**
   Instantiates and supplies the correct adapter based on `process.env.PLATFORM` (`web` or `mobile`).
4. **Unified Test Runner:**
   `@playwright/test` manages test discovery, execution, assertions, fixtures, and reporting for both web and mobile runs.

---

## 3. Required Dependencies & Rationale

### A. Core Runtime & TypeScript
* `typescript`: Static type system for interface enforcement and strict typing.
* `@types/node`: Node.js platform type definitions (filesystem, environment variables, streams).
* `ts-node`: Executes TypeScript utility scripts (e.g., APK downloader) directly without manual build steps.

### B. Web Engine & Unified Test Runner
* `@playwright/test`: Universal test runner (fixtures, test lifecycle, reporting) and browser automation engine for Web runs.

### C. Mobile Engine (Appium & WebdriverIO)
* `webdriverio`: Standalone client library to communicate with Appium server via W3C WebDriver protocol inside Mobile adapters.
* `appium`: Node.js-based mobile test automation orchestrator.
* `appium-uiautomator2-driver`: Official Appium driver automating native Android apps via Google's UiAutomator2 framework.
* `@types/webdriverio`: TypeScript definitions for WDIO commands, locators, and options.

### D. Environment & Orchestration
* `dotenv`: Environment variable loader from `.env` files.
* `cross-env`: Cross-platform command-line environment variable setter (supporting Linux, macOS, and Windows).

### E. Reporting & Code Quality
* `allure-playwright`: Playwright reporter generating Allure-compatible test execution artifacts.
* `allure-commandline`: CLI generator to compile Allure JSON into a standalone interactive HTML dashboard.
* `eslint` & `@typescript-eslint/parser` & `@typescript-eslint/eslint-plugin`: Enforces code standards and interface compliance.
* `prettier`: Automatic code formatter across the repository.

### F. External System Dependencies
* **JDK 17 or 21:** Required by the Android SDK and Appium UiAutomator2 server.
* **Android SDK Command-Line Tools & Platform Tools (`adb`):** Required for emulator interaction, APK installation, and UI hierarchy inspection.

---

## 4. Android APK Facilitation Strategy

### Sourcing
* **Source:** Official Sauce Labs open-source releases: `https://github.com/saucelabs/my-demo-app-rn/releases`
* **Release Artifact:** `Android-MyDemoAppRN.1.3.0.build-244.apk`

### Storage & Repository Hygiene
* Binary `.apk` files are kept out of Git version control via `.gitignore` (`apps/*.apk`).
* Local automated download script (`scripts/download-apk.ts`) pulls the verified APK when needed (`npm run fetch:apk`).

### Dynamic Capability Resolution
* The mobile adapter configuration resolves APK location dynamically via environment variables with a safe fallback:
  ```typescript
  app: process.env.APP_PATH || path.resolve(__dirname, "../apps/saucedemo.apk")
  ```
* **Emulator Configuration:**
  * Device: `Medium_Phone_API_37.0`
  * RAM Allocated: **6144 MB (6 GB)**
  * Heap Size: **576 MB**
  * Hardware Acceleration: Linux KVM enabled via BIOS Intel VT-x

---

## 5. Execution Commands & Allure Reporting Workflow

* **`npm run web`**:
  * Runs Web automation in headed mode (Chromium browser visible on screen).
  * Automatically compiles and launches the interactive Allure report in the default browser upon completion.
* **`npm run android`**:
  * Runs Mobile automation on the Android emulator/device via Appium.
  * Automatically compiles and launches the interactive Allure report in the default browser upon completion.
* **`npm run all`**:
  * Executes both Web (headed) and Android test suites in sequence.
  * Combines all test runs into a single Allure report and opens it in the default browser.
* **`npm run getReport`**:
  * Fallback command to compile and open the latest Allure report at any time.
* **`npm run fetch:apk`**:
  * Pulls the verified Sauce Labs demo APK directly from GitHub releases.


### CI/CD Caching (GitHub Actions)
* In GitHub Actions, the APK is cached using `actions/cache` against the version tag, downloading only on cache misses before launching the Android Emulator runner.

