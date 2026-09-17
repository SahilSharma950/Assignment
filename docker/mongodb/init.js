// Runs once, automatically, the first time the mongodb container starts with
// an empty data volume (docker-entrypoint-initdb.d convention).
//
// Indexes are defined on the Mongoose schemas themselves and are created by
// the application on connect, so there's nothing this needs to seed today —
// this file exists so the docker-compose.yml bind mount has something to
// mount without failing.
