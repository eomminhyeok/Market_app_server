import express, { Request, Response, Router } from 'express';
import db from '../index';


const router: Router = express.Router();

// 사용자 로그인 처리 라우터
router.post('/charge', (req: Request, res: Response) => {
    const { userId, updatePoints} = req.body;
      console.log("connect request");
      console.log("userId : " + userId);
      console.log("updatePoints : " + updatePoints)

    db.query(
      'UPDATE user SET points = ? WHERE user_id = ?',
      [updatePoints,userId],
      (err) => {
        if(err) {
            console.error('포인트 충전 실패 : ' + err.message);
            res.status(500).json({message : '포인트 충전 실패'});
        } else {
            res.status(200).json({message : '포인트 충전 완료'});
        }
      }
    );
  });
  

export default router;