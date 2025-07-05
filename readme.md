# Website for TST

This repo contains a simple React/Node photo gallery with authentication.

## Setup

Run the server:
```bash
cd server
npm install
npm start
```

Run the client:
```bash
cd client
npm install
npm start
```

### Docker

You can also run the entire application in Docker. This will build the React
app and start the Node server listening on port 80:

```bash
make run
```

Add any favicon or logo images you want to use into `client/public` and update
`index.html` and `manifest.json` accordingly.
