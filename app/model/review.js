const { dbmysql } = require('../middlewares');
const TableProduct = "reviews";

const util = require("util");
const query = util.promisify(dbmysql.query).bind(dbmysql);


exports.insertReview =  async(param)=>{
    var que = "INSERT INTO reviews (description, rate, productId, userId)"
    que += "VALUES('"+param.description+"', "+param.rate+", "+param.productId+", "+param.userId+" )"
    console.log(que);
    var rows = await query(que);
    return rows;
}

exports.getAllReviewbyProduct = async(param)=>{
    var que = "SELECT r.id, IFNULL(reviewVote.voted, 0) as voted, r.description, r.rate, u.name , dtl.img_avatar "
    que += "FROM Reviews r "
    que += "JOIN users u ON r.userId = u.id "
    que += "JOIN users_details dtl ON dtl.userId = u.id "
    que += "LEFT JOIN ( SELECT reviewId, COUNT(id) as voted FROM review_upvotes GROUP BY reviewId) reviewVote ON reviewVote.reviewId = r.id "
    que += "WHERE  r.productId = "+param.productId+" AND r.rowStatus = 1 AND u.isactive = 1 AND dtl.isMute = 0 "
    console.log(que);
    var rows = await query(que);
    console.log(rows);
    return rows;
}

exports.countView = async(param)=>{
    var que = "UPDATE reviews SET views= views+1 WHERE id ="+param.reviewId;
    var rows = await query(que);
    return rows;
}

exports.countUpvote = async (param) =>{

    var que = "INSERT INTO review_upvotes (userId, reviewId) ";
    que += "VALUES(" + param.userId+", "+param.id+" )"
    console.log(que);
    var rows = await query(que);

    return rows;
}

exports.isUserhasCountedvote = async(param) =>{

    var que = "SELECT id FROM review_upvotes WHERE userId ="+param.userId;
    var rows = await query(que);
    return rows;
}