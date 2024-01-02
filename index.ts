import express from 'express';
import mysql from 'mysql';
import bodyParser from 'body-parser';
import * as schedule from 'node-schedule';
import usersRouter from './router/userinfo';
import pointsRouter from './router/points';
import productRouter from './router/product';
import postsRouter from './router/posts';
import myPageRouter from './router/myPage';
import path from 'path';

const app = express();
const port = 8000;

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('uploads'));

const db = mysql.createConnection({
  host: '127.0.0.1',
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

const postsCheck = schedule.scheduleJob('*/1 * * * *', async () => {
  try {
    // 매 분마다 스케쥴링을 실행하여 등록기간이 지났고 구매자와 입찰자가 없는 상품은 삭제
    const deletePosts = 'DELETE FROM product WHERE expiryTime <= NOW() AND buyer IS NULL AND bidder IS NULL';
    // 스케쥴링시 입찰자가 있고 등록시간이 마감되면 상품이 낙찰되며 최종 입찰자는 구매자가됨
    const fixBuyer = `UPDATE product SET buyer = bidder WHERE expiryTime <= NOW() AND buyer IS NULL AND bidder IS NOT NULL`;
    // 낙찰시 입찰가가 즉시구매가가 되며 최종 거래가가 됨
    const fixPrice = `UPDATE product SET price = bid WHERE expiryTime <= NOW() AND buyer IS NOT NULL AND bidder IS NOT NULL`;
    // 낙찰된 상품의 판매자 아이디를 조회
    const searchSeller = 'SELECT itemId, seller, price FROM product WHERE expiryTime <= NOW() AND buyer IS NOT NULL AND bidder IS NOT NULL';
    // 조회된 판매자의 포인트에 판매대금을 추가함
    const addPoints = 'UPDATE user SET points = points + ? WHERE userId = ?';

    // 상품 삭제
    db.query(deletePosts, (err, deleteResults) => {
      if (err) {
        return db.rollback(() => {
          throw err;
        });
      }
      console.log('등록 기간 마감:', deleteResults.affectedRows);

      // 트랜잭션 시작
      db.beginTransaction((err) => {
        if (err) throw err;

        // 입찰자를 구매자로 업데이트
        db.query(fixBuyer, (err) => {
          if (err) {
            return db.rollback(() => {
              throw err;
            });
          }
          // 최종입찰가를 즉시구매가로 업데이트
          db.query(fixPrice, (err) => {
            if (err) {
              return db.rollback(() => {
                throw err;
              });
            }
            // 판매자 아이디 조회 (에러 및 결과값에 대한 타입 명시)
            db.query(searchSeller, (err: mysql.MysqlError | null, results: Array<{ itemId: number, seller: string, price: number }>) => {
              if (err) {
                return db.rollback(() => {
                  throw err;
                });
              }

              // 조회된 상품들
              results.forEach((result) => {
                const itemId = result.itemId;
                const sellerName = result.seller; // 판매자 아이디
                const reward = result.price; // 판매 대금

                // 판매자에게 판매대금 전달
                db.query(addPoints, [reward, sellerName], (err) => {
                  if (err) {
                    return db.rollback(() => {
                      throw err;
                    });
                  }
                  console.log('낙찰 완료:', itemId);
                });
              });

              // 트랜잭션 커밋
              db.commit((err) => {
                if (err) {
                  return db.rollback(() => {
                    throw err;
                  });
                }
              });
            });
          });
        });
      });
    });
  } catch (err) {
    console.error('Error deleting expired posts:', err);
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

app.use('/myPage', myPageRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default db;

