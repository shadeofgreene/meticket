var express = require('express');
var app = express();
var querystring = require('querystring');
var mongojs = require('mongojs');
var collections = ['ticket', 'User'];
var db = mongojs('MeTicket', ['Ticket', 'User']);
var bodyParser = require('body-parser');
var ObjectId = require('mongodb').ObjectID;
var http = require('http');
var _ = require('underscore');
var Pdf = require('pdfkit');
var fs = require('fs');
var serverPathToSiteRoot = '/CodeNode/meticket/public/';
var moment = require('moment');
var accounting = require('accounting');

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());

app.post('/TryLoginAndGetUser', function (req, res) {
	var user = req.body;
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
				console.log(data);
				var options = {
					host: 'meticket.briangreenedev.com',
					path: '/TicketSystem/LoginView/TryLoginAndGetUser',
					method: 'POST',
					headers: {
						'Content-Type': 'application/json;charset=UTF-8',
						'Content-Length': Buffer.byteLength(data)
					}
				};
				console.log(options);

				var userString = '';
				http.request(options, function (userRes) {
					//console.log(userRes);
					userRes.setEncoding('utf8');
					userRes.on('data', function (chunk) {
						console.log(chunk);
						userString += chunk;
					}).on('end', function (data) {
						if (userString) {
							var userToSave = JSON.parse(userString);
							console.log(user.userPassword);
							userToSave.userPassword = user.userPassword;
							//console.log(userToSave);
							db.User.save(userToSave);
							res.json(userToSave);
						} else {
							console.log('user not on remote server');
							res.status(500).json({
								'message': 'User not found on server.'
							});

						}
					});
				}).write(data);
			} else {
				console.log('user was found');
				res.json(checkUser);
			}
		});
	}
});

//app.post('/CreateTicketAndReturnTicket', function (req, res) {
//    var ticket = req.body;
//    console.log(ticket);
//    if (ticket) {
//        db.Ticket.save(ticket, function (err, ticket) {
//            if (!err) {
//                res.json(ticket);
//            } else {
//                res.json('Invalid');
//            }
//        });
//    }
//});

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
			var sortedTickets = _.sortBy(tickets, 'workTicketNumber');
			res.json(sortedTickets.reverse());
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
			var sortedEmps = _.sortBy(employees, 'userLastName');
			res.status(200).json(sortedEmps);
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

// GET EQUIPMENT PRODUCTS
app.get('/GetEquipmentProducts', function (req, res) {
	var equipmentProducts = db.collection('EquipmentProduct');
	equipmentProducts.find(function (err, equipmentProducts) {
		if (!err) {
			res.status(200).json(equipmentProducts);
		} else {
			res.status(500).json({
				error: 'Problem getting equipment products.'
			})
		}
	})
});

// GET MATERIAL PRODUCTS
app.get('/GetMaterialProducts', function (req, res) {
	var materialProducts = db.collection('MaterialProduct');
	materialProducts.find(function (err, materialProducts) {
		if (!err) {
			res.status(200).json(materialProducts);
		} else {
			res.status(500).json({
				error: 'Problem getting material products.'
			})
		}
	})
});

// GET TICKET (by ticketId)
app.post('/GetTicket', function (req, res) {
	console.log('started');
	console.log('**************************');
	console.log('**************************');
	console.log('**************************');
	var request = req.body;
	if (request) {
		var ticketId = request.ticketId;
		if (ticketId) {
			//console.log(ticketId);
			var tickets = db.collection('Ticket');
			tickets.findOne({
				'ticketId': ticketId
			}, function (err, ticket) {
				//console.log(ticket);
				if (!err && ticket) {
					var ticketItems = db.collection('TicketItem');
					ticketItems.find({
						'ticketId': ticket.ticketId
					}, function (err, ticketItems) {
						if (!err) {
							ticket.ticketItems = ticketItems;
							res.status(200).json(ticket);
						}
					});
				} else {
					console.log(ticketId);
					var newObjectIdObject = new ObjectId.createFromHexString(ticketId);
					tickets.findOne({
						'_id': newObjectIdObject
					}, function (err, ticket) {
						//console.log(ticket);
						if (!err && ticket) {
							var ticketItems = db.collection('TicketItem');
							ticketItems.find({
								'_ticketId': ticket._id
							}, function (err, ticketItems) {
								if (!err) {
									ticket.ticketItems = ticketItems;
									res.status(200).json(ticket);
								}
							});
						} else {
							res.status(500).json({
								error: 'There was a problem'
							})
						}
					});
				}
			});
		} else {
			res.status(500).json({
				error: 'There was a problem'
			})
		}
	} else {
		res.status(500).json({
			error: 'There was a problem'
		})
	}
});

