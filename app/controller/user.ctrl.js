const config = require("../config/auth.config");
const users = require("../model/users");

const jwt = require("jsonwebtoken");
const { mailer, uploadfile, dynamiclink } = require("../middlewares");
const moment = require("moment");
const bcrypt = require("bcrypt");
const config_upload = require("../config/upload.config");
const conf_paging = require("../config/paging.config");
const formidable = require("formidable");

const from_year = 2019;

exports.loginUser = async (param, res) => {
    // res.json({message : 'halo ' + req.username + ', pass ' + req.password});
    var req = param.body;
    if (req.email == "") {
        // Gagal
        return res.status(500).json({
            isSuccess: false,
            message: "Login Failed, email has been null"
        });
    }
    var verif = await verifyLogin(req.email, req.password, req.token, req.type);
    if (!verif) {
        return res.status(500).json({
            isSuccess: false,
            message: 'Username or password did not match'
        });
    }

    await users.loginUser(req.email, "User", res, this.processLogin);
};

exports.loginUserSSO = async (param, res) => {
    // res.json({message : 'halo ' + req.username + ', pass ' + req.password});
    var req = param.body;
    if (req.email == undefined || req.email == "") {
        // Gagal
        return res.status(500).json({
            isSuccess: false,
            message: "Login Failed"
        });
    }
    var login = await users.loginUserSSO(req.email, "User");
    if (login.length == 0) {
        var salt = await bcrypt.genSalt(config.regSalt);
        var password = await bcrypt.hash("defaultpassSSO202011", salt);

        var parm = {
            email: req.email,
            source: req.source,
            password: password,
            name: req.name
        };
        await users.registerUser(parm, async (err, rtn) => {
            if (rtn != null) {
                if (rtn.affectedRows > 0) {
                    // Sukses
                    var prm = {
                        email: req.email
                    };
                    var usr = await users.getAllRecord(prm);
                    var id_user = "";
                    for (let u of usr) {
                        id_user = u.id;
                    }

                    var prmRoles = {
                        userId: id_user,
                        roleId: 1 // Roles Default User
                    };
                    await users.registerUsersRole(prmRoles, async (errRole, rtnRole) => {
                        if (rtnRole != null) {
                            if (rtnRole.affectedRows > 0) {
                                var prm_dtls = {
                                    userId: id_user,
                                    img_avatar: req.img_avatar,
                                    isMute: 0
                                };
                                var ins_dtls = await users.insertUsertDetails(prm_dtls);
                                if (ins_dtls.affectedRows > 0) {
                                    var cek = await users.getRecordToken(req.token, id_user, req.type);
                                    if (cek.length == 0) {
                                        var ins = await users.insertToken(req.token, id_user, req.type);
                                        if (ins.affectedRows < 1) {
                                            console.error("Failed to insert token notification");
                                        }
                                    }

                                    // Direct login
                                    await users.loginUser(req.email, "", res, this.processLogin);
                                }
                                else {
                                    return res.status(500).json({
                                        isSuccess: false,
                                        message: "Register User failed on details"
                                    });
                                }
                            }
                            else {
                                return res.status(500).json({
                                    isSuccess: false,
                                    message: "Register User failed"
                                });
                            }
                        }
                        else {
                            console.log("registerUser-error");
                            console.log(errRole);

                            return res.status(500).json({
                                isSuccess: false,
                                message: "Register User failed"
                            });
                        }
                    });
                }
                else {
                    // Gagal
                    return res.status(500).json({
                        isSuccess: false,
                        message: "Register User gagal"
                    });
                }
            }
            else {
                console.log("registerUser-error");
                console.log(err);

                return res.status(500).json({
                    isSuccess: false,
                    message: "Register User gagal"
                });
            }
        });
    }
    else {
        var id_user = "";
        for (var l of login) {
            id_user = l.id;
        }
        var cek = await users.getRecordToken(req.token, id_user, req.type);
        if (cek.length == 0) {
            var ins = await users.insertToken(req.token, id_user, req.type);
            if (ins.affectedRows < 1) {
                console.error("Failed to insert token notification");
            }
        }
        await users.loginUser(req.email, "User", res, this.processLogin);
    }
};


