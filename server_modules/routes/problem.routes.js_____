import { Router } from'express';
import { Problem } from "../controllers/index.js";
import {auth}  from '../middleware/auth.middleware.js'; 

const router = Router()


// /api/problem/
router.get('/:id', auth, Problem.get)

// /api/problem/
router.put('/:id', auth, Problem.put)

export default  router