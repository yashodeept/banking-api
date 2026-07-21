const { v4: uuidv4 } = require("uuid");
const { AsyncLocalStorage } = require("async_hooks");

const requestContext = new AsyncLocalStorage();

const requestIdMiddleware = (req, res, next) => {
  const requestId = req.headers["x-request-id"] || uuidv4();
  req.id = requestId;
  res.setHeader("X-Request-ID", requestId);

  requestContext.run(new Map([["requestId", requestId]]), () => {
    next();
  });
};

module.exports = {
  requestContext,
  requestIdMiddleware,
};
