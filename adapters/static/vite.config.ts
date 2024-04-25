import { staticAdapter } from "@builder.io/qwik-city/adapters/static/vite";
import { extendConfig } from "@builder.io/qwik-city/vite";
import baseConfig from "../../vite.config";
import { loadEnv } from "vite";

export default extendConfig(baseConfig, ({mode}) => {
  const env = {...process.env, ...loadEnv(mode, process.cwd())};

  return {
    build: {
      ssr: true,
      rollupOptions: {
        input: ["@qwik-city-plan"],
      },
    },
    plugins: [
      staticAdapter({
        origin: env.VITE_ORIGIN as string | undefined ?? env.VERCEL_BRANCH_URL as string | undefined ?? "https://fpv-drone.info",
      }),
    ],
  };
});
