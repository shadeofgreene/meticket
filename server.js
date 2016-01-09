var express = require('express');
var app = express();
var mongojs = require('mongojs');
var collections = ['ticket', 'User'];
var db = mongojs('MeTicket', ['Ticket', 'User']);
var bodyParser = require('body-parser');
var http = require('http');
var _ = require('underscore');

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());

app.post('/TryLoginAndGetUser', function (req, res) {
	var user = req.body;
	console.log(user);
	if (user.userEmail && user.userPassword) {
		db.User.findOne({
			'userEmail': user.userEmail,
			'userPassword': user.userPassword
		}, function (err, checkUser) {
			console.log(err);
			console.log(checkUser);
			if (err || !checkUser) {
				console.log('user not found');
				res.status(500).json({
					error: 'Invalid credentials'
				});
			} else {
				console.log('user was found');
				res.json(checkUser);
			}
		});
	}
});

app.post('/CreateTicketAndReturnTicket', function (req, res) {
	var ticket = req.body;
	console.log(ticket);
	if (ticket) {
		db.Ticket.save(ticket, function (err, ticket) {
			if (!err) {
				res.json(ticket);
			} else {
				res.json('Invalid');
			}
		});
	}
});

app.get('/GetTickets', function (req, res) {
	db.Ticket.find(function(err, tickets) {
		if(!err) {
			res.json(tickets);
		} else {
			res.status(500).json({error: 'Problem getting tickets'})
		}
	})
});

app.post('/SyncAllData', function (req, res) {
	console.log('#############################################################')
	console.log('#############################################################')
	console.log('#############################################################')
	console.log('#############################################################')
	console.log('#############################################################')
	var user = req.body;
	if (user.userId) {
		console.log('userId: ' + user.userId);
		var userTickets = '';

		var options = {
			host: 'meticket.briangreenedev.com',
			path: '/TicketSystem/TicketView/GetTickets',
			method: 'GET'
		};
		http.get(options, function (ticketRes) {
			ticketRes.setEncoding('utf8');
			ticketRes.on('data', function (chunk) {
				userTickets += chunk;
			});
			ticketRes.on('end', function (data) {
				db.Ticket.find(function (err, userTicketsLocal) {
					if (!err) {
						// get tickets from server
						var records = JSON.parse(userTickets);
						var userTicketsServer = _.filter(records, function (record) {
							return record.userId === user.userId;
						});

						// update local with server tickets
						_.each(userTicketsServer, function (ticket) {
							var existingTicket = _.find(userTicketsLocal, function (locTicket) {
								return parseInt(ticket.ticketId) === parseInt(locTicket.ticketId);
							})
							if (!existingTicket) {
								// save ticket to local
								console.log(ticket);
								db.Ticket.save(ticket);
							}
						});
					}
				});
				//console.log(userTicketsServer);
				res.json('finished');
			})
		});
	}
})

app.listen(3000);
console.log('Server running on port 3000');