app.controller('AuthController', [
	'$scope',
	'$rootScope',
	'$state',
	'$stateParams',
	'auth',
	function($scope, $rootScope, $state, $stateParams, auth) {
		$scope.user = {};

		$scope.login = function() {
			auth.login($scope.user)
			.error(function(err) {
				$scope.error = err.message;
			}).then(function() {
				// Logged in, redirect to correct URL
				if ( $stateParams.toState ) {
					$state.go($stateParams.toState, $stateParams.toParams);
				} else if( $rootScope.returnToState ) {
					$state.go($rootScope.returnToState, $rootScope.returnToStateParams);
				} else {
					// redirect all others after login to dashboard
					$state.go('dashboard');
				}
			});
		};
	}
]);