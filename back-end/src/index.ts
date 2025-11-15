import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { routes } from './routes';

const fastify = Fastify({
  logger: true
});

// Register plugins
fastify.register(cors, {
  origin: ['http://localhost:3000', 'http://frontend:3000'],
  credentials: true
});

fastify.register(jwt, {
  secret: process.env.JWT_SECRET || 'default-secret-change-in-production'
});

fastify.register(swagger, {
  swagger: {
    info: {
      title: 'Finance AI API',
      description: 'API for Finance AI application',
      version: '1.0.0'
    },
    host: 'localhost:3001',
    schemes: ['http'],
    consumes: ['application/json'],
    produces: ['application/json'],
    securityDefinitions: {
      bearerAuth: {
        type: 'apiKey',
        name: 'Authorization',
        in: 'header'
      }
    }
  }
});

fastify.register(swaggerUi, {
  routePrefix: '/docs'
});

// Register routes
fastify.register(routes);

const start = async () => {
  try {
    await fastify.listen({
      port: parseInt(process.env.PORT || '3001'),
      host: process.env.HOST || '0.0.0.0'
    });
    console.log(`Server running on http://localhost:3001`);
    console.log(`Documentation available on http://localhost:3001/docs`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();