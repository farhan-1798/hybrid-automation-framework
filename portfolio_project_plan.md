# Unified Web & Android Automation Framework 

## 1. Target Applications (Free to Automate)
Choose one of these pairs to demonstrate your ability to automate the *same* business logic across different platforms:

*   **Option A: The E-commerce Flow (Swag Labs by SauceLabs)**
    *   **Web:** `saucedemo.com`
    *   **Mobile:** SauceLabs React Native Demo App (APK available on GitHub).
    *   **Why it's great:** Designed specifically for automation. Perfect for building a unified `ICheckout` and `ILogin` adapter since the Web and App share identical user journeys.
*   **Option B: The Production App (Wikipedia)**
    *   **Web:** `wikipedia.org`
    *   **Mobile:** Wikipedia Native Android App (APK available via Wikimedia).
    *   **Why it's great:** A real-world, complex application. Excellent for demonstrating advanced scrolling, search dynamic dropdowns, and multi-language data-driven testing.

## 2. Tech Stack
*   **Core:** Node.js, TypeScript
*   **Test Runner/Web Engine:** Playwright
*   **Mobile Engine:** WebdriverIO (Appium)
*   **Reporting:** Allure Reports 
*   **CI/CD:** GitHub Actions (Ubuntu Web + Android Emulator Runner)

## 3. Core Architecture
*   **Interfaces (Contracts):** Define agnostic business workflows (e.g., `ILogin.ts` containing `submitCredentials()`).
*   **Platform Adapters:** 
    *   `WebLogin.ts` (Implements `ILogin` using Playwright locators).
    *   `MobileLogin.ts` (Implements `ILogin` using Appium locators).
*   **Page Factory:** `Factory.ts` dynamically returns the Web or Mobile adapter based on `process.env.PLATFORM`.
*   **Agnostic Tests:** `login.spec.ts` calls the Factory and runs pure business logic. Zero locators in the test script.

## 4. Execution Plan
*   **Phase 1: Foundation:** Init Node.js, install Playwright/WDIO, download the target APK, and define TypeScript interfaces.
*   **Phase 2: Adapters:** Build concrete Web and Mobile page objects implementing the interfaces.
*   **Phase 3: Routing:** Build the Page Factory and write the platform-agnostic test scripts.
*   **Phase 4: CI/CD Pipeline:** Configure GitHub Actions matrix to run Web and App tests simultaneously, generating a unified Allure report.