app.controller('PaymentController', [
	'$scope',
	'$state',
	'auth',
	'payments',
	'payment',
	function($scope, $state, auth, payments, payment) {
		$scope.user = auth.currentUser();
		$scope.payment = payment;
	}
]);