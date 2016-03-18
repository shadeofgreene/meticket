app.controller('NgGlobalController', ['$scope', '$http', '$location', 'Auth', function ($scope, $http, $location, Auth) {
    $scope.currentUserLoggedIn = Auth.currentUser;

    $scope.$on('currentUserUpdated', function () {
        $scope.currentUserLoggedIn = Auth.currentUser;
        //Auth.setUser($scope.currentUserLoggedIn);
    });

    $scope.logout = function () {
        Auth.removeUser();
    };

    $scope.syncAllData = function () {
        debugger;
        if ($scope.currentUserLoggedIn) {
            //$('#loadingModal').modal('show');
            debugger;

            var userLoggedIn = $scope.currentUserLoggedIn;
            
            $scope.syncCollection(userLoggedIn, 'Office');
            $scope.syncCollection(userLoggedIn, 'Customer');
            $scope.syncCollection(userLoggedIn, 'MaterialProduct');
			$scope.syncCollection(userLoggedIn, 'EquipmentProduct');
            $scope.syncCollection(userLoggedIn, 'ProductType');
            $scope.syncCollection(userLoggedIn, 'UnitType');
            $scope.syncCollection(userLoggedIn, 'User');
            $scope.syncCollection(userLoggedIn, 'TaxCategory');
			$scope.syncCollection(userLoggedIn, 'TicketItem');
			//$scope.syncCollection(userLoggedIn, 'Ticket');
        }
    };

    $scope.syncCollection = function (user, collectionName) {
        debugger;
        var data = {
            'user': user,
            'collection': collectionName
        };
        $http.post('/SyncCollection', data).success(function (data) {
            debugger;
            toastr.success(collectionName + 's have been synced!')
        }).error(function (err, error) {
            debugger;
            if (err.error) {
                toastr.error(err.error);
            }
        });
    }
}])