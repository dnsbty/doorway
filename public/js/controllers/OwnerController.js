app.controller('OwnerController', [
	'$scope',
	'$state',
	'$window',
	'auth',
	'owner',
	function($scope, $state, $window, auth, owner) {
		$scope.user = auth.currentUser();
		$scope.owner = owner;
		$scope.$parent.setBack({
			title: "Owners",
			link: "app.owners"
		});

		$scope.stripeConnect = function() {
			$window.location.href = owner.stripe_connect_url;
		};
	}
]);