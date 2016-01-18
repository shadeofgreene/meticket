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
            $('#loadingModal').modal('show');
            debugger;

            var userLoggedIn = $scope.currentUserLoggedIn;

            $scope.syncCollection(userLoggedIn, 'Office', function () {
                $scope.syncCollection(userLoggedIn, 'Customer', function () {
                    $scope.syncCollection(userLoggedIn, 'Product', function () {
                        $scope.syncCollection(userLoggedIn, 'ProductType', function () {
                            $scope.syncCollection(userLoggedIn, 'UnitType', function () {
                                $scope.syncCollection(userLoggedIn, 'User', function () {
                                    $scope.syncCollection(userLoggedIn, 'TaxCategory');
                                });
                            });
                        });
                    });
                });
            });
        }
    };

    $scope.syncCollection = function (user, collectionName, callback, isEnd) {
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
        }).finally(function () {
            debugger;
            if(callback) {
                callback();
            } else {
                $('#loadingModal').modal('hide');
            }
        });
    }
}])