const express = require('express');
const path = require('path');
const logger = require('morgan');
const cors = require('cors');
const boolParser = require('express-query-boolean');
const helmet = require('helmet');
require('dotenv').config();

const { jsonLimit } = require('./config/rate-limit.json');
const { limiter } = require('./helpers/limiter');
const { HttpCode } = require('./helpers/constants');
const usersRouter = require('./routes/api/users');
const contactsRouter = require('./routes/api/contacts');

const app = express();

const formatsLogger = app.get('env') === 'development' ? 'dev' : 'short';

app.use(helmet()); // устанавливает дополнительные заголовки (безопасность)

const AVATARS_DIR = path.join('public', process.env.AVATARS_DIR);
app.use(express.static(path.join(__dirname, AVATARS_DIR)));

app.use(limiter); // количество запросов с одного IP
app.get('env') !== 'test' && app.use(logger(formatsLogger));
app.use(cors());
app.use(express.json({ limit: jsonLimit })); // лимит в байтах
app.use(boolParser()); // приводит строку 'true' к булеану true, строку 'false' к булеану false

app.use('/api/users', usersRouter);
app.use('/api/contacts', contactsRouter);

app.use((_req, res) => {
  res.status(HttpCode.NOT_FOUND).json({
    status: 'error',
    code: HttpCode.NOT_FOUND,
    message: 'Not Found',
  });
});

app.use((err, _req, res, _next) => {
  const code = err.status || HttpCode.INTERNAL_SERVER_ERROR;
  const status = err.status ? 'error' : 'fail';

  res.status(code).json({
    status,
    code,
    message: err.message,
  });
}); // все ошибки переданные в next формируются здесь

module.exports = app;
