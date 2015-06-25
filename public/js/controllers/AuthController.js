app.controller('AuthController', [
	'$scope',
	'$state',
	'auth',
	function($scope, $state, auth) {
		$scope.user = {};

		$scope.login = function() {
			auth.login($scope.user)
			.error(function(err) {
				$scope.error = err.message;
			}).then(function() {
				$state.go('home');
			});
		};
	}
]);