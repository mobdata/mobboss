import couchSettings from '../../lib/couchdb/config'

const couch = require('nano')(couchSettings.couchUrl)

export function getRevision(req, res) {
  const { db, id, rev } = req.params
  const dbObj = couch.use(db)
  dbObj.get(id, { rev }, (err, body) => {
    let responseValue
    if (err) {
      responseValue = res.json(err)
    } else {
      responseValue = res.json(body)
    }
    return responseValue
  })
}

export function getPreviousRevision(req, res) {
  const { db, id } = req.params
  const dbObj = couch.use(db)

  dbObj.get(id, { revs_info: true }, (err, body) => {
    let responseValue
    if (err) {
      responseValue = res.json(err)
    } else {
      responseValue = res.json(body)
    }
    return responseValue
  })
}

export async function updateDoc(req, res) {
  const { db } = req.params
  const { docs } = req.body

  const dbObj = couch.use(db)

  dbObj.bulk({ docs }).then((err, body) => {
    let responseValue
    if (err) {
      responseValue = res.json(err)
    } else {
      responseValue = res.json(body)
    }
    return responseValue
  });
}
