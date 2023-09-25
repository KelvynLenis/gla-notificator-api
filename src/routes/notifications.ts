import { FastifyInstance } from "fastify";
import { clearIslandJobs, clearWPJobs, getNextIslandEvent, publicKeyGenerated, scheduleNextIslandEvent, scheduleNextWantedPirate } from '../service/notificationService';
import WebPush from 'web-push';

export async function notificationsRoutes(app: FastifyInstance) {
  app.get('/public-key', async (_, reply) => {
      return {
        publicKeyGenerated
      }
    })

  app.post('/subscribe', async (request, reply) => {
    const subscription: WebPush.PushSubscription = request.body as WebPush.PushSubscription

    // subscribe(subscription);
    // console.log(subscription)

    reply.status(201).send() ;
  })
  
  app.post("/schedule-island-notification", async (request, reply) => {
    const subscription = request.body as WebPush.PushSubscription
    const nextNotification = scheduleNextIslandEvent(subscription);

    console.log("submited", subscription)

    // WebPush.sendNotification(subscription, 'Evento de ilha resetado')

    reply.status(201).send({ nextNotification })
  })

  app.post("/schedule-wanted-pirate-notification", async (request, reply) => {
    const subscription = request.body as WebPush.PushSubscription
    const nextWantedPirate =  scheduleNextWantedPirate(subscription);

    reply.status(201).send({ nextWantedPirate })
  })

  app.post('/unsubscribe-island', async (request, reply) => {
    clearIslandJobs();

    reply.status(201).send()
  })

  app.post('/unsubscribe-wanted-pirate', async (request, reply) => {
    clearWPJobs();

    reply.status(201).send()
  })

  app.get('/next-island-event', async (request, reply) => {
    const nextIslandEvent = getNextIslandEvent();

    reply.status(200).send({ nextIslandEvent })
  })

  app.get('/next-wanted-pirate', async (request, reply) => {
    const nextWantedPirate = getNextIslandEvent();

    reply.status(200).send({ nextWantedPirate })
  })
}
