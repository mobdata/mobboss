# MobBoss API

### Environment Variables

MobBoss currently depends on specific user-specified environment variables. For example, MobBoss uses CouchDB credentials to test the API and to authenticate the user. The MobBoss repository provides a blank template for all of the required variables inside of `.env.example` in the root folder.

```toml
INFLUX_USER=
INFLUX_PASS=
INFLUX_HOST=
INFLUX_DB=

COUCH_AUTH_SECRET=
COUCH_URL=
COUCH_USER=
COUCH_PASS=
```
