# Project Setup Instructions

This document provides instructions for setting up Shadcn UI, Tailwind CSS, and migrating to TypeScript, as requested.

## 1. Shadcn UI Setup

The project currently uses Tailwind CSS but does not appear to have Shadcn UI fully configured (missing `components.json`).

To set up Shadcn UI:

1.  **Run the init command:**
    ```bash
    npx shadcn@latest init
    ```

2.  **Follow the prompts:**
    -   **Style:** Default (or New York)
    -   **Base Color:** Slate (or your preference)
    -   **CSS Variables:** Yes
    -   **Tailwind CSS config:** `tailwind.config.js`
    -   **Components:** `src/components`
    -   **Utils:** `src/lib/utils`
    -   **RSC:** No (since this is a Vite React project)

3.  **Add components:**
    Once initialized, you can add components like this:
    ```bash
    npx shadcn@latest add button
    ```

## 2. Tailwind CSS Setup

The project is already using Tailwind CSS v4.

-   **Config:** `tailwind.config.js` is present.
-   **CSS:** `src/index.css` imports tailwind.

No further action is required for Tailwind CSS setup.

## 3. TypeScript Migration

To migrate this Vite + React project to TypeScript:

1.  **Install TypeScript dependencies:**
    ```bash
    npm install -D typescript @types/react @types/react-dom @types/node
    ```

2.  **Initialize TypeScript config:**
    ```bash
    npx tsc --init
    ```
    Or create a `tsconfig.json` manually. A standard Vite `tsconfig.json` looks like this:
    ```json
    {
      "compilerOptions": {
        "target": "ES2020",
        "useDefineForClassFields": true,
        "lib": ["ES2020", "DOM", "DOM.Iterable"],
        "module": "ESNext",
        "skipLibCheck": true,
        "moduleResolution": "bundler",
        "allowImportingTsExtensions": true,
        "resolveJsonModule": true,
        "isolatedModules": true,
        "noEmit": true,
        "jsx": "react-jsx",
        "strict": true,
        "noUnusedLocals": true,
        "noUnusedParameters": true,
        "noFallthroughCasesInSwitch": true
      },
      "include": ["src"],
      "references": [{ "path": "./tsconfig.node.json" }]
    }
    ```

3.  **Rename files:**
    -   Rename `.jsx` files to `.tsx`.
    -   Rename `.js` files to `.ts`.

4.  **Fix type errors:**
    -   You will likely encounter type errors. You can fix them gradually.
    -   Use `any` temporarily if needed, but aim for proper types.

5.  **Update `vite.config.js`:**
    -   Rename to `vite.config.ts` if you want the config to be typed as well.

## 4. Component Structure

We are following the Shadcn UI structure:
-   `src/components/ui`: Reusable UI components (buttons, inputs, etc.).
-   `src/components`: Feature-specific components.
-   `src/lib`: Utility functions (`utils.js` or `utils.ts`).

The `AnimatedShaderBackground` component has been placed in `src/components/ui/AnimatedShaderBackground.jsx`.
