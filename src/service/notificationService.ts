import dayjs from 'dayjs';
import { Job, scheduleJob } from 'node-schedule';
import WebPush from 'web-push';

const islandEventTimes = ['00:06', '00:36', '01:06', '01:36', '02:06', 
                          '02:36', '03:06', '03:36', '04:06', '04:36', 
                          '05:06', '05:36', '06:06', '06:36', '07:06', 
                          '07:36', '08:06', '08:36', '09:06', '09:36', 
                          '10:06', '10:36', '11:06', '11:36', '12:06', 
                          '12:36', '13:06', '13:36', '14:06', '14:36', 
                          '15:06', '15:36', '16:06', '16:36', '17:06', 
                          '17:36', '18:06', '18:36', '19:06', '19:36', 
                          '20:06', '20:36', '21:06', '21:36', '22:06', 
                          '22:36', '23:06', '23:36'];

const wantedPirateTimes = ['00:36', '02:36', '04:36', '06:36', '08:36', 
                          '10:36', '12:36', '14:36', '16:36', '18:36', 
                          '20:36', '22:36'];

const wpJobs: Job[] = [];
const islandJobs: Job[] = [];

const wpQueue: { time: dayjs.Dayjs, title: string }[] = [];
const islandQueue: { time: dayjs.Dayjs, title: string }[] = [];

// export const { publicKey, privateKey } = WebPush.generateVAPIDKeys();

// console.log(publicKey)
// console.log(privateKey)

export const publicKey = 'BL_H_NaChuIL3D1s2z3fgxQ4n6Wr_Z7H1Ro3hldL1cs0Z1C9DZh139b2LMsgaknp-dqazGcLHZGKhNfpjZtl1H8'
const privateKey = 'WY8P3-fqvAg5ZSjpPM297p5oUxQUxQ0tVI9zoY4tQr4'


WebPush.setVapidDetails('https://gla-notificator.vercel.app', publicKey, privateKey);
// WebPush.setVapidDetails('mailto:http://localhost:5173', publicKey, privateKey);
                        
function notify(title: string, subscription: WebPush.PushSubscription) {
  if(title === 'Evento de ilha resetado') { 
    islandJobs.shift();
    islandQueue.shift(); 
  } else {
    wpJobs.shift();  
    wpQueue.shift();
  } 
  WebPush.sendNotification(subscription, title);
}

export function scheduleAllEvents(subscription: WebPush.PushSubscription) {
  islandEventTimes.map((time) => {
    const hour = Number(time.split(':')[0]);
    const minute = Number(time.split(':')[1]);
    const job = scheduleJob({ hour: hour, minute: minute }, () => notify('Evento de ilha resetado', subscription))
    islandJobs.push(job);
  });
  return islandEventTimes;
}

export function scheduleAllWantedPirates(subscription: WebPush.PushSubscription) {
  wantedPirateTimes.map((time) => {
    const hour = Number(time.split(':')[0]);
    const minute = Number(time.split(':')[1]);
    const job = scheduleJob({ hour: hour, minute: minute }, () => notify('Piratas procurados resetado', subscription))
    wpJobs.push(job);
  });

  return wantedPirateTimes;
}


export function scheduleNextIslandEvent(subscription: WebPush.PushSubscription, now: string){
  const queue = makeIslandEventQueue(now);
  
  if(islandJobs.length > 0){
    clearIslandJobs();
  }
  
  queue.map((checkpoint) => {
    const nextHour = checkpoint.time.hour();
    const nextMinute = checkpoint.time.minute();
    const job = scheduleJob({ hour: nextHour, minute: nextMinute }, () => notify(checkpoint.title, subscription));
    islandJobs.push(job);
    islandQueue.push(checkpoint);
  })
  
  const nextIslandEvent = getNextIslandEvent();

  return nextIslandEvent;
}

function makeIslandEventQueue(actualTime: string) {
  const initialTime = dayjs().set('hour', 0).set('minute', 6).set('second', 0);
  const finalTime = dayjs().set('hour', 23).set('minute', 6).set('second', 0);  
  const numberOfAlarms = islandEventTimes.length;
    
  const queue = [];
  let time = initialTime;
  const now = dayjs().hour(Number(actualTime.split(':')[0])).minute(Number(actualTime.split(':')[1])).second(0).millisecond(0);
  // const now = dayjs()

  for (let i = 0; i < numberOfAlarms; i++) {
    time = dayjs().hour(time.hour()).minute(time.minute() + 30).second(0).millisecond(0)
    
    if (time.isAfter(finalTime)) {
      break;
    }
    
    if(now.isBefore(time)){
      const checkpoint = {
        time: time,
        title:'Evento de ilha resetado'
      }
      queue.push(checkpoint);
    }      
  }

  return queue; 
}

export function scheduleNextWantedPirate(subscription: WebPush.PushSubscription, now: string){
  const queue = makeWPQueue(now);

  // const now = dayjs();

  if(wpJobs.length > 0){
    clearWPJobs();
  }

  queue.map((checkpoint) => {
    const nextHour = checkpoint.time.hour();
    const nextMinute = checkpoint.time.minute();
    const job = scheduleJob({ hour: nextHour, minute: nextMinute }, () => notify(checkpoint.title, subscription));
    wpJobs.push(job);
    wpQueue.push(checkpoint);
  })

  console.log(now)
  
  let nextWantedPirate = getNextWantedPirate();

  return nextWantedPirate;
}

function makeWPQueue(actualTime: string) {
  const initialTime = dayjs().set('hour', 0).set('minute', 36).set('second', 0);
  const finalTime = dayjs().set('hour', 23).set('minute', 36).set('second', 0);
  const numberOfAlarms = wantedPirateTimes.length;
    
  const queue = [];
  let time = initialTime;
  const now = dayjs().hour(Number(actualTime.split(':')[0])).minute(Number(actualTime.split(':')[1])).second(0).millisecond(0);
  // const now = dayjs();

  for (let i = 0; i < numberOfAlarms; i++) {
    time = dayjs().hour(time.hour() + 2).minute(time.minute()).second(0).millisecond(0)
    

    if (time.isAfter(finalTime)) {
      break;
    }

    if(now.isBefore(time)){
      const checkpoint = {
        time: time,
        title:'Piratas procurados resetado'
      }
      queue.push(checkpoint);
    }
  }

  return queue;
}

export function clearIslandJobs() {
  if(islandJobs.length > 0){
    islandJobs.map((job) => job.cancel());
    islandJobs.map(() => islandJobs.shift());
  }
}

export function clearWPJobs() {
  if(wpJobs.length > 0){
    wpJobs.map((job) => job.cancel());
    wpJobs.map(() => wpJobs.shift());
  }
}

export function getNextIslandEvent() {
  return islandQueue[0].time.format('HH:mm');
}

export function getNextWantedPirate() {
  return wpQueue[0].time.format('HH:mm');
}