app.controller('ApplicationController', [
	'$scope',
	'$state',
	'$stateParams',
	'auth',
	'applications',
	'application',
	function($scope, $state, $stateParams, auth, applications, application) {
		$scope.user = auth.currentUser();
		$scope.application = application;
		$scope.page = "contact";
	}
]);