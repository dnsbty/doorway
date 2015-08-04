app.controller('ManagerController', [
	'$scope',
	'$state',
	'$stateParams',
	'auth',
	'owners',
	'properties',
	'tenants',
	function($scope, $state, $stateParams, auth, owners, properties, tenants) {
		$scope.user = auth.currentUser();
		$scope.owners = owners.owners;
		$scope.properties = properties.properties;
		if ($stateParams.property)
		{
			$scope.tenant = {};
			$scope.tenant.property = $stateParams.property;
		}

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