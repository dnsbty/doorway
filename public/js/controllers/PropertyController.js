app.controller('PropertyController', [
	'$scope',
	'$state',
	'$stateParams',
	'auth',
	'properties',
	'property',
	'owners',
	function($scope, $state, $stateParams, auth, properties, property, owners) {
		$scope.user = auth.currentUser();
		$scope.property = property;
		if ($stateParams.owner)
			$scope.property.owner = $stateParams.owner;
		$scope.properties = properties.properties;
		$scope.owners = owners.owners;

		$scope.newProperty = function() {
			$scope.error = null;
			properties.create(property).success(function(property) {
				$state.go('properties.detail', { id: property._id });
			}).error(function(err) {
				$scope.error = err.message;
			});
		};
	}
]);