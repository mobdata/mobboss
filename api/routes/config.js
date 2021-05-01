/*
   configures specific router to specific pages
*/
import usersRouter from './users/users.routes'
import nodesRouter from './nodes/nodes.routes'
import docsRouter from './docs/docs.routes'

const configureRoutes = (app) => {
  /*
   * Core routes here
   */
  app.use('/api', usersRouter)
  app.use('/api', nodesRouter)
  app.use('/api', docsRouter)
}

export default configureRoutes
