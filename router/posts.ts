import express, { Request, Response, Router } from 'express';
import db from '../index';

const router: Router = express.Router();

// 메인화면 게시글 불러오기
router.get('/newPosts', (req: Request, res: Response) => {
    // 게시글 자료 전송(가장 최근에 생성된 게시글 부터 전송)
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
            p.buyer IS NULL
        GROUP BY
            p.itemId
        ORDER BY
            p.createdTime DESC
        LIMIT
            2
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
// 검색화면 게시글 불러오기
router.get('/searchPosts', (req: Request, res: Response) => {
    // 검색페이지 게시글 자료 전송(req로 받은 조건에 맞춰 게시글 정보 전송)
    const { keyword, max, min, limit, lineUp } = req.body;
    console.log('정렬: ' + lineUp);
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
    `;

    // 조건이 있을 경우 WHERE 절 추가
    let whereClause = '';

    // 키워드 조건
    if (keyword) {
        whereClause += `p.title LIKE '%${keyword}%' AND `;
    }

    // 최소 입찰가 조건
    if (min) {
        whereClause += `p.bid >= ${min} AND `;
    }

    // 최대 입찰가 조건
    if (max) {
        whereClause += `p.bid <= ${max} AND `;
    }

    // 구매자가 없는 경우 조건
    whereClause += 'p.buyer IS NULL';

    // whereClause가 비어 있지 않은 경우에만 WHERE 절 추가
    if (whereClause) {
        query += `WHERE ${whereClause}`;
    }

    query += `
        GROUP BY
            p.itemId
        ORDER BY
            ${lineUp}
        LIMIT
            ${limit}
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
// 구매 라우터
router.post('/buying', (req: Request, res: Response) => {
    // 상품 즉시구매 라우터
    const { itemId, userId, deductPoints, currentBidder, price, bid, time } = req.body;
    console.log("itemId: " + itemId);
    console.log("구매자: " + userId);
    console.log("구매 후 잔여 포인트: " + deductPoints);

    db.beginTransaction((err) => {
        if (err) {
            console.error('트랜잭션 에러:', err);
            res.status(500).send('구매 실패');
            return;
        }

        const updateBuyer = 'UPDATE product SET buyer = ? WHERE itemId = ?';  // 구매자 업데이트
        const buyingTime = 'UPDATE product SET expiryTime = ? WHERE itemId = ?'; // 마감시간에 구매일자를 입력
        const deleteBidder = 'UPDATE product SET bidder = NULL WHERE itemId = ?';   // 기존 입찰자 삭제
        const deduction = 'UPDATE user SET points = ? WHERE userId = ?'; // 포인트 차감
        const refundPoints = 'UPDATE user SET points = points + ? WHERE userId = ?'; // 기존 입찰자에게 포인트 반환
        const searchSeller = 'SELECT seller FROM product WHERE itemId = ?'; // 상품 판매자 조회
        const addPoints = 'UPDATE user SET points = points + ? WHERE userId = ?'; // 상품 판매자에게 판매대금 충전


        db.query(updateBuyer, [userId, itemId], (err) => {
            if (err) {
                // 쿼리 실행 실패시 원래 상태로 롤백
                db.rollback(() => {
                    console.error('구매자 업데이트 실패:', err);
                    res.status(500).send('구매자 업데이트 실패');
                });
                return;
            }

            db.query(buyingTime, [time, itemId], (err) => {
                if (err) {
                    // 쿼리 실행 실패시 원래 상태로 롤백
                    db.rollback(() => {
                        console.error('구매일자 업데이트 실패:', err);
                        res.status(500).send('구매일자 업데이트 실패');
                    });
                    return;
                }

                db.query(deleteBidder, [itemId], (err) => {
                    if (err) {
                        db.rollback(() => {
                            console.error('입찰자 삭제 실패:', err);
                            res.status(500).send('입찰자 삭제 실패');
                        });
                        return;
                    }
                    if (currentBidder != null) {
                        db.query(deduction, [deductPoints, userId], (err) => {
                            if (err) {
                                db.rollback(() => {
                                    console.error('포인트 차감 실패:', err);
                                    res.status(500).send('포인트 차감 실패');
                                });
                                return;
                            }

                            db.query(refundPoints, [bid, currentBidder], (err) => {
                                if (err) {
                                    db.rollback(() => {
                                        console.error('포인트 반환 실패:', err);
                                        res.status(500).send('포인트 반환 실패');
                                    });
                                    return;
                                }

                                db.query(searchSeller, [itemId], (err, results) => {
                                    if (err) {
                                        db.rollback(() => {
                                            console.error('판매자 조회 실패:', err);
                                            res.status(500).send('판매자 조회 실패');
                                        });
                                        return;
                                    }

                                    const sellerId = results[0].seller; // 조회된 판매자의 아이디를 저장 (에러 발생시 롤백의 결과가 배열이므로 results[] 사용)

                                    db.query(addPoints, [price, sellerId], (err) => {
                                        if (err) {
                                            db.rollback(() => {
                                                console.error('판매대금 전달 실패:', err);
                                                res.status(500).send('판매대금 전달 실패');
                                            });
                                            return;
                                        }


                                        // 구매자, 입찰자 업데이트 성공시 커밋
                                        db.commit((err) => {
                                            if (err) { // 커밋 오류시 에러
                                                db.rollback(() => {
                                                    console.error('트랜잭션 커밋 오류:', err);
                                                    res.status(500).send('트랜잭션 커밋 오류');
                                                });
                                            } else {
                                                db.query(
                                                    'SELECT * FROM user WHERE userId = ?',
                                                    [userId],
                                                    (err, results) => {
                                                        if (err) {
                                                            db.rollback(() => {
                                                                console.error('포인트 조회 실패 : ' + err);
                                                                res.status(500).json({ message: '포인트 조회 실패' });
                                                            })
                                                        } else {
                                                            // 조회된 포인트를 응답으로 클라이언트에게 보냄
                                                            const updatedPoints = results[0].points;
                                                            res.status(200).json({ message: '구매 완료!', updatedPoints: updatedPoints });
                                                        }
                                                    }
                                                );
                                            }
                                        });
                                    });
                                });
                            });

                        });
                    }
                });
            });
        });
    });


});
// 입찰 라우터
router.post('/bidding', (req: Request, res: Response) => {
    // 상품 입찰 라우터
    const { itemId, userId, bid, deductPoints, currentBidder, newBid } = req.body;
    console.log("ID: " + itemId);
    console.log("입찰자: " + userId);
    console.log('현재 입찰가: ' + bid);
    console.log('현재 입찰자: ' + currentBidder);
    console.log("입찰 후 잔여 포인트: " + deductPoints);
    console.log('입찰가 갱신: ' + newBid);

    db.beginTransaction((err) => {
        if (err) {
            console.error('트랜잭션 에러:', err);
            return res.status(500).send('구매 실패');
        }

        const updateBidder = 'UPDATE product SET bidder = ? WHERE itemId = ?';  // 입찰자 업데이트
        const deduction = 'UPDATE user SET points = ? WHERE userId = ?'; // 포인트 차감
        const updateBid = 'UPDATE product SET bid = ? WHERE itemId = ?'; // 입찰가 갱신
        const refundPoints = 'UPDATE user SET points = points + ? WHERE userId = ?'; // 기존 입찰자에게 포인트 반환

        db.query(updateBidder, [userId, itemId], (err) => {
            if (err) {
                // 쿼리 실행 실패시 원래 상태로 롤백
                db.rollback(() => {
                    console.error('입찰자 업데이트 실패:', err);
                    return res.status(500).send('입찰자 업데이트 실패');
                });
                return;
            }

            db.query(deduction, [deductPoints, userId], (err) => {
                if (err) {
                    db.rollback(() => {
                        console.error('포인트 차감 실패:', err);
                        return res.status(500).send('포인트 차감 실패');
                    });
                    return;
                }

                db.query(updateBid, [newBid, itemId], (err) => {
                    if (err) {
                        db.rollback(() => {
                            console.log('입찰가 갱신 실패', err);
                            return res.status(500).send('낙찰가 갱신 실패');
                        })
                        return;
                    }

                    if (currentBidder != null) {
                        db.query(refundPoints, [bid, currentBidder], (err) => {
                            if (err) {
                                db.rollback(() => {
                                    console.error('기존입찰자 포인트 반환 실패:', err);
                                    return res.status(500).send('기존입찰자 포인트 반환 실패');
                                });
                                return;
                            }

                            // 구매자, 입찰자 업데이트 성공시 커밋
                            db.query(
                                'SELECT bid FROM product WHERE itemId = ?',
                                [itemId],
                                (err, result) => {
                                    if (err) {
                                        db.rollback(() => {
                                            console.error('상품 입찰 정보 조회 실패:', err);
                                            return res.status(500).send('상품 입찰 정보 조회 실패');
                                        });
                                    } else {
                                        const updatedBid = result[0].bid;
                                        db.query(
                                            'SELECT * FROM user WHERE userId = ?',
                                            [userId],
                                            (err, results) => {
                                                if (err) {
                                                    db.rollback(() => {
                                                        console.error('포인트 조회 실패 : ' + err);
                                                        return res.status(500).json({ message: '포인트 조회 실패' });
                                                    })
                                                } else {
                                                    // 조회된 포인트를 응답으로 클라이언트에게 보냄
                                                    const updatedPoints = results[0].points;
                                                    db.commit((err) => {
                                                        if (err) { // 커밋 오류시 에러
                                                            db.rollback(() => {
                                                                console.error('트랜잭션 커밋 오류:', err);
                                                                return res.status(500).send('트랜잭션 커밋 오류');
                                                            });
                                                        } else {
                                                            return res.status(200).json({ message: '입찰 성공!', updatedPoints: updatedPoints, updatedBid: updatedBid });
                                                        }
                                                    });
                                                }
                                            }
                                        );
                                    }
                                }
                            );
                        });
                    }
                });
            });
        });
    });
});




export default router;