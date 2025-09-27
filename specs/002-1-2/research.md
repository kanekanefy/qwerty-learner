# Research: Analyze Existing Project

## Project Overview

Based on the file structure and dependencies, this is a web-based application built with React, TypeScript, and Vite. It appears to be a typing tutor application, with a focus on learning English words. The project also includes a Tauri-based desktop application.

## Key Technologies

- **Frontend Framework:** React
- **Language:** TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Database:** Dexie.js (a wrapper for IndexedDB)
- **Testing:** Playwright for end-to-end testing
- **Desktop App:** Tauri

## Project Structure

- `src/`: Contains the main source code for the React application.
  - `components/`: Reusable React components.
  - `pages/`: Different pages of the application, such as `Typing`, `Analysis`, `ErrorBook`, and `Gallery`.
  - `hooks/`: Custom React hooks.
  - `store/`: State management with Jotai.
  - `utils/`: Utility functions, including database interactions.
  - `resources/`: Data resources like dictionaries.
- `src-tauri/`: Contains the source code for the Tauri desktop application.
- `public/`: Static assets, including a large collection of dictionaries in JSON format.
- `tests/e2e/`: End-to-end tests written with Playwright.

## Existing Features

Based on the file names in `src/pages`, the following features appear to be implemented:

- **Typing Practice:** The core feature of the application.
- **Analysis:** A page to analyze typing performance.
- **Error Book:** A place to review words that the user has typed incorrectly.
- **Dictionary Gallery:** A gallery of different dictionaries that the user can choose from.
- **Mobile View:** A mobile-specific view of the application.

## Areas for Further Investigation

- The exact functionality of the Tauri desktop application.
- The data schema used by Dexie.js.
- The specific metrics and visualizations used in the `Analysis` page.
