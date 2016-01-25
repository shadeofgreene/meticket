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

// GET CUSTOMERS
app.get('/GetCustomers', function (req, res) {
    var customers = db.collection('Customer');
    customers.find(function (err, customers) {
        if (!err) {
            res.json(customers);
        } else {
            res.status(500).json({
                error: 'Problem getting customers'
            });
        }
    });
});

// GET ALL OFFICES
app.get('/GetAllOffices', function (req, res) {
    var offices = db.collection('Office');
    offices.find(function (err, offices) {
        if (!err) {
            res.json(offices);
        } else {
            res.status(500).json({
                error: 'Problem getting offices'
            });
        }
    });
});

// TODO!
// GET PRODUCTS BY TYPE
app.get('/GetProductsByType/', function (req, res) {
    var products = db.collection('Product');
    products.find(function (err, products) {
        if (!err) {
            res.json(products);
        } else {
            res.status(500).json({
                error: 'Problem getting products'
            });
        }
    })
});

// GET TICKETS
app.get('/GetTickets', function (req, res) {
    var tickets = db.collection('Ticket');
    tickets.find(function (err, tickets) {
        if (!err) {
            res.json(tickets);
        } else {
            res.status(500).json({
                error: 'Problem getting tickets'
            })
        }
    })
});

// GET TICKET
app.get('/GetTicket', function (req, res) {
    var data = req.body;
    if (data.ticketId) {
        var tickets = db.collection('Ticket');
        tickets.findOne({
            'ticketId': parseInt(data.ticketId)
        }, function (err, ticket) {
            if (err) {
                console.log('error');
                res.status(500).json({
                    error: err
                });
            } else {
                console.log('user was found');
                res.status(200).json(ticket);
            }
        });
    }
});

// GET PRODUCT TYPES
app.get('/GetProductTypes', function (req, res) {
    var productTypes = db.collection('ProductType');
    productTypes.find(function (err, productTypes) {
        if (!err) {
            res.json(productTypes);
        } else {
            res.status(500).json({
                error: 'Problem getting product types'
            })
        }
    })
});

// GET TICKET ITEMS
app.get('/GetTicketItems', function (req, res) {
    var ticketItems = db.collection('TicketItem');
    ticketItems.find(function (err, ticketItems) {
        if (!err) {
            res.status(200).json(ticketItems);
        } else {
            res.status(500).json({
                error: 'Problem getting ticket items'
            })
        }
    })
});

// GET EMPLOYEES
app.get('/GetEmployeeList', function (req, res) {
    var employees = db.collection('User');
    employees.find(function (err, employees) {
        if (!err) {
            res.status(200).json(employees);
        } else {
            res.status(500).json({
                error: 'Problem getting employees'
            })
        }
    })
});

// GET TAX CATEGORIES
app.get('/GetTaxCategories', function (req, res) {
    var taxCats = db.collection('TaxCategory');
    taxCats.find(function (err, taxCats) {
        if (!err) {
            res.status(200).json(taxCats);
        } else {
            res.status(500).json({
                error: 'Problem getting tax categories'
            })
        }
    })
});

// GET UNIT TYPES
app.get('/GetUnitTypes', function (req, res) {
    var unitTypes = db.collection('UnitType');
    unitTypes.find(function (err, unitTypes) {
        if (!err) {
            res.status(200).json(unitTypes);
        } else {
            res.status(500).json({
                error: 'Problem getting unit types'
            })
        }
    })
});

// GET PRODUCTS BY TYPE
app.post('/GetProductsByType', function (req, res) {
    var productType = req.body;
    if (productType) {
        var products = db.collection('Product');
        products.find({
            'productTypeId': productType.productTypeId
        }, function (err, products) {
            if (!err) {
                res.status(200).json(products);
            } else {
                res.status(500).json({
                    error: 'Problem getting products'
                })
            }
        })
    }
    res.status(500).json({
        error: 'Problem getting products'
    })
})









