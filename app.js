const express = require('express');
const logger = require('morgan');
const cors = require('cors');

const { httpCode } = require('./helpers/constants');
const contactsRouter = require('./routes/api/contacts');

const app = express();

const formatsLogger = app.get('env') === 'development' ? 'dev' : 'short';

app.use(logger(formatsLogger));
app.use(cors());
app.use(express.json());

app.use('/api/contacts', contactsRouter);

app.use((_req, res) => {
  res.status(httpCode.NOT_FOUND).json({
    status: 'error',
    code: httpCode.NOT_FOUND,
    message: 'Not Found',
  });
});

app.use((err, _req, res, _next) => {
  const code = err.status || httpCode.INTERNAL_SERVER_ERROR;
  const status = err.status ? 'error' : 'fail';

  res.status(code).json({
    status,
    code,
    message: err.message,
  });
});

module.exports = app;
