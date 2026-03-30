# 🤖 AI Agent Guidelines - Vinyl Pulse (Discogs Insights)

This document defines the core principles and operational rules for AI agents (Gemini, Cursor, Windsurf, etc.) working on this repository.

## 🛠️ Operational Rules

- **User-Controlled Git Operations**: DO NOT auto-commit or auto-push changes. Always provide a summary of your work and wait for the user to explicitly approve and initiate any Git actions.
- **Design Integrity**: The visual aesthetic and "vibe" of the project are paramount. Refer to the `design/` folder for specifications and inspirations. Maintain the premium, tactile, and immersive "Pulse" aesthetic.
- **Responsive & Platform-Ready Architecture**:
  - **Mobile-First**: Primary design focus is mobile.
  - **Capacitor/Android Ready**: Always consider how UI elements and interactions will translate to a wrapped mobile environment (Android/Capacitor), even if not currently deployed as such. Avoid browser-only hacks that break in a web-view.
  - **Desktop Versatility**: Ensure layouts scale elegantly for wide-screen monitors without losing the intimate, focused feel of the mobile experience.
- **Performance & Responsiveness**:
  - **Batch Data Loading**: Always implement data fetching in batches (e.g., the Pulse Sync Engine).
  - **Main Thread Health**: Keep the UI responsive at all times, even when handling large datasets or complex SVG/Canvas visualizations. Use concurrent React patterns and optimizations (memo, callback, refs) where appropriate.

## ⚠️ Model-Specific Constraints (Antigravity/Gemini)

- **Browser Usage**: The local internal browser tool **does NOT work** in this environment. DO NOT attempt to use it as a way to test or preview the code. Always rely on source code analysis and command-line verification.

## 🎯 Project Mission

- **Target Audience**: Dedicated vinyl collectors.
- **Goal**: Provide deep, meaningful, and visually stunning insights into their Discogs collections.
- **Tone**: Professional, premium, and data-driven, yet visually expressive and alive.

---
*Follow these rules strictly to ensure the project maintains its identity and quality.*
