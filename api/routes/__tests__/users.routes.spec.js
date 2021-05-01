import test from 'ava'
import request from 'supertest'

import server from '../..'

// Get CouchDB credentials for any tests that require it
const { COUCH_USER, COUCH_PASS } = process.env

const wrongCredentials   = { username: 'wrong', password: 'creds' }
const correctCredentials = { username: COUCH_USER, password: COUCH_PASS }

test.skip('Should deny incorrect credentials', async (t) => {
  t.plan(3)

  const res = await request(server)
    .post('/api/users/login')
    .send(wrongCredentials)
    .set('Accept', 'application/json')

  t.is(res.status, 401)
  t.true(Object.prototype.hasOwnProperty.call(res.body, 'error'))
  t.true(Object.prototype.hasOwnProperty.call(res.body, 'reason'))
})

test.skip('Should accept correct credentials', async (t) => {
  t.plan(5)

  const res = await request(server)
    .post('/api/users/login')
    .send(correctCredentials)
    .set('Accept', 'application/json')

  // Check the header status
  t.is(res.status, 200)

  // Response object has these values
  t.true(Object.prototype.hasOwnProperty.call(res.body, 'token'))
  t.true(Object.prototype.hasOwnProperty.call(res.body, 'username'))

  // Assert the value of the user object
  t.is(res.body.username, correctCredentials.username)

  // Ensure object does not have these
  t.false(Object.prototype.hasOwnProperty.call(res.body, 'password'))
})

test.skip('Should reject users with malformed or no cookie', async (t) => {
  t.plan(1)

  const res = await request(server)
    .get('/api/nodes')
    .set('Accept', 'application/json')

  t.is(res.status, 401)
})

test.skip('Should return node data for an authenticated user', async (t) => {
  t.plan(5)

  let res = await request(server)
    .post('/api/users/login')
    .send(correctCredentials)
    .set('Accept', 'application/json')

  const userToken = await res.body.token

  res = await request(server)
    .get('/api/nodes')
    .set('Cookie', userToken)
    .set('Accept', 'application/json')

  // Check the header status
  t.is(res.status, 200)

  // Ensure the response is an array
  t.true(Array.isArray(res.body))

  const nodes = res.body

  // Ensure every node has the correct attributes
  t.true(nodes.every((node) => Object.prototype.hasOwnProperty.call('node_name')
    && Object.prototype.hasOwnProperty.call(node, 'url')
    && Object.prototype.hasOwnProperty.call(node, 'active_tasks')
    && Object.prototype.hasOwnProperty.call(node, 'active_tasks_fully_synced')
    && Object.prototype.hasOwnProperty.call(node, 'triggered_documents')
    && Object.prototype.hasOwnProperty.call(node, 'error_documents')))

  // Ensure every attribute has proper type
  t.true(nodes.every((node) => typeof node.url === 'string' && typeof node.version === 'string'))
  t.true(nodes.every((node) => typeof node.active_tasks === 'number'
    && typeof node.active_tasks_fully_synced === 'number'
    && typeof node.triggered_documents === 'number'
    && typeof node.error_documents === 'number'))
})

test.skip('Should return appropriate response stats', async (t) => {
  t.plan(4)

  let res = await request(server)
    .post('/api/users/login')
    .send(correctCredentials)
    .set('Accept', 'application/json')

  const userToken = await res.body.token

  res = await request(server)
    .get('/api/nodes/stats/response')
    .set('Cookie', userToken)
    .set('Accept', 'application/json')

  t.is(res.status, 200)
  t.true(Object.prototype.hasOwnProperty.call(res.body, 'stats'))
  t.true(Array.isArray(res.body.stats))
  t.true(res.body.stats.every((stat) => Object.prototype.hasOwnProperty.call(stat, 'time')
    && Object.prototype.hasOwnProperty.call(stat, 'ping_mean')
    && Object.prototype.hasOwnProperty.call(stat, 'http_mean')))
})

test.skip('Should return appropriate replication stats', async (t) => {
  t.plan(4)

  let res = await request(server)
    .post('/api/users/login')
    .send(correctCredentials)
    .set('Accept', 'application/json')

  const userToken = await res.body.token

  res = await request(server)
    .get('/api/nodes/stats/replication')
    .set('Cookie', userToken)
    .set('Accept', 'application/json')

  t.is(res.status, 200)
  t.true(Object.prototype.hasOwnProperty.call(res.body, 'stats'))
  t.true(Array.isArray(res.body.stats))
  t.true(res.body.stats.every((stat) => Object.prototype.hasOwnProperty.call(stat, 'time')
    && Object.prototype.hasOwnProperty.call(stat, 'errored_docs_mean')))
})
