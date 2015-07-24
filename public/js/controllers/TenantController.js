app.controller('TenantController', [
	'$scope',
	'$state',
	'auth',
	'stripe',
	'tenants',
	'accounts',
	'payments',
	function($scope, $state, auth, stripe, tenants, accounts, payments) {
		$scope.user = auth.currentUser();
		$scope.accounts = accounts.accounts;
		if ($scope.user)
			$scope.payment = { amount: $scope.user.property.rent };
		$scope.payments = payments.payments;
		$scope.show = 'main';

		$scope.editTenant = function() {
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
			auth.saveCurrentUser($scope.user);
			$state.go('newAccount');
		};

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
				accounts.newAccount($scope.user._id, token);
			}).then(function() {
				$state.go('verifyAccount');
			}).catch(function (err) {
				$scope.error = err.message;
			});
		};

		$scope.newPayment = function() {
			$scope.view = 'processing';
			$scope.error = null;
			if (!$scope.payment.amount || $scope.payment.amount === '') {
					$scope.error = "Please provide an amount to pay";
					$scope.view = 'main';
					return;
			}

			payments.create($scope.payment).success(function(data) {
				$scope.payment = data;
				$scope.view = 'success';
			}).error(function(err) {
				$scope.error = err.message;
				$scope.view = 'main';
				return;
			});
		};
	}
]);