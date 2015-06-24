app.controller('TenantController', [
	'$scope',
	'$state',
	'auth',
	'tenants',
	function($scope, $state, auth, tenants) {
		$scope.user = auth.currentUser();

		$scope.editTenant = function() {
			console.log("Getting it");
			// make sure all fields are filled out
			if (!$scope.user.name_first || $scope.user.name_first === '' ||
				!$scope.user.name_last || $scope.user.name_last === '' ||
				!$scope.user.email || $scope.user.email === '' ||
				!$scope.user.password || $scope.user.password === '' ||
				!$scope.user.password2 || $scope.user.password2 === '') {
					$scope.error = "Please fill out all fields";
					return;
			}

			// make sure passwords match
			if ($scope.user.password !== $scope.user.password2) {
				$scope.error = "Passwords don't match.";
				return;
			}

			tenants.save($scope.user);
			$state.go('newAccount');
		}
	}
]);