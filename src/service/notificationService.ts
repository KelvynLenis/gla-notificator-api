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
// export let subscription: WebPush.PushSubscription;

// export const { publicKey, privateKey } = WebPush.generateVAPIDKeys();

export const publicKeyGenerated = 'BOtVKO6u05dpqWRwDJDh47WDjs6aGEk1DdFfL3XGYG1yCensEWl1wWG2B1FjtRq6nBhObFEgb999r_WqwNQ2cxc'
const privateKeyGenerated = 'TJ8sx7qoYlim9r_HijI02ahuLSLAPzsFnysQFVwBKgA'

// console.log(publicKey)
// console.log( privateKey)

WebPush.setVapidDetails('https://gla-notificator.vercel.app', publicKeyGenerated, privateKeyGenerated);
                        
function notify(title: string, subscription: WebPush.PushSubscription) {
  title === 'Evento de ilha resetado' ? islandJobs.shift() : wpJobs.shift();  
  WebPush.sendNotification(subscription, title);
}

// export function subscribe(subscriptionIn: WebPush.PushSubscription) {
//   subscription = subscriptionIn;
// }

export function scheduleNextIslandEvent(subscription: WebPush.PushSubscription){
  const queue = makeIslandEventQueue();
  const now = dayjs();

  if(islandJobs.length > 0){
    islandJobs.forEach((job) => job.cancel());
  }

  const filteredQueue = queue.filter((checkpoint) => checkpoint.time.isAfter(now));
  
  let nextIslandEvent = '';

  if(filteredQueue.length > 0){
    const nextHour = filteredQueue[0].time.hour();
    const nextMinute = filteredQueue[0].time.minute();
    const job = scheduleJob({ hour: nextHour, minute: nextMinute }, () => notify(filteredQueue[0].title, subscription));
    islandJobs.push(job);

    const hour = filteredQueue[0].time.hour() < 10 ? '0' + filteredQueue[0].time.hour() : filteredQueue[0].time.hour();
    const minute = filteredQueue[0].time.minute() < 10 ? '0' + filteredQueue[0].time.minute() : filteredQueue[0].time.minute();
    // setNextIslandEvent(hour + ':' + minute);
    nextIslandEvent = hour + ':' + minute;
  }


  return nextIslandEvent;
}

function makeIslandEventQueue() {
  const initialTime = dayjs().set('hour', 0).set('minute', 6).set('second', 0);
  const finalTime = dayjs().set('hour', 23).set('minute', 6).set('second', 0);  
  const numberOfAlarms = islandEventTimes.length;
    
  const queue = [];
  let time = initialTime;
  const now = dayjs();
  
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

export function scheduleNextWantedPirate(subscription: WebPush.PushSubscription){
  const queue = makeWPQueue();

  const now = dayjs();

  if(wpJobs.length > 0){
    wpJobs.forEach((job) => job.cancel());
  }
  
  const filteredQueue = queue.filter((checkpoint) => checkpoint.time.isAfter(now));
  
  let nextWantedPirate = '';
  
  if(filteredQueue.length > 0){
    const nextHour = filteredQueue[0].time.hour();
    const nextMinute = filteredQueue[0].time.minute();
    const job = scheduleJob({ hour: nextHour, minute: nextMinute }, () => notify(filteredQueue[0].title, subscription));
    wpJobs.push(job);

    const hour = filteredQueue[0].time.hour() < 10 ? '0' + filteredQueue[0].time.hour() : filteredQueue[0].time.hour();
    const minute = filteredQueue[0].time.minute() < 10 ? '0' + filteredQueue[0].time.minute() : filteredQueue[0].time.minute();
    // setNextWantedPirate(hour + ':' + minute);
    nextWantedPirate = hour + ':' + minute;
  }

  return nextWantedPirate;
}

function makeWPQueue() {
  const initialTime = dayjs().set('hour', 0).set('minute', 36).set('second', 0);
  const finalTime = dayjs().set('hour', 23).set('minute', 36).set('second', 0);
  const numberOfAlarms = wantedPirateTimes.length;
    
  const queue = [];
  let time = initialTime;
  const now = dayjs();
  
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
  islandJobs.forEach((job) => job.cancel());
}

export function clearWPJobs() {
  wpJobs.forEach((job) => job.cancel());
}

export function getNextIslandEvent() {
 const hour = islandJobs[0].nextInvocation().getHours() < 10 ? '0' + islandJobs[0].nextInvocation().getHours() : islandJobs[0].nextInvocation().getHours();
  const minute = islandJobs[0].nextInvocation().getMinutes() < 10 ? '0' + islandJobs[0].nextInvocation().getMinutes() : islandJobs[0].nextInvocation().getMinutes();

  return hour + ':' + minute;
}

export function getNextWantedPirate() {
  const hour = wpJobs[0].nextInvocation().getHours() < 10 ? '0' + wpJobs[0].nextInvocation().getHours() : wpJobs[0].nextInvocation().getHours();
  const minute = wpJobs[0].nextInvocation().getMinutes() < 10 ? '0' + wpJobs[0].nextInvocation().getMinutes() : wpJobs[0].nextInvocation().getMinutes();

  return hour + ':' + minute;
}