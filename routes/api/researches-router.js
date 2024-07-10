import express from 'express';
import researchController from '../../controllers/research-controller.js';

const researchRouter = express.Router();

researchRouter.get('/get', researchController.getResearches);

export default researchRouter;
