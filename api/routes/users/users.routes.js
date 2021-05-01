import { Router } from 'express' // performs middleware and route functions
import * as UsersController from '../../controllers/users/users.controller'

const router = new Router()

router.route('/users/me')
  .get(UsersController.headerAuthenticate, (req, res) => res.json(req.user))

export default router