exports.loginAdmin = async (param, res) => {
    // res.json({message : 'halo ' + req.username + ', pass ' + req.password});
    var req = param.body;
    if (req.email == "") {
        // Gagal
        return res.status(500).json({
            isSuccess: false,
            message: "Login Failed, email has been null"
        });
    }
    var verif = await verifyLogin(req.email, req.password, "", "");
    if (!verif) {
        return res.status(500).json({
            isSuccess: false,
            message: 'Username or password did not match'
        });
    }
    await users.loginUser(req.email, "Admin", res, this.processLogin);
};

exports.registerUser = async (param, res) => {
    var req = param.body;
    if (req.email == undefined || req.email == "") {
        // Gagal
        return res.status(500).json({
            isSuccess: false,
            message: "Register User failed"
        });
    }
    var prm = {
        email: req.email
    }
    var check_user = await users.getAllRecord(prm);
    if (check_user.length > 0) {
        // Gagal
        return res.status(500).json({
            isSuccess: false,
            message: "Email has been registered"
        });
    }

    req.source = 'App';     // Register from Application
    var salt = await bcrypt.genSalt(config.regSalt);
    req.password = await bcrypt.hash(req.password, salt);

    await users.registerUser(req, async (err, rtn) => {
        if (rtn != null) {
            if (rtn.affectedRows > 0) {
                // Sukses
                var prm = {
                    email: req.email
                };
                var usr = await users.getAllRecord(prm);
                var id_user = "";
                for (let u of usr) {
                    id_user = u.id;
                }

                var prmRoles = {
                    userId: id_user,
                    roleId: 1 // Roles Default User
                };
                await users.registerUsersRole(prmRoles, async (errRole, rtnRole) => {
                    if (rtnRole != null) {
                        if (rtnRole.affectedRows > 0) {
                            var prm_dtls = {
                                userId: id_user,
                                img_avatar: '',
                                isMute: 0
                            };
                            var ins_dtls = await users.insertUsertDetails(prm_dtls);
                            if (ins_dtls.affectedRows > 0) {
                                var cek = await users.getRecordToken(req.token, id_user, req.type);
                                if (cek.length == 0) {
                                    var ins = await users.insertToken(req.token, id_user, req.type);
                                    if (ins.affectedRows < 1) {
                                        console.error("Failed to insert token notification");
                                    }
                                }

                                return res.status(200).json({
                                    isSuccess: true,
                                    message: "Register User success"
                                });
                            }
                            else {
                                return res.status(500).json({
                                    isSuccess: false,
                                    message: "Register User failed"
                                });
                            }
                        }
                        else {
                            return res.status(500).json({
                                isSuccess: false,
                                message: "Register User failed"
                            });
                        }
                    }
                    else {
                        console.log("registerUser-error");
                        console.log(errRole);

                        return res.status(500).json({
                            isSuccess: false,
                            message: "Register User failed"
                        });
                    }
                });
            }
            else {
                // Gagal
                return res.status(500).json({
                    isSuccess: false,
                    message: "Register User failed"
                });
            }
        }
        else {
            console.log("registerUser-error");
            console.log(err);

            return res.status(500).json({
                isSuccess: false,
                message: "Register User failed"
            });
        }
    });
};

exports.getProfile = async (param, res) => {
    var user_id = param.userId;
    var dt = await users.getUserDetails(user_id);

    var rtn = {};
    var status = 500; // Default if failed.
    if (dt.length > 0) {
        status = 200;
        rtn = {
            isSuccess: true,
            message: "Success get profile",
            data: dt[dt.length - 1]
        }
    }
    else {
        rtn = {
            isSuccess: false,
            message: "profile not found"
        };
    }

    return res.status(status).json(rtn);
}

exports.insertUserDetails = async (param, res) => {
    var req = param.body;
    var ins = {
        affectedRows: 0
    };
    if (req.userId != undefined) {
        ins = await users.insertUsertDetails(req);
    }

    var rtn = {
        isSuccess: '',
        message: ''
    }
    var status = 500; // Default if failed.
    if (ins.affectedRows > 0) {
        status = 200;
        rtn.isSuccess = true;
        rtn.message = "Insert User details success";
    }
    else {
        rtn.isSuccess = false;
        rtn.message = "Insert User details failed";
    }

    return res.status(status).json(rtn);
}

