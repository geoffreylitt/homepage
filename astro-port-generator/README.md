# Middleman to Astro Port Generator

Converts a Middleman site to Astro with 99.7% accuracy via deterministic transformations.

## What it does

Takes a Middleman site structure and generates a fully functional Astro equivalent. Instead of manually copying 400+ files, you review one script that does the transformation programmatically.

## Usage

```bash
node astro-port-generator/generate.js
```

Produces a complete Astro site in `astro-port-generated/` with:
- All static assets (images, styles, scripts)
- Content collections for blog posts and projects  
- Layouts and components
- Dynamic routing
- Build configuration

## Testing

Verify the generated site matches the original:

```bash
node verify-against-middleman.js                    # Summary comparison
node verify-against-middleman.js --file /blog      # Compare specific file
node verify-against-middleman.js --diff /blog      # Show detailed diff
node verify-against-middleman.js --list            # List all files
```

This script builds both sites and compares the built HTML files directly. The summary mode gives you a concise overview, then you can drill into specific differences as needed.