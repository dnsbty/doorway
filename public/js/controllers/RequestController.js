app.controller('RequestController', [
	'$scope',
	'$state',
	'auth',
	'requests',
	'request',
	function($scope, $state, auth, requests, request) {
		$scope.user = auth.currentUser();
		$scope.request = request;
		if ($scope.$parent.isManager)
			$scope.$parent.setBack({
				title: "Requests",
				link: "app.requests.list_manager"
			});
		else
			$scope.$parent.setBack({
				title: "Maintenance",
				link: "app.requests.list_tenant"
			});

		$scope.newRequest = function() {
			$scope.error = null;
			requests.create(request).success(function(request) {
				$state.go('app.requests.detail', { id: request._id });
			}).error(function(err) {
				$scope.error = err.message;
			});
		};

		$scope.newMessage = function(request) {
			$scope.error = null;
			requests.newMessage(request, $scope.message).success(function(request) {
				$scope.message = null;
				$scope.request = request;
			}).error(function(err) {
				$scope.error = err.message;
			});
		};
	}
]);