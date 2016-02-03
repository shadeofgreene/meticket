var app = angular.module('app', ['ngRoute', 'ui.bootstrap', 'angucomplete-alt', 'swd.inspector-gadget']);
debugger;
app.config(function ($routeProvider) {
	$routeProvider.when('/home', {
		controller: 'NgHomeController',
		templateUrl: '/ajs-partials/home.html'
	}).when('/', {
		controller: 'NgLoginController',
		templateUrl: '/ajs-partials/login.html'
	}).when('/login', {
		controller: 'NgLoginController',
		templateUrl: '/ajs-partials/login.html'
	}).when('/admin/users', {
		controller: 'NgUserController',
		templateUrl: '/ajs-partials/admin-users.html'
	}).when('/add-user', {
		controller: 'NgUserController',
		templateUrl: '/ajs-partials/add-user.html'
	}).when('/user-list', {
		controller: 'NgUserController',
		templateUrl: '/ajs-partials/user-list.html'
	}).when('/customer-list', {
		controller: 'NgCustomerController',
		templateUrl: '/ajs-partials/customers/customer-list.html'
	}).when('/add-customer', {
		controller: 'NgCustomerController',
		templateUrl: '/ajs-partials/customers/add-customer.html'
	}).when('/add-customer-office', {
		controller: 'NgCustomerController',
		templateUrl: '/ajs-partials/customers/add-customer-office.html'
	}).when('/add-product', {
		controller: 'NgProductController',
		templateUrl: '/ajs-partials/products/add-product.html'
	}).when('/product-list', {
		controller: 'NgProductController',
		templateUrl: '/ajs-partials/products/product-list.html'
	}).when('/edit-product', {
		controller: 'NgProductController',
		templateUrl: '/ajs-partials/products/edit-product.html'
	}).when('/product-types', {
		controller: 'NgProductController',
		templateUrl: '/ajs-partials/products/product-types.html'
	}).when('/unit-types', {
		controller: 'NgProductController',
		templateUrl: '/ajs-partials/products/unit-types.html'
	}).when('/add-product-type', {
		controller: 'NgProductController',
		templateUrl: '/ajs-partials/products/add-product-type.html'
	}).when('/add-unit-type', {
		controller: 'NgProductController',
		templateUrl: '/ajs-partials/products/add-unit-type.html'
	}).when('/create-ticket', {
		controller: 'NgTicketController',
		templateUrl: '/ajs-partials/tickets/create-ticket.html'
	}).when('/add-ticket-item', {
		controller: 'NgTicketController',
		templateUrl: '/ajs-partials/tickets/add-ticket-item.html'
	}).when('/ticket-list', {
		controller: 'NgTicketController',
		templateUrl: '/ajs-partials/tickets/ticket-list.html'
	}).when('/edit-ticket', {
		controller: 'NgTicketController',
		templateUrl: '/ajs-partials/tickets/edit-ticket.html'
	}).otherwise({
		redirectTo: '/'
	});
});

app.run(['$rootScope', '$location', 'Auth', function ($rootScope, $location, Auth) {
	$rootScope.$on('$routeChangeStart', function (event) {
		var user = Auth.isLoggedIn();
		debugger;
		if (!user) {
			
			console.log('DENY');
			event.preventDefault();
			$location.path('/login');
		}
		else {
			console.log('ALLOW');
			
			$('#userName').html(user.userFirstName + ' ' + user.userLastName);
			//$location.path($location.$$url);

			helper.changeActiveMenuTo($location.$$url);

			//$location.path('/home');
		}
	});

//	$rootScope.logout = function () {
//		
//		localStorage.clear();
//		$location.path('/login');
//	}
}]);

app.factory('Auth', function ($rootScope, $location) {
	
//	var user = null;
//	var localUser = localStorage.getItem('user');
//	if (localUser) {
//		user = JSON.parse(localStorage.getItem('user'));
//	}

	return {
		currentUser: {},
		setUser: function (aUser) {
			debugger;
			//user = aUser[0];
			this.currentUser = aUser;
			localStorage.setItem('user', JSON.stringify(aUser));
			$rootScope.$broadcast('currentUserUpdated');
		},
		isLoggedIn: function () {
			debugger;
			if(this.currentUser.userId) {
				//this.currentUser = user;
				$rootScope.$broadcast('currentUserUpdated');
				return this.currentUser;
			} else if(localStorage.getItem('user')) {
				var localUser = JSON.parse(localStorage.getItem('user'));
				if(localUser.userId) {
					this.currentUser = localUser;
					$rootScope.$broadcast('currentUserUpdated');
					return this.currentUser;
				}

			} else {
				this.currentUser = {};
				$rootScope.$broadcast('currentUserUpdated');
				return false;
			}
		},
		removeUser: function() {
			debugger;
			this.currentUser = {};
			localStorage.removeItem('user');
			
			$rootScope.$broadcast('currentUserUpdated');
			$location.path('/login');
		}
	}
});

