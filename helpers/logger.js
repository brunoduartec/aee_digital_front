module.exports = class Logger {
  info(info, data = {}) {
    console.log(`[info]=>${info}`, data);
  }
  error(info, data = {}) {
    console.log(`[error]=>${info}`, data);
  }
  warning(info, data = {}) {
    console.log(`[warn]=>${info}`, data);
  }
};
