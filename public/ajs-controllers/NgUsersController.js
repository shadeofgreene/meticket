app.controller('NgUsersController', [
	'$scope', '$location', '$http', function ($scope, $location, $http) {
		debugger;

		$scope.addUser = {
			userFirstName: null,
			userLastName: null,
			userPhoneNumber: null,
			userEmail: null,
			costNormalTime: null,
			costOvertime: null,
			userPassword: null,
			userToken: null,
			isSystemUser: null
		}

		$scope.addNewUser = function () {
			debugger;
			$('#loadingModal').modal('show');
			$scope.addUser = $('#systemUserSwitch').is(':checked');
			$http.post(helper.baseUrl + 'TicketSystem/UserView/AddNewUser', JSON.stringify($scope.addNewUser)).success(function (data) {
				debugger;

				$('#loadingModal').modal('hide');
				$('#successModal').modal('show');
				setTimeout(function () {
					$('#successModal').modal('hide');
				}, 3000);
				$location.path('/add-user');
			}).error(function (err, error) {
				debugger;
				$('#loadingModal').modal('show');
				$('#failModal').modal('show');
				setTimeout(function () {
					$('#failModal').modal('hide');
				}, 3000);
			});
		}
	}
]);