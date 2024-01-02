import express, { Request, Response, Router } from 'express';
import db from '../index';


const router: Router = express.Router();

// 포인트 충전 라우터
router.post('/charge', (req: Request, res: Response) => {
  const { userId, updatePoints } = req.body;
  console.log("connect request");
  console.log("userId : " + userId);
  console.log("updatePoints : " + updatePoints);

  // 1. UPDATE 쿼리 수행
  db.query(
    'UPDATE user SET points = ? WHERE userId = ?',
    [updatePoints, userId],
    (err) => {
      if (err) {
        console.error('포인트 충전 실패 : ' +err.message);
        res.status(500).json({ message: '포인트 충전 실패' });
      } else {
        // 2. 사용자의 업데이트된 포인트를 조회하는 SELECT 쿼리 수행
        db.query(
          'SELECT * FROM user WHERE userId = ?',
          [userId],
          (err, results) => {
            if (err) {
              console.error('포인트 조회 실패 : ' + err.message);
              res.status(500).json({ message: '포인트 조회 실패' });
            } else {
              // 3. 조회된 포인트를 응답으로 클라이언트에게 보냄
              const updatedPoints = results[0].points;
              res.status(200).json({ message: '포인트 충전 완료', updatedPoints: updatedPoints });
            }
          }
        );
      }
    }
  );
});

  

export default router;