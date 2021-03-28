'use strict';
const user = require('./app/controller/user.ctrl');
// const videos = require('./app/controller/videos.ctrl');
const category = require('./app/controller/category.ctrl');
// const favorites = require('./app/controller/favorites.ctrl');
// const notification = require('./app/controller/notification.ctrl');
// const ticket = require("./app/controller/ticket.ctrl");
const product = require('./app/controller/product.ctrl');
const review = require('./app/controller/review.ctrl');
const { authJwt,dynamiclink } = require("./app/middlewares");
const fs = require("fs");

module.exports = function(app) {
    app.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.route("/")
        .get((req, response) => {
            response.writeHead(404, {
                'Content-Type': 'text/html'
            });
            fs.readFile('html/index.html', null, function (error, data) {
                if (error) {
                    response.writeHead(404);
                    respone.write('Whoops! File not found!');
                } else {
                    response.write(data);
                }
                response.end();
            });
            // response.write("Ok");
            // response.end();
        }
    );
    
    // Function for Mobile
    app.post('/user/login', user.loginUser);
    app.post('/user/loginSSO', user.loginUserSSO);
    app.post('/user/register', user.registerUser);
    app.post('/user/logout', [authJwt.isUser], user.logoutUser);

    app.post('/admin/insertCategory', category.insertCategory);
    app.post('/admin/updateCategory', category.updateCategory);
    app.post('/admin/deleteCategory', category.deleteCategory);

    app.get('/user/getAllParentCategory', category.getAllParentCategory);
    app.get('/user/getAllSubCategory', category.getAllSubCategory);
    app.get('/user/getSubCategoryByParentId', category.getSubCategoryByParentId);

    // Product
    app.post('/user/insertProduct', [authJwt.isUser], product.insertProduct);
    app.post('/user/countViewProduct', [authJwt.isUser], product.countViewProduct);
    app.post('/user/countUpvoteProduct',[authJwt.isUser], product.countUpvoteProduct);
    app.get('/user/getAllProduct', product.getAllProduct);

    // Review
    app.post('/user/insertReview', [authJwt.isUser], review.insertReview)
    app.get('/user/getAllReviewbyProduct', review.getAllReviewbyProduct);
    app.post('/user/countViewReview', [authJwt.isUser], review.countViewReview );
    app.post('/user/countUpvotereview', [authJwt.isUser], review.countUpvoteReview);
    
    // app.post('/user/actionVidComments', [authJwt.isUser], videos.actionVidComments);
    // Function for Web
    app.post('/user/resetPassword', [authJwt.isResetPassword], user.resetPassword);
    // Merchant
    // Admin
    app.post('/admin/login', user.loginAdmin);

    app.get("/shareurl/:type/:id", async(req, response) => {
        var prm = req.params;

        var type = prm.type;
        var id = prm.id;
        var agent = req.headers['user-agent'];
        var url = "https://pito.com.sg";
        if(agent.includes("Android") || agent.includes("iPhone") || agent.includes("iPad") || agent.includes("iPod")){
            url = "pito://"+type+"?"+type+"_id="+id;
        }

        response.writeHead(200, {
            'Content-Type': 'text/html'
        });
        response.write("<html><head><title>PITO</title></head><body>Redirect to</body><script>location.replace('"+url+"');</script></html>");
        response.end();
    });
    
    app.get('/tes_jwt', [authJwt.isUser], function(req,res){
        res.json({message : 'Berhasil tes token'});
    });

    app.post("/tesf", function(req,res){
        console.log(req.headers);
        console.log(req.body);
        return res.json({
            sts : "ok"
        });
    });
};