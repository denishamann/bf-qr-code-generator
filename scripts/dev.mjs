import * as esbuild from "esbuild";

const port = Number(process.env.PORT) || 8000;

const ctx = await esbuild.context({
  entryPoints: ["src/main.ts"],
  bundle: true,
  outdir: "dist",
  sourcemap: true,
});

await ctx.watch();
await ctx.serve({ servedir: ".", host: "0.0.0.0", port });

console.log(`\n  Basic-Fit QR dev server\n  → http://localhost:${port}\n  (watching src/, press Ctrl+C to stop)\n`);