// EDIT AND RETURN TICKET
app.post('/EditTicketAndReturnTicket', function (req, res) {
	var tickets = db.collection('Ticket');
	var ticketItems = db.collection('TicketItem');
	var ticket = req.body;
	if (ticket) {
		console.log(ticket);
		if (ticket.ticketId) {
			tickets.findAndModify({
				query: {
					ticketId: ticket.ticketId
				},
				update: {
					officeId: ticket.officeId,
					customerName: ticket.customerName,
					customerPhone: ticket.customerPhone,
					customerAddress1: ticket.customerAddress1,
					customerAddress2: ticket.customerAddress2,
					customerCity: ticket.customerCity,
					customerOfficeId: ticket.customerOfficeId,
					customerState: ticket.customerState,
					customerZip: ticket.customerZip,
					userId: ticket.userId,
					locationNumber: ticket.locationNumber,
					rigNumber: ticket.rigNumber,
					customerPo: ticket.customerPo,
					freight: ticket.freight,
					taxCategory: ticket.taxCategory,
					jobDescription: ticket.jobDescription
				},
				new: true
			}, function (err, updatedTicket, lastErrorObject) {
				if (!err) {
					// delete ticket items
					ticketItems.remove({
						'ticketId': updatedTicket.ticketId
					}, function (err, removedTicketItems) {
						if (!err) {
							// create new of these items
							var newTicketItemsToSave = [];
							// create new ticket item if freight exists
							if (updatedTicket.freight) {
								updatedTicket.ticketItems.push({
									ticketItemDescription: 'Freight charge',
									productTypeId: 1008,
									userId: updatedTicket.userId,
									ticketItemRate: parseFloat(ticket.freight),
									ticketItemName: 'Freight charge',
									qtyUnits: 1,
									ticketItemUnitType: 'E'
								});
							}
							_.each(updatedTicket.ticketItems, function (ticketItem) {
								if (parseInt(ticketItem.productTypeId) === 1008) {
									ticketItem.ticketId = updatedTicket.ticketId;
									newTicketItemsToSave.push(ticketItem);
								} else {
									var newTicketItem = {
										ticketItemDescription: ticketItem.productDescription,
										productTypeId: ticketItem.productTypeId,
										productId: ticketItem.productId,
										userId: updatedTicket.userId,
										ticketItemRate: parseFloat(ticketItem.pricePerUnit),
										ticketItemName: ticketItem.productDescription,
										qtyUnits: parseInt(ticketItem.qtyUnits),
										ticketId: updatedTicket.ticketId,
										ticketItemUnitType: ticketItem.ticketItemUnitType
									}
									newTicketItemsToSave.push(newTicketItem);
								}
							});
							// insert list of ticket items
							ticketItems.insert(newTicketItemsToSave, function (err, savedTicketItems) {
								if (!err) {
									updatedTicket.ticketItems = savedTicketItems;
									res.status(200).json(updatedTicket);
								}
							});
						}
					})
				}
			});
		} else if (ticket._id) {
			tickets.findAndModify({
				query: {
					ticketId: ticket._id
				},
				update: {
					officeId: ticket.officeId,
					customerName: ticket.customerName,
					customerPhone: ticket.customerPhone,
					customerAddress1: ticket.customerAddress1,
					customerAddress2: ticket.customerAddress2,
					customerCity: ticket.customerCity,
					customerOfficeId: ticket.customerOfficeId,
					customerState: ticket.customerState,
					customerZip: ticket.customerZip,
					userId: ticket.userId,
					locationNumber: ticket.locationNumber,
					rigNumber: ticket.rigNumber,
					customerPo: ticket.customerPo,
					freight: ticket.freight,
					taxCategory: ticket.taxCategory,
					jobDescription: ticket.jobDescription
				},
				new: true
			}, function (err, updatedTicket, lastErrorObject) {
				if (!err) {
					// delete ticket items
					ticketItems.remove({
						'_ticketId': updatedTicket._id
					}, function (err, ticketItemsRemoved) {
						if (!err) {
							// create new of these items
							var newTicketItemsToSave = [];
							// create new ticket item if freight exists
							if (updatedTicket.freight) {
								updatedTicket.ticketItems.push({
									ticketItemDescription: 'Freight charge',
									productTypeId: 1008,
									userId: updatedTicket.userId,
									ticketItemRate: parseFloat(updatedTicket.freight),
									ticketItemName: 'Freight charge',
									qtyUnits: 1,
									ticketItemUnitType: 'E'
								});
							}
							_.each(updatedTicket.ticketItems, function (ticketItem) {
								if (parseInt(ticketItem.productTypeId) === 1008) {
									ticketItem._ticketId = updatedTicket._id;
									newTicketItemsToSave.push(ticketItem);
								} else {
									var newTicketItem = {
										ticketItemDescription: ticketItem.productDescription,
										productTypeId: ticketItem.productTypeId,
										productId: ticketItem.productId,
										userId: updatedTicket.userId,
										ticketItemRate: parseFloat(ticketItem.pricePerUnit),
										ticketItemName: ticketItem.productDescription,
										qtyUnits: parseInt(ticketItem.qtyUnits),
										_ticketId: updatedTicket._id,
										ticketItemUnitType: ticketItem.ticketItemUnitType
									}
									newTicketItemsToSave.push(newTicketItem);
								}
							});
							// insert list of ticket items
							ticketItems.insert(newTicketItemsToSave, function (err, savedTicketItems) {
								if (!err) {
									updatedTicket.ticketItems = savedTicketItems;
									res.status(200).json(updatedTicket);
								}
							});
						}
					})
				}
			});
		}
	}
});


