app.controller('AccountController', [
	'$scope',
	'$state',
	'auth',
	'stripe',
	'accounts',
	function($scope, $state, auth, stripe, accounts) {
		$scope.newAccount = function() {
			$scope.error = null;
			if (!$scope.account.routing_number || $scope.account.routing_number === '' ||
				!$scope.account.account_number || $scope.account.account_number === '') {
					$scope.error = "Please fill out all fields";
					return;
			}

			if (!stripe.bankAccount.validateRoutingNumber($scope.account.routing_number, 'US')) {
				$scope.error = 'Please check your routing number again.';
				return;
			}

			if (!stripe.bankAccount.validateAccountNumber($scope.account.account_number, 'US')) {
				$scope.error = 'Please check your account number again.';
				return;
			}

			stripe.bankAccount.createToken({
				country: 'US',
				currency: 'USD',
				routing_number: $scope.account.routing_number,
				account_number: $scope.account.account_number
			}).then(function(token) {
				accounts.newAccount(token);
			}).then(function() {
				$state.go('verifyAccount');
			}).catch(function (err) {
				$scope.error = err.message;
			});
		}
	}
]);