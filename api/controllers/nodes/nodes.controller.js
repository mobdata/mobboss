import { InfluxDB } from 'influx' // retreival of influx data (time series db)
import https from 'https' // importing http object
import fetch from 'node-fetch' // implements browser specific fetch polyfill
import couchSettings, { couchHeaders } from '../../lib/couchdb/config' // couchdb settings
import { key, ca, cert } from '../../ssl/config' // auth tokens

const couch = require('nano')(couchSettings.couchUrl) // Node couchdb client
const Promise = require('bluebird') // promise implemntation

export function sanitizeQuery(req, res, next) {
  const { query } = req
  const isEmpty = Object.keys(query).length === 0 && query.constructor === Object

  if (isEmpty) { // tests if request is empty
    next()
    return
  }

  const timeRegex = /\d{1}(h|m|s|ms|u|ns){1}/ // pattern for how time signatures should be stored

  if (!timeRegex.test(query.time)) { // tests if query time stamp matches regex format
    const body = {
      message: 'Invalid query parameter',
    }

    res.status(400).json(body)
    return
  }

  next()
}

// eslint-disable-next-line import/prefer-default-export
export async function getNodes(req, res) {
  const time = req.query.time || '2m'
  try {
    // creates new influx object
    const influx = new InfluxDB({
      host: process.env.INFLUX_HOST,
      port: 8086,
      database: process.env.INFLUX_DB,
      username: process.env.INFLUX_USER,
      password: process.env.INFLUX_PASS,
      timeout: 10000,
    })

    /*
      influx query blocks: specific language made for retreiving
      data from influx
    */
    const versionQuery = `
      select * from couch_version
      where time > now() - ${time}
      group by url
      limit 1
    `

    const pingQuery = `
      select * from couch_ping
      where time > now() - ${time}
      group by url
      limit 1
    `

    const taskQuery = `
      select * from couch_replication
      where time > now() - ${time}
      group by url
      limit 1
    `

    // passes various query blocks to influx
    const [versions, pingData, taskData] = await Promise.all([
      influx.query(versionQuery),
      influx.query(pingQuery),
      influx.query(taskQuery),
    ])

    const data = { versions, pingData, taskData }
    const versionsMap = versions.map((version) => version.url);
    const pingMap = pingData.map((ping) => ping.url);
    const taskMap = taskData.map((task) => task.url);

    const nodes = [
      ...versionsMap.filter((version) => (pingMap.includes(version) && taskMap.includes(version))),
      ...pingMap.filter((url) => (versionsMap.includes(url) && taskMap.includes(url))),
      ...taskMap.filter((task) => (versionsMap.includes(task) && pingMap.includes(task))),
    ].filter((value, index, self) => self.indexOf(value) === index)

    const responseData = nodes.map((url) => Object.assign(
      data.versions.filter((version) => url === version.url).shift(),
      data.pingData.filter((ping) => url === ping.url).shift(),
      data.taskData.filter((task) => url === task.url).shift(),
      { url },
    ))

    const allNodes = couch.use(('md_nodes')).list({ include_docs: true })
    // Asigns node_names from coucdb to the proper url
    await allNodes.then((body) => {
      body.rows.forEach((doc) => {
        responseData.forEach((url) => {
          // eslint-disable-next-line
          if (url.url === doc.doc.host) { url.node_name = doc.doc.node_name }
        })
      })
    })

    const listDbs = Promise.promisify(couch.db.list)
    const allDbs = await listDbs()

    const allConflicts = await Promise.all(allDbs.map(async (dbName) => {
      const db = couch.use(dbName)
      const viewConflicts = Promise.promisify(db.view)
      let conflictsReport
      try {
        const conflicts = await viewConflicts(dbName, 'conflicts')
        const numConflicts = conflicts.rows.length
        conflictsReport = {
          dbName, numConflicts, conflictsList: conflicts.rows, error: null,
        }
      } catch (err) {
        conflictsReport = {
          dbName, numConflicts: 0, conflictsList: [], error: { code: 0, msg: 'VIEW_NO_CONFIG' },
        }
      }
      return conflictsReport
    }))

    const netConflicts = {
      total: allConflicts.reduce((acc, cur) => acc + cur.numConflicts, 0),
      rows: allConflicts,
    }

    const responseDataWithConflicts =  responseData.map((nodeData) => {
      const newNodeData = { ...nodeData, conflicts: netConflicts }
      return newNodeData
    })
    return res.status(200).json(responseDataWithConflicts)
  } catch (err) {
    if (err.errno && err.errno === 'ECONNREFUSED') {
      const response = {
        statusCode: 500,
        message: 'The server could not connect to InfluxDB. Please check the host configuration.',
      }
      return res.status(500).json(response)
    }

    if (err.message && /Error from InfluxDB: database not found:/.test(err.message)) {
      const response = {
        statusCode: 500,
        message: 'The query to InfluxDB timed out. Please check the database name in the configuration.',
      }
      return res.status(500).json(response)
    }
    // console.log(err);
    return res.status(500).json(err)
  }
}

