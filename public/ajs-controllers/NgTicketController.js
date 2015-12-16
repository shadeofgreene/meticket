app.controller('NgTicketController', [
	'$scope', '$sce', '$window', 'Auth', 'Alert', '$location', '$http', 'GlobalUser', function ($scope, $sce, $window, Auth, Alert, $location, $http, GlobalUser) {
		$scope.baseUrl = helper.baseUrl;
		$scope.tickets = [];
		$scope.ticketsForCurrentUser = [];
		$scope.getTicketList = function() {
			var url = helper.baseUrl + 'public/TicketView/GetTickets';
			$http.get(url).success(function (tickets) {
				$scope.tickets = tickets;
				$scope.initializeTicketsForCurrentUser(tickets);
			}).error(function (error, err) {
				
			});
		}
		$scope.initializeTicketsForCurrentUser = function(tickets) {
			var user = JSON.parse(localStorage.getItem('user'));
			if (user) {
				$scope.ticketsForCurrentUser = _.filter(tickets, function (userTicket) {
					return userTicket.userId === user.userId;
				});
			}
		}
		$scope.getTicketList();

		$scope.dynamicPopover = {
			content: 'Hello, World!',
			templateUrl: 'ticketItemPopover.html',
			title: 'Title'
		};

		$scope.updateUnitAndPrice = function (currentTicketItem) {
			
			if (currentTicketItem.ticketItemUnitType.toLowerCase() === 'hr') {
				currentTicketItem.pricePerUnit = currentTicketItem.productCost;
			} else if (currentTicketItem.ticketItemUnitType.toLowerCase() === 'c') {
				currentTicketItem.pricePerUnit = (currentTicketItem.productCost / 100) * 1.6;
			} else if (currentTicketItem.ticketItemUnitType.toLowerCase() === 'm') {
				currentTicketItem.pricePerUnit = (currentTicketItem.productCost / 1000) * 1.6;
			} else {
				currentTicketItem.pricePerUnit = currentTicketItem.productCost * 1.6;
			}
		}

		$scope.ticketItems = [];
		$scope.getTicketItems = function() {
			var url = helper.baseUrl + 'public/TicketView/GetTicketItems';
			$http.get(url).success(function (items) {
				$scope.ticketItems = items;
			}).error(function (error, err) {
				
			});
		}
		$scope.getTicketItems();

		$scope.getTicketItemsForTicket = function (ticketId) {
			return _.filter($scope.ticketItems, function (item) {
				return parseInt(item.ticketId) === parseInt(ticketId);
			});
		}

		$scope.getTotalPrice = function (ticket) {
			debugger;
			var materialTotal = 0.00;
			var materialTax = 0.00;
			var laborEquipmentTotal = 0.00;
			var laborEquipmentTax = 0.00;
			var freightTax = 0.00;
			var totalTax = 0.00;
			var freight = 0.00;
			var grandTotal = 0.00;

			if (ticket.freight) {
				freight = ticket.freight;
				freightTax = parseFloat(returnTaxFromAmountAndTaxCategory(freight, ticket.taxCategoryId));
				totalTax += freightTax;
			} else {
				freight = 0.00;
			}
			
			// iterate through all ticket items
			ticket.ticketItems = [];
			//ticket.ticketItems = $scope.getTicketItemsForTicket(ticket.ticketId);
			angular.forEach($scope.ticketItems, function (item) {
				debugger;
				if (parseInt(ticket.ticketId) === parseInt(item.ticketId)) {
					ticket.ticketItems.push(item);
				}
			});
			debugger;
			_.each(ticket.ticketItems, function (item) {
				var subtotal = parseInt(item.qtyUnits) * parseFloat(item.ticketItemRate);

				if (parseInt(item.productTypeId) === 1 || parseInt(item.productTypeId) === 1006) {
					
					var laborEquipmentSubTax = parseFloat(returnTax(item, ticket.taxCategoryId));
					laborEquipmentTax += laborEquipmentSubTax;
					laborEquipmentTotal += subtotal;
					totalTax += laborEquipmentSubTax;
				} else if (item.productTypeId === 1005) {
					
					var materialSubTax = parseFloat(returnTax(item, ticket.taxCategoryId));
					materialTax += materialSubTax;
					materialTotal += subtotal;
					totalTax += materialSubTax;
				}
			});
			grandTotal = parseFloat(freight) + parseFloat(materialTotal) + parseFloat(laborEquipmentTotal) + parseFloat(totalTax);

			return grandTotal;
		}

		$scope.getTotalForTicket = function(ticketId) {
			var items = $scope.getTicketItemsForTicket(ticketId);
			if (items) {
				var total = 0;
				_.each(items, function(item) {
					var itemTotal = item.ticketItemRate * item.qtyUnits;
					total += itemTotal;
				});
				return total;
			}
			return 0;
		}

		$scope.ticket = {
			ticketNumber: null,
			ticketId: null,
			officeId: null,
			officeName: null,
			customerName: null,
			customerPhone: null,
			customerAddress1: null,
			customerAddress2: null,
			customerCity: null,
			customerState: null,
			customerZip: null,
			userId: null,
			priceRuleGeneralId: null,
			locationNumber: null,
			rigNumber: null,
			customerPo: null,
			freight: '0.00',
			taxCategoryId: null,
			ticketItems: [],
			totalSection: {
				materialSubTotal: '0.00',
				laborAndEquipmentSubTotal: '0.00',
				totalTaxes: '0.00',
				grandTotal: '0.00'
			}
		};
		function returnTaxFromAmountAndTaxCategory(amount, taxBracket) {
			var taxRate;
			taxBracket = Number(taxBracket);
			if (taxBracket === 1) {
				// Utah relocatable equipment
				taxRate = 6.05 * 0.01;
			} else if (taxBracket === 2) {
				// Utah fix location
				taxRate = 6.05 * 0.01;
			} else if (taxBracket === 3) {
				// Texas fix
				taxRate = 8.25 * 0.01;
			} else if (taxBracket === 4) {
				// Texas relocatable equipment
				taxRate = 8.25 * 0.01;
			} else {
				taxRate = 0;
			}
			return amount * taxRate;
		};
		function returnTax(item, taxBracket) {
			var taxRate;
			taxBracket = Number(taxBracket);
			var subtotal = Number(item.qtyUnits) * parseFloat(item.pricePerUnit);
			if (taxBracket === 1) {
				// Utah relocatable equipment
				taxRate = 6.05 * 0.01;
				if (item.productTypeId === 1 || 
					item.productTypeId === 1006 || 
					item.productTypeId === 1005) {
					// equipment or labor or material
					return subtotal * taxRate;
				}
			} else if (taxBracket === 2) {
				// Utah fix location
				taxRate = 6.05 * 0.01;
				if (item.productTypeId === 1005) {
					// equipment or labor or material
					return subtotal * taxRate;
				}
			} else if (taxBracket === 3) {
				// Texas fix
				taxRate = 8.25 * 0.01;
				if (item.productTypeId === 1005) {
					// equipment or labor or material
					return subtotal * taxRate;
				}
			} else if (taxBracket === 4) {
				// Texas relocatable equipment
				taxRate = 8.25 * 0.01;
				if (item.productTypeId === 1 ||
					item.productTypeId === 1006 ||
					item.productTypeId === 1005) {
					// equipment or labor or material
					return subtotal * taxRate;
				}
			} else {
				return 0;
			}
			return 0;
		};
		$scope.updateTotalPrices = function () {
			
			var materialTotal = 0;
			var materialTax = 0;
			var laborEquipmentTotal = 0;
			var laborEquipmentTax = 0;
			var freightTax = 0;
			var totalTax = 0;
			var freight = 0;
			var grandTotal = 0;

			if ($scope.ticket.freight) {
				freight = $scope.ticket.freight;
				freightTax = returnTaxFromAmountAndTaxCategory(freight, $scope.ticket.taxCategoryId);
				totalTax += freightTax;
			} else {
				freight = 0;
			}
			
			// iterate through all ticket items
			_.each($scope.ticket.ticketItems, function (item) {
				debugger;
				var subtotal = Number(item.qtyUnits) * parseFloat(item.pricePerUnit);

				if (item.productTypeId === 1 || item.productTypeId === 1006) {
					var laborEquipmentSubTax = returnTax(item, $scope.ticket.taxCategoryId);
					laborEquipmentTax += laborEquipmentSubTax;
					laborEquipmentTotal += subtotal;
					totalTax += laborEquipmentSubTax;
				} else if (item.productTypeId === 1005) {
					debugger;
					var materialSubTax = returnTax(item, $scope.ticket.taxCategoryId);
					materialTax += materialSubTax;
					materialTotal += subtotal;
					totalTax += materialSubTax;
				}
			});
			debugger;
			grandTotal = parseFloat(freight) + parseFloat(materialTotal) + parseFloat(laborEquipmentTotal) + parseFloat(totalTax);

			$scope.ticket.totalSection.materialSubTotal = materialTotal;
			$scope.ticket.totalSection.laborAndEquipmentSubTotal = laborEquipmentTotal;
			$scope.ticket.freight = freight;
			$scope.ticket.totalSection.totalTaxes = totalTax;
			$scope.ticket.totalSection.grandTotal = grandTotal;
		}

		$scope.productTypes = [];
		$scope.getProductTypes = function() {
			var url = helper.baseUrl + 'public/productView/GetProductTypes';
			$http.get(url).success(function(productTypes) {
				$scope.productTypes = productTypes;
			}).error(function(error, err) {
				
			});
		}

		$scope.updateTicketOfficeId = function (obj) {
			debugger;
			var office = obj.originalObject;
			$scope.ticket.officeId = office.officeId;
			$scope.updateCustomerInfo();
		}

		$scope.updateATicket = function () {
			debugger;
			Alert.showLoading();
			var postObject = {
				Token: GlobalUser.getToken()
			};
			$scope.ticket.postObject = postObject;
			$scope.ticket.ticketItemObjects = $scope.ticket.ticketItems;
			
			$http.post(helper.baseUrl + 'public/TicketView/EditTicketAndReturnTicket', $scope.ticket).success(function (ticket) {
				
				$scope.ticket = {};
				$scope.ticket.ticketItems = [];
				Alert.hideLoading();
				
				// local
				$window.location.href = helper.baseUrl + 'Goodies/Tickets/Generated/ticket-' + ticket.ticketId + '.pdf';
				// server
				//$window.location.href = helper.baseUrl + 'Goodies/Content/Goodies/Tickets/Generated/ticket-' + ticket.ticketId + '.pdf';
				toastr.success('The ticket was updated successfully', 'Success');
			}).error(function (error, err) {
				
				toastr.error('Something went wrong while trying to save', 'Error');
			});
		}

		$scope.createATicket = function () {

			Alert.showLoading();
			var postObject = {
				Token: GlobalUser.getToken()
			};
			$scope.ticket.workTicketNumber = null;
			$scope.ticket.ticketId = null;
			$scope.ticket.postObject = postObject;
			$scope.ticket.userId = $scope.user.userId;
			$scope.ticket.ticketItemObjects = $scope.ticket.ticketItems;
			
			$http.post(helper.baseUrl + 'public/TicketView/CreateTicketAndReturnTicket', $scope.ticket).success(function(ticket) {
				
				$scope.ticket = {};
				$scope.ticket.ticketItems = [];
				Alert.hideLoading();
				
				// local
				$window.location.href = helper.baseUrl + 'Goodies/Tickets/Generated/ticket-' + ticket.ticketId + '.pdf';
				// server
				//$window.location.href = helper.baseUrl + 'Goodies/Content/Goodies/Tickets/Generated/ticket-' + ticket.ticketId + '.pdf';
				toastr.success('The ticket was created successfully', 'Success');
			}).error(function (error, err) {
				
				toastr.error('Something went wrong while trying to save', 'Error');
			});
		};
		$scope.editTicketItem = function(index) {
			$scope.currentTicketItem = $scope.ticket.ticketItems[index];
			$('#createTicketItemModal').modal('show');
		};
		$scope.deleteTicketItem = function (index) {
			$scope.ticket.ticketItems.splice(index, 1);
			$scope.updateTotalPrices();
		}; // create ticket item functions
		$scope.currentTicketItem = {
			ticketId: $scope.ticket.ticketId
		};
		$scope.updatePriceFromCost = function (currentTicketItem) {
			$scope.updateUnitAndPrice(currentTicketItem);
			//$scope.currentTicketItem.pricePerUnit = currentTicketItem.productCost * 1.6;
		}
		$scope.currentMaterialProductId = null;
		$scope.updateCurrentMaterialProduct = function (materialProduct) {
			// if materialProduct is 0, means that this function is being called by a select dropdown, not by the autocomplete functionality.
			debugger;
			if (materialProduct === 0) {
				materialProduct = {
					originalObject: _.find($scope.materialProducts, function (p) {
						debugger;
						return p.productId === $scope.currentMaterialProductId;
					})
				};
				debugger;
			}
			debugger;
			//$scope.currentTicketItem = materialProduct.originalObject;
			$scope.currentTicketItem.productId = materialProduct.originalObject.productId;
			$scope.currentTicketItem.productName = materialProduct.originalObject.productName;
			$scope.currentTicketItem.productCost = materialProduct.originalObject.productCost;
			$scope.currentTicketItem.productDescription = materialProduct.originalObject.productDescription;
			$scope.currentTicketItem.ticketItemUnitType = materialProduct.originalObject.ticketItemUnitType;
			$scope.currentTicketItem.qtyUnits = materialProduct.originalObject.qtyUnits;
			$scope.currentTicketItem.pricePerUnit = $scope.currentTicketItem.productCost * 1.6;
			$scope.currentTicketItem.ticketId = $scope.ticket.ticketId;
			
			$scope.currentTicketItem.unitType = _.find($scope.unitTypes, function (type) {
				
				return materialProduct.originalObject.unitTypeId === type.unitTypeId;
			});
			$scope.currentTicketItem.ticketItemUnitType = $scope.currentTicketItem.unitType.unitTypeShortName;
			if (!$scope.currentTicketItem.ticketItemUnitType) {
				$scope.currentTicketItem.ticketItemUnitType = 'E';
			} else if ($scope.currentTicketItem.ticketItemUnitType === 'C') {
				$scope.currentTicketItem.pricePerUnit = parseFloat($scope.currentTicketItem.pricePerUnit) / 100.00;
			} else if ($scope.currentTicketItem.ticketItemUnitType === 'M') {
				$scope.currentTicketItem.pricePerUnit = parseFloat($scope.currentTicketItem.pricePerUnit) / 1000.00;
			}

		}
		$scope.openAddTicketItemModal = function (productTypeId) {
			$scope.showMaterialDropdown = false;
			$scope.showEquipmentDropdown = false;

			$('#employeeListAutoComplete_value').val('');
			
			$scope.currentTicketItem = {};
			$scope.currentTicketItem.productTypeId = productTypeId;
			
			$scope.productTypeForAddTicketItemModal = _.find($scope.productTypes, function(type) {
				return type.productTypeId === productTypeId;
			}).productTypeName;
			$scope.currentEmployee = {};
			$scope.searchStr = null;
			$('#createTicketItemModal').modal('show');
		};
		$scope.openAddEmployeeTimeModal = function () {
			
			$('#employeeListAutoComplete_value').val('');
			$scope.currentEmployee = {};
			$scope.currentTicketItem = {};
			$scope.currentTicketItem.ticketItemUnitType = 'hr';
			$scope.currentTicketItem.productTypeId = 1006;
			$('#createEmployeeTimeModal').modal('show');
		}
		$scope.addNewTicketItem = function () {
			
			if (typeof $scope.currentEmployee !== 'undefined') {
				if ($scope.currentEmployee) {
					if ($scope.currentEmployee.originalObject) {
						$scope.currentTicketItem.ticketItemDescription = $scope.currentEmployee.originalObject.userFirstName + ' ' + $scope.currentEmployee.originalObject.userLastName + ' labor charge';
						$scope.currentTicketItem.userId = $scope.currentEmployee.originalObject.userId;
					}
				}
			}
			//// convert Per 1000 to Per Each
			//if ($scope.currentTicketItem.ticketItemUnitType === 'M') {
			//	// pricePerUnit = pricePerUnit / 1000
			//	var newQtyM = 1000 * $scope.currentTicketItem.qtyUnits;
			//	var newPricePerUnitM = ($scope.currentTicketItem.pricePerUnit * $scope.currentTicketItem.qtyUnits) / newQtyM;
				
			//	$scope.currentTicketItem.pricePerUnit = newPricePerUnitM;
			//	$scope.currentTicketItem.qtyUnits = newQtyM;
			//	$scope.currentTicketItem.ticketItemUnitType = 'E';
			//}
			//// convert Per 100 to Per Each
			//if ($scope.currentTicketItem.ticketItemUnitType === 'C') {
			//	// pricePerUnit = pricePerUnit / 100
			//	var newQtyC = 100 * $scope.currentTicketItem.qtyUnits;
			//	var newPricePerUnitC = ($scope.currentTicketItem.pricePerUnit * $scope.currentTicketItem.qtyUnits) / newQtyC;
				
			//	$scope.currentTicketItem.pricePerUnit = newPricePerUnitC;
			//	$scope.currentTicketItem.qtyUnits = newQtyC;
			//	$scope.currentTicketItem.ticketItemUnitType = 'E';
			//}
			$scope.ticket.ticketItems.push($scope.currentTicketItem);
			$scope.updateTotalPrices();
			$scope.currentTicketItem = {};
			$scope.currentEmployee = {};
			$('#createTicketItemModal').modal('hide');
			$('#createEmployeeTimeModal').modal('hide');
		};
		$scope.isUsingProductType = function (productTypeId) {
			return $scope.currentTicketItem.productTypeId === productTypeId;
		}

		$scope.editTicket = function (ticket) {
			
			var ticketId = ticket.ticketId;
			// initialize current ticket and go to ticket edit page
			helper.currentTicketId = ticketId;
			$location.path('edit-ticket');
		}

		$scope.initiateEditTicket = function () {
			
			if (helper.currentTicketId) {
				var url = helper.baseUrl + 'public/TicketView/GetTicket';
				var data = {
					'ticketId': helper.currentTicketId
				};
				$http.post(url, data).success(function (ticket) {
					
					
					_.each(ticket.ticketItems, function (item) {
						item.pricePerUnit = item.ticketItemRate;
						item.productDescription = item.ticketItemDescription;
					});

					var tempTickets = _.reject(ticket.ticketItems, function(item) {
						return parseInt(item.productTypeId) === 1008;
					});

					ticket.ticketItems = tempTickets;

					ticket.totalSection = {
						materialSubTotal: '0.00',
						laborAndEquipmentSubTotal: '0.00',
						totalTaxes: '0.00',
						grandTotal: '0.00'
					}

					$scope.ticket = ticket;
					helper.currentTicketId = null;
					$scope.updateTotalPrices();
				}).error(function(error, err) {

				});
			}
		}

		$scope.unitTypes = [];
		$scope.getUnitTypes = function() {
			var url = helper.baseUrl + 'public/ProductView/GetUnitTypes';
			$http.get(url).success(function(unitTypes) {
				$scope.unitTypes = unitTypes;
			}).error(function() {
				
			});
		}

		$scope.user = {};
		$scope.getUser = function() {
			var user = JSON.parse(localStorage.getItem('user'));
			if (user) {
				$scope.user.userId = user.userId;
				$scope.user.userFirstName = user.userFirstName;
				$scope.user.userLastName = user.userFirstName;
			}
		};

		$scope.taxCategory = {};
		$scope.taxCategories = [];
		$scope.getTaxCategories = function() {
			var url = helper.baseUrl + 'public/TicketView/GetTaxCategories';
			$http.get(url).success(function(taxCategories) {
				$scope.taxCategories = taxCategories;
				
			}).error(function() {
				
			});
		}

		$scope.currentEmployee = {};

		$scope.updateEmployeeTicketItem = function(employee) {
			var emp = employee.originalObject;
			$scope.currentTicketItem.productName = emp.userFirstName + ' ' + emp.userLastName + ' labor';
			$scope.currentTicketItem.pricePerUnit = emp.costNormalTime;
			$scope.currentTicketItem.productDescription = emp.userFirstName + ' ' + emp.userLastName + ' labor';
			$scope.currentTicketItem.ticketItemUnitType = 'hr';
			$scope.currentTicketItem.ticketId = $scope.ticket.ticketId;
			$scope.currentTicketItem.userId = emp.userId;
		}

		// Employees
		$scope.employeeList = [];
		$scope.getEmployeeList = function () {
			
			$http.post(helper.baseUrl + 'TicketView/GetEmployeeList').success(function (employees) {
				
				$scope.employeeList = employees;
			}).error(function(error, err) {

			});
		}

		// Get Customers for customer dropdown
		$scope.customers = [];
		$scope.getCustomersAndOffices = function() {
			$http.get(helper.baseUrl + 'public/CustomerView/GetCustomers').success(function(customers) {
				$scope.customers = [];
				$http.get(helper.baseUrl + 'public/CustomerView/GetAllOffices').success(function(offices) {
					_.each(customers, function(customer) {
						var officesForThisCustomer = _.filter(offices, function(office) {
							return office.customerId === customer.customerId;
						});
						customer.offices = officesForThisCustomer;
						$scope.customers.push(customer);
					});
				}).error(function(error, err) {

				}); 
				//_.each(customers, function (customer) {
				//	debugger;
				//	customer.offices = [];
				//	customer.offices = $scope.getOffices(customer.customerId);
				//	debugger;
				//	$scope.customers.push(customer);
				//});
			}).error(function(error, err) {

			});
		}; // Get offices for customer dropdown
		$scope.offices = [];
		$scope.getOffices = function() {
			$http.get(helper.baseUrl + 'public/CustomerView/GetAllOffices').success(function(offices) {
				$scope.offices = [];
				$http.get(helper.baseUrl + 'public/CustomerView/GetCustomers').success(function(customers) {
					_.each(offices, function(office) {
						var customerForThisOffice = _.find(customers, function(customer) {
							return office.customerId === customer.customerId;
						});
						office.customer = customerForThisOffice;
						$scope.offices.push(office);
					});
				}).error(function(error, err) {

				});
			}).error(function(error, err) {

			});
		};

		$scope.products = [];
		$scope.materialProducts = [];
		$scope.equipmentProducts = [];
		$scope.getEquipmentProducts = function () {
			
			var url = helper.baseUrl + 'public/ProductView/GetProductsByType/' + helper.enums.productTypes.Equipment;
			$http.get(url).success(function (data) {
				
				$scope.equipmentProducts = data;
			}).error(function() {
				
			});
		}
		$scope.getMaterialProducts = function () {
			
			var url = helper.baseUrl + 'public/ProductView/GetProductsByType/' + helper.enums.productTypes.Item;
			$http.get(url).success(function (data) {
				
				$scope.materialProducts = data;
			}).error(function () {
				
			});
		}

		// update customer information after clicking a customer in dropdown list
		$scope.updateCustomerInfo = function() {
			
			var office = _.find($scope.offices, function(thisOffice) {
				
				return thisOffice.officeId === parseInt($scope.ticket.officeId);
			});

			

			if (office) {
				$scope.ticket.customerName = office.customer.customerName;
				$scope.ticket.customerPhone = office.officePhonePrimary;
				$scope.ticket.customerAddress1 = office.officeAddress1;
				$scope.ticket.customerAddress2 = office.officeAddress2;
				$scope.ticket.customerCity = office.officeCity;
				$scope.ticket.customerState = office.officeState;
				$scope.ticket.customerZip = office.officeZip;
			}
		};

		$scope.openDialogSpellCheckerForTicketDescription = function() {
			$('#ticketDescription').spellCheckInDialog();
		}

		$scope.showMaterialDropdown = false;
		$scope.showEquipmentDropdown = false;
		$scope.showMaterialDropdownButton = function() {
			$scope.showMaterialDropdown = true;
		}
		$scope.showEquipmentDropdownButton = function () {
			$scope.showEquipmentDropdown = true;
		}

		$scope.openCreateTicketItemModal = function (productType) {
			$scope.showMaterialDropdown = false;
			$scope.showEquipmentDropdown = false;
			if (productType === 'material') {
				// have ticket item be taxed for material item
			} else if (productType === 'equipment') {
				// have ticket item be taxed for equipment item
			}
			var modalInstance = $modal.open({
				templateUrl: '/ajs-modals/myModalContent.html',
				controller: 'CreateTicketItemModalController',
				size: size,
				resolve: {
					items: function () {
						return $scope.items;
					}
				}
			});

			modalInstance.result.then(function (selectedItem) {
				$scope.selected = selectedItem;
			}, function () {
				$log.info('Modal dismissed at: ' + new Date());
			});
		};

		function init() {
			$scope.initiateEditTicket();
			$scope.getCustomersAndOffices();
			$scope.getOffices();
			$scope.getEmployeeList();
			$scope.getUser();
			$scope.getMaterialProducts();
			$scope.getEquipmentProducts();
			$scope.getTaxCategories();
			$scope.getProductTypes();
			$scope.getUnitTypes();
		};

		init();
	}
]);

app.controller('ModalInstanceCtrl', function ($scope, $modalInstance, items) {

	$scope.items = items;
	$scope.selected = {
		item: $scope.items[0]
	};

	$scope.ok = function () {
		$modalInstance.close($scope.selected.item);
	};

	$scope.cancel = function () {
		$modalInstance.dismiss('cancel');
	};
});

app.directive('create-ticket-item-modal', function () {
	return {
		link: function postLink(scope, element, attrs) {
			scope.title = attrs.title;

			scope.$watch(attrs.visible, function (value) {
				if (value == true)
					$(element).modal('show');
				else
					$(element).modal('hide');
			});

			$(element).on('shown.bs.modal', function () {
				scope.$apply(function () {
					scope.$parent[attrs.visible] = true;
				});
			});

			$(element).on('hidden.bs.modal', function () {
				scope.$apply(function () {
					scope.$parent[attrs.visible] = false;
				});
			});
		}
	}
});