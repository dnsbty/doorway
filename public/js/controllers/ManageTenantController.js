app.controller('ManageTenantController', [
	'$scope',
	'$state',
	'tenants',
	'tenant',
	'auth',
	function($scope, $state, tenants, tenant, auth) {
		$scope.user = auth.currentUser();
		$scope.tenant = tenant;
	}
]);