/*
  fetches historical ping data from influx
*/
export async function getResponseStats(req, res) {
  try {
    const influx = new InfluxDB({
      host: process.env.INFLUX_HOST,
      port: 8086,
      database: process.env.INFLUX_DB,
      username: process.env.INFLUX_USER,
      password: process.env.INFLUX_PASS,
      timeout: 10000,
    })

    const pingQuery = `
      select mean(average_response_ms) as ping_mean
      from couch_ping
      where time > now() - 12w group by time(1d)
      fill(0)
    `

    const httpQuery = `
      select mean(response_time) as http_mean
      from couch_http_response
      where time > now() - 12w group by time(1d)
      fill(0)
    `

    const pingData = await influx.query(pingQuery)
    const httpData = await influx.query(httpQuery)

    const stats = pingData.map((pingEntry, index) => Object.assign(pingEntry, httpData[index]))

    return res.json({ stats })
  } catch (e) {
    return res.status(500).json(e)
  }
}

export async function getReplicationStats(req, res) {
  try {
    const influx = new InfluxDB({
      host: process.env.INFLUX_HOST,
      port: 8086,
      database: process.env.INFLUX_DB,
      username: process.env.INFLUX_USER,
      password: process.env.INFLUX_PASS,
      timeout: 10000,
    })

    const repStatQuery = `
      select mean(errored_reps) as errored_docs_mean
      from couch_replication
      where time > now() - 12w group by time(1d)
      fill(0)
    `

    const stats = await influx.query(repStatQuery)

    return res.json({ stats })
  } catch (e) {
    return res.status(500).json(e)
  }
}

export async function getNodeStatusStats(req, res) {
  const { node } = req.query
  let nodeUrl
  const allNodes = couch.use(('md_nodes')).list({ include_docs: true })

  await allNodes.then((body) => {
    body.rows.forEach((doc) => {
      if (node === doc.doc.node_name) {
        nodeUrl = doc.doc.host
      }
    })
  })

  try {
    const influx = new InfluxDB({
      host: process.env.INFLUX_HOST,
      port: 8086,
      database: process.env.INFLUX_DB,
      username: process.env.INFLUX_USER,
      password: process.env.INFLUX_PASS,
      timeout: 10000,
    })

    const statusQuery = `
      select * from couch_version
      where time > now() - 7d
    `

    const statuses = await influx.query(statusQuery)
    // eslint-disable-next-line
    const stats = statuses.map((status) => {
      if (status.url === nodeUrl) {
        let value
        switch (status.app_status) {
          case 'up':
            value = 2
            break
          case 'app_conn_down':
            value = 1
            break
          case 'net_conn_down':
          default:
            value = 0
            break
        }
        return value
      }
    })
    const noNulls = stats.filter((el) => el != null);
    const filteredStats = [];

    const maxVal = 200;
    const delta = Math.floor(noNulls.length / maxVal);
    for (let i = 0; i < noNulls.length; i += delta) {
      filteredStats.push(noNulls[i]);
    }
    return res.json({ filteredStats })
  } catch (e) {
    return res.status(500).json(e)
  }
}

// Function to seperate active tasks based on ping-ability of each node in the active targets
export async function getAppStatus(req, res) {
  const time = req.query.time || '2m'
  const { node } = req.query
  let nodeUrl
  const allNodes = couch.use(('md_nodes')).list({ include_docs: true })

  // Use the node name to find the host name
  await allNodes.then((body) => {
    body.rows.forEach((doc) => {
      if (node === doc.doc.node_name) {
        nodeUrl = doc.doc.host
      }
    })
  })

  try {
    const influx = new InfluxDB({
      host: process.env.INFLUX_HOST,
      port: 8086,
      database: process.env.INFLUX_DB,
      username: process.env.INFLUX_USER,
      password: process.env.INFLUX_PASS,
      timeout: 10000,
    })

    const taskQuery = `
      select * from couch_replication
      where time > now() - ${time}
      group by url
      limit 1
    `

    const versionQuery = `
      select * from couch_version
      where time > now() - ${time}
      group by url
      limit 1
    `
    // Call for the active targets list
    const tasks = await influx.query(taskQuery)
    // Call for the app_status
    const status = await influx.query(versionQuery)
    const targets = {
      active: [],
      completed: [],
    };
    tasks.forEach((element) => {
      // Find the node we want in the list of nodes from telegraf
      if (element.url === nodeUrl) {
        // Grab the list of targets and seperate them
        const targetList = element.active_targets.split(',')
        // For each target check the app status
        targetList.forEach((target) => {
          status.forEach((app) => {
            // Format the target name to match the app url format
            if (target.slice(target.indexOf('"') + 1, target.indexOf(':6984')) === app.url) {
              // If the status is up then it is an active task
              // If the stauts is down then we consider it a completed task
              if (app.app_status === 'up') {
                targets.active.push(target.replace('{', '').replace('}', ''))
              } else {
                targets.completed.push(target.replace('{', '').replace('}', ''))
              }
            }
          })
        })
      }
    })
    return res.json({ targets })
  } catch (e) {
    return res.status(500).json(e)
  }
}

