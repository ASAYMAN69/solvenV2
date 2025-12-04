## Gemini Added Memories
- I will log all the changes I make in this code in the GEMINI.md file
- When starting a new session, read the GEMINI.md file to get the full context of the project, including past actions and standing instructions.
## Changes made by Gemini
- Updated `og:image` meta tag in `index.html` to use `solvenlogo.png`.
- Replaced `fetch` with `navigator.sendBeacon` in `api.js` for "fire and forget" API calls.
- Updated API endpoints in `api.js`.
- Removed `async`/`await` from calling functions in `main.js`.
- Updated the `Content-Type` for `navigator.sendBeacon` requests in `api.js` from `text/plain` to `application/json`.
- Moved the email form field to be under the name field in `index.html`.
- Added an information icon and tooltip to the email field, which appears on focus.
- Added styles for the information icon in `components.css`.
- Added JavaScript logic to show the tooltip in `main.js`.
- Refactored the `.hidden` class in `base-styles.css` to enable smooth transitions using `opacity` and `max-height`.
- Introduced a new `.visually-hidden` class in `base-styles.css` for elements that should be completely hidden without transition.
- Updated `index.html` to use the `.visually-hidden` class for the `otherRoleWrap` element.