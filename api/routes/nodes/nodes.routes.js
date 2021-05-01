/*
  provides address for influx data on nodes page
*/
import { Router } from 'express'
import * as NodesController from '../../controllers/nodes/nodes.controller'
import { headerAuthenticate } from '../../controllers/users/users.controller'

const router = new Router()

// Apply authentication to all 'nodes' routes
router.route('/nodes(/*)?').all(headerAuthenticate)

router.route('/nodes')
  .get(
    NodesController.sanitizeQuery,
    NodesController.getNodes,
  )

router.route('/nodes/graph')
  .get(
    NodesController.getNodeGraph,
  )

// router.route('/nodes/test')
//  .get(
//    NodesController.getNodeTestGraph,
//  )

router.route('/nodes/stats/response')
  .get(
    NodesController.getResponseStats,
  )

router.route('/nodes/stats/replication')
  .get(
    NodesController.getReplicationStats,
  )

router.route('/nodes/stats/status')
  .get(
    NodesController.getNodeStatusStats,
  )

router.route('/nodes/stats/completed')
  .get(
    NodesController.getAppStatus,
  )

export default router
