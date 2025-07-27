import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't resolve 'fs' module on the client to prevent this error on build --> Error: Can't resolve 'fs'
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        path: false,
        os: false,
        stream: false,
        util: false,
        buffer: false,
        events: false,
        assert: false,
        constants: false,
        domain: false,
        http: false,
        https: false,
        punycode: false,
        querystring: false,
        url: false,
        zlib: false,
        child_process: false,
        cluster: false,
        dgram: false,
        dns: false,
        module: false,
        process: false,
        readline: false,
        repl: false,
        string_decoder: false,
        sys: false,
        timers: false,
        tty: false,
        v8: false,
        vm: false,
        worker_threads: false,
      };
    }
    
    // Handle dynamic requires in Apify and related modules
    config.module.rules.push({
      test: /node_modules\/browserslist/,
      use: 'null-loader',
    });
    
    return config;
  },
  serverExternalPackages: ['apify', '@crawlee/utils', 'got-scraping', 'header-generator', 'apify-client'],
};

export default nextConfig;