// CREATE AND RETURN TICKET
app.post('/CreateTicketAndReturnTicket', function (req, res) {
	var tickets = db.collection('Ticket');
	var ticketItems = db.collection('TicketItem');
	var request = req.body;
	var newTicket = request.ticket;
	var user = request.user;

	if (newTicket) {
		// first generate new work ticket number (BJG150006)
		var newWorkTicketNumber = '';
		tickets.find({
			'userId': user.userId
		}, function (err, ticketsForThisUser) {
			if (!err) {
				if (ticketsForThisUser && ticketsForThisUser.length > 0) {
					var numberPattern = /\d+/g;
					var highTicketNumber = 0;
					var counter = 1;
					_.each(ticketsForThisUser, function (ticket) {
						if (ticket.workTicketNumber) {
							var ticketNumber = ticket.workTicketNumber.match(numberPattern);
							if (ticketNumber) {

								if (parseInt(ticketNumber) > highTicketNumber) {
									highTicketNumber = parseInt(ticketNumber);
								}
							}
							counter++;
						}
					});
					var newTicketNumber = highTicketNumber + 1;
					newWorkTicketNumber = user.workTicketCode + String(newTicketNumber);
				} else {
					newWorkTicketNumber = user.workTicketCode + '150000';
				}
				newTicket.workTicketNumber = newWorkTicketNumber;

				var newTicketItemsToSave = [];

				// create new ticket item if freight exists
				if (newTicket.freight) {
					newTicket.ticketItems.push({
						ticketItemDescription: 'Freight charge',
						productTypeId: 1008,
						userId: user.userId,
						ticketItemRate: parseFloat(newTicket.freight),
						ticketItemName: 'Freight charge',
						qtyUnits: 1,
						ticketItemUnitType: 'E'
					});
				}

				// get current date
				var dateTime = new Date();
				newTicket.ticketCreationDate = dateTime;
				var newTicketItems = newTicket.ticketItems;
				newTicket.ticketItems = null;
				newTicket.ticketItemObjects = null;

				// set grand total
				newTicket.grandTotal = newTicket.totalSection.grandTotal;


				// Save ticket and ticket items
				tickets.save(newTicket, function (err, ticket) {
					if (!err) {
						// assign ticket items to this ticket and add ticketItemDescription and ticketItemName

						_.each(newTicketItems, function (ticketItem) {
							if (parseInt(ticketItem.productTypeId) === 1008) {
								ticketItem._ticketId = ticket._id;
								newTicketItemsToSave.push(ticketItem);
							} else {
								var newTicketItem = {
									ticketItemDescription: ticketItem.productDescription,
									productTypeId: ticketItem.productTypeId,
									productId: ticketItem.productId,
									userId: user.userId,
									ticketItemRate: parseFloat(ticketItem.pricePerUnit),
									ticketItemName: ticketItem.productDescription,
									qtyUnits: parseInt(ticketItem.qtyUnits),
									_ticketId: ticket._id,
									ticketItemUnitType: ticketItem.ticketItemUnitType
								}
								newTicketItemsToSave.push(newTicketItem);
							}
						});


						ticketItems.insert(newTicketItemsToSave, function (err, savedTicketItems) {
							if (!err) {
								// create PDF
								var doc = new Pdf({
									margin: 25
								});
								var defaultFontSize = 12;
								var contentWidth = doc.page.width - 50;

								doc.fillColor('#4f4f4f');
								doc.fontSize(defaultFontSize);

								doc.pipe(fs.createWriteStream(serverPathToSiteRoot + 'content/Tickets/Generated/' + ticket._id.toHexString() + '.pdf'));

								doc.image(serverPathToSiteRoot + 'content/Tickets/Templates/me-ticket-template.jpg', {
									width: contentWidth
								});

								doc.fontSize(defaultFontSize + 3);
								doc.fillColor('#56abc0');
								// work ticket number
								doc.text(ticket.workTicketNumber, 425, 65, {
									lineBreak: false
								});

								doc.fillColor('#4f4f4f');
								doc.fontSize(defaultFontSize);

								// po number
								if (ticket.customerPo) {
									doc.text('PO #' + ticket.customerPo, 425, 90, {
										lineBreak: false
									});
								}
								// creation date
								console.log(ticket.ticketCreationDate);
								var formattedDate = moment(ticket.ticketCreationDate).format('M/D/YYYY');
								doc.text(formattedDate, 425, 105, {
									lineBreak: false
								});

								doc.fillColor('#56abc0');

								// ticket to:
								doc.text('TICKET TO:', 25, 145, {
									lineBreak: false
								});

								doc.fillColor('#4f4f4f');

								// customer info
								var currentCustomerInfoSpot = 160;
								doc.text(ticket.customerName, 25, currentCustomerInfoSpot);
								currentCustomerInfoSpot += 15;

								doc.fontSize(defaultFontSize - 2);

								doc.text(newTicket.customerAddress1, 25, currentCustomerInfoSpot);
								if (newTicket.customerAddress2) {
									currentCustomerInfoSpot += 13;
									doc.text(newTicket.customerAddress2, 25, currentCustomerInfoSpot);
								}

								currentCustomerInfoSpot += 13;
								if (!newTicket.customerZip) {
									newTicket.customerZip = '';
								}
								if (!newTicket.customerState) {
									newTicket.customerState = '';
								}
								if (newTicket.customerState === '' && newTicket.customerZip === '') {
									doc.text(newTicket.customerCity, 25, currentCustomerInfoSpot);
								} else {
									doc.text(newTicket.customerCity + ', ' + newTicket.customerState + ' ' + newTicket.customerZip, 25, currentCustomerInfoSpot);
								}

								doc.fontSize(defaultFontSize);
								if (newTicket.locationNumber) {
									currentCustomerInfoSpot += 20;
									// location:
									doc.fillColor('#56abc0');
									doc.text('LOCATION:', 25, currentCustomerInfoSpot, {
										lineBreak: false
									});
									// location
									doc.fillColor('#4f4f4f');
									doc.text(newTicket.locationNumber, 95, currentCustomerInfoSpot, {
										lineBreak: false
									});
								}

								if (newTicket.rigNumber) {
									currentCustomerInfoSpot += 20;
									// rig:
									doc.fillColor('#56abc0');
									doc.text('RIG:', 25, currentCustomerInfoSpot, {
										lineBreak: false
									});
									// rig
									doc.fillColor('#4f4f4f');
									doc.text(newTicket.rigNumber, 58, currentCustomerInfoSpot, {
										lineBreak: false
									});
								}

								doc.fillColor('#56abc0');
								// job description:
								doc.text('JOB DESCRIPTION:', 325, 145, {
									lineBreak: false
								});

								var currentJobDescriptionSpot = 160;

								doc.fillColor('#4f4f4f');
								doc.fontSize(defaultFontSize - 2);

								// description
								doc.text(ticket.jobDescription, 325, 160, {
									lineBreak: false,
									width: contentWidth - 325
								});

								currentJobDescriptionSpot = doc.y;

								var currentSpotTicketItems;
								if (currentJobDescriptionSpot > currentCustomerInfoSpot) {
									currentSpotTicketItems = currentJobDescriptionSpot;
								} else {
									currentSpotTicketItems = currentCustomerInfoSpot;
								}

								currentSpotTicketItems += 16;

								// ticket item header
								doc.image(serverPathToSiteRoot + 'content/Tickets/Templates/me-ticket-template-itemheading.jpg', 25, currentSpotTicketItems, {
									width: contentWidth
								});

								currentSpotTicketItems += 30;

								var laborItems = _.filter(savedTicketItems, function (sti) {
									return parseInt(sti.productTypeId) === 1006;
								});
								var otherItems = _.reject(savedTicketItems, function (sti) {
									return parseInt(sti.productTypeId) === 1006;
								});
								var startOfTicketItems = currentSpotTicketItems;

								if (laborItems.length > 0) {
									_.each(laborItems, function (ti) {
										doc.text(ti.ticketItemDescription, 25, startOfTicketItems, {
											width: 280
										});
										doc.text(accounting.formatMoney(ti.ticketItemRate), 25 + 280, startOfTicketItems, {
											width: 103
										});
										doc.text(ti.qtyUnits, 25 + 280 + 103, startOfTicketItems, {
											width: 80
										});
										doc.text(accounting.formatMoney(parseFloat(ti.ticketItemRate) * parseInt(ti.qtyUnits)), 25 + 280 + 103 + 80, startOfTicketItems, {
											width: 100
										});
										startOfTicketItems += 20;
									});

									startOfTicketItems += 20;
								}

								_.each(otherItems, function (ti) {
									var endOfPage = 750;

									if (startOfTicketItems > endOfPage - 30) {
										doc.addPage();
										doc.fillColor('#4f4f4f');
										doc.fontSize(defaultFontSize);

										doc.image(serverPathToSiteRoot + 'content/Tickets/Templates/me-ticket-template.jpg', {
											width: contentWidth
										});

										doc.fontSize(defaultFontSize + 3);
										doc.fillColor('#56abc0');
										// work ticket number
										doc.text(ticket.workTicketNumber, 425, 65, {
											lineBreak: false
										});

										doc.fillColor('#4f4f4f');
										doc.fontSize(defaultFontSize);

										// po number
										if (ticket.customerPo) {
											doc.text('PO #' + ticket.customerPo, 425, 90, {
												lineBreak: false
											});
										}
										// creation date
										console.log(ticket.ticketCreationDate);
										var formattedDate = moment(ticket.ticketCreationDate).format('M/D/YYYY');
										doc.text(formattedDate, 425, 105, {
											lineBreak: false
										});

										doc.fillColor('#4f4f4f');
										doc.fontSize(defaultFontSize);

										var startOfItemHeadingImage = 145;

										// ticket item header
										doc.image(serverPathToSiteRoot + 'content/Tickets/Templates/me-ticket-template-itemheading.jpg', 25, 145, {
											width: contentWidth
										});
										startOfItemHeadingImage += 35;

										startOfTicketItems = startOfItemHeadingImage;
									}
									doc.text(ti.ticketItemDescription, 25, startOfTicketItems, {
										width: 280
									});
									doc.text(accounting.formatMoney(ti.ticketItemRate), 25 + 280, startOfTicketItems, {
										width: 103
									});
									doc.text(ti.qtyUnits, 25 + 280 + 103, startOfTicketItems, {
										width: 80
									});
									doc.text(accounting.formatMoney(parseFloat(ti.ticketItemRate) * parseInt(ti.qtyUnits)), 25 + 280 + 103 + 80, startOfTicketItems, {
										width: 100
									});
									startOfTicketItems += 20;
								});


								var startOfTotalSection = 595;
								if (startOfTicketItems > startOfTotalSection - 30) {
									doc.addPage();
									doc.fillColor('#4f4f4f');
									doc.fontSize(defaultFontSize);

									doc.image(serverPathToSiteRoot + 'content/Tickets/Templates/me-ticket-template.jpg', {
										width: contentWidth
									});

									doc.fontSize(defaultFontSize + 3);
									doc.fillColor('#56abc0');
									// work ticket number
									doc.text(ticket.workTicketNumber, 425, 65, {
										lineBreak: false
									});

									doc.fillColor('#4f4f4f');
									doc.fontSize(defaultFontSize);

									// po number
									if (ticket.customerPo) {
										doc.text('PO #' + ticket.customerPo, 425, 90, {
											lineBreak: false
										});
									}
									// creation date
									console.log(ticket.ticketCreationDate);
									var formattedDate = moment(ticket.ticketCreationDate).format('M/D/YYYY');
									doc.text(formattedDate, 425, 105, {
										lineBreak: false
									});

									doc.fillColor('#4f4f4f');
									doc.fontSize(defaultFontSize);
								}

								doc.fontSize(defaultFontSize);

								// total section
								doc.image(serverPathToSiteRoot + 'content/Tickets/Templates/me-ticket-template-totalsection.jpg', 275, 595, {
									width: contentWidth - 250
								});

								var incrementAmount = 26;
								var yStart = 618;
								doc.text(accounting.formatMoney(newTicket.totalSection.materialSubTotal), 460, yStart);
								doc.text(accounting.formatMoney(newTicket.totalSection.laborAndEquipmentSubTotal), 460, yStart + incrementAmount);
								doc.text(accounting.formatMoney(newTicket.freight), 460, yStart + incrementAmount + incrementAmount);
								doc.text(accounting.formatMoney(newTicket.totalSection.totalTaxes), 460, yStart + incrementAmount + incrementAmount + incrementAmount);

								doc.fontSize(defaultFontSize + 4);

								doc.text(accounting.formatMoney(newTicket.totalSection.grandTotal), 460, yStart + incrementAmount + incrementAmount + incrementAmount + incrementAmount - 2);
								doc.text(accounting.formatMoney(newTicket.totalSection.grandTotal), 460, yStart + incrementAmount + incrementAmount + incrementAmount + incrementAmount - 2);
								doc.text(accounting.formatMoney(newTicket.totalSection.grandTotal), 460, yStart + incrementAmount + incrementAmount + incrementAmount + incrementAmount - 2);

								//                                var values = [
								//                                    50, 100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600, 650, 700, 750, 800, 850, 900, 950
								//                                ];
								//                                var vals = [
								//                                    50, 100, 150, 200, 250, 300, 350, 400, 450, 500
								//                                ];
								//
								//                                doc.fillColor('red');
								//                                _.each(values, function(v) {
								//                                    doc.text(v, 0, v, {
								//                                        lineBreak: false
								//                                    });
								//                                });
								//                                doc.fillColor('green');
								//                                _.each(vals, function(x) {
								//                                    doc.text(x, x, 0, {
								//                                        lineBreak: false
								//                                    });
								//                                });

								doc.end();

								res.status(200).json('Ticket has been saved!');
							} else {
								res.status(201).json('Ticket was saved, but ticket items were not saved');
							}
						})
					} else {
						console.log(err);
					}
				});
			} else {
				res.status(500).json({
					error: 'There was a problem.'
				})
			}
		});
	}
});

