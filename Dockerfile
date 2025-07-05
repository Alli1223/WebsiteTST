# Build React app
FROM node:18 as build

WORKDIR /app

# install client deps and build
COPY client/package*.json ./client/
RUN cd client && npm install
COPY client ./client
RUN cd client && npm run build

# production image
FROM node:18
WORKDIR /app

# install server deps
COPY server/package*.json ./server/
RUN cd server && npm install

COPY server ./server
COPY --from=build /app/client/build ./client/build

WORKDIR /app/server
ENV NODE_ENV=production
ENV PORT=80
EXPOSE 80
CMD ["node", "server.js"]
