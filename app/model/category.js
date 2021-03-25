const { dbmysql } = require('../middlewares');
const TableCategories = "categories";
const TableUsersRole = "users_roles";
const TableRoles = "roles";
const TableUserDetails = "users_details";
const TableUserForgotPass = "user_forgotpassword";
const TableMerchDetails = "merchant_details";
const TableToken = "user_token_notif";
const moment = require("moment");

const util = require("util");
const query = util.promisify(dbmysql.query).bind(dbmysql);



exports.createCategory = async(param) => {
    // var que = "INSERT INTO " + TableCategories + " (categoryName,isParent,iconUrl,rowStatus) ";
     var que = "INSERT INTO " + TableCategories + " (categoryName,isParent,parentCategoryId,iconUrl,rowStatus, createdAt) ";
    que += "VALUES ('" + param.categoryName + "','" + param.isParent + "'," ;
    que += param.parentCategoryId + ",";
    que += "'" + param.iconUrl + "',1, now() )";
    console.log(que);
    var rows = await query(que);
    return rows;
}

exports.updateCategory = async(param) =>{
    var que = "UPDATE " + TableCategories + " SET categoryName = '" + param.categoryName + "', isParent = " + param.isParent;
    que += ", parentCategoryId = " + param.parentCategoryId + " , iconUrl = '" + param.iconUrl + "' , modifiedAt = now() ";
    que += "WHERE id = '" + param.id + "'";
    console.log(que);
    var rows = await query(que);
    return rows;
}

exports.deleteCategory = async(param) =>{
    var que = "UPDATE " + TableCategories + " SET rowStatus = 0, modifiedAt = now() ";
        que += "WHERE id = '" + param.id + "'";

    var rows = await query(que);
    return rows;
}

exports.getAllParentCategory = async() =>{
    var que = "SELECT * FROM " + TableCategories + " WHERE rowStatus = 1 && isParent = 1 ";

    var rows = await query(que);
    return rows;
}

exports.getAllSubCategory = async() =>{
    var que = "SELECT * FROM " + TableCategories + " WHERE rowStatus = 1 && isParent = 0 ";

    var rows = await query(que);
    return rows;
}

exports.getSubCategoryByParentId = async(parent_id) =>{
    var que = "SELECT * FROM " + TableCategories + " WHERE rowStatus = 1 && isParent = 0 && parentCategoryId = " + parent_id;

    var rows = await query(que);
    return rows;
}