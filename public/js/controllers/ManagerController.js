app.controller('ManagerController', [
	'$scope',
	'$state',
	'$stateParams',
	'auth',
	'owners',
	'properties',
	'tenants',
	'requests',
	function($scope, $state, $stateParams, auth, owners, properties, tenants, requests) {
		switch ($state.current.name)
		{
			case "app.newOwner":
				$scope.$parent.setBack({
					title: "Owners",
					link: "app.owners"
				});
				break;
			case "app.tenants.new":
				$scope.$parent.setBack({
					title: "Property",
					link: "app.properties.detail",
					linkParams: { id: $stateParams.property }
				});
				break;
			default:
				$scope.$parent.setBack({
					title: "Home",
					link: "app.dashboard"
				});
				break;
		}
		$scope.user = auth.currentUser();
		$scope.owners = owners.owners;
		$scope.properties = properties.properties;
		if ($stateParams.property)
		{
			$scope.tenant = {};
			$scope.tenant.property = $stateParams.property;
		}
		$scope.requests = requests.requests;

		$scope.newOwner = function() {
			owners.create({ name: $scope.owner.name }).success(function(owner) {
				$scope.owners.push(owner);
				$state.go('app.ownerDetails', { id: owner._id });
			});
		};

		$scope.newTenant = function() {
			$scope.error = '';
			tenants.create($scope.tenant).success(function(tenant) {
				$state.go('app.properties.detail', { id: $scope.tenant.property });
			}).error(function(err) {
				$scope.error = err.message;
			});
		};
	}
]);