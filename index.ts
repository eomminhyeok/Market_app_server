import express from 'express';
import mysql from 'mysql';
import bodyParser from 'body-parser';
import usersRouter from './router/userinfo';
import pointsRouter from './router/points';

const app = express();
const port = 8000;

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const db = mysql.createConnection({
  host: '127.0.0.1' ,
  user: 'root',
  password: 'Jela7839!',
  database: 'market_app',
});

db.connect((err) => {
  if (err) {
    console.error('DB 연결 실패:', err);
    return;
  }
  console.log('DB 연결 성공.');
});

app.get('/', (req, res) => {
  res.send('서버 접속 성공');
});

app.get('/user', (req, res) => {
  const query = 'SELECT * FROM user';

  db.query(query, (err, results) => {
    if (err) {
      console.error('유저 정보를 가져오기 실패:', err);
      res.status(500).json({ error: '유저 정보 가져오기 실패'});
      return;
    }
    res.json(results);
  });
});

app.use('/userinfo', usersRouter);

app.use('/points', pointsRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default db;

