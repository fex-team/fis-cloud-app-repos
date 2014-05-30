var User = require("../../lib/user.js");

module.exports = function(req, res, app){
    if(req.query.username && req.query._auth && req.query.email){
        var username = req.query.username,
            _auth = req.query._auth,
            email = req.query.email;
        User.getUserByName(username, function(err, user){
            if(err){
                res.send(500, err);
            }else if(user == null){
                User.addUser(username, _auth, email, function(err, result){
                    if(err){
                        res.send(500, err);
                    }else{
                        res.send(200, "Add user successfully");
                    }
                });
            }else{
                //用户存在，验证_auth
                if(_auth != user._auth){
                    res.json(500, "sorry, username or password is wrong!");
                }else{
                    if(email != user.email){
                        user.email = email;
                        User.updateUser(user, function(error, result){
                            if(error){
                                res.send(500, "Update email error " + error);
                            }else{
                                res.send(200, "Find the user!");
                            }
                        });
                    }else{
                        res.send(200, "Find the user!");
                    }
                }
            }

        });
    }else{
        res.json(500, "Must have username、auth and email!");
    }
};
