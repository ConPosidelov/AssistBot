import { Router } from 'express';
import App from '../App.js';

const app = new App();
const appRouter = Router();

appRouter.get('/test', app.test);


export { appRouter, app };