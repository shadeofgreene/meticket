app.controller('NgUserController', [
	'$scope', 'Auth', 'Alert', '$location', '$http', 'GlobalUser', function($scope, Auth, Alert, $location, $http, GlobalUser) {
		debugger;
		//$scope.$watch(Auth.isLoggedIn, function(value, oldValue) {
		//	debugger;
		//	if (!value && oldValue) {
		//		console.log("Disconnect");
		//		$location.path('/login');
		//	}

		//	if (value) {
		//		console.log("Connect");
		//		//Do something when the user is connected
		//	}

		//}, true);

		$scope.addUser = {
			userFirstName: null,
			userLastName: null,
			userPhoneNumber: null,
			userEmail: null,
			costNormalTime: null,
			costOverTime: null,
			userPassword: null,
			userToken: null,
			isSystemUser: null
		}

		$scope.addNewUser = function () {
			if (Auth.isLoggedIn()) {
				debugger;
				Alert.showLoading('Attempting to save user...');
				$scope.addUser.isSystemUser = $('#systemUserSwitch').is(':checked');
				$scope.addUser.costNormalTime = $scope.addUser.costNormalWhole + '.' + $scope.addUser.costNormalDecimal;
				$scope.addUser.costOverTime = $scope.addUser.costOvertimeWhole + '.' + $scope.addUser.costOvertimeDecimal;
				$http.post(helper.baseUrl + 'TicketSystem/UserView/AddNewUser', JSON.stringify($scope.addUser)).success(function (message) {
					debugger;
					Alert.hideLoading();
					if (message === 'Failed to save') {
						Alert.error(message);
					} else if (message === 'User already exists') {
						Alert.success(message);
					} else {
						$location.path('user-list');
						Alert.success(message);
					}
					
				}).error(function (err, error) {
					debugger;
					Alert.hideLoading();
					Alert.error('Failed to save user');
				});
			}
		}

		$scope.users = [];

		$scope.getUsers = function () {
			debugger;
			$http.get(helper.baseUrl + 'TicketSystem/UserView/GetUsers').success(function (users) {
				debugger;
				$scope.users = users;
			}).error(function (err, error) {
				debugger;
				Alert.hideLoading();
				Alert.error('Failed to save user');
			});
		}

		$scope.workingWithUserId = null;
		$scope.workingWithName = null;

		$scope.makeUserInactiveModal = function (userId, name) {
			$scope.workingWithUserId = userId;
			$scope.workingWithName = name;
			$('#confirmMakeUserInactiveModal').modal('show');
		}

		$scope.makeUserInactive = function () {
			$('#confirmMakeUserInactiveModal').modal('hide');
			Alert.showLoading('Loading...');
			debugger;
			var postObject = {
				Token: GlobalUser.getToken(),
				Id: $scope.workingWithUserId
			}
			$http.post(helper.baseUrl + 'TicketSystem/UserView/MakeUserInactive/', JSON.stringify(postObject)).success(function () {
				debugger;
				Alert.hideLoading();
				Alert.success('User has been removed');
				$scope.getUsers();
			}).error(function (err, error) {
				debugger;
				Alert.hideLoading();
			});
		}

		$scope.getUsers();
	}
]);