# Cache API
This is a Node.js and Express.js API for a simple caching system using MongoDB as the database. The API allows users to create, read, update, and delete cache entries.


## Environment Configurations
These values are in .env file and can be configured as per requirements. Default values are however provided in app.ts
- PORT
- DATABASE_URI
- TIME_TO_LIVE
- MAX_ENTRIES
- JOB_INTERVAL




## Build Instructions

1. Clone repository (first time) with `git clone` or pull updates to the repository (subsequent times) with `git pull`.
2. `cd fc-cache-api`
3. `npm install`
4. `npm run build` for building the dist directory in javascript and then `npm run start`
5. `npm run dev for development`
6. `npm run test` for tests




## API Documentation

 - Go to `http://localhost:{PORT}/api-docs/` for documentation 

## Developer Comments
- Node version: v14.17.0
- This requirement was not clear to me hence I wrote a cron-job that looks for expired cache entries and removes them from database. Interval for the job is configurable. 
- - > Every cached item has a Time To Live (TTL). If the TTL is exceeded, the cached data will not be used. A new random value will then be generated (just like cache miss). The TTL will be reset on every read/cache hit.
- I couldn't keep track of time hence couldn't write tests.

