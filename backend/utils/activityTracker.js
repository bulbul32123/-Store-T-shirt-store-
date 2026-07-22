let lastActivityAt = Date.now();

function trackActivity(req, res, next) {
  lastActivityAt = Date.now();
  next();
}

function getLastActivity() {
  return lastActivityAt;
}

module.exports = { trackActivity, getLastActivity };
