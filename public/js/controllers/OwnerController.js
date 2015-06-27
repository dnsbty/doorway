app.controller('OwnerController', [
	'$scope',
	'$state',
	'auth',
	'owner',
	function($scope, $state, auth, owner) {
		$scope.user = auth.currentUser();
		$scope.owner = owner;
	}
]);