// GET PRODUCTS BY TYPE
//app.post('/GetProductsByType', function (req, res) {
//    var productType = req.body;
//    if (productType) {
//        var products = db.collection('Product');
//        products.find({
//            'productTypeId': productType.productTypeId
//        }, function (err, products) {
//            if (!err) {
//                res.status(200).json(products);
//            } else {
//                res.status(500).json({
//                    error: 'Problem getting products'
//                })
//            }
//        })
//    } else {
//		res.status(500).json({
//			error: 'Problem getting products'
//		})
//	}
//})






app.post('/SaveTicketOnServer', function (req, res) {
	var hostConstant = 'meticket.briangreenedev.com';
	var ticket = req.body;
	if (ticket._id) {
		var t_id = JSON.parse(JSON.stringify(ticket._id));
		delete ticket._id;
		delete ticket.ticketNumber;
		delete ticket.ticketId;
		console.log(ticket);

		// remove freight value so that another ticket item doesn't get created.
		delete ticket.freight;
		var saveTicketOnServerOptions = {
			host: hostConstant,
			path: '/TicketSystem/TicketView/CreateTicketAndReturnTicket',
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Content-Length': Buffer.byteLength(ticket)
			}
		}

		http.request(saveTicketOnServerOptions, function (res) {
			var chunks = '';
			res.on('data', function (chunk) {
				chunks += chunk;
			}).on('end', function () {
				var tickets = db.collection('Ticket');

				var serverTicket = JSON.parse(chunks);

				tickets.findAndModify({
					query: {
						_id: t_id
					},
					update: {
						_id: null,
						serverTicket: serverTicket.ticketId
					},
					new: false
				}, function (err, doc, lastErrorObject) {
					if (!err) {
						// update ticket items with new ticketId
						var ticketItems = db.collection('TicketItem');
						ticketItems.update({
							_ticketId: t_id
						}, {
							$set: {
								ticketId: ticket.ticketId
							}
						}, {
							multi: true
						}, function (err, ticketItems) {
							if(!err) {
								doc.ticketItems = ticketItems;
								res.json(doc);
							} else {
								res.status(500).send(err);
							}
						});
					} else {
						res.status(500).send(err);
					}
				});

				tickets.remove({
					'_id': ticket._id
				}, function (err) {
					console.log('YES!');
				});
			});
		}).write(querystring.stringify(ticket));
	}
});

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
				}).on('error', function () {
					res.status(500).json({
						'message': 'There was a problem trying to get the customer offices.'
					});
				}).on('end', function () {
					var offices = db.collection('Office');
					offices.remove({}, function (err) {
						if (!err) {
							// get records from server
							var sOffices = JSON.parse(chunks); //-*
							var brianGreene = _.find(sOffices, function (off) {
								return off.officeId === 108;
							});
							console.log(brianGreene);

							// update local with server records
							_.each(sOffices, function (sOffice) { //-*
								offices.save(sOffice); //-*
							});
							res.status(200).json({
								message: request.collection + ' was synced.'
							});
						} else {
							res.status(500).json({
								message: request.collection + ' was NOT synced.'
							});
						}
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
					var me = users.find({
						'userId': request.user.userId
					}, function (err, myUsers) {
						if (!err) {
							var myUser = _.find(myUsers, function (u) {
								return u.userPassword !== null;
							});
							users.remove({}, function (err) {
								if (!err) {
									console.log(myUser);

									// get records from server
									var sUsers = JSON.parse(chunks); //-*

									// update local with server records
									_.each(sUsers, function (sUser) { //-*
										console.log(sUser.userId + ' : ' + myUser.userId)
										if (sUser.userId === myUser.userId) {
											console.log('sUser password = ' + myUser.userPassword);
											sUser.userPassword = myUser.userPassword;
										} else {
											sUser.userPassword = null;
										}
										users.save(sUser); //-*
									});
									res.status(200).json({
										message: request.collection + ' was synced.'
									});
								} else {
									res.status(500).json({
										message: request.collection + ' was NOT synced.'
									});
								}
							});
						}
					});
				});
			});
			//		} else if (request.collection === 'Ticket') {
			//
			//			///////// GET TICKETS /////////////
			//			///////////////////////////////////	
			//			// TODO!
			//			if (request.ticketChangedFromLocalToServer) {
			//				// update local with server tickets
			//				var tickets = db.collection('Ticket');
			//				tickets.find(function (err, lTickets) {
			//					if (!err) {
			//						// get local tickets: get tickets for this user that have not been saved to the server yet (those without a ticketId)
			//						var ticketsWithoutId = _.filter(lTickets, function (lTicket) {
			//							return !lTicket.ticketId
			//						});
			//						var ticketsChanged = _.each(ticketsWithoutId, function (twi) {
			//							twi._id = null;
			//						});
			//
			//						// Get tickets from server to save locally
			//						var options = {
			//							host: 'meticket.briangreenedev.com',
			//							path: '/TicketSystem/TicketView/GetTickets',
			//							method: 'GET'
			//						};
			//						http.get(options, function (sResponse) {
			//							var chunks = '';
			//							sResponse.setEncoding('utf8');
			//							sResponse.on('data', function (chunk) {
			//								chunks += chunk;
			//							}).on('end', function (data) {
			//								var tickets = db.collection('Ticket');
			//								tickets.remove({}, function (err) {
			//									console.log('there were NOT local tickets to be saved');
			//									if (!err) {
			//										// get records from server
			//										var sTickets = JSON.parse(chunks); //-*
			//
			//										// update local with server records
			//										_.each(sTickets, function (sTicket) { //-*
			//											tickets.save(sTicket); //-*
			//										});
			//										res.status(200).json({
			//											message: request.collection + ' was synced.'
			//										});
			//									} else {
			//										res.status(500).json({
			//											message: request.collection + ' was NOT synced.'
			//										});
			//									}
			//								});
			//							});
			//						});
			//					} else {
			//						res.status(500).json({
			//							'message': 'There was a problem'
			//						});
			//					}
			//
			//				});
			//			}


			//		} else if (request.collection === 'TicketItem') {
			//			///////// GET TICKET ITEMS ///////////
			//			//////////////////////////////////////
			//			var ticketItemOptions = { //-*
			//				host: hostConstant,
			//				path: '/TicketSystem/TicketView/GetTicketItems', //-*
			//				method: 'GET' //-*
			//			}
			//			http.get(ticketItemOptions, function (sResponse) { //-*
			//				var chunks = '';
			//				sResponse.setEncoding('utf8');
			//				sResponse.on('data', function (chunk) {
			//					chunks += chunk;
			//				}).on('error', function () {
			//					res.status(500).json({
			//						'message': 'There was a problem trying to get the ticket items.'
			//					});
			//				});
			//				sResponse.on('end', function () {
			//					var ticketItems = db.collection('TicketItem'); //-*
			//					ticketItems.find(function (err, lTicketItems) { //-*
			//						if (!err) {
			//							// get records from server
			//							var sTicketItems = JSON.parse(chunks); //-*
			//
			//							// update local with server records
			//							_.each(sTicketItems, function (sTicketItem) { //-*
			//								var existingLocalRecord = _.find(lTicketItems, function (lTicketItem) { //-*
			//									return parseInt(sTicketItem.ticketItemId) === parseInt(lTicketItem.ticketItemId); //-*
			//								})
			//								if (typeof existingLocalRecord === 'undefined' || !existingLocalRecord) {
			//									// save record to local
			//									ticketItems.save(sTicketItems); //-*
			//								}
			//							});
			//						}
			//					});
			//					res.status(200).json({
			//						message: request.collection + ' was synced.'
			//					});
			//				});
			//			});
		} else if (request.collection === 'MaterialProduct') {
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
				}).on('error', function () {
					res.status(500).json({
						'message': 'There was a problem trying to get the products.'
					});
				});
				sResponse.on('end', function () {
					var products = db.collection('MaterialProduct');
					products.find(function (err, lProducts) { //-*
						if (!err) {
							// get records from server
							if (chunks) {
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
							} else {
								res.status(500).json({
									'message': 'No products found'
								});
							}
						}
					});
					res.status(200).json({
						message: request.collection + ' was synced.'
					});
				});
			});
		} else if (request.collection === 'EquipmentProduct') {
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
				}).on('error', function () {
					res.status(500).json({
						'message': 'There was a problem trying to get the products.'
					});
				});
				sResponse.on('end', function () {
					var products = db.collection('EquipmentProduct');
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
				}).on('error', function () {
					res.status(500).json({
						'message': 'There was a problem trying to get the tax categories.'
					});
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
				}).on('error', function () {
					res.status(500).json({
						'message': 'There was a problem trying to get the unit types.'
					});
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
				}).on('error', function () {
					res.status(500).json({
						'message': 'There was a problem trying to get the customers.'
					});
				}).on('end', function () {
					var customers = db.collection('Customer');
					customers.find(function (err, lCustomers) { //-*
						if (!err) {
							// get records from server
							var sCustomers = JSON.parse(chunks); //-*
							console.log(sCustomers);
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
				}).on('error', function () {
					res.status(500).json({
						'message': 'There was a problem trying to get the product types.'
					});
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