# D1–D9 Life Pattern Analyzer

This package includes the full app structure needed to run on Cloudflare Pages Functions.

## Files included
- `index.html`
- `styles.css`
- `app.js`
- `functions/api/analyze.js`

## What was changed
- Original multi-section layout preserved
- Bold plain theme applied
- EMA checkbox removed from input page
- Confidence Score removed
- Why this conclusion removed
- D1 and D9 headings expanded with bracket descriptions
- EMA renamed to **Restraint**
- Tamil removed
- Domain insights rewritten to explain:
  - astrology standpoint
  - flag logic
  - practical domain reading
- `Mixed` replaced with clearer wording such as `Developing` or `Shifting pattern`

## Deploy structure
Keep this exact structure:

```text
project-root/
  index.html
  styles.css
  app.js
  functions/
    api/
      analyze.js
```

## Local testing
If you want to test with Cloudflare Pages Functions locally:

```bash
npm install -g wrangler
wrangler pages dev .
```

Then open the local URL shown by Wrangler.
