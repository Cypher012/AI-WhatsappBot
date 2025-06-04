import { Elysia } from 'elysia';
import birthdayRouter from './routes';
import { swagger } from '@elysiajs/swagger';
import { cors } from '@elysiajs/cors';
import { auth, OpenAPI } from '@/utils/auth';


// User middleware (compute user and session and pass to routes)
const betterAuth = new Elysia({ name: 'better-auth' })
    .mount(auth.handler) // Mounting auth handler here for the '/api/auth' endpoint
    .macro({
      auth: {
        async resolve({ error, request: { headers } }) {
          const session = await auth.api.getSession({ headers });
          if (!session) return error(401);
          return {
            user: session.user,
            session: session.session,
          };
        },
      },
    });

const corsOptions = cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:3001',
  ],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
});

const app = new Elysia()
  .use(
    swagger({
      documentation: {
        info: {
          title: 'Elysia Birthday API',
          description: 'API for managing birthdays',
          version: '1.0.0',
        },
          components: await OpenAPI.components,
          paths: await OpenAPI.getPaths()
      },
    })
  )
  .use(corsOptions)
  .get('/', () => 'Hello Elysia').use(betterAuth)
  .group('/api', (app) => app.use(birthdayRouter))
  .listen(8000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
