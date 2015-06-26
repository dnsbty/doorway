app.controller('MainController', [
	'$scope',
	'$state',
	'emails',
	'auth',
	function($scope, $state, emails, auth){

		$scope.user = auth.currentUser();

		$scope.addEmail = function(){
			if (!$scope.email || $scope.email == '')
			{
				$scope.error = "You must provide a valid email address to continue.";
				return false;
			} else {
				emails.create({
					email: $scope.email
				});
				$state.go('waiting');
				$scope.error = null;
			}
		};
	}
]);