exports.forgotPasswordReq = async (param, res) => {
    var req = param.body;
    if (req.email == undefined || req.email == "") {
        return res.status(500).json({
            isSuccess: false,
            message: "Failed to forgot password, email has null"
        });
    }
    var interval_time = 86400; // 24 hours

    var name = "";
    var token = "";
    var usr = await users.getAllRecord(req);
    for (var u of usr) {
        name = u.name;
        token = jwt.sign({ email: u.email, desc: "Forgot Password" }, config.secret, {
            expiresIn: interval_time
        });
    }

    if (usr.length > 0) {
        var exp_time = moment().add(interval_time, "s");
        var exp_str = exp_time.format("YYYY-MM-DD HH:mm:ss");
        var ins = await users.insertForgotPass(req.email, 0, exp_str, token);

        if (ins.affectedRows > 0) {
            var url = "https://pito-api.herokuapp.com/user/resetPassword?token=" + token;
            var subject = "Pito User Forgot Password";
            var text = "Hi " + name + ",<br/><br/>";
            text += "Please reset your password on this link :<br/>";
            text += url + " <br/>";
            text += "Expired on " + exp_str + " <br/><br/>";
            text += "Regards,<br/>Pito Team";

            var mail = await mailer.sendMail(req.email, subject, text);

            if (mail) {
                return res.status(200).json({
                    isSuccess: true,
                    message: "Success send email forgot password"
                });
            }
            else {
                return res.status(500).json({
                    isSuccess: false,
                    message: "Failed send email forgot password"
                });
            }
        }
        else {
            return res.status(500).json({
                isSuccess: false,
                message: "Failed send email forgot password"
            });
        }
    }
    else {
        return res.status(500).json({
            isSuccess: false,
            message: "Failed to forgot password, User is not registered"
        });
    }

}

exports.resetPassword = async (param, res) => {
    var req = param.body;
    if (req.email == undefined || req.email == "") {
        return res.status(500).json({
            isSuccess: false,
            message: "Failed to reset password, email has null"
        });
    }

    var upd = await users.changePassword(req.email, req.password);
    if (upd.affectedRows > 0) {
        return res.status(200).json({
            isSuccess: true,
            message: "Success to reset password"
        });
    }
    else {
        return res.status(500).json({
            isSuccess: false,
            message: "Failed to reset password"
        });
    }
}

exports.changePassword = async (param, res) => {
    var req = param.body;
    var user_id = param.userId;
    if (req.new_password == undefined || req.new_password == "") {
        return res.status(500).json({
            isSuccess: false,
            message: "Failed to change password, New password has null"
        });
    }

    var email = "";
    var prm = {
        id: user_id
    };
    var cek = await users.getAllRecord(prm);
    for (var c of cek) {
        email = c.email;
    }
    var verif = await verifyLogin(email, req.old_password, "", "");
    if (verif) {
        var salt = await bcrypt.genSalt(config.regSalt);
        var new_password = await bcrypt.hash(req.new_password, salt);
        var upd = await users.changePassword(user_id, new_password);
        if (upd.affectedRows > 0) {
            return res.status(200).json({
                isSuccess: true,
                message: "Success to change password"
            });
        }
        else {
            return res.status(500).json({
                isSuccess: false,
                message: "Failed to change password"
            });
        }
    }
    else {
        return res.status(500).json({
            isSuccess: false,
            message: "Failed to change password, Username or password did not match"
        });
    }
}



async function verifyLogin(email, loginpass, token, type) {
    var rtn = false;
    var prm = {
        email: email
    };
    var usr = await users.getAllRecord(prm);
    if (usr.length > 0) {
        var pass = "";
        var id = 0;
        for (let u of usr) {
            pass = u.password;
            id = u.id;
        }
        var isSame = await bcrypt.compare(loginpass, pass);
        if (isSame) {
            rtn = true;

            if (token != "" && type != "") {
                var cek = await users.getRecordToken(token, id, type);
                if (cek.length == 0) {
                    var ins = await users.insertToken(token, id, type);
                    if (ins.affectedRows < 1) {
                        console.error("Failed to insert token notification");
                    }
                }
            }
        }
    }

    return rtn;
}

