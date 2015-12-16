var express = require('express');
var app = express();
var mongojs = require('mongojs');
var db = mongojs('MeTicket', ['MeTicket']);
var bodyParser = require('body-parser');

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());

app.post('/TryLoginAndGetUser', function(req, res) {
    console.log(req.body);
    var user = req.body;
    console.log(user);
    if(user.username && user.password) {
        var checkUser = db.meticket.user.find({ username: user.username, password: user.password}, function(err, user) {
            if(err || !user) {
                console.log('Invalid credentials');
                res.json('Invalid Credentials');
            } else {
                res.json(user);
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