app.controller('MainController', [
	'$scope',
	'$state',
	'emails',
	'auth',
	function($scope, $state, emails, auth){
		$scope.user = auth.currentUser();
		$scope.isManager = auth.isManager();
		$scope.isTenant = auth.isTenant();
		$scope.showUserMenu = false;
		$scope.backButton = false;
		if ($scope.$parent.backButton)
			$scope.$parent.setBack(false);

		$scope.toggleUserMenu = function () {
			if ($scope.showUserMenu)
				$scope.showUserMenu = false;
			else
				$scope.showUserMenu = true;
		};

		$scope.goBack = function () {
			if ($state.current.name == "app.properties.apply")
				$scope.$broadcast("goBack", { page: $scope.backButton.link });
			else if ($scope.backButton.link) {
				if ($scope.backButton.linkParams)
					$state.go($scope.backButton.link, $scope.backButton.linkParams);
				else
					$state.go($scope.backButton.link);
			}
		};

		$scope.setBack = function (button) {
			$scope.backButton = button;
		}
	}
]);