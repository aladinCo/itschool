import { Router } from 'express';
import { Solving } from "../controllers/index.js";
import {auth}  from '../middleware/auth.middleware.js'; 

const router = Router()


// /api/solving/
router.get('/:id', auth, Solving.get)

// /api/problem/
router.put('/:id', auth, Solving.put)

export default  router