app.controller('AccountController', [
	'$scope',
	'$state',
	'auth',
	'accounts',
	'account',
	function($scope, $state, auth, accounts, account) {
		$scope.user = auth.currentUser();
		$scope.account = account;
		$scope.instructions = false;

		$scope.verifyAccount = function() {
			$scope.error = null;
			if (!$scope.amount1 || $scope.amount1 === '' ||
				!$scope.amount2 || $scope.amount2 === '') {
					$scope.error = "Please fill out all fields";
					return;
			}

			accounts.verifyAccount($scope.account._id, $scope.amount1, $scope.amount2).success(function(data) {
				$scope.account = data;
			}).error(function(err) {
				$scope.error = err.message;
			})
		}

		$scope.showInstructions = function() { $scope.instructions = true; }
		$scope.hideInstructions = function() { $scope.instructions = false; }
	}
]);