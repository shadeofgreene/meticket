var express = require('express');
var app = express();
var mongojs = require('mongojs');
var collections = ['ticket', 'User'];
var db = mongojs('MeTicket', ['Ticket', 'User']);
var bodyParser = require('body-parser');

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());

app.post('/TryLoginAndGetUser', function(req, res) {
    var user = req.body;
    //console.log(user);
    if(user.username && user.password) {
        var checkUser = db.User.find({ userEmail: user.userEmail, userPassword: user.userPassword}, function(err, user) {
            if(err || !user) {
                console.log('Invalid credentials');
                res.json('Invalid Credentials');
            } else {
                //console.log(res.json(checkUser));
                res.json(checkUser);
            }
        });
    }
});

// test comment
app.get('/getTickets', function(req, res) {
    db.meticket.ticket.find(function(err, docs) {
        console.log(docs);
        res.json(docs);
    })
});

app.listen(3000);
console.log('Server running on port 3000');