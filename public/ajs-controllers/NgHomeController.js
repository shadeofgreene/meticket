app.controller('NgHomeController', [
	'$scope', 'Auth', '$location', function ($scope, Auth, $location) {

		//$scope.$watch(Auth.isLoggedIn, function (value, oldValue) {

		//	if (!value && oldValue) {
		//		console.log("Disconnect");
		//		$location.path('/login');
		//	}

		//	if (value) {
		//		console.log("Connect");
		//		//Do something when the user is connected
		//	}

		//}, true);
	}
]);