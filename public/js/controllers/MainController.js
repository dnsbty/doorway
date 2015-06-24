app.controller('MainController', [
	'$scope',
	'$state',
	'emails',
	function($scope, $state, emails){
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