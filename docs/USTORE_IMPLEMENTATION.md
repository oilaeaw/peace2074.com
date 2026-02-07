# @waelio/ustore Implementation Guide

## Overview

This project now uses [`@waelio/ustore`](https://github.com/waelio/ustore) for all client-side storage needs. The library provides a unified API for localStorage, sessionStorage, memoryStorage, and more, with built-in encryption support.

## Key Features

- ✅ **Unified API** - Same interface for all storage types
- ✅ **TypeScript Support** - Full type safety
- ✅ **Encryption** - Optional encryption using `waelio-utils`
- ✅ **Namespacing** - Avoid key collisions
- ✅ **SSR Safe** - Memory storage fallback for server-side
- ✅ **Vue Integration** - Reactive composables and Pinia plugin
- ✅ **Cross-Tab Sync** - Auto-sync localStorage across tabs

## File Structure

```
src/
├── composables/
│   ├── useUStore.ts           # Main composable
│   └── useUStore.examples.ts  # Usage examples
├── plugins/
│   └── pinia/
│       ├── index.ts           # Pinia setup
│       └── ustore-plugin.ts   # Auto-persistence plugin
└── utils/
    ├── configStore.ts         # Config storage wrapper
    └── secureStore.ts         # Secure storage wrapper
```

## Basic Usage

```typescript
import { useUStore } from "@/composables/useUStore";

const { local, session, memory } = useUStore();

// Store data
local.set("user", { name: "Wael", role: "admin" });

// Retrieve data with fallback
const user = local.get("user", { name: "Guest", role: "user" });

// Check existence
if (local.has("user")) {
  console.log("User exists");
}

// Remove
local.remove("user");
```

## Encrypted Storage

```typescript
import { useUStore } from "@/composables/useUStore";

const { local } = useUStore();
const SALT = import.meta.env.VITE_ENCRYPTION_SALT;

// Store encrypted
local.set(
  "sensitive-data",
  { apiKey: "secret" },
  {
    encrypt: true,
    salt: SALT,
  },
);

// Retrieve and decrypt
const data = local.get("sensitive-data", null, {
  encrypt: true,
  salt: SALT,
});
```

## Reactive Storage

```typescript
import { useStorageRef } from "@/composables/useUStore";

// Creates a reactive ref that auto-syncs with localStorage
const darkMode = useStorageRef("darkMode", false, "local");

// Use like a normal Vue ref
console.log(darkMode.value); // false
darkMode.set(true); // Updates ref AND localStorage

// Watch for changes (including from other tabs)
watch(darkMode.value, (newValue) => {
  console.log("Dark mode changed:", newValue);
});
```

## Pinia Integration

The project includes an automatic persistence plugin for Pinia stores:

```typescript
import { defineStore } from "pinia";

export const useUserStore = defineStore("user", {
  state: () => ({
    id: null,
    name: "",
    preferences: {},
  }),

  actions: {
    setUser(user) {
      this.id = user.id;
      this.name = user.name;
    },
  },

  // Automatically persist entire state
  persist: true,

  // Or persist specific fields only
  persist: {
    key: "user-store", // Custom key
    paths: ["id", "preferences"], // Only these fields
    storage: "local", // or 'session'
    encrypt: true, // Optional encryption
    salt: "your-salt-here", // Required if encrypt: true
  },
});

// The store will automatically:
// ✓ Load saved state on initialization
// ✓ Save state changes to storage
// ✓ Handle encryption/decryption
```

## Namespacing

```typescript
const { local } = useUStore();

// Store in different namespaces to avoid collisions
local.set("config", { theme: "dark" }, { namespace: "user-prefs" });
local.set(
  "config",
  { apiUrl: "https://api.example.com" },
  { namespace: "app-settings" },
);

// Retrieve from specific namespace
const userConfig = local.get("config", {}, { namespace: "user-prefs" });
const appConfig = local.get("config", {}, { namespace: "app-settings" });
```

## Migration from Native Storage

If you have existing code using native `localStorage`:

```typescript
// Before
localStorage.setItem("user", JSON.stringify(user));
const user = JSON.parse(localStorage.getItem("user") || "{}");

// After
const { local } = useUStore();
local.set("user", user);
const user = local.get("user", {});

// uStore handles JSON serialization automatically
```

## Environment Variables

Set these in your `.env` file:

```env
# Optional: Salt for encryption
VITE_ENCRYPTION_SALT=your-secure-salt-here

# Used by secureStore and configStore
VITE_CONF_ENCRYPTION_KEY=your-encryption-key
```

## Available Storage Types

| Storage   | Description    | Persistence | Use Case                       |
| --------- | -------------- | ----------- | ------------------------------ |
| `local`   | localStorage   | Permanent   | User preferences, cached data  |
| `session` | sessionStorage | Tab session | Temporary data, workflow state |
| `memory`  | In-memory      | None        | SSR fallback, temporary cache  |

## API Reference

### useUStore()

Returns storage APIs:

```typescript
const { local, session, memory, raw } = useUStore();
```

### Storage API Methods

```typescript
interface StorageAPI {
  set<T>(key: string, value: T, options?: StoreOptions): void;
  get<T>(key: string, fallback?: T, options?: StoreOptions): T | undefined;
  remove(key: string, namespace?: string): void;
  has(key: string, namespace?: string): boolean;
  clear(): void; // localStorage/sessionStorage only
}
```

### StoreOptions

```typescript
interface StoreOptions {
  encrypt?: boolean; // Enable encryption
  salt?: string; // Salt for encryption (required if encrypt: true)
  namespace?: string; // Namespace prefix (default: 'peace2074')
}
```

### useStorageRef()

```typescript
function useStorageRef<T>(
  key: string,
  defaultValue: T,
  storage: "local" | "session" | "memory" = "local",
  options: StoreOptions = {},
);
```

Returns:

```typescript
{
  value: Ref<T>,
  set: (newValue: T) => void,
  remove: () => void,
  has: () => boolean
}
```

## Examples

See [`src/composables/useUStore.examples.ts`](../src/composables/useUStore.examples.ts) for 10 comprehensive examples covering:

1. Basic Usage
2. Encrypted Storage
3. Namespaced Storage
4. Reactive Storage
5. User Preferences
6. Pinia Integration
7. Auth Token Management
8. Cross-Tab Sync
9. Cache Management
10. Migration from Old Storage

## Testing

```typescript
import { useUStore } from "@/composables/useUStore";

describe("uStore Integration", () => {
  it("sets and gets values", () => {
    const { local } = useUStore();
    local.set("test", "value");
    expect(local.get("test")).toBe("value");
  });

  it("handles encryption", () => {
    const { local } = useUStore();
    const salt = "test-salt";
    local.set("secret", { data: "sensitive" }, { encrypt: true, salt });
    const decrypted = local.get("secret", null, { encrypt: true, salt });
    expect(decrypted).toEqual({ data: "sensitive" });
  });
});
```

## Best Practices

1. **Always use namespaces** for different data categories
2. **Encrypt sensitive data** (tokens, API keys, user credentials)
3. **Use fallback values** when retrieving data
4. **Enable Pinia persistence** for stores that need state restoration
5. **Use sessionStorage** for temporary, tab-specific data
6. **Use memoryStorage** during SSR to avoid window access
7. **Set encryption salt via environment variables**, never hardcode

## Troubleshooting

### Data not persisting

- Check browser localStorage quota (5-10MB limit)
- Verify namespace/key consistency
- Check for errors in browser console

### Encryption errors

- Ensure salt is provided when `encrypt: true`
- Verify salt matches between set/get operations
- Check `waelio-utils` is installed

### SSR errors

- Use `memoryStorage` or check for `typeof window !== 'undefined'`
- The composable handles this automatically

## Resources

- [uStore GitHub](https://github.com/waelio/ustore)
- [uStore NPM](https://www.npmjs.com/package/@waelio/ustore)
- [Testing Examples](https://github.com/waelio/testing-ustore)
