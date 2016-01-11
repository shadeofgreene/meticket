var express = require('express');
var app = express();
var querystring = require('querystring');
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
            if (err) {
                console.log('error');
                res.status(500).json({
                    error: err
                });
            } else if (!checkUser) {
                console.log('local user not found');
                // try to get this user from server and add it to local db
                var data = JSON.stringify({
                    'username': user.userEmail,
                    'password': user.userPassword
                });
                var options = {
                    host: 'meticket.briangreenedev.com',
                    path: '/TicketSystem/LoginView/TryLoginAndGetUser',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json;charset=UTF-8',
                        'Content-Length': Buffer.byteLength(data)
                    }
                };

                var userString = '';
                http.request(options, function (userRes) {
                    userRes.setEncoding('utf8');
                    userRes.on('data', function (chunk) {
                        //console.log(chunk);
                        userString += chunk;
                    });
                    userRes.on('end', function (data) {
                        var userToSave = JSON.parse(userString);
                        userToSave.userPassword = user.userPassword;
                        console.log(userToSave);
                        db.User.save(userToSave);
                    });
                }).write(data);

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
    db.Ticket.find(function (err, tickets) {
        if (!err) {
            res.json(tickets);
        } else {
            res.status(500).json({
                error: 'Problem getting tickets'
            })
        }
    })
});

app.post('/SyncAllData', function (req, res) {
    console.log('#############################################################')
    console.log('#############################################################')
    console.log('#############################################################')
    console.log('#############################################################')
    console.log('#############################################################')
	
	var hostConstant = 'meticket.briangreenedev.com';
	
    var user = req.body;
    if (user.userId) {
        console.log('userId: ' + user.userId);

        ///////// GET TICKETS /////////////
        ///////////////////////////////////		
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

                ///////// GET DATA ////////////////
                ///////////////////////////////////
				syncRecords(db, hostConstant, '/TicketSystem/CustomerView/GetCustomers', 'GET', 'Customer', 'customerId',
						   syncRecords(db, hostConstant, '/TicketSystem/CustomerView/GetCustomers', 'GET', 'Customer', 'customerId',
						   syncRecords(db, hostConstant, '/TicketSystem/CustomerView/GetAllOffices', 'GET', 'Customer', 'customerId',
						   syncRecords(db, hostConstant, '/TicketSystem/TicketView/GetEmployeeList', 'POST', 'Customer', 'customerId',
						   syncRecords(db, hostConstant, '/TicketSystem/ProductView/GetProductsByType/1005', 'GET', 'Customer', 'customerId',
						   syncRecords(db, hostConstant, '/TicketSystem/ProductView/GetProductsByType/1', 'GET', 'Customer', 'customerId',
						   syncRecords(db, hostConstant, '/TicketSystem/TicketView/GetTaxCategories', 'POST', 'Customer', 'customerId',
						   syncRecords(db, hostConstant, '/TicketSystem/ProductView/GetProductTypes', 'POST', 'Customer', 'customerId',
						   syncRecords(db, hostConstant, '/TicketSystem/ProductView/GetUnitTypes', 'POST', 'Customer', 'customerId',
						   syncRecords(db, hostConstant, '/TicketSystem/ProductView/GetProductsByType/1005', 'POST', 'Customer', 'customerId',
						   function() {
					console.log('Finished syncing data...');
				}))))))))));
				
//                var customerOptions = {
//                    host: 'meticket.briangreenedev.com',
//                    path: '/TicketSystem/CustomerView/GetCustomers',
//                    method: 'GET'
//                }
//                var customersString = '';
//                http.get(options, function (customerRes) {
//                    customerRes.setEncoding('utf8');
//                    customerRes.on('data', function (chunk) {
//                        customersString += chunk;
//                    });
//                    customerRes.on('end', function (data) {
//                        db.Customer.find(function (err, customersLocal) {
//                            if (!err) {
//                                // get customers from server
//                                var serverCustomers = JSON.parse(customersString);
//
//                                // update local with server customers
//                                _.each(serverCustomers, function (customer) {
//                                    var existingCustomer = _.find(customersLocal, function (localCustomer) {
//                                        return parseInt(ticket.ticketId) === parseInt(locTicket.ticketId);
//                                    })
//                                    if (!existingTicket) {
//                                        // save ticket to local
//                                        console.log(ticket);
//                                        db.Ticket.save(ticket);
//                                    }
//                                });
//                            }
//                        });
//
//                        ///////// GET CUSTOMERS ///////////
//                        ///////////////////////////////////
//                    })
//                });
            })
        });
    }
})

function syncRecords(db, host, path, method, collection, collectionIdKey, callback) {
    var options = {
        host: host,
        path: path,
        method: method
    };
    var recordString = '';
    http.get(options, function (serverRes) {
        serverRes.setEncoding('utf8');
        serverRes.on('data', function (chunk) {
            recordString += chunk;
        });
        serverRes.on('end', function (data) {
			console.log(recordString);
			console.log(db);
            db.getCollection(collection).find(function (err, localRecords) {
                if (!err) {
                    // get customers from server
                    var serverRecords = JSON.parse(recordString);

                    // update local with server customers
                    _.each(serverRecords, function (serverRecord) {
                        var existingRecord = _.find(localRecords, function (localRecord) {
                            return parseInt(localRecord[collectionIdKey]) === parseInt(serverRecord[collectionIdKey]);
                        })
                        if (!existingRecord) {
                            // save record to local
                            console.log(ticket);
                            db.getCollection(collection).save(serverRecord);
                        }
                    });
                }
            });
            callback();
        })
    });
}

app.listen(3000);
console.log('Server running on port 3000');