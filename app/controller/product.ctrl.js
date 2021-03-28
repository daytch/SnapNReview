const product = require("../model/product");



exports.insertProduct = async (param, res) => {
    var req = param.body;
    req.userId = param.userId;
    var ins = await product.createProduct(req);
    if (ins.affectedRows > 0) {
        return res.status(200).json({
            isSuccess: true,
            message: "Success insert data"
        });
    }
    else {
        return res.status(500).json({
            isSuccess: false,
            message: "Failed insert data"
        });
    }
}

exports.countViewProduct = async (param, res) => {
    var req = param.body;
    req.userId = param.userId;
    var ins = await product.countViews(req);
    if (ins.affectedRows > 0) {
        return res.status(200).json({
            isSuccess: true,
            message: "Success insert data"
        });
    }
    else {
        return res.status(500).json({
            isSuccess: false,
            message: "Failed insert data"
        });
    }
}

exports.countUpvoteProduct = async (param, res) => {
    var req = param.body;
    req.userId = param.userId;
    var hasCounted = await product.isUserhasCountedvote(req);
    if (hasCounted.length > 0) {
        return res.status(200).json({
            isSuccess: false,
            message: "user has been voted"
        });
    } else {
        var ins = await product.countUpvote(req);
        if (ins.affectedRows > 0) {
            return res.status(200).json({
                isSuccess: true,
                message: "Success insert data"
            });
        }
        else {
            return res.status(500).json({
                isSuccess: false,
                message: "Failed insert data"
            });
        }
    }

}


exports.getAllProduct = async (param, res) => {
    var rtn = {};
    try {
        var items = await product.getAllProduct(param.body);

        status = 200;
        rtn.isSuccess = true;
        rtn.message = "Success";
        rtn.data = items;
        rtn.total = items.length;
        return res.status(status).json(rtn);
    }
    catch (error) {
        rtn.isSuccess = false,
            rtn.status = 500;
        rtn.message = "There Are somethign Wrong in Our System"
        return res.status(500).json(rtn);
    }

};