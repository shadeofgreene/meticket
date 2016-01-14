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

                ///////// GET CUSTOMERS ///////////
                ///////////////////////////////////
                var customerOptions = { //-*
                    host: hostConstant,
                    path: '/TicketSystem/CustomerView/GetCustomers', //-*
                    method: 'GET' //-*
                }
                http.get(customerOptions, function (sResponse) { //-*
                    var chunks = '';
                    sResponse.setEncoding('utf8');
                    sResponse.on('data', function (chunk) {
                        chunks += chunk;
                    });
                    sResponse.on('end', function () {
                        if(!db.Customer) {
                            db.createCollection('Customer');
                        }
                        db.Customer.find(function (err, lCustomers) { //-*
                            if (!err) {
                                // get records from server
                                var sCustomers = JSON.parse(chunks); //-*

                                // update local with server records
                                _.each(sCustomers, function (sCustomer) { //-*
                                    var existingLocalRecord = _.find(lCustomers, function (lCustomer) { //-*
                                        return parseInt(sCustomer.customerId) === parseInt(lCustomer.customerId); //-*
                                    })
                                    if (!existingLocalRecord) {
                                        // save record to local
                                        console.log(existingLocalRecord);
                                        db.Customer.save(existingLocalRecord); //-*
                                    }
                                });
                            }
                        });

                        ///////// GET OFFICES ///////////
                        ///////////////////////////////////
                        var officeOptions = { //-*
                            host: hostConstant,
                            path: 'TicketSystem/CustomerView/GetAllOffices', //-*
                            method: 'GET' //-*
                        }
                        http.get(officeOptions, function (sResponse) { //-*
                            var chunks = '';
                            sResponse.setEncoding('utf8');
                            sResponse.on('data', function (chunk) {
                                chunks += chunk;
                            });
                            sResponse.on('end', function () {
                                db.Office.find(function (err, lOffices) { //-*
                                    if (!err) {
                                        // get records from server
                                        var sOffices = JSON.parse(chunks); //-*

                                        // update local with server records
                                        _.each(sOffices, function (sOffice) { //-*
                                            var existingLocalRecord = _.find(lOffices, function (lOffice) { //-*
                                                return parseInt(sOffice.officeId) === parseInt(lOffice.officeId); //-*
                                            })
                                            if (!existingLocalRecord) {
                                                // save record to local
                                                console.log(existingLocalRecord);
                                                db.Office.save(existingLocalRecord); //-*
                                            }
                                        });
                                    }
                                });

                                ///////// GET EMPLOYEES ///////////
                                ///////////////////////////////////
                                var employeeOptions = {
                                    host: hostConstant,
                                    path: '/TicketSystem/TicketView/GetEmployeeList',
                                    method: 'POST'
                                }

                                http.get(employeeOptions, function (sResponse) { //-*
                                    var chunks = '';
                                    sResponse.setEncoding('utf8');
                                    sResponse.on('data', function (chunk) {
                                        chunks += chunk;
                                    });
                                    sResponse.on('end', function () {
                                        db.User.find(function (err, lEmployees) { //-*
                                            if (!err) {
                                                // get records from server
                                                var sEmployees = JSON.parse(chunks); //-*

                                                // update local with server records
                                                _.each(sEmployees, function (sEmployee) { //-*
                                                    var existingLocalRecord = _.find(lEmployees, function (lEmployee) { //-*
                                                        return parseInt(lEmployee.userId) === parseInt(sEmployee.userId); //-*
                                                    })
                                                    if (!existingLocalRecord) {
                                                        // save record to local
                                                        console.log(existingLocalRecord);
                                                        db.User.save(existingLocalRecord); //-*
                                                    }
                                                });
                                            }
                                        });

                                        ///////// GET PRODUCTS BY 1005 ///////
                                        //////////////////////////////////////
                                        var product1005Options = { //-*
                                            host: hostConstant,
                                            path: '/TicketSystem/ProductView/GetProductsByType/1005', //-*
                                            method: 'GET' //-*
                                        }
                                        http.get(product1005Options, function (sResponse) { //-*
                                            var chunks = '';
                                            sResponse.setEncoding('utf8');
                                            sResponse.on('data', function (chunk) {
                                                chunks += chunk;
                                            });
                                            sResponse.on('end', function () {
                                                db.Product.find(function (err, lProducts) { //-*
                                                    if (!err) {
                                                        // get records from server
                                                        var sProducts = JSON.parse(chunks); //-*

                                                        // update local with server records
                                                        _.each(sProducts, function (sProduct) { //-*
                                                            var existingLocalRecord = _.find(lProducts, function (lProduct) { //-*
                                                                return parseInt(sProduct.productId) === parseInt(lProduct.productId); //-*
                                                            })
                                                            if (!existingLocalRecord) {
                                                                // save record to local
                                                                console.log(existingLocalRecord);
                                                                db.Product.save(existingLocalRecord); //-*
                                                            }
                                                        });
                                                    }
                                                });

                                                ///////// GET PRODUCTS BY 1 ///////
                                                //////////////////////////////////////
                                                var product1Options = { //-*
                                                    host: hostConstant,
                                                    path: '/TicketSystem/ProductView/GetProductsByType/1', //-*
                                                    method: 'GET' //-*
                                                }
                                                http.get(product1Options, function (sResponse) { //-*
                                                    var chunks = '';
                                                    sResponse.setEncoding('utf8');
                                                    sResponse.on('data', function (chunk) {
                                                        chunks += chunk;
                                                    });
                                                    sResponse.on('end', function () {
                                                        db.Product.find(function (err, lProducts) { //-*
                                                            if (!err) {
                                                                // get records from server
                                                                var sProducts = JSON.parse(chunks); //-*

                                                                // update local with server records
                                                                _.each(sProducts, function (sProduct) { //-*
                                                                    var existingLocalRecord = _.find(lProducts, function (lProduct) { //-*
                                                                        return parseInt(sProduct.productId) === parseInt(lProduct.productId); //-*
                                                                    })
                                                                    if (!existingLocalRecord) {
                                                                        // save record to local
                                                                        console.log(existingLocalRecord);
                                                                        db.Product.save(existingLocalRecord); //-*
                                                                    }
                                                                });
                                                            }
                                                        });

                                                        ///////// GET TAX CATEGORIES ///////////
                                                        ////////////////////////////////////////
                                                        var taxCatOptions = { //-*
                                                            host: hostConstant,
                                                            path: '/TicketSystem/TicketView/GetTaxCategories', //-*
                                                            method: 'POST' //-*
                                                        }
                                                        http.get(taxCatOptions, function (sResponse) { //-*
                                                            var chunks = '';
                                                            sResponse.setEncoding('utf8');
                                                            sResponse.on('data', function (chunk) {
                                                                chunks += chunk;
                                                            });
                                                            sResponse.on('end', function () {
                                                                db.TaxCategory.find(function (err, lTaxCats) { //-*
                                                                    if (!err) {
                                                                        // get records from server
                                                                        var sTaxCats = JSON.parse(chunks); //-*

                                                                        // update local with server records
                                                                        _.each(sTaxCats, function (sTaxCat) { //-*
                                                                            var existingLocalRecord = _.find(lTaxCats, function (lTaxCat) { //-*
                                                                                return parseInt(sTaxCat.taxCategoryId) === parseInt(lTaxCat.taxCategoryId); //-*
                                                                            })
                                                                            if (!existingLocalRecord) {
                                                                                // save record to local
                                                                                console.log(existingLocalRecord);
                                                                                db.TaxCategory.save(existingLocalRecord); //-*
                                                                            }
                                                                        });
                                                                    }
                                                                });
                                                            });

                                                            ///////// GET PRODUCT TYPES ///////
                                                            ///////////////////////////////////
                                                            var productTypeOptions = { //-*
                                                                host: hostConstant,
                                                                path: '/TicketSystem/ProductView/GetProductTypes', //-*
                                                                method: 'POST' //-*
                                                            }
                                                            http.get(productTypeOptions, function (sResponse) { //-*
                                                                var chunks = '';
                                                                sResponse.setEncoding('utf8');
                                                                sResponse.on('data', function (chunk) {
                                                                    chunks += chunk;
                                                                });
                                                                sResponse.on('end', function () {
                                                                    db.ProductType.find(function (err, lProductTypes) { //-*
                                                                        if (!err) {
                                                                            // get records from server
                                                                            var sProductTypes = JSON.parse(chunks); //-*

                                                                            // update local with server records
                                                                            _.each(sProductTypes, function (sProductType) { //-*
                                                                                var existingLocalRecord = _.find(lProductTypes, function (lProductType) { //-*
                                                                                    return parseInt(sProductType.productTypeId) === parseInt(lProductType.productTypeId); //-*
                                                                                })
                                                                                if (!existingLocalRecord) {
                                                                                    // save record to local
                                                                                    console.log(existingLocalRecord);
                                                                                    db.ProductType.save(existingLocalRecord); //-*
                                                                                }
                                                                            });
                                                                        }
                                                                    });

                                                                    ///////// GET UNIT TYPES ///////////
                                                                    ///////////////////////////////////
                                                                    var unitTypeOptions = { //-*
                                                                        host: hostConstant,
                                                                        path: '/TicketSystem/ProductView/GetUnitTypes', //-*
                                                                        method: 'POST' //-*
                                                                    }
                                                                    http.get(unitTypeOptions, function (sResponse) { //-*
                                                                        var chunks = '';
                                                                        sResponse.setEncoding('utf8');
                                                                        sResponse.on('data', function (chunk) {
                                                                            chunks += chunk;
                                                                        });
                                                                        sResponse.on('end', function () {
                                                                            db.UnitType.find(function (err, lUnitTypes) { //-*
                                                                                if (!err) {
                                                                                    // get records from server
                                                                                    var sUnitTypes = JSON.parse(chunks); //-*

                                                                                    // update local with server records
                                                                                    _.each(sUnitTypes, function (sUnitType) { //-*
                                                                                        var existingLocalRecord = _.find(lUnitTypes, function (lUnitType) { //-*
                                                                                            return parseInt(sUnitType.unitTypeId) === parseInt(lUnitType.unitTypeId); //-*
                                                                                        })
                                                                                        if (!existingLocalRecord) {
                                                                                            // save record to local
                                                                                            console.log(existingLocalRecord);
                                                                                            db.UnitType.save(existingLocalRecord); //-*
                                                                                        }
                                                                                    });
                                                                                }
                                                                            });

                                                                            /////////////////////
                                                                            ////// FINISHED /////
                                                                            /////////////////////
                                                                            
                                                                            res.status(200).json('perfect!');

                                                                        });
                                                                    });
                                                                });
                                                            });
                                                        });
                                                    });
                                                });
                                            });
                                        });
                                    });
                                });
                            });
                        });


                        //                        ///////// GET DATA ////////////////
                        //                        ///////////////////////////////////
                        //                        syncRecords(db, hostConstant, '/TicketSystem/CustomerView/GetCustomers', 'GET', 'Customer', 'customerId',
                        //                            syncRecords(db, hostConstant, '/TicketSystem/CustomerView/GetCustomers', 'GET', 'Customer', 'customerId',
                        //                                syncRecords(db, hostConstant, '/TicketSystem/CustomerView/GetAllOffices', 'GET', 'Customer', 'customerId',
                        //                                    syncRecords(db, hostConstant, '/TicketSystem/TicketView/GetEmployeeList', 'POST', 'Customer', 'customerId',
                        //                                        syncRecords(db, hostConstant, '/TicketSystem/ProductView/GetProductsByType/1005', 'GET', 'Customer', 'customerId',
                        //                                            syncRecords(db, hostConstant, '/TicketSystem/ProductView/GetProductsByType/1', 'GET', 'Customer', 'customerId',
                        //                                                syncRecords(db, hostConstant, '/TicketSystem/TicketView/GetTaxCategories', 'POST', 'Customer', 'customerId',
                        //                                                    syncRecords(db, hostConstant, '/TicketSystem/ProductView/GetProductTypes', 'POST', 'Customer', 'customerId',
                        //                                                        syncRecords(db, hostConstant, '/TicketSystem/ProductView/GetUnitTypes', 'POST', 'Customer', 'customerId',
                        //                                                            syncRecords(db, hostConstant, '/TicketSystem/ProductView/GetProductsByType/1005', 'POST', 'Customer', 'customerId',
                        //                                                                function () {
                        //                                                                    console.log('Finished syncing data...');
                        //                                                                }))))))))));

                    });
                });
            });
        });
    }
});


app.listen(3000);
console.log('Server running on port 3000');