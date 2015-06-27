app.controller('ManagerController', [
	'$scope',
	'$state',
	'auth',
	'owners',
	function($scope, $state, auth, owners) {
		$scope.user = auth.currentUser();
		$scope.owners = owners.owners;

		$scope.newOwner = function() {
			owners.create({ name: $scope.owner.name }).success(function(owner) {
				$scope.owners.push(owner);
				$state.go('ownerDetails', { id: owner._id });
			});
		};
	}
]);