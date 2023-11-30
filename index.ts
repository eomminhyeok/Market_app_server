import express from 'express';
import mysql from 'mysql';
import bodyParser from 'body-parser';
import * as schedule from 'node-schedule';
import usersRouter from './router/userinfo';
import pointsRouter from './router/points';
import productRouter from './router/product';
import postsRouter from './router/posts';
import path from 'path';

const app = express();
const port = 8000;

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('uploads'));

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

const job = schedule.scheduleJob('*/1 * * * *', async () => {
  try {
    // 현재 시간보다 expiryTime이 이전인 게시물 검색
    const sql = 'DELETE FROM product WHERE expiryTime <= NOW()';
    db.query(sql, (error, results) => {
      if (error) throw error;
      console.log('Expired posts deleted:', results.affectedRows);
    });
  } catch (error) {
    console.error('Error deleting expired posts:', error);
  }
});

app.use('/userinfo', usersRouter);

app.use('/points', pointsRouter);

app.use('/product', productRouter);

app.use('/posts', postsRouter);

app.get('/getImage', (req, res) => {
  const imagePath = req.query.imagePath as string;
  console.log(imagePath);
  res.sendFile(path.join(__dirname, imagePath));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default db;