exports.processLogin = async (err, rtn, res, role) => {
    var dt = {};
    var status = 0;

    if (rtn != null) {
        var cnt = rtn.length;
        if (cnt > 0) {
            var userId = "";
            var roleName = "";  // Untuk Token
            var roleArr = [];
            var userEmail = "";
            var name = "";
            for (var p of rtn) {
                userId = p.id;
                userEmail = p.email;
                name = p.name;
                if (roleName != "") {
                    roleName += ",";
                }
                roleName += p.role_name;  // Untuk Token
                roleArr.push(p.role_name);
            }

            // Login User
            // if(role == ""){
            if (!roleName.includes(role)) {
                status = 500;
                dt = {
                    isSuccess: false,
                    message: 'Username or password did not match'
                }
                return res.status(status).json(dt);
            }
            // }

            var image = "";
            var isMute = "";
            if (userId != "") {
                var dtls = await users.getUserDetails(userId);
                for (var d of dtls) {
                    image = d.img_avatar;
                    isMute = d.isMute;
                }
            }

            status = 200;
            var token = jwt.sign({ id: userId, role: roleName }, config.secret, {
                expiresIn: 2592000 // 30 day
            });

            dt = {
                isSuccess: true,
                message: 'Success',
                id: userId,
                name: name,
                email: userEmail,
                image: image,
                isMute: isMute,
                roles: roleArr,
                token: token
            }

            var log = await users.updateLastLogin(userId);
            if (log.affectedRows == 0) {
                console.error("Failed update last login on id " + userId);
            }
        }
        else {
            status = 500;
            dt = {
                isSuccess: false,
                message: 'Username or password did not match'
            }
        }
    }
    else {
        status = 500;
        dt = {
            isSuccess: false,
            message: 'Login Failed'
        }
    }

    return res.status(status).json(dt);
}

exports.submitProfile = async (param, res) => {
    // var req = param.body;
    var user_id = param.userId;
    var form = new formidable.IncomingForm();
    form.parse(param, async (err, fields, files) => {
        if (err) {
            console.error('Error', err)
            return res.status(500).json({
                isSuccess: false,
                message: "Failed Update Profile"
            });
        }
        if (files.mypic !== undefined && files.mypic != "") {
            var check = await uploadfile.processUpload(files.mypic, user_id);
            if (!check.error) {
                var prm = {
                    userId: user_id,
                    img_avatar: config_upload.base_url + "/" + config_upload.folder + "/" + check.filename
                };
                var ins = await users.insertUsertDetails(prm);
                if (ins.affectedRows > 0) {
                    var name = fields.name;
                    var upd = await users.updateName(name, user_id);
                    if (upd.affectedRows > 0) {
                        var data = await users.getUserDetails(user_id);
                        return res.status(200).json({
                            isSuccess: true,
                            message: "Success Update Profile",
                            data: data[data.length - 1]
                        });
                    }
                }
                return res.status(500).json({
                    isSuccess: false,
                    message: "Failed Update Profile"
                });
            }
            else {
                return res.status(500).json({
                    isSuccess: false,
                    message: check.message
                });
            }
        }
        else {  // Change display name or delete avatar
            if (fields.flagDeleteAva != "") {
                var prm = {
                    userId: user_id,
                    img_avatar: ""
                };
                var ins = await users.insertUsertDetails(prm);
                if (ins.affectedRows == 0) {
                    return res.status(500).json({
                        isSuccess: false,
                        message: "Failed Update Profile"
                    });
                }
            }
            var name = fields.name;
            var upd = await users.updateName(name, user_id);
            if (upd.affectedRows > 0) {
                var data = await users.getUserDetails(user_id);
                return res.status(200).json({
                    isSuccess: true,
                    message: "Success Update Profile",
                    data: data[data.length - 1]
                });
            }
            return res.status(500).json({
                isSuccess: false,
                message: "Failed Update Profile"
            });
        }
    });
}

exports.getListUser = async (param, res) => {
    var dt = await users.getAllRecord({ isActive: 1 });
    res.status(200).json({
        isSuccess: true,
        data: dt
    });
}



