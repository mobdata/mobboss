/*
  configures routes and pathnames to different components
*/
import App from '../modules/App' // main app component
import Dashboard from '../modules/Nodes/pages/Dashboard' // nodes page
import Conflicts from '../modules/Conflicts/pages/Conflicts' // conflicts page
import NetworkGraph from '../modules/NetworkGraph' // network page
import Show404 from '../modules/App/components/Show404' // 404 error

const routes = [
  {
    component: App,

    routes: [
      {
        path: `${process.env.REACT_APP_INDEX_ROUTE}/`,
        exact: true,
        component: Dashboard,
      },
      {
        path: `${process.env.REACT_APP_INDEX_ROUTE}/conflicts`,
        exact: true,
        component: Conflicts,
      },
      {
        path: '/',
        exact: true,
        component: Dashboard,
      },
      {
        path: '/conflicts',
        exact: true,
        component: Conflicts,
      },
      {
        path: `${process.env.REACT_APP_INDEX_ROUTE}/network`,
        exact: true,
        component: NetworkGraph,
      },
      {
        path: '/network',
        exact: true,
        component: NetworkGraph,
      },
      {
        component: Show404,
      },
    ],
  },
]

export default routes
