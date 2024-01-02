import express, { Request, Response, Router } from 'express';
import db from '../index';

const router: Router = express.Router();


// 판매중인 상품
router.post('/sellingList', (req: Request, res: Response) => {
    // 구매내역 전송
    const { userId } = req.body;
    console.log('사용자 아이디: ' + userId);

    let query = `
        SELECT
            p.itemId,
            p.title,
            p.description,
            p.price,
            p.bid,
            p.buyer,
            p.seller,
            p.createdTime,
            p.expiryTime,
            p.bidder,
            GROUP_CONCAT(i.imageUrl) AS images
        FROM
            product p
        LEFT JOIN
            image i ON p.itemId = i.productId
        WHERE
            p.seller = ? AND p.buyer IS NULL
        GROUP BY
            p.itemId
        ORDER BY
            p.createdTime DESC
    `;

    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('판매중인 거래 불러오기 실패: ' + err.message);
            res.status(500).json({ success: false, error: 'Internal Server Error' });
            return;
        }

        if (results.length === 0) {
            // 해당하는 구매내역이 없을 때
            console.error('판매중인내역 없음');
            res.status(200).json({ success: true, posts: [] });
            return;
        }

        const posts: any[] = [];

        results.forEach((result: any) => {
            const post: any = {
                itemId: result.itemId,
                title: result.title,
                description: result.description,
                price: result.price,
                bid: result.bid,
                buyer: result.buyer,
                seller: result.seller,
                createdTime: result.createdTime,
                expiryTime: result.expiryTime,
                bidder: result.bidder,
                images: result.images.split(','), // 이미지 URL을 배열로 변환
            };

            posts.push(post);
        });

        res.status(200).json({ success: true, posts });
        console.log(posts);
    });
});
// 입찰중인 상품
router.post('/biddingList', (req: Request, res: Response) => {
    // 구매내역 전송
    const { userId } = req.body;
    console.log('사용자 아이디: ' + userId);

    let query = `
        SELECT
            p.itemId,
            p.title,
            p.description,
            p.price,
            p.bid,
            p.buyer,
            p.seller,
            p.createdTime,
            p.expiryTime,
            p.bidder,
            GROUP_CONCAT(i.imageUrl) AS images
        FROM
            product p
        LEFT JOIN
            image i ON p.itemId = i.productId
        WHERE
            p.bidder = ? AND p.buyer IS NULL
        GROUP BY
            p.itemId
        ORDER BY
            p.createdTime DESC
    `;

    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('입찰중인 거래 불러오기 실패: ' + err.message);
            res.status(500).json({ success: false, error: 'Internal Server Error' });
            return;
        }

        if (results.length === 0) {
            // 해당하는 구매내역이 없을 때
            console.error('입찰중인내역 없음');
            res.status(200).json({ success: true, posts: [] });
            return;
        }

        const posts: any[] = [];

        results.forEach((result: any) => {
            const post: any = {
                itemId: result.itemId,
                title: result.title,
                description: result.description,
                price: result.price,
                bid: result.bid,
                buyer: result.buyer,
                seller: result.seller,
                createdTime: result.createdTime,
                expiryTime: result.expiryTime,
                bidder: result.bidder,
                images: result.images.split(','), // 이미지 URL을 배열로 변환
            };

            posts.push(post);
        });

        res.status(200).json({ success: true, posts });
        console.log(posts);
    });
});
// 구매내역
router.post('/buyingList', (req: Request, res: Response) => {
    // 구매내역 전송
    const { userId } = req.body;
    console.log('사용자 아이디: ' + userId);

    let query = `
        SELECT
            p.itemId,
            p.title,
            p.description,
            p.price,
            p.bid,
            p.buyer,
            p.seller,
            p.createdTime,
            p.expiryTime,
            p.bidder,
            GROUP_CONCAT(i.imageUrl) AS images
        FROM
            product p
        LEFT JOIN
            image i ON p.itemId = i.productId
        WHERE
            p.buyer = ?
        GROUP BY
            p.itemId
        ORDER BY
            p.createdTime DESC
    `;

    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('구매내역 불러오기 실패: ' + err.message);
            res.status(500).json({ success: false, error: 'Internal Server Error' });
            return;
        }

        if (results.length === 0) {
            // 해당하는 구매내역이 없을 때
            console.error('구매내역 없음');
            res.status(200).json({ success: true, posts: [] });
            return;
        }

        const posts: any[] = [];

        results.forEach((result: any) => {
            const post: any = {
                itemId: result.itemId,
                title: result.title,
                description: result.description,
                price: result.price,
                bid: result.bid,
                buyer: result.buyer,
                seller: result.seller,
                createdTime: result.createdTime,
                expiryTime: result.expiryTime,
                bidder: result.bidder,
                images: result.images.split(','), // 이미지 URL을 배열로 변환
            };

            posts.push(post);
        });

        res.status(200).json({ success: true, posts });
        console.log(posts);
    });
});
// 판매내역
router.post('/soldList', (req: Request, res: Response) => {
    // 구매내역 전송
    const { userId } = req.body;
    console.log('사용자 아이디: ' + userId);

    let query = `
        SELECT
            p.itemId,
            p.title,
            p.description,
            p.price,
            p.bid,
            p.buyer,
            p.seller,
            p.createdTime,
            p.expiryTime,
            p.bidder,
            GROUP_CONCAT(i.imageUrl) AS images
        FROM
            product p
        LEFT JOIN
            image i ON p.itemId = i.productId
        WHERE
            p.seller = ? AND p.buyer IS NOT NULL
        GROUP BY
            p.itemId
        ORDER BY
            p.createdTime DESC
    `;

    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('구매내역 불러오기 실패: ' + err.message);
            res.status(500).json({ success: false, error: 'Internal Server Error' });
            return;
        }

        if (results.length === 0) {
            // 해당하는 구매내역이 없을 때
            console.error('구매내역 없음');
            res.status(200).json({ success: true, posts: [] });
            return;
        }

        const posts: any[] = [];

        results.forEach((result: any) => {
            const post: any = {
                itemId: result.itemId,
                title: result.title,
                description: result.description,
                price: result.price,
                bid: result.bid,
                buyer: result.buyer,
                seller: result.seller,
                createdTime: result.createdTime,
                expiryTime: result.expiryTime,
                bidder: result.bidder,
                images: result.images.split(','), // 이미지 URL을 배열로 변환
            };

            posts.push(post);
        });

        res.status(200).json({ success: true, posts });
        console.log(posts);
    });
});

export default router;