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
    console.log(user);
    if(user.username && user.password) {
        db.User.find({ 'userEmail': user.username, 'userPassword': user.password}, function(err, checkUser) {
            console.log(err);
            console.log(checkUser);
            if(err || !user) {
                console.log('user not found');
                res.json('Invalid Credentials');
            } else {
                console.log('user was found');
                res.json(user);
            }
        });
    }
});

app.post('CreateTicketAndReturnTicket', function(req, res) {
   var ticket = req.body;
    console.log(ticket);
    if(ticket) {
        db.Ticket.save(ticket, function(err, ticket) {
            if(!err) {
                res.json(ticket);
            } else {
                res.json('Invalid');
            }
        });
    }
});

app.get('/getTickets', function(req, res) {
    db.meticket.ticket.find(function(err, docs) {
        console.log(docs);
        res.json(docs);
    })
});

app.listen(3000);
console.log('Server running on port 3000');