import fastify from 'fastify';
import cors from '@fastify/cors';
import { notificationsRoutes } from './routes/notifications';

const PORT = Number(process.env.PORT) || 3000;

export const app = fastify();

app.register(cors, {
  origin: true,
})

app.register(notificationsRoutes)

app.listen({
    host: '0.0.0.0',
    port: PORT,
}).then(() => {
    console.log(`🚀 HTTP server running on port http://localhost:${PORT}`)
})

// app.listen({
//   port: 3000,
// }).then(() => {
// console.log('🚀 HTTP server running on port http://localhost:3000')
// })
