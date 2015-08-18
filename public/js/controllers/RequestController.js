app.controller('RequestController', [
	'$scope',
	'$state',
	'auth',
	'requests',
	'request',
	function($scope, $state, auth, requests, request) {
		$scope.user = auth.currentUser();
		$scope.request = request;

		$scope.newRequest = function() {
			$scope.error = null;
			requests.create(request).success(function(request) {
				$state.go('app.requests.detail', { id: request._id });
			}).error(function(err) {
				$scope.error = err.message;
			});
		};
	}
]);