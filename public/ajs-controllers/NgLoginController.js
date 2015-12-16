app.controller('NgLoginController', ['$scope', '$http', '$location', 'Auth', function ($scope, $http, $location, Auth) {
	$scope.user = {
		username: null,
		password: null,
		token: null,
		firstName: null,
		lastName: null
	};

	$scope.isLoggedIn = function() {
		var user = Auth.isLoggedIn();
		if (user) {
			return true;
		}
		return false;
	}

	$scope.addCustomer = function() {
		$scope.customers.push({
			name: $scope.newCustomer.name,
			city: $scope.newCustomer.city
		});
	};

	$scope.tryLogin = function () {
		$('#loadingModal').modal('show');
		debugger;
		var username = $scope.loginUsername;
		var password = $scope.loginPassword;

		var data = {
			'username': username,
			'password': password
		}
		debugger;
		$http.post('/TryLoginAndGetUser', data).success(function(user) {
			debugger;
			Auth.setUser(user);
			$location.path('/home');

		}).error(function(err, error) {
			debugger;
		});

		setTimeout(function () {
			$('#loadingModal').modal('hide');
		}, 2000);

		debugger;

		//$.ajax({
		//	url: helper.baseUrl + 'TicketSystem/LoginView/TryLoginAndGetUser',
		//	contentType: 'application/json',
		//	type: 'POST',
		//	data: JSON.stringify(data)
		//}).done(function (user) {
		//	debugger;
		//	Auth.setUser(user);
		//	localStorage.setItem('user', JSON.stringify(user));
		//}).fail(function(error, err) {
		//	debugger;
		//});
		//setTimeout(function() {
		//	$('#loadingModal').modal('hide');
		//}, 2000);
	};
}]);