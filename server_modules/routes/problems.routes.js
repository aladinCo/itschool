import { Router } from'express';
import { Problems } from "../controllers/index.js";
import {auth}  from '../middleware/auth.middleware.js'; 

const router = Router()


// /api/problems/
router.get('/', auth, Problems.getAll)

// /api/problem/
router.get('/:id', auth, Problems.getOne)

// /api/problem/
//router.put('/:id', auth, Problems.put)

export default  router