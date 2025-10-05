import { defineConfig } from 'prisma/config';

export default defineConfig({
  experimental: {
    externalTables: true
  },
  tables: { external: ['neon_auth.users_sync'] }
});
