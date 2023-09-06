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
        // 로그인 성공
        res.status(200).json({ message: '로그인 성공' });
      } else {
        // 로그인 실패
        res.status(401).json({ message: '로그인 실패' });
      }
    }
  );
});



export default router;