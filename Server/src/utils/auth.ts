import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '@/db'; // your drizzle instance
import { openAPI } from 'better-auth/plugins';
import { user, account, session, verification } from '@/db/schema/auth-schema';

export const schema = { user, account, session, verification };

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema,
  }),
  basePath: '/api/auth',
  emailAndPassword: {
    enabled: true,
  },
  trustedOrigins: [
    'http://localhost:3000',
    process.env.FRONTEND_URL_1,
    process.env.FRONTEND_URL_2,
  ],
  advanced: {
    crossSubDomainCookies: {
      enabled: true,
      domain: '.ai-whatsappbot.onrender.com', // leading dot for subdomain coverage
    },
    defaultCookieAttributes: {
      secure: true, // since deployed on HTTPS
      httpOnly: true,
      sameSite: 'none', // allow cross-site cookies
      partitioned: true,
    },
    useSecureCookies: true,
  },
  plugins: [openAPI()],
});

let _schema: ReturnType<typeof auth.api.generateOpenAPISchema> | undefined;
const getSchema = async () => (_schema ??= auth.api.generateOpenAPISchema());

export const OpenAPI = {
  getPaths: (prefix = '/api/auth') =>
    getSchema().then(({ paths }) => {
      const reference: typeof paths = Object.create(null);

      for (const path of Object.keys(paths)) {
        const key = prefix + path;
        reference[key] = paths[path];

        for (const method of Object.keys(paths[path])) {
          const operation = (reference[key] as any)[method];

          operation.tags = ['Better Auth'];
        }
      }

      return reference;
    }) as Promise<any>,
  components: getSchema().then(({ components }) => components) as Promise<any>,
} as const;
