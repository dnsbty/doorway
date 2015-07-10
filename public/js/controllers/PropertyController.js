app.controller('PropertyController', [
	'$scope',
	'$state',
	'auth',
	'properties',
	'property',
	'owners',
	function($scope, $state, auth, properties, property, owners) {
		$scope.user = auth.currentUser();
		$scope.property = property;
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