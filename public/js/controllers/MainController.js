app.controller('MainController', [
	'$scope',
	'$state',
	'emails',
	function($scope, $state, emails){
		$scope.addEmail = function(){
			if (!$scope.email || $scope.email === '')
				return;
			emails.create({
				email: $scope.email
			});
			$state.go('waiting');
		};
	}
]);