export async function getNodeGraph(req, res) {
  const time = req.query.time || '2m'
  const influx = new InfluxDB({
    host: process.env.INFLUX_HOST,
    port: 8086,
    database: process.env.INFLUX_DB,
    username: process.env.INFLUX_USER,
    password: process.env.INFLUX_PASS,
    timeout: 10000,
  })
  const targetQuery = `
      select * from couch_replication
      where time > now() - ${time}
      group by url
      limit 1
    `
  const [targetData] = await Promise.all([
    influx.query(targetQuery),
  ])

  const rawNodes = [
    ...targetData.map((target) => target.url),
  ].filter((value, index, self) => self.indexOf(value) === index)

  const responseData = rawNodes.map((url) => ({
    ...targetData.filter((target) => url === target.url).shift(),
    url,
  }))

  const allNodes = couch.use(('md_nodes')).list({ include_docs: true })
  // Asigns node_name from couchdb to proper url
  await allNodes.then((body) => {
    body.rows.forEach((doc) => {
      responseData.forEach((url) => {
        // eslint-disable-next-line
        if (url.url === doc.doc.host) { url.node_name = doc.doc.node_name }
      })
    })
  })

  const agent = new https.Agent({
    key,
    cert,
    ca,
  })
  const opts = {
    headers: couchHeaders,
    timeout: 1500,
    agent,
  }
  const nodes = [];
  const edges = [];
  // eslint-disable-next-line
  for (let i = 0; i < responseData.length; i++) {
    // couch call for all dbs amd all attributes per node
    // eslint-disable-next-line
    const getDbs = await fetch(`https://${responseData[i].url}/_all_dbs`, opts).then((rew) => {
      if (rew !== undefined) {
        if (rew.ok) {
          return rew.json();
        }
        return []
      }
    })
      .catch((error) => {
        // eslint-disable-next-line
        console.log(error)
      })
    // eslint-disable-next-line
    const getAtts = await fetch(`https://${responseData[i].url}/md_nodes/home_node`, opts).then((rew) => {
      if (rew !== undefined) {
        if (rew.ok) {
          return rew.json();
        }
        return []
      }
    })
      .catch((error) => {
        // eslint-disable-next-line
        console.log(error)
      })
    // split up results into usable strings and push data for each node and edge
    if (responseData[i].all_targets !== null && getAtts !== undefined) {
      const allTargets = responseData[i].all_targets.split(',')
      // eslint-disable-next-line
      for (let j = 0; j < allTargets.length; j++) {
        const target = allTargets[j].slice(0, allTargets[j].indexOf('":'))
        const targetUrl = target.slice(target.indexOf('"') + 1, (target.indexOf(':')))
        let targetName
        responseData.forEach((url) => {
          if (url.url === targetUrl) { targetName = url.node_name }
        })
        const repDb = target.slice(target.indexOf('6984') + 5, target.length).replace('/', '')
        edges.push({ source: responseData[i].node_name, target: targetName, db: repDb })
      }
      nodes.push({ name: responseData[i].node_name, dbs: getDbs, attributes: getAtts.attributes });
    }
  }
  const body = {
    nodes,
    edges,
  }
  res.contentType('application/json')
  return res.status(200).json(body)
}

/*
// a sample dataset representing an international game company
// tries to represent distributed servers, business operations, regional grouping
export const testgraph2 = {
  nodes: [
    { name: 'NYC', dbs: ['finances', 'profiles'], attributes:
    { region: 'USE', type: 'business', owner: 'Azure' } },
    { name: 'BOS', dbs: ['finances', 'profiles'], attributes:
    { region: 'USE', type: 'analytics', owner: 'Azure' } },
    { name: 'DC', dbs: ['gamedata', 'profiles'], attributes:
    { region: 'USE', type: 'game', owner: 'Azure' } },
    { name: 'ATL', dbs: ['gamedata', 'profiles'], attributes:
    { region: 'USE', type: 'game', owner: 'Azure' } },
    { name: 'MIA', dbs: ['profiles'], attributes:
    { region: 'USE', type: 'business', owner: 'AWS' } },
    { name: 'CLE', dbs: ['finances'], attributes:
    { region: 'USE', type: 'business', owner: 'Azure' } },
    { name: 'LA', dbs: ['finances'], attributes:
    { region: 'USW', type: 'business', owner: 'AWS' } },
    { name: 'SF', dbs: ['gamedata', 'profiles'], attributes:
    { region: 'USW', type: 'game', owner: 'AWS' } },
    { name: 'SEA', dbs: ['finances', 'profiles'], attributes:
    { region: 'USW', type: 'analytics', owner: 'AWS' } },
    { name: 'DEN', dbs: ['profiles'], attributes:
    { region: 'USC', type: 'business', owner: 'AWS' } },
    { name: 'CHI', dbs: ['gamedata', 'profiles'], attributes:
    { region: 'USC', type: 'game', owner: 'Azure' } },
    { name: 'OKC', dbs: ['finances', 'profiles', 'gamedata'], attributes:
    { region: 'USC', type: 'analytics', owner: 'AWS' } },
    { name: 'DAL', dbs: ['gamedata'], attributes:
    { region: 'USC', type: 'game', owner: 'AWS' } },
    { name: 'LON', dbs: ['finances', 'profiles'], attributes:
    { region: 'EUW', type: 'business', owner: 'AWS' } },
    { name: 'MAD', dbs: ['finances'], attributes:
    { region: 'EUW', type: 'business', owner: 'AWS' } },
    { name: 'PAR', dbs: ['gamedata'], attributes: {
       region: 'EUW', type: 'game', owner: 'AWS' } },
    { name: 'GER-W', dbs: ['finances', 'gamedata'], attributes:
    { region: 'EUC', type: 'analytics', owner: 'Azure' } },
    { name: 'GER-E', dbs: ['gamedata', 'profiles'], attributes:
    { region: 'EUC', type: 'game', owner: 'Azure' } },
    { name: 'ITA', dbs: ['profiles'], attributes:
    { region: 'EUC', type: 'business', owner: 'AWS' } },
    { name: 'AMD', dbs: ['profiles'], attributes:
    { region: 'EUC', type: 'analytics', owner: 'AWS' } },
    { name: 'SCA', dbs: ['finances'], attributes:
    { region: 'EUE', type: 'analytics', owner: 'Azure' } },
    { name: 'GRE', dbs: ['gamedata', 'profiles'], attributes:
    { region: 'EUE', type: 'game', owner: 'Azure' } },
  ],
  edges: [
    { source: 'NYC', target: 'BOS', db: 'finances' },
    { source: 'NYC', target: 'CLE', db: 'finances' },
    { source: 'NYC', target: 'BOS', db: 'profiles' },
    { source: 'NYC', target: 'LON', db: 'finances' },
    { source: 'NYC', target: 'LON', db: 'profiles' },
    { source: 'DC', target: 'ATL', db: 'gamedata' },
    { source: 'DC', target: 'CHI', db: 'gamedata' },
    { source: 'DC', target: 'CHI', db: 'profiles' },
    { source: 'DC', target: 'ATL', db: 'profiles' },
    { source: 'DC', target: 'OKC', db: 'profiles' },
    { source: 'DC', target: 'OKC', db: 'gamedata' },
    { source: 'DC', target: 'PAR', db: 'gamedata' },
    { source: 'DC', target: 'NYC', db: 'profiles' },
    { source: 'ATL', target: 'MIA', db: 'profiles' },
    { source: 'CLE', target: 'OKC', db: 'finances' },
    { source: 'ATL', target: 'DAL', db: 'gamedata' },
    { source: 'OKC', target: 'DEN', db: 'profiles' },
    { source: 'OKC', target: 'SF', db: 'gamedata' },
    { source: 'OKC', target: 'SF', db: 'profiles' },
    { source: 'OKC', target: 'LA', db: 'finances' },
    { source: 'LA', target: 'SEA', db: 'finances' },
    { source: 'CHI', target: 'SEA', db: 'profiles' },
    { source: 'LON', target: 'MAD', db: 'finances' },
    { source: 'LON', target: 'GER-W', db: 'finances' },
    { source: 'LON', target: 'SCA', db: 'finances' },
    { source: 'LON', target: 'AMD', db: 'profiles' },
    { source: 'PAR', target: 'GER-W', db: 'gamedata' },
    { source: 'GER-W', target: 'GER-E', db: 'gamedata' },
    { source: 'GER-E', target: 'GRE', db: 'gamedata' },
    { source: 'GER-E', target: 'ITA', db: 'profiles' },
    { source: 'AMD', target: 'GER-E', db: 'profiles' },
    { source: 'GER-E', target: 'GRE', db: 'profiles' },
    // note the next three are for making the graph have loops
    { source: 'CLE', target: 'SEA', db: 'finances' },
    { source: 'GRE', target: 'ITA', db: 'profiles' },
    { source: 'LON', target: 'BOS', db: 'profiles' },
  ],
} */
