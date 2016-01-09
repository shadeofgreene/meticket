app.controller('NgGlobalController', ['$scope', '$http', '$location', 'Auth', function ($scope, $http, $location, Auth) {
	$scope.currentUserLoggedIn = Auth.currentUser;
	
	$scope.$on('currentUserUpdated', function () {
        $scope.currentUserLoggedIn = Auth.currentUser;
		//Auth.setUser($scope.currentUserLoggedIn);
    });
	
	$scope.logout = function() {
		Auth.removeUser();
	};
	
	$scope.syncAllData = function() {
		debugger;
		if($scope.currentUserLoggedIn) {
			$('#loadingModal').modal('show');
			debugger;

			var data = $scope.currentUserLoggedIn;
			debugger;
			$http.post('/SyncAllData', data).success(function(data) {
				debugger;
			}).error(function(err, error) {
				debugger;
				if(err.error) {
					toastr.error(err.error);
				}
			}).finally(function() {
				setTimeout(function () {
					$('#loadingModal').modal('hide');
				}, 3000);
			});
		}
	};
}])