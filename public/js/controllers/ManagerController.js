app.controller('ManagerController', [
	'$scope',
	'$state',
	'auth',
	'owners',
	'properties',
	function($scope, $state, auth, owners, properties) {
		$scope.user = auth.currentUser();
		$scope.owners = owners.owners;
		$scope.properties = properties.properties;

		$scope.newOwner = function() {
			owners.create({ name: $scope.owner.name }).success(function(owner) {
				$scope.owners.push(owner);
				$state.go('ownerDetails', { id: owner._id });
			});
		};
	}
]);