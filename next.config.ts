import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  sassOptions: {
    silenceDeprecations: ['mixed-decls', 'global-builtin', 'import', 'legacy-js-api'],
    loadPaths: [path.join(process.cwd(), 'node_modules')],
  },
};

export default nextConfig;
