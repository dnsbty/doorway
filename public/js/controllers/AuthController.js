app.controller('AuthController', [
	'$scope',
	'$rootScope',
	'$state',
	'$stateParams',
	'auth',
	function($scope, $rootScope, $state, $stateParams, auth) {
		$scope.user = {};
		if ($stateParams.id)
			$scope.user._id = $stateParams.id;
		if ($stateParams.token)
			$scope.user.token = $stateParams.token;
		$scope.success = false;
		$scope.passwordType = 'password';

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
					$state.go('app.dashboard');
				}
			});
		};

		$scope.register = function() {
			auth.register($scope.user)
			.error(function(err) {
				$scope.error = err.message;
			}).then(function() {
				$state.go('app.dashboard');
			});
		};

		$scope.resetPassword = function() {
			auth.resetPassword($scope.user)
			.error(function(err) {
				$scope.error = err.message;
			}).then(function() {
				$scope.success = true;
			});
		};

		$scope.savePasswordReset = function() {
			if (!$scope.user.password || !$scope.user.password2)
				return $scope.error = 'Please enter your new password in both fields';
			if ($scope.user.password !== $scope.user.password2)
				return $scope.error = 'Please check both fields to make sure the password matches';

			auth.savePasswordReset($scope.user)
			.error(function(err) {
				$scope.error = err.message;
			}).then(function() {
				$scope.success = true;
			});
		};

		$scope.togglePasswordShow = function () {
			if ($scope.passwordType == 'password')
				$scope.passwordType = 'text';
			else
				$scope.passwordType = 'password';
		};
	}
]);