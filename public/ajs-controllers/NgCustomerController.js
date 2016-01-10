app.controller('NgCustomerController', [
	'$scope', 'Auth', 'Alert', '$location', '$http', 'GlobalUser',
    function ($scope, Auth, Alert, $location, $http, GlobalUser) {
        helper.getOffices();
        $scope.offices = [];

        $scope.initiateoffices = function () {
            var offices = JSON.parse(localStorage.getItem('offices'));
            $scope.offices = offices;
        }

        $scope.addCustomer = {
            customerName: null,
            notes: null
        }

        $scope.displayOfficeModal = function (officeId) {
            var customerOffice = _.find($scope.offices, function (office) {
                debugger;
                return office.officeId == officeId;
            });

            $scope.displayOfficeObject = {
                officeId: customerOffice.officeId,
                officeName: customerOffice.officeName,
                officeAddress1: customerOffice.officeAddress1,
                officeAddress2: customerOffice.officeAddress2,
                officeCity: customerOffice.officeCity,
                officeState: customerOffice.officeState,
                officeZip: customerOffice.officeZip,
                officePhonePrimary: customerOffice.officePhonePrimary,
                officePhoneSecondary: customerOffice.officePhoneSecondary,
                customerId: customerOffice.customerId
            }

            $('#displayOfficeModal').modal('show');
        }

        $scope.displayOfficeFormDisabled = true;
        $scope.toggleEnableDisplayOffice = function () {
            debugger;
            if ($scope.displayOfficeFormDisabled == true) {
                $scope.displayOfficeFormDisabled = false;
            } else {
                $scope.displayOfficeFormDisabled = true;
            }
        }

        $scope.addCustomerOffice = {
            officeName: null,
            officeAddress1: null,
            officeAddress2: null,
            officeCity: null,
            officeState: null,
            officeZip: null,
            officePhonePrimary: null,
            officePhoneSecondary: null,
            customerId: null
        };

        $scope.customers = [];

        // TODO
        $scope.addNewCustomer = function () {

            Alert.showLoading('Loading...');
            $http.post(helper.baseUrl + 'TicketSystem/CustomerView/SaveNewCustomer', JSON.stringify($scope.addCustomer)).success(function (customer) {

                Alert.hideLoading();
                Alert.success('Customer saved successfully');
                // prep the next view (add-customer-office.html)
                helper.workingWith.NgCustomerController.customerName = customer.customerName;
                helper.workingWith.NgCustomerController.customerId = customer.customerId;

                //$scope.workingWith.customerName = customer.customerName;
                //$scope.workingWith.customerId = customer.customerId;
                $location.path('/add-customer-office');
            }).error(function (err, error) {

                Alert.hideLoading();
                Alert.error('Failed to save customer');
            });
        }

        $scope.addOfficeForThisCustomer = function (customerId, customerName) {

            helper.workingWith.NgCustomerController.customerName = customerName;
            helper.workingWith.NgCustomerController.customerId = customerId;
            $location.path('/add-customer-office');
        }

        $scope.updateOffice = function () {
            Alert.showLoading('Loading...');
            $http.post(helper.baseUrl + 'TicketSystem/CustomerView/UpdateOffice', JSON.stringify($scope.displayOfficeObject)).success(function (office) {
                debugger;
                Alert.hideLoading();
                Alert.success('Office was updated successfully');
            }).error(function (err, error) {
                debugger;
                Alert.hideLoading();
                Alert.error('Failed to update office');
            });
        }

        // TODO
        $scope.addNewOffice = function () {

            Alert.showLoading('Loading...');
            $http.post(helper.baseUrl + 'TicketSystem/CustomerView/SaveNewOffice', JSON.stringify($scope.addCustomerOffice)).success(function (office) {

                Alert.hideLoading();
                Alert.success('Office saved successfully');
                // prep the next view "add-customer-office.html"

                helper.workingWith.NgCustomerController.customerName = null;
                helper.workingWith.NgCustomerController.customerId = null;
                //helper.getOffices();
                //helper.getCustomers();
                //$scope.getCustomers();
                //$scope.initiateoffices();
                $location.path('/customer-list');


                //window.href = helper.baseUrl + '/ticketsystem/ticketsystem?#/customer-list';
                //$('#customerListLink').trigger('click');

            }).error(function (err, error) {

                Alert.hideLoading();
                Alert.error('Failed to save office');
            });
        }

        $scope.getOffices = function (customerId) {
            debugger;
            return _.filter($scope.offices, function (office) {
                debugger;
                return office.customerId === customerId;
            });
        }

        $scope.getAllOffices = function () {
            $http.get(helper.baseUrl + 'TicketSystem/CustomerView/GetAllOffices').success(function (offices) {
                $scope.offices = offices;
                $scope.getCustomers();
            }).error(function (error, err) {

            });
        }

        $scope.getCustomers = function (getCustomers) {
            $http.get(helper.baseUrl + 'TicketSystem/CustomerView/GetCustomers').success(function (customers) {
                $scope.offices = JSON.parse(localStorage.getItem('offices'));
                $scope.customers = [];

                _.each(customers, function (customer) {
                    debugger;
                    customer.offices = [];
                    customer.offices = $scope.getOffices(customer.customerId);
                    debugger;
                    $scope.customers.push(customer);
                });
            }).error(function (error, err) {

            });
        }

        $scope.getWorkingCustomerName = function () {
            return helper.workingWith.NgCustomerController.customerName;
        };

        $scope.getWorkingCustomerId = function () {
            $scope.addCustomerOffice.customerId = helper.workingWith.NgCustomerController.customerId;
            return helper.workingWith.NgCustomerController.customerId;
        };

        $scope.makeCustomerInactive = function () {
            debugger;
            $('#confirmMakeCustomerInactiveModal').modal('hide');
            Alert.showLoading('Loading...');
            var postObject = {
                Token: GlobalUser.getToken(),
                Id: $scope.makeCustomerInactiveObject.customerId
            }
            $http.post(helper.baseUrl + 'TicketSystem/CustomerView/MakeCustomerInactive', JSON.stringify(postObject)).success(function () {
                debugger;
                Alert.hideLoading();
                Alert.success('Customer has been removed');
                $scope.getAllOffices();
            }).error(function (error, err) {
                debugger;
                Alert.hideLoading();
            });
        }

        $scope.makeCustomerOfficeInactive = function () {
            debugger;
            $('#confirmMakeCustomerOfficeInactiveModal').modal('hide');
            Alert.showLoading('Loading...');
            var postObject = {
                Token: GlobalUser.getToken(),
                Id: $scope.makeCustomerOfficeInactiveObject.customerId
            }
            $http.post(helper.baseUrl + 'TicketSystem/CustomerView/MakeCustomerOfficeInactive', JSON.stringify(postObject)).success(function () {
                debugger;
                Alert.hideLoading();
                Alert.success('Office has been removed');
                $scope.getAllOffices();
            }).error(function (error, err) {
                debugger;
                Alert.hideLoading();
            });
        }

        $scope.makeCustomerOfficeInactiveObject = {
            customerOfficeId: null,
            customerOfficeName: null
        }

        $scope.makeCustomerInactiveObject = {
            customerId: null,
            customerName: null
        }

        $scope.makeCustomerInactiveModal = function (customerId, customerName) {
            $scope.makeCustomerInactiveObject.customerId = customerId;
            $scope.makeCustomerInactiveObject.customerName = customerName;
            $('#confirmMakeCustomerInactiveModal').modal('show');
        }

        // execute this on view load
        $scope.getAllOffices();
        $scope.getWorkingCustomerId();

        //$scope.initiateoffices();
	}
]);