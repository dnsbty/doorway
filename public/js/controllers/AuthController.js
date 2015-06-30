app.controller('AuthController', [
	'$scope',
	'$rootScope',
	'$state',
	'auth',
	function($scope, $rootScope, $state, auth) {
		$scope.user = {};

		$scope.login = function() {
			auth.login($scope.user)
			.error(function(err) {
				$scope.error = err.message;
			}).then(function() {
				// Logged in, redirect to correct URL
				if( $rootScope.returnToState ) {
					$state.go($rootScope.returnToState, $rootScope.returnToStateParams);
				} else {
					// redirect all others after login to dashboard
					$state.go('dashboard');
				}
			});
		};
	}
]);