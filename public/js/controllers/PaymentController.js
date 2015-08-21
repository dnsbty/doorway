app.controller('PaymentController', [
	'$scope',
	'$state',
	'auth',
	'payments',
	'payment',
	function($scope, $state, auth, payments, payment) {
		$scope.$parent.setBack({
			title: "Payments",
			link: "app.payments.list"
		});
		$scope.user = auth.currentUser();
		$scope.payment = payment;
	}
]);