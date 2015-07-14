app.controller('PropertyController', [
	'$scope',
	'$state',
	'$stateParams',
	'$window',
	'auth',
	'stripe',
	'properties',
	'property',
	'owners',
	function($scope, $state, $stateParams, $window, auth, stripe, properties, property, owners) {
		$scope.user = auth.currentUser();
		$scope.property = property;
		if ($stateParams.owner)
			$scope.property.owner = $stateParams.owner;
		$scope.properties = properties.properties;
		$scope.owners = owners.owners;
		$scope.page = 'main';
		$scope.application = {
			occupants: [{}],
			vehicles: [{}],
			pets: [{}]
		};

		$scope.newProperty = function() {
			$scope.error = null;
			properties.create(property).success(function(property) {
				$state.go('properties.detail', { id: property._id });
			}).error(function(err) {
				$scope.error = err.message;
			});
		};

		$scope.cardToken = function() {
			$scope.error = null;
			if (!$scope.application || !$scope.application.card) {
					$scope.error = "Please fill out all fields.";
					return false;
			}

			if (!$scope.application.card.number || $scope.application.card.number === '') {
				$scope.error = "Please enter your card number.";
				return false;
			}

			if (!$scope.application.card.exp_month || $scope.application.card.exp_month === '' ||
				!$scope.application.card.exp_year || $scope.application.card.exp_year === '') {
				$scope.error = "Please enter your card's expiration date.";
				return false;
			}

			if (!$scope.application.card.cvc || $scope.application.card.cvc === '') {
				$scope.error = "Please enter your card's verification number (usually on the back of the card).";
				return false;
			}

			if (!stripe.card.validateCardNumber($scope.application.card.number)) {
				$scope.error = 'Please check your card number again.';
				return false;
			}

			if (!stripe.card.validateExpiry($scope.application.card.exp_month, $scope.application.card.exp_year)) {
				$scope.error = 'Please check your card\'s expiration date again.  It may have expired.';
				return false;
			}

			if (!stripe.card.validateCVC($scope.application.card.cvc)) {
				$scope.error = 'Please check your card\'s verification number again.';
				return false;
			}

			return stripe.card.createToken($scope.application.card).then(function(token) {
				$scope.application.card.token = token;
				return true;
			}).catch(function (err) {
				$scope.error = err.message;
				return false;
			});
		};

		$scope.validation = function(page) {
			switch (page) {
				case "payment":
					if ($scope.cardToken() === false)
						return false;
					break;
				case "legal":
					if (!$scope.application.signature || !$scope.application.signature === '') {
						$scope.error = 'Please type your name in the signature field.';
						return false;
					}
					break;
			}
			return true;
		};

		$scope.changePage = function(page, validate) {
			var valid = true;

			if (validate === false || $scope.validation($scope.page)) {
				$scope.page = page;
			}
			$window.scrollTo(0,0);
		};

		$scope.addOccupant = function() {
			$scope.application.occupants.push({});
		};

		$scope.addVehicle = function() {
			$scope.application.vehicles.push({});
		};

		$scope.addPet = function() {
			$scope.application.pets.push({});
		};

		$scope.submitApplication = function() {
			var application = $scope.application;
			application.card = application.card.token.id;
			properties.apply($scope.property, application).success(function(data) {
				console.log(data);
				$scope.page = 'confirmation';
			}).error(function(err) {
				console.log(err);
			});
		};
	}
]);