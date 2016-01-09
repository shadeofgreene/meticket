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
			'userEmail': username,
			'userPassword': password
		}
		debugger;
		$http.post('/TryLoginAndGetUser', data).success(function(user) {
			debugger;
			if(user) {
				Auth.setUser(user);
				$location.path('/home');
			} else {
				toastr.error('Invalid credentials');
			}
		}).error(function(err, error) {
			debugger;
			if(err.error) {
				toastr.error(err.error);
			}
		});

		setTimeout(function () {
			$('#loadingModal').modal('hide');
		}, 3000);
	};
}]);