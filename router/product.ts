import express, { Request, Response, Router } from 'express';
import db from '../index';
import multer from 'multer';
import path from 'path';


const router: Router = express.Router();

const storage = multer.diskStorage({
    destination: function (req: Request, file: Express.Multer.File, cb: any) {
        cb(null, 'uploads/'); // 업로드된 파일을 저장할 디렉토리 설정
    },
    filename: function (req: Request, file: Express.Multer.File, cb: any) {
        const ext = path.extname(file.originalname);
        cb(null, Date.now() + ext); // 파일명 중복을 방지하기 위해 현재 시간을 사용
    }
});

const upload = multer({ storage: storage });

router.post('/create', upload.array('images', 5), (req: Request, res: Response) => {
    const { title, description, price, bid, seller, createdTime, expiryTime } = req.body;
    const images = req.files;

    console.log("connect request");
    console.log("판매자 : " + seller);
    console.log("게시글 : " + title);
    console.log("즉시구매가 : " + price);
    console.log("경매시작가 : " + bid);
    console.log("등록시간 : " + createdTime);
    console.log("마감시간 : " + expiryTime);
    console.log("images:", images);

    const imageUrls = (req.files as Express.Multer.File[]).map((file) => {
        return file.path;
    });

    db.query(
        'INSERT INTO product (title, description, price, bid, seller, createdTime, expiryTime) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [title, description, price, bid, seller, createdTime, expiryTime],
        (err, result) => {
            if (err) {
                console.error('등록 실패 : ' + err.message);
                res.status(500).json();
            } else {
                imageUrls.forEach((imageUrl) => {
                    db.query(
                        'INSERT INTO image (productId, imageUrl) VALUES (?, ?)',
                        [result.insertId, imageUrl],
                        (err) => {
                            if (err) {
                                console.error('이미지 등록 실패 : ' + err.message);
                                res.status(500).json();
                            } else {
                                console.log('게시글 등록 완료!');
                                res.status(200).json();
                            }

                        }
                    );
                });
            }
        }
    );
});


export default router;