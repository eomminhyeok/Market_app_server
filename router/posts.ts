import express, { Request, Response, Router } from 'express';
import { request } from 'http';
import db from '../index';
import path from 'path';

const router: Router = express.Router();

router.get('/newPosts', (req: Request, res: Response) => { // 게시글 자료 전송
    const query = `
        SELECT
            p.item_id,
            p.title,
            p.description,
            p.price,
            p.bid,
            p.seller,
            p.createdTime,
            p.expiryTime,
            GROUP_CONCAT(i.imageUrl) AS images
        FROM
            product p
        LEFT JOIN
            image i ON p.item_id = i.productId
        GROUP BY
            p.item_id
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('게시글 및 이미지 조회 실패: ' + err.message);
            res.status(500).json({ success: false, error: 'Internal Server Error' });
            return;
        }

        const posts: any[] = [];

        results.forEach((result: any) => {
            const post: any = {
                item_id: result.item_id,
                title: result.title,
                description: result.description,
                price: result.price,
                bid: result.bid,
                seller: result.seller,
                createdTime: result.createdTime,
                expiryTime: result.expiryTime,
                images: result.images.split(','), // 이미지 URL을 배열로 변환
            };

            posts.push(post);
        });

        res.status(200).json({ success: true, posts });
        console.log(posts);
    });
});

export default router;
