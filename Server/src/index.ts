import { Elysia } from 'elysia';
import birthdayRouter from './routes';
import { swagger } from '@elysiajs/swagger';

import { cors } from '@elysiajs/cors';

const corsOptions = cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:3001',
  ],
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
      },
    })
  )
  .use(corsOptions)
  .get('/', () => 'Hello Elysia')
  .group(
    '/api',
    (app) => app.use(birthdayRouter) // Use the birthday router
  )
  .listen(8000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
