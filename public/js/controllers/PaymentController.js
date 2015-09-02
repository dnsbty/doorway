app.controller('PaymentController', [
	'$scope',
	'$state',
	'auth',
	'payments',
	'payment',
	function($scope, $state, auth, payments, payment) {
		$scope.user = auth.currentUser();
		$scope.payment = payment;
		$scope.$parent.setBack({
			title: "Payments",
			link: $scope.user._type == "Tenant" ? "app.payments.list_tenant" : "app.payments.list_manager"
		});
	}
]);