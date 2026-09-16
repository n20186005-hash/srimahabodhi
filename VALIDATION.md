# Validation status

Required clean-environment validation could not be completed in this execution environment because outbound DNS/network access from the build runtime is blocked. This prevents Corepack/pnpm from downloading `pnpm@12.4.1` and project dependencies, and also prevents downloading Wikimedia image binaries.

Attempted runtime checks showed the registry request failing at `registry.npmjs.org` with `EAI_AGAIN`.

The source is prepared for the requested commands once network access is available:

```bash
rm -rf node_modules
CI=1 corepack pnpm install --frozen-lockfile
pnpm check
pnpm build
grep -R -nE 'example\\.com|localhost|chrome-extension://' dist || true
```

A generated `pnpm-lock.yaml` is intentionally not fabricated because doing so without resolving the dependency graph would make `--frozen-lockfile` misleading and invalid.
