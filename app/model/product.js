const { dbmysql } = require('../middlewares');
const TableProduct = "products";
const TableProductImages = "product_images";

const util = require("util");
const query = util.promisify(dbmysql.query).bind(dbmysql);

exports.createProduct = async (param) => {
    // var que = "INSERT INTO " + TableCategories + " (categoryName,isParent,iconUrl,rowStatus) ";
    var que = "INSERT INTO " + TableProduct + " (userId,categoryId, productName, isAnonymous,rowStatus) ";
    que += "VALUES (" + param.userId + "," + param.categoryId + ",";
    que += "'" + param.productName + "'," + param.isAnonymous + ",1 )";
    console.log(que);
    var rows = await query(que);
    console.log(rows);
    return rows;
}

exports.countViews = async (param) =>{
    var que = "UPDATE " +TableProduct +" SET views = views+1 WHERE id ="+param.id
    var rows = await query(que);

    return rows;
}

exports.countUpvote = async (param) =>{

    var que = "INSERT INTO product_upvotes (userId, productId) ";
    que += "VALUES(" + param.userId+", "+param.id+" )"
    console.log(que);
    var rows = await query(que);

    return rows;
}

exports.isUserhasCountedvote = async(param) =>{

    var que = "SELECT id FROM product_upvotes WHERE userId ="+param.userId;
    var rows = await query(que);
    return rows;
}

 exports.getAllProduct = async(param) =>{
    var que = "SELECT pro.id, pro.categoryId, pro.productName, IFNULL(productVote.voted,0) as voted, pro.views, pro.createdAt, pro.isAnonymous, usr.name, usrdetail.img_avatar, productRate.rate, productRate.countedRate  FROM products pro "
    que +=  "JOIN users usr on pro.userId = usr.id ";
    que += "JOIN users_details usrdetail on usrdetail.userId = usr.id ";
    que += "JOIN (SELECT product.id, AVG(reviews.rate) as rate, COUNT(reviews.rate) as countedRate FROM products product "
    que += "JOIN reviews ON product.id = reviews.productId "
    que += "GROUP BY id ) productRate ON productRate.id = pro.id "
    que += "LEFT JOIN ( SELECT productId, COUNT(id) as voted FROM product_upvotes GROUP BY productId) productVote ON productVote.productId = pro.id "
    que += "WHERE pro.rowStatus = 1 AND usr.isactive = 1 AND usrdetail.isMute = 0 ";
    if (param != undefined && param.categoryId != "" && param.categoryId != undefined) {
        que += "AND pro.categoryId = "+param.categoryId;
    }
    var rows = await query(que);
    return rows;
}


