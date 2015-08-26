app.controller('ManagerController', [
	'$scope',
	'$state',
	'$stateParams',
	'$window',
	'auth',
	'managers',
	'owners',
	'properties',
	'tenants',
	'requests',
	function($scope, $state, $stateParams, $window, auth, managers, owners, properties, tenants, requests) {
		switch ($state.current.name)
		{
			case "app.newOwner":
				$scope.$parent.setBack({
					title: "Owners",
					link: "app.owners"
				});
				break;
			case "app.tenants.new":
				$scope.$parent.setBack({
					title: "Property",
					link: "app.properties.detail",
					linkParams: { id: $stateParams.property }
				});
				break;
			default:
				$scope.$parent.setBack({
					title: "Home",
					link: "app.dashboard"
				});
				break;
		}
		$scope.user = auth.currentUser();
		$scope.owners = owners.owners;
		$scope.properties = properties.properties;
		if ($stateParams.property)
		{
			$scope.tenant = {};
			$scope.tenant.property = $stateParams.property;
		}
		$scope.requests = requests.requests;
		$scope.onboardingPage = 'stripe';
		if ($scope.user.stripe_id)
			$scope.onboardingPage = 'manages_others';

		$scope.newOwner = function() {
			owners.create({ name: $scope.owner.name }).success(function(owner) {
				$scope.owners.push(owner);
				$state.go('app.ownerDetails', { id: owner._id });
			});
		};

		$scope.newTenant = function() {
			$scope.error = '';
			tenants.create($scope.tenant).success(function(tenant) {
				$state.go('app.properties.detail', { id: $scope.tenant.property });
			}).error(function(err) {
				$scope.error = err.message;
			});
		};

		$scope.stripeConnect = function() {
			$window.location.href = user.stripe_connect_url;
		};

		$scope.setMultipleOwners = function (bool) {
			managers.save({
				_id: $scope.user._id,
				multiple_owners: bool
			}).success(function(data) {
				$scope.user = data;
				auth.saveCurrentUser(data);
			});
			if (bool)
				$scope.onboardingPage = 'other_manage';
			else
				$scope.onboardingPage = 'self_manage';
		};

		$scope.endOnboarding = function () {
			managers.save({
				_id: $scope.user._id,
				onboarding: false
			}).success(function(data) {
				$scope.user = data;
				auth.saveCurrentUser(data);
			});
			console.log($scope.user.multiple_owners)
			if ($scope.user.multiple_owners)
				$state.go('app.newOwner');
			else
				$state.go('app.properties.new');
		};
	}
]);