// SYNC DATA
app.post('/SyncCollection', function (req, res) {
    console.log('#############################################################')
    console.log('#############################################################')
    console.log('#############################################################')
    console.log('#############################################################')
    console.log('#############################################################')

    var hostConstant = 'meticket.briangreenedev.com';

    var request = req.body;
    if (request.user.userId && request.collection) {
        console.log('userId: ' + request.user.userId);
        console.log('collection: ' + request.collection)

        if (request.collection === 'Office') {
            ///////// GET OFFICES ///////////
            ///////////////////////////////////
            var officeOptions = { //-*
                host: hostConstant,
                path: '/TicketSystem/CustomerView/GetAllOffices', //-*
                method: 'GET' //-*
            }

            http.get(officeOptions, function (sResponse) { //-*
                console.log('start');
                var chunks = '';
                sResponse.setEncoding('utf8');
                sResponse.on('data', function (chunk) {
                    chunks += chunk;
                });
                sResponse.on('end', function () {
                    var offices = db.collection('Office');
                    offices.find(function (err, lOffices) { //-*
                        if (!err) {
                            console.log('local offices exist');
                            // get records from server
                            var sOffices = JSON.parse(chunks); //-*

                            // update local with server records
                            _.each(sOffices, function (sOffice) { //-*
                                var existingLocalRecord = _.find(lOffices, function (lOffice) { //-*
                                    return parseInt(sOffice.officeId) === parseInt(lOffice.officeId); //-*
                                })
                                if (typeof existingLocalRecord === 'undefined' || !existingLocalRecord) {
                                    // save record to local
                                    offices.save(sOffice); //-*
                                }
                            });
                        }
                    });
                    res.status(200).json({
                        message: request.collection + ' was synced.'
                    });
                });
            });
        } else if (request.collection === 'User') {
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
                    var users = db.collection('User');
                    users.find(function (err, lEmployees) { //-*
                        if (!err) {
                            // get records from server
                            var sEmployees = JSON.parse(chunks); //-*

                            // update local with server records
                            _.each(sEmployees, function (sEmployee) { //-*
                                var existingLocalRecord = _.find(lEmployees, function (lEmployee) { //-*
                                    return parseInt(lEmployee.userId) === parseInt(sEmployee.userId); //-*
                                })
                                if (typeof existingLocalRecord === 'undefined' || !existingLocalRecord) {
                                    // save record to local
                                    users.save(sEmployee); //-*
                                }
                            });
                        }
                    });
                    res.status(200).json({
                        message: request.collection + ' was synced.'
                    });

                });
            });
        } else if (request.collection === 'Ticket') {
            ///////// GET TICKETS /////////////
            ///////////////////////////////////		
            var options = {
                host: 'meticket.briangreenedev.com',
                path: '/TicketSystem/TicketView/GetTickets',
                method: 'GET'
            };
            http.get(options, function (sResponse) {
                var chunks = '';
                sResponse.setEncoding('utf8');
                sResponse.on('data', function (chunk) {
                    chunks += chunk;
                });
                sResponse.on('end', function (data) {
                    var tickets = db.collection('Ticket');
                    tickets.find(function (err, lTickets) {
                        if (!err) {
                            // get tickets from server
                            var records = JSON.parse(chunks);
                            var sTickets = _.filter(records, function (record) {
                                return record.userId === request.user.userId;
                            });


                            // update server with local tickets
                            //                            var data = JSON.stringify({
                            //                                'username': user.userEmail,
                            //                                'password': user.userPassword
                            //                            });
                            //                            var saveTicketsOptions = {
                            //                                host: hostConstant,
                            //                                path: '/TicketSystem/TicketView/TryLoginAndGetUser',
                            //                                method: 'POST',
                            //                                headers: {
                            //                                    'Content-Type': 'application/json;charset=UTF-8',
                            //                                    'Content-Length': Buffer.byteLength(data)
                            //                                }
                            //                            };
                            //                            http.get(saveTicketsOptions, function (sRes) {
                            //
                            //                            });


                            // update local with server tickets
                            _.each(sTickets, function (sTicket) {
                                var existingLocalRecord = _.find(lTickets, function (lTicket) {
                                    return parseInt(sTicket.ticketId) === parseInt(lTicket.ticketId);
                                })
                                if (typeof existingLocalRecord === 'undefined' || !existingLocalRecord) {
                                    // save record to local
                                    tickets.save(sTicket); //-*
                                }
                            });
                        }
                    });
                    res.status(200).json({
                        message: request.collection + ' was synced.'
                    });
                });
            });
        } else if (request.collection === 'TicketItem') {
            ///////// GET TICKET ITEMS ///////////
            //////////////////////////////////////
            var ticketItemOptions = { //-*
                host: hostConstant,
                path: '/TicketSystem/TicketView/GetTicketItems', //-*
                method: 'GET' //-*
            }
            http.get(ticketItemOptions, function (sResponse) { //-*
                var chunks = '';
                sResponse.setEncoding('utf8');
                sResponse.on('data', function (chunk) {
                    chunks += chunk;
                });
                sResponse.on('end', function () {
                    var ticketItems = db.collection('TicketItem'); //-*
                    ticketItems.find(function (err, lTicketItems) { //-*
                        if (!err) {
                            // get records from server
                            var sTicketItems = JSON.parse(chunks); //-*

                            // update local with server records
                            _.each(sTicketItems, function (sTicketItem) { //-*
                                var existingLocalRecord = _.find(lTicketItems, function (lTicketItem) { //-*
                                    return parseInt(sTicketItem.ticketItemId) === parseInt(lTicketItem.ticketItemId); //-*
                                })
                                if (typeof existingLocalRecord === 'undefined' || !existingLocalRecord) {
                                    // save record to local
                                    ticketItems.save(sTicketItems); //-*
                                }
                            });
                        }
                    });
                });
            });
        } else if (request.collection === 'Product') {
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
                    var products = db.collection('Product');
                    products.find(function (err, lProducts) { //-*
                        if (!err) {
                            // get records from server
                            var sProducts = JSON.parse(chunks); //-*

                            // update local with server records
                            _.each(sProducts, function (sProduct) { //-*
                                var existingLocalRecord = _.find(lProducts, function (lProduct) { //-*
                                    return parseInt(sProduct.productId) === parseInt(lProduct.productId); //-*
                                })
                                if (typeof existingLocalRecord === 'undefined' || !existingLocalRecord) {
                                    // save record to local
                                    products.save(sProduct); //-*
                                }
                            });
                        }
                    });
                });
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
                    var products = db.collection('Product');
                    products.find(function (err, lProducts) { //-*
                        if (!err) {
                            // get records from server
                            var sProducts = JSON.parse(chunks); //-*

                            // update local with server records
                            _.each(sProducts, function (sProduct) { //-*
                                var existingLocalRecord = _.find(lProducts, function (lProduct) { //-*
                                    return parseInt(sProduct.productId) === parseInt(lProduct.productId); //-*
                                })
                                if (typeof existingLocalRecord === 'undefined' || !existingLocalRecord) {
                                    // save record to local
                                    products.save(sProduct); //-*
                                }
                            });
                        }
                    });
                    res.status(200).json({
                        message: request.collection + ' was synced.'
                    });

                });
            });
        } else if (request.collection === 'TaxCategory') {
            ///////// GET TAX CATEGORIES ///////////
            ////////////////////////////////////////
            var taxCatOptions = { //-*
                host: hostConstant,
                path: '/TicketSystem/TicketView/GetTaxCategories', //-*
                method: 'GET' //-*
            }
            http.get(taxCatOptions, function (sResponse) { //-*
                var chunks = '';
                sResponse.setEncoding('utf8');
                sResponse.on('data', function (chunk) {
                    chunks += chunk;
                });
                sResponse.on('end', function () {
                    var taxCategories = db.collection('TaxCategory');
                    taxCategories.find(function (err, lTaxCats) { //-*
                        if (!err) {
                            // get records from server
                            var sTaxCats = JSON.parse(chunks); //-*

                            // update local with server records
                            _.each(sTaxCats, function (sTaxCat) { //-*
                                var existingLocalRecord = _.find(lTaxCats, function (lTaxCat) { //-*
                                    return parseInt(sTaxCat.taxCategoryId) === parseInt(lTaxCat.taxCategoryId); //-*
                                })
                                if (typeof existingLocalRecord === 'undefined' || !existingLocalRecord) {
                                    // save record to local
                                    taxCategories.save(sTaxCat); //-*
                                }
                            });
                        }
                    });
                    res.status(200).json({
                        message: request.collection + ' was synced.'
                    });
                });
            });
        } else if (request.collection === 'UnitType') {
            console.log('found it');
            ///////// GET UNIT TYPES ///////////
            ///////////////////////////////////
            var unitTypeOptions = { //-*
                host: hostConstant,
                path: '/TicketSystem/ProductView/GetUnitTypes', //-*
                method: 'GET' //-*
            }
            http.get(unitTypeOptions, function (sResponse) { //-*
                var chunks = '';
                sResponse.setEncoding('utf8');
                sResponse.on('data', function (chunk) {
                    chunks += chunk;
                });
                sResponse.on('end', function () {
                    var unitTypes = db.collection('UnitType');
                    unitTypes.find(function (err, lUnitTypes) { //-*
                        if (!err) {
                            // get records from server
                            var sUnitTypes = JSON.parse(chunks); //-*
                            // update local with server records
                            _.each(sUnitTypes, function (sUnitType) { //-*
                                var existingLocalRecord = _.find(lUnitTypes, function (lUnitType) { //-*
                                    return parseInt(sUnitType.unitTypeId) === parseInt(lUnitType.unitTypeId); //-*
                                })
                                if (typeof existingLocalRecord === 'undefined' || !existingLocalRecord) {
                                    // save record to local
                                    unitTypes.save(sUnitType); //-*
                                }
                            });
                        }
                    });

                    res.status(200).json({
                        message: request.collection + ' was synced.'
                    });

                });
            });
        } else if (request.collection === 'Customer') {
            console.log('start');
            ///////// GET CUSTOMERS ///////////
            ///////////////////////////////////
            var customerOptions = { //-*
                host: hostConstant,
                path: '/TicketSystem/CustomerView/GetCustomers', //-*
                method: 'GET' //-*
            }
            http.get(customerOptions, function (sResponse) { //-*
                console.log('http start');
                var chunks = '';
                sResponse.setEncoding('utf8');
                sResponse.on('data', function (chunk) {
                    chunks += chunk;
                });
                sResponse.on('end', function () {
                    var customers = db.collection('Customer');
                    customers.find(function (err, lCustomers) { //-*
                        if (!err) {
                            // get records from server
                            var sCustomers = JSON.parse(chunks); //-*

                            // update local with server records
                            console.log('sCustomer length: ' + sCustomers.length);
                            _.each(sCustomers, function (sCustomer) { //-*
                                var existingLocalRecord = _.find(lCustomers, function (lCustomer) { //-*
                                    return parseInt(sCustomer.customerId) === parseInt(lCustomer.customerId); //-*
                                })
                                if (typeof existingLocalRecord === 'undefined' || !existingLocalRecord) {
                                    // save record to local
                                    customers.save(sCustomer); //-*
                                }
                            });
                        }
                    });

                    res.status(200).json({
                        message: request.collection + ' was synced.'
                    });
                });
            });
        } else if (request.collection === 'ProductType') {
            ///////// GET PRODUCT TYPES////////
            ///////////////////////////////////
            var productTypeOptions = { //-*
                host: hostConstant,
                path: '/TicketSystem/ProductView/GetProductTypes', //-*
                method: 'GET' //-*
            }
            http.get(productTypeOptions, function (sResponse) { //-*
                var chunks = '';
                sResponse.setEncoding('utf8');
                sResponse.on('data', function (chunk) {
                    chunks += chunk;
                });
                sResponse.on('end', function () {
                    var productTypes = db.collection('ProductType');
                    productTypes.find(function (err, lProductTypes) { //-*
                        if (!err) {
                            // get records from server
                            var sProductTypes = JSON.parse(chunks); //-*

                            // update local with server records
                            _.each(sProductTypes, function (sProductType) { //-*
                                var existingLocalRecord = _.find(lProductTypes, function (lProductType) { //-*
                                    return parseInt(sProductType.productTypeId) === parseInt(lProductType.productTypeId); //-*
                                })
                                if (typeof existingLocalRecord === 'undefined' || !existingLocalRecord) {
                                    // save record to local
                                    productTypes.save(sProductType); //-*
                                }
                            });
                        }
                    });
                    res.status(200).json({
                        message: request.collection + ' was synced.'
                    });
                });
            });
        } else {
            res.status(500).json({
                error: request.collection + ' collection does not exist.'
            })
        }
    } else {
        res.status(500).json({
            error: 'Insufficient input. Unable to complete the request'
        });
    }

});




app.listen(3000);
console.log('Server running on port 3000');