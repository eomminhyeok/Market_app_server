import express, { Request, Response, Router } from 'express';
import db from '../index';

const router: Router = express.Router();

// 사용자 로그인 처리 라우터
router.post('/login', (req: Request, res: Response) => {
  const { userId, password } = req.body;
    console.log("connect request");
    console.log("userId : " + userId);
    console.log("password : " + password)
  // 데이터베이스에서 사용자 정보를 조회하여 인증 수행

  db.query(
    'SELECT * FROM user WHERE userId = ? AND password = ?',
    [userId, password],
    (err, results) => {
      if (err) {
        console.error('데이터베이스 오류:', err);
        res.status(500).json({ message: '서버 오류' });
        return;
      }

      if (results.length === 1) {
        const user_name = results[0].user_name;
        const points = results[0].points;

        // 로그인 성공
        res.status(200).json({ message: '로그인 성공', user_name : user_name, points: points});
      } else {
        // 로그인 실패
        res.status(401).json({ message: '로그인 실패' });
      }
    }
  );
});

//회원가입 라우터
router.post('/sign', (req: Request, res: Response) => {
  const { userName, userId, password, email, phoneNumber, address } = req.body;
    console.log("connect request");
    console.log("Name : " + userName);
    console.log("userId : " + userId);
    console.log("password : " + password);
    console.log("email : " + email);
    console.log("phoneNumber : " + phoneNumber);
    console.log("address : " + address);
    
    
  // 데이터베이스에서 사용자 정보를 조회하여 인증 수행
  db.query(

    'SELECT * FROM user WHERE userId = ?',
    [userId],
    (err, results) => {
      if (err) {
        console.error('데이터베이스 오류:', err);
        res.status(500).json({ message: '서버 오류' });
        return;
      }

      if (results.length === 1) { 
        // 회원가입 실패
        res.status(401).json({ message: '이미 존재하는 아이디입니다.' });
      } 
      
      else {
        // 회원가입 성공
        db.query(
          'INSERT INTO user (user_name, userId, password, email, phone_number, address, points) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [userName, userId, password, email, phoneNumber, address, 0],
          (err) => {
            if (err) {
              console.error('데이터베이스 오류:', err);
              res.status(500).json({ message: '회원가입 살패' });
              return;
            }

            // 회원가입 성공
            res.status(200).json({ message: '회원가입 성공!' });
          }
        );
      }
    }
  );
});

// 사용자 포인트 다시 불러오기
router.post('/updateName', (req: Request, res: Response) => {
  const { userId } = req.body;
    console.log("connect request");
    console.log("userId : " + userId);
  // 데이터베이스에서 사용자 정보를 조회하여 인증 수행

  db.query(
    'SELECT * FROM user WHERE userId = ?',
    [userId],
    (err, results) => {
      if (err) {
        console.error('데이터베이스 오류:', err);
        res.status(500).json({ message: '서버 오류' });
        return;
      }

      if (results.length === 1) {
        const points = results[0].points;

        // 로그인 성공
        res.status(200).json({ message: '로그인 성공', points: points});
      } else {
        // 로그인 실패
        res.status(401).json({ message: '로그인 실패' });
      }
    }
  );
});

router.post('/searchName', (req: Request, res: Response) => {
  const { seller, buyer } = req.body;
  console.log("connect request");
  console.log("userId : " + seller);

  // seller 정보 조회
  db.query(
    'SELECT * FROM user WHERE userId = ?',
    [seller],
    (err, results) => {
      if (err) {
        console.error('판매자 이름 조회 실패:', err);
        res.status(500).json({ message: '서버 오류' });
        return;
      }

      if (results.length === 1) {
        const sellerName = results[0].user_name;

        // buyer가 null이 아닌 경우
        if (buyer !== null) {
          // buyer 정보 조회
          db.query(
            'SELECT user_name FROM user WHERE userId = ?',
            [buyer],
            (err, results) => {
              if (err) {
                console.error('구매자 이름 조회 실패:', err);
                res.status(500).json({ message: '서버 오류' });
                return;
              }

              if (results.length === 1) {
                const buyerName = results[0].user_name;

                res.status(200).json({ sellerName: sellerName, buyerName: buyerName });
              } else {
                res.status(401).json({ message: '구매자 이름 불러오기 실패' });
              }
            }
          );
        } else {
          // buyer가 null인 경우
          res.status(200).json({ sellerName: sellerName, buyerName: null });
        }
      } else {
        res.status(401).json({ message: '판매자 이름 불러오기 실패' });
      }
    }
  );
});


export default router;