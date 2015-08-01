app.controller('ApplicationController', [
	'$scope',
	'$state',
	'$stateParams',
	'auth',
	'property',
	'applications',
	'application',
	function($scope, $state, $stateParams, auth, property, applications, application) {
		$scope.user = auth.currentUser();
		$scope.property = property;
		$scope.applications = applications.applications;
		$scope.application = application;
	}
]);