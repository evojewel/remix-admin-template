// vite.config.ts
import { vitePlugin as remix } from "file:///Users/jewel/Projects/ulagathan/kite-admin/node_modules/@remix-run/dev/dist/index.js";
import { defineConfig } from "file:///Users/jewel/Projects/ulagathan/kite-admin/node_modules/vite/dist/node/index.js";
import tsconfigPaths from "file:///Users/jewel/Projects/ulagathan/kite-admin/node_modules/vite-tsconfig-paths/dist/index.mjs";
import { netlifyPlugin } from "file:///Users/jewel/Projects/ulagathan/kite-admin/node_modules/@netlify/remix-adapter/dist/vite/plugin.mjs";
var vite_config_default = defineConfig({
  plugins: [
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
        v3_singleFetch: true,
        v3_lazyRouteDiscovery: true
      }
    }),
    tsconfigPaths(),
    netlifyPlugin()
  ]
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvamV3ZWwvUHJvamVjdHMvdWxhZ2F0aGFuL2tpdGUtYWRtaW5cIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy9qZXdlbC9Qcm9qZWN0cy91bGFnYXRoYW4va2l0ZS1hZG1pbi92aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvamV3ZWwvUHJvamVjdHMvdWxhZ2F0aGFuL2tpdGUtYWRtaW4vdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyB2aXRlUGx1Z2luIGFzIHJlbWl4IH0gZnJvbSBcIkByZW1peC1ydW4vZGV2XCI7XG5pbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHRzY29uZmlnUGF0aHMgZnJvbSBcInZpdGUtdHNjb25maWctcGF0aHNcIjtcbmltcG9ydCB7IG5ldGxpZnlQbHVnaW4gfSBmcm9tIFwiQG5ldGxpZnkvcmVtaXgtYWRhcHRlci9wbHVnaW5cIjtcblxuZGVjbGFyZSBtb2R1bGUgXCJAcmVtaXgtcnVuL25vZGVcIiB7XG4gIGludGVyZmFjZSBGdXR1cmUge1xuICAgIHYzX3NpbmdsZUZldGNoOiB0cnVlO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHBsdWdpbnM6IFtcbiAgICByZW1peCh7XG4gICAgICBmdXR1cmU6IHtcbiAgICAgICAgdjNfZmV0Y2hlclBlcnNpc3Q6IHRydWUsXG4gICAgICAgIHYzX3JlbGF0aXZlU3BsYXRQYXRoOiB0cnVlLFxuICAgICAgICB2M190aHJvd0Fib3J0UmVhc29uOiB0cnVlLFxuICAgICAgICB2M19zaW5nbGVGZXRjaDogdHJ1ZSxcbiAgICAgICAgdjNfbGF6eVJvdXRlRGlzY292ZXJ5OiB0cnVlLFxuICAgICAgfSxcbiAgICB9KSxcbiAgICB0c2NvbmZpZ1BhdGhzKCksXG4gICAgbmV0bGlmeVBsdWdpbigpLFxuICBdLFxufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQWdULFNBQVMsY0FBYyxhQUFhO0FBQ3BWLFNBQVMsb0JBQW9CO0FBQzdCLE9BQU8sbUJBQW1CO0FBQzFCLFNBQVMscUJBQXFCO0FBUTlCLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVM7QUFBQSxJQUNQLE1BQU07QUFBQSxNQUNKLFFBQVE7QUFBQSxRQUNOLG1CQUFtQjtBQUFBLFFBQ25CLHNCQUFzQjtBQUFBLFFBQ3RCLHFCQUFxQjtBQUFBLFFBQ3JCLGdCQUFnQjtBQUFBLFFBQ2hCLHVCQUF1QjtBQUFBLE1BQ3pCO0FBQUEsSUFDRixDQUFDO0FBQUEsSUFDRCxjQUFjO0FBQUEsSUFDZCxjQUFjO0FBQUEsRUFDaEI7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