app.factory('GlobalUser', function() {
	var user = JSON.parse(localStorage.getItem('user'));
	if (!user) {
		$location.path('/login');
	}
	return {
		getToken: function () {
			
			return user.userToken;
		}
	}
});

app.factory('Alert', function() {
	return {
		error: function (errorMessage, messageDuration) {
			var preMessage = '<i class="fa fa-thumbs-down"></i>';
			if (!errorMessage) {
				errorMessage = 'Failed to save';
			}
			if (!messageDuration) {
				messageDuration = 3000;
			}
			$('#showFailMessage').html(preMessage + ' ' + errorMessage);
			$('#failModal').modal('show');
			setTimeout(function() {
				$('#failModal').modal('hide');
			}, messageDuration);
		},
		success: function (successMessage, messageDuration) {
			var preMessage = '<i class="fa fa-thumbs-up"></i>';
			if (!successMessage) {
				successMessage = 'Saved successfully!';
			}
			if (!messageDuration) {
				messageDuration = 3000;
			}
			$('#showSuccessMessage').html(preMessage + ' ' + successMessage);
			$('#successModal').modal('show');
			setTimeout(function () {
				$('#successModal').modal('hide');
			}, messageDuration);
		},
		info: function (infoMessage, messageDuration) {
			if (!infoMessage) {
				infoMessage = 'Information';
			}
			if (!messageDuration) {
				messageDuration = 5000;
			}
			$('#showInfoMessage').html(infoMessage);
			$('#infoModal').modal('show');
			setTimeout(function () {
				$('#infoModal').modal('hide');
			}, messageDuration);
		},
		showLoading: function (loadingMessage) {
			var preMessage = '<i class="fa-spin fa-spinner"></i>';
			if (!loadingMessage) {
				loadingMessage = 'Loading...';
			}
			$('#showLoadingMessage').html(preMessage + ' ' + loadingMessage);
			$('#loadingModal').modal('show');
		},
		hideLoading: function () {
			$('#loadingModal').modal('hide');
		}
	}
});

function GlobalHelpers() {
	
	this.baseUrl = 'http://localhost:3000/';

	this.currentTicketId = null;

	this.workingWith = {
		NgCustomerController: {
			customerName: null,
			customerId: null
		}
	}

	this.enums = {
		productTypes: {
			'Equipment': 1,
			'Rental': 2,
			'Service': 3,
			'Item': 1005,
			'IndividualLabor': 1006,
			'CrewLabor': 1007,
			'Freight': 1008
		}
	};

	this.changeActiveMenuTo = function(url) {
		// remove all active except for one clicked
		//$('#nav-accordion > li a').each(function () {
		//	var src = $(this).attr('href');
		//	var newUrl = '#' + url;

		//	if ($(this).next()) {
		//		if (src === newUrl) {
		//			$(this).addClass('active');
		//		} else {
		//			$(this).removeClass('active');
		//		}
		//	} else {
		//		debugger;
				
		//		if (src === newUrl) {
		//			$(this).addClass('active');
		//			$(this).parent().parent().prev().addClass('active');
		//		} else {
		//			$(this).removeClass('active');
		//			$(this).parent().parent().prev().removeClass('active');
		//		}
		//	}
			
		//});

	};

	this.getCustomers = function () {
		$.ajax({
			url: helper.baseUrl + 'TicketSystem/CustomerView/GetCustomers',
			type: 'GET',
			contentType: 'application/json',
			dataType: 'json'
		}).done(function (customers) {

			localStorage.setItem('customers', JSON.stringify(customers));
		}).fail(function(err, error) {

		});
	}

	this.getOffices = function () {

		$.ajax({
			url: helper.baseUrl + 'TicketSystem/CustomerView/GetAllOffices',
			type: 'GET',
			contentType: 'application/json',
			dataType: 'json'
		}).done(function (offices) {

			localStorage.setItem('offices', JSON.stringify(offices));
		}).fail(function (err, error) {

		});
	}

	this.updateProductObject = {}
}

var helper = new GlobalHelpers();
debugger;
helper.getCustomers();
helper.getOffices();