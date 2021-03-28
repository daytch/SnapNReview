const review = require("../model/review");



exports.insertReview = async (param, res) => {
    var req = param.body;
    req.userId = param.userId;
    var ins = await review.insertReview(req);
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
exports.getAllReviewbyProduct = async (param, res) => {
    var rtn = {};
    try {
        var items = await review.getAllReviewbyProduct(param.body);

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


exports.countViewReview= async (param, res) => {
    var req = param.body;
    req.userId = param.userId;
    var ins = await review.countView(req);
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

exports.countUpvoteReview= async (param, res) => {
    var req = param.body;
    req.userId = param.userId;
    var req = param.body;
    req.userId = param.userId;
    var hasCounted = await review.isUserhasCountedvote(req);
    if (hasCounted.length > 0) {
        return res.status(200).json({
            isSuccess: false,
            message: "user has been voted"
        });
    } else {
        var ins = await review.countUpvote(req);
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
