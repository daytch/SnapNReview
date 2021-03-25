
const category = require("../model/category");



exports.insertCategory = async(param, res) => {
    var req = param.body;

    var ins = await category.createCategory(req);
    if(ins.affectedRows > 0){
        return res.status(200).json({
            isSuccess : true,
            message : "Success insert data"
        });
    }
    else {
        return res.status(500).json({
            isSuccess : false,
            message : "Failed insert data"
        });
    }
}

exports.updateCategory = async(param, res) => {
    var req = param.body;

    var ins = await category.updateCategory(req);
    if(ins.affectedRows > 0){
        return res.status(200).json({
            isSuccess : true,
            message : "Success update data"
        });
    }
    else {
        return res.status(500).json({
            isSuccess : false,
            message : "Failed update data"
        });
    }
}

exports.deleteCategory = async(param, res) => {
    var req = param.body;

    var ins = await category.deleteCategory(req);
    if(ins.affectedRows > 0){
        return res.status(200).json({
            isSuccess : true,
            message : "Success update data"
        });
    }
    else {
        return res.status(500).json({
            isSuccess : false,
            message : "Failed update data"
        });
    }
}

exports.getAllParentCategory = async(param, res) => {
    var cat = await category.getAllParentCategory();
    var listcat = [];
    

    for(var c of cat){
        var objCat = {
            id : c.id,
            text : c.categoryName,
            iconUrl : c.iconUrl

        };
        listcat.push(objCat);
    }

    var status = 500;
    var rtn = {
        isSuccess: false,
        message: "Failed",
        data : [
            objCat
        ],
        total: 0
    }
    if(listcat.length > 0){
        status = 200;
        rtn.isSuccess = true;
        rtn.message = "Success";
        rtn.data = listcat;
        rtn.total = listcat.length;
    }

    return res.status(status).json(rtn);
};

exports.getAllSubCategory = async(param, res) => {
    var cat = await category.getAllSubCategory();
    var listcat = [];
    

    for(var c of cat){
        var objCat = {
            id : c.id,
            text : c.categoryName,
            iconUrl : c.iconUrl,
            parentCategoryId : c.parentCategoryId

        };
        listcat.push(objCat);
    }

    var status = 500;
    var rtn = {
        isSuccess: false,
        message: "Failed",
        data : [
            objCat
        ],
        total: 0
    }
    if(listcat.length > 0){
        status = 200;
        rtn.isSuccess = true;
        rtn.message = "Success";
        rtn.data = listcat;
        rtn.total = listcat.length;
    }

    return res.status(status).json(rtn);
};

exports.getSubCategoryByParentId = async(param, res) => {
    var query = param.query;
    var cat = await category.getSubCategoryByParentId(query.parentId);
    var listcat = [];
    

    for(var c of cat){
        var objCat = {
            id : c.id,
            text : c.categoryName,
            iconUrl : c.iconUrl,
            parentCategoryId : c.parentCategoryId

        };
        listcat.push(objCat);
    }

    var status = 500;
    var rtn = {
        isSuccess: false,
        message: "Failed",
        data : [
            objCat
        ],
        total: 0
    }
    if(listcat.length > 0){
        status = 200;
        rtn.isSuccess = true;
        rtn.message = "Success";
        rtn.data = listcat;
        rtn.total = listcat.length;
    }

    return res.status(status).json(rtn);
}