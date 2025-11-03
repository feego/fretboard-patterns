# Vanilla Extract Integration

This project uses Vanilla Extract for type-safe CSS-in-TypeScript styling.

## What's been set up:

1. **Packages installed:**
   - `@vanilla-extract/css` - Core Vanilla Extract library
   - `@vanilla-extract/next-plugin` - Next.js integration
   - `@vanilla-extract/vite-plugin` - Development tooling

2. **Configuration:**
   - Next.js config updated to use Vanilla Extract plugin
   - Turbopack disabled for compatibility (runs with webpack)

3. **Example files created:**
   - `src/components/Fretboard.css.ts` - Component styles
   - `src/styles/theme.ts` - Design tokens and theme variables
   - `src/types/vanilla-extract.d.ts` - TypeScript declarations

## How to use:

### 1. Create styles in `.css.ts` files:
```typescript
import { style } from "@vanilla-extract/css";

export const button = style({
  backgroundColor: "blue",
  color: "white",
  padding: "12px 24px",
  borderRadius: "4px",
  ":hover": {
    backgroundColor: "darkblue",
  },
});
```

### 2. Import and use in components:
```typescript
import * as styles from "./Button.css";

export function Button() {
  return <button className={styles.button}>Click me</button>;
}
```

### 3. Use theme variables:
```typescript
import { colors, spacing } from "../styles/theme";

export const card = style({
  backgroundColor: colors.gray[50],
  padding: spacing.lg,
});
```

## Benefits:
- ✅ Type-safe styles
- ✅ Zero runtime overhead
- ✅ Automatic vendor prefixing
- ✅ CSS Modules-like local scoping
- ✅ Theme-driven design system
- ✅ Excellent TypeScript integration