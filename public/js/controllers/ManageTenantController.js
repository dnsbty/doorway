app.controller('ManageTenantController', [
	'$scope',
	'$state',
	'tenants',
	'tenant',
	'auth',
	function($scope, $state, tenants, tenant, auth) {
		$scope.user = auth.currentUser();
		$scope.tenant = tenant;
		$scope.$parent.setBack({
			title: "Property",
			link: "app.properties.detail",
			linkParams: { id: $scope.tenant.property }
		});

		$scope.lockTenant = function() {
			$scope.tenant.locked = true;
			tenants.toggleLock($scope.tenant._id, true);
		};
		$scope.unlockTenant = function() {
			$scope.tenant.locked = false;
			tenants.toggleLock($scope.tenant._id, false);
		};
	}
]);
