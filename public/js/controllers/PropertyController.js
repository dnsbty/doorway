app.controller('PropertyController', [
	'$scope',
	'$state',
	'auth',
	'properties',
	'property',
	function($scope, $state, auth, properties, property) {
		$scope.user = auth.currentUser();
		$scope.property = property;
	}
]);