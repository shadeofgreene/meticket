app.controller('NgProductController', [
	'$scope', 'Auth', 'Alert', '$location', '$http', 'GlobalUser', function ($scope, Auth, Alert, $location, $http, GlobalUser) {
		$scope.products = [];
		$scope.getProducts = function() {
			$http.get(helper.baseUrl + 'TicketSystem/ProductView/GetProductObjects').success(function(products) {
				$scope.products = products;
			}).error(function(error, err) {
				
			});
		}

		// New Product
		$scope.newProduct = {}
		$scope.saveNewProduct = function () {
			debugger;
			Alert.showLoading();
			$scope.newProduct.Product.pricePerUnit = $scope.newProduct.Product.pricePerUnitWhole + '.' + $scope.newProduct.Product.pricePerUnitDecimal;
			$http.post(helper.baseUrl + 'TicketSystem/ProductView/SaveNewProduct', JSON.stringify($scope.newProduct)).success(function (newProduct) {
				debugger;
				Alert.hideLoading();
				Alert.success('New product has been created');
				$location.path('/product-list');
			}).error(function(error, err) {
				Alert.hideLoading();
				Alert.error('Failed to add new product');
			});
		}

		//// Update product
		
		//$scope.editProductPage = function (product) {
		//	debugger;
		//	helper.updateProductObject = product;
		//	$location.path('/edit-product');
		//}
		//$scope.updateThisProduct = function () {
		//	debugger;
		//	$('#updateProductModal').modal('hide');
		//	Alert.showLoading();
		//	$scope.updateProduct.Product.pricePerUnit = $scope.updateProduct.Product.pricePerUnitWhole + '.' + $scope.updateProduct.Product.pricePerUnitDecimal;
		//	$http.post(helper.baseUrl + 'TicketSystem/ProductView/UpdateProduct', JSON.stringify($scope.newProduct)).success(function (updatedProduct) {
		//		debugger;
		//		Alert.hideLoading();
		//		Alert.success('Product was updated successfully');
		//		$location.path('/product-list');
		//	}).error(function (error, err) {
		//		Alert.hideLoading();
		//		Alert.error('Failed to update this product');
		//	});
		//}
		//$scope.getPriceItems = function () {
		//	debugger;
		//	var str = $scope.updateProduct.Product.pricePerUnit.toString();
		//	if (str.indexOf('.') !== -1) {
		//		var split = str.split('.');
		//		$scope.updateProduct.Product.pricePerUnitWhole = str[0];
		//		$scope.updateProduct.Product.pricePerUnitDecimal = str[1];
		//	} else {
		//		$scope.updateProduct.Product.pricePerUnitWhole = str;
		//		$scope.updateProduct.Product.pricePerUnitDecimal = '00';
		//	}
		//}
		//$scope.getUpdateProductAndInitiate = function() {
		//	$scope.updateProduct = helper.updateProductObject;
		//	$scope.getPriceItems();
		//}

		$scope.removeProductWorking = {
			productId: null,
			productName: null
		}

		$scope.removeProductModal = function (productId, productName) {
			debugger;
			$scope.removeProductWorking.productId = productId;
			$scope.removeProductWorking.productName = productName;
			$('#removeProductModal').modal('show');
		}
		$scope.removeProduct = function () {
			$('#removeProductModal').modal('hide');
			Alert.showLoading();
			var postObject = {
				Id: $scope.removeProductWorking.productId,
				Token: GlobalUser.getToken()
			};
			$http.post(helper.baseUrl + 'TicketSystem/ProductView/RemoveProduct', JSON.stringify(postObject)).success(function() {
				Alert.hideLoading();
				Alert.success('Product was removed successfully');
				$scope.getProducts();
			}).error(function(error, err) {
				Alert.success('Failed to remove the product');
			});
		}

		// Product Type Section
		$scope.newProductType = {};
		$scope.addNewProductType = function () {
			Alert.showLoading();
			$http.post(helper.baseUrl + 'TicketSystem/ProductView/AddNewProductType', JSON.stringify($scope.newProductType)).success(function (productType) {
				Alert.hideLoading();
				Alert.success('Product Type added successfully');
				$location.path('/product-types');
			}).error(function (error, err) {
				Alert.hideLoading();
				Alert.success('Failed to save product type');
			});
		}
		$scope.removeProductType = function() {
			Alert.showLoading();
			$http.post(helper.baseUrl + 'TicketSystem/ProductView/RemoveProductType', JSON.stringify()).success(function() {
				Alert.hideLoading();
				Alert.success('Product Type has been removed');
				$location.path('/product-types');
			}).error(function() {
				Alert.hideLoading();
				Alert.error('Failed to remove product type');
			});
		}
		$scope.productTypes = {};
		$scope.getProductTypes = function() {
			$http.get(helper.baseUrl + 'TicketSystem/ProductView/GetProductTypes').success(function (productTypes) {
				debugger;
				$scope.productTypes = productTypes;
			}).error(function(error, err) {
				debugger;
			});
		}

		// Unit Type Section
		$scope.newUnitType = {};
		$scope.addNewUnitType = function () {
			Alert.showLoading();
			$http.post(helper.baseUrl + 'TicketSystem/ProductView/AddNewUnitType', JSON.stringify($scope.newUnitType)).success(function (unitType) {
				Alert.hideLoading();
				Alert.success('Unit Type added successfully');
				$location.path('/unit-types');
			}).error(function (error, err) {
				Alert.hideLoading();
				Alert.success('Failed to save unit type');
			});
		}
		$scope.removeUnitType = function () {
			Alert.showLoading();
			$http.post(helper.baseUrl + 'TicketSystem/ProductView/RemoveUnitType', JSON.stringify()).success(function () {
				Alert.hideLoading();
				Alert.success('Unit Type has been removed');
				$location.path('/unit-types');
			}).error(function () {
				Alert.hideLoading();
				Alert.error('Failed to remove unit type');
			});
		}
		$scope.unitTypes = {};
		$scope.getUnitTypes = function () {
			$http.get(helper.baseUrl + 'TicketSystem/ProductView/GetUnitTypes').success(function (unitTypes) {
				debugger;
				$scope.unitTypes = unitTypes;
			}).error(function (error, err) {
				debugger;
			});
		}

		$scope.getProducts();
		$scope.getProductTypes();
		$scope.getUnitTypes();
		//$scope.getUpdateProductAndInitiate();

		
	}
]);