#!/usr/bin/env node

/**
 * Module dependencies.
 */

import app from "../app.js";
import createDebugger from "debug";
import http from "http";
import { port } from "../config.js";

const debug = createDebugger('express-api:start')

/**
 * Get port from the configuration and store it in Express.
 */
app.set("port", port);

/**
 * Create HTTP server.
 */
const server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on("error", onError);
server.on("listening", onListening);

/**
 * Event listener for HTTP server "error" event.
 */
function onError(error) {
  if (error.syscall !== "listen") {
    throw error;
  }

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      console.error(`Port ${port} requires elevated privileges`);
      process.exit(1);
    case "EADDRINUSE":
      console.error(`Port ${port} is already in use`);
      process.exit(1);
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
  debug(`Listening on port ${port}`);
}
