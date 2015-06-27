app.controller('ManagerController', [
	'$scope',
	'$state',
	'auth',
	'owners',
	function($scope, $state, auth, owners) {
		$scope.user = auth.currentUser();
	}
]);