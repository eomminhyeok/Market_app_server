import express, { Request, Response, Router } from 'express';
import db from '../index';

const router: Router = express.Router();

// 사용자 로그인 처리 라우터
router.post('/login', (req: Request, res: Response) => {
  const { user_id, password } = req.body;
    console.log("connect request");
    console.log("user_id : " + user_id);
    console.log("password : " + password)
  // 데이터베이스에서 사용자 정보를 조회하여 인증 수행

  db.query(
    'SELECT * FROM user WHERE user_id = ? AND password = ?',
    [user_id, password],
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

    'SELECT * FROM user WHERE user_id = ?',
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
          'INSERT INTO user (user_name, user_id, password, email, phone_number, address, points) VALUES (?, ?, ?, ?, ?, ?, ?)',
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


export default router;