exports.logoutUser = async (param, res) => {
    var user_id = param.userId;
    var token = param.body.token;
    var type_device = param.body.type;

    var upd = await users.deleteToken(token, user_id, type_device);
    if (upd.affectedRows > 0) {
        return res.status(200).json({
            isSuccess: true,
            message: "Success Logout"
        });
    }
    else {
        return res.status(500).json({
            isSuccess: false,
            message: "Failed Logout"
        });
    }
}

exports.disableUserByAdmin = async (req, res) => {
    var user_id = req.body.user_id;
    var upd = await users.updateActive(user_id, 0);
    if (upd.affectedRows > 0) {

        var dt = await users.getUserDetails(user_id);
        var subject = "Your account has been disable from Pito.";
        var text = "<br/><br/>";
        text += "This account has been temporarily disabled.<br/>";
        text += "Please contact administrator at contact@pito.com.sg for more information.<br/>";
        text += "<br/><br/>";
        text += "Regards,<br/>Pito Team";

        var mail = await mailer.sendMail(dt.email, subject, text);

        if (mail) {
            return res.status(200).json({
                isSuccess: true,
                message: "Success disable user"
            });
        }
        else {
            return res.status(500).json({
                isSuccess: false,
                message: "Failed send email disable user"
            });
        }
    }
    else {
        return res.status(500).json({
            isSuccess: false,
            message: "Failed disable user"
        });
    }
}

exports.enableUserByAdmin = async (req, res) => {
    var user_id = req.body.user_id;
    var upd = await users.updateActive(user_id, 1);
    if (upd.affectedRows > 0) {
        var dt = await users.getUserDetails(user_id);
        var subject = "Your account has been activated back Pito.";
        var text = "<br/><br/>";
        text += "This account has been activated back!!!<br/>";
        text += "<br/><br/>";
        text += "Regards,<br/>Pito Team";

        var mail = await mailer.sendMail(dt.email, subject, text);

        if (mail) {
            return res.status(200).json({
                isSuccess: true,
                message: "Success enable user"
            });
        }
        else {
            return res.status(500).json({
                isSuccess: false,
                message: "Failed send email enable user"
            });
        }
    }
    else {
        return res.status(500).json({
            isSuccess: false,
            message: "Failed enable user"
        });
    }
}

/* Push Notif IOS
const apn = require("apn");
exports.sendNotifIOS = async(param, res) => {
    var req = param.query;
    var token = req.token;

    var options = {
        pfx : appRoot + "\\ioscert\\certif.p12",
        production: true
      };

    var apnConnection = new apn.Provider(options);

    var note = new apn.Notification();

    note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
    // note.badge = 1;
    // note.sound = "ping.aiff";
    // note.alert = "Testing PITO XX";
    // note.payload = {'messageFrom': 'John Appleseed'};
    // note.payload = {"url" : "pito://video?video_id=1"};
    // note.payload = {
    //     aps : {
    //         deeplink: "pito://video?video_id=1"
    //     }
    // }
    note.rawPayload = {
        "aps":{"alert":"Testing.. (15)","badge":1,"sound":"default", "deeplink": "pito://video?video_id=1"}
    }
    note.topic = "com.pito";

    apnConnection.send(note, token).then( (result) => {
        // see documentation for an explanation of result
        console.log("result",result);
        if(result.failed.length > 0){
            console.log("response", result.failed[0].response);
        }
    });

    return res.json({success: "true"});
}
*/

/* Push Notif Android */
// const admin = require("firebase-admin");
// const serviceAccount = require("../../fbase/pito-60b05-firebase-adminsdk-3zi3t-916f9b9b09.json");
// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount)
// });
// exports.pushAndroid = async(req, res) => {
//     var token = req.query.token;
//     var message = {
//         data: {
//             title: "Your password was changed",
//             body: "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt",
//             // image: "optional",
//             deepLink: "pito://video?video_id=1"
//         },
//         token: token
//     };

//     // Send a message to the device corresponding to the provided
//     // registration token.
//     admin.messaging().send(message)
//     .then((response) => {
//     // Response is a message ID string.
//         console.log('Successfully sent message:', response);
//     })
//     .catch((error) => {
//         console.log('Error sending message:', error);
//     });

//     return res.json({status : "ok"});
// }