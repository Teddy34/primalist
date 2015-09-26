# primalist
Small project to help industry bros planning.

It fetches losses from zkillboard api, and extract the list of destroyed/lost items in the last week and present it in a simple way

For production please define env variables:
-USER_AGENT (see https://github.com/zKillboard/zKillboard/wiki/API-(Killmails))
-DB_CONNECTION_STRING (connection string for posgrey connection)