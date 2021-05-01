import { Router } from 'express'
import * as DocsController from '../../controllers/docs/docs.controller'
import { headerAuthenticate } from '../../controllers/users/users.controller'

const router = new Router()

// Apply authentication to all 'docs' routes
router.route('/docs(/*)?').all(headerAuthenticate)

router.route('/docs/:db/:id/:rev')
  .get(
    DocsController.getRevision,
  )

router.route('/:db/_bulk_docs')
  .post(
    headerAuthenticate,
    DocsController.updateDoc,
  )

router.route('/docs/:db/:id')
  .get(
    DocsController.getPreviousRevision,
  )

export default router
