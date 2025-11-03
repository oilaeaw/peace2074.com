export default defineNuxtPlugin(() => {
  try {
    // Only in browsers that support Trusted Types
    const tt: any = (globalThis as any).trustedTypes
    if (!tt || typeof tt.createPolicy !== 'function') return

    // Create a permissive default policy to avoid runtime breaks on environments
    // that enforce Trusted Types but where third-party libs/framework code doesn't
    // yet provide TrustedScript/TrustedHTML explicitly.
    // NOTE: For stronger security, replace these identity functions with
    // validation/escaping of known-safe inputs.
    const policyName = 'default'
    // Avoid duplicate policy creation errors
    if (typeof tt.getPolicyNames === 'function' && tt.getPolicyNames().includes(policyName)) return

    tt.createPolicy(policyName, {
      createHTML: (input: string) => input,
      createScript: (input: string) => input,
      createScriptURL: (input: string) => input,
    })
  }
  catch (e) {
    // best-effort only
    console.warn('[trusted-types] policy setup skipped:', (e as any)?.message || e)
  }
})
