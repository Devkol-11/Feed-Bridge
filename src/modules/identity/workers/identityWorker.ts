import { Worker } from 'bullmq';

const workerName = 'identity_events'; //--THE NAME OF THE QUEUE

const identityWorker = new Worker(workerName);
