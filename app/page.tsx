import { InstallCheck } from "@/registry/aimy/ui/install-check"

const registryConfig = `{
  "registries": {
    "@aimy": {
      "url": "https://aimy-ui-lib.nour-ali.workers.dev/r/{name}.json",
      "headers": { "Authorization": "Bearer \${AIMY_REGISTRY_TOKEN}" }
    }
  }
}`

export default function Home() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-[30px] font-semibold">AiMY UI</h1>
      <p className="mt-3 text-[16px] text-[#c3ceda]">
        The component library for AiMY products. Phase 0: proving that the registry builds, deploys and installs.
      </p>

      <h2 className="mt-12 text-[20px] font-medium">Install</h2>
      <p className="mt-2 text-[16px] text-[#c3ceda]">
        Add the AiMY registry to your <code>components.json</code>, set <code>AIMY_REGISTRY_TOKEN</code> in your
        environment, then add items by name.
      </p>
      <pre className="mt-4 overflow-x-auto rounded-lg bg-[#0d1117] p-4 text-[14px]">{registryConfig}</pre>
      <pre className="mt-4 overflow-x-auto rounded-lg bg-[#0d1117] p-4 text-[14px]">
        npx shadcn@latest add @aimy/install-check
      </pre>

      <h2 className="mt-12 text-[20px] font-medium">Preview</h2>
      <div className="mt-4">
        <InstallCheck />
      </div>
    </main>
  )
}
