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
	'applications',
	function($scope, $state, $stateParams, $window, auth, stripe, properties, property, owners, applications) {
		$scope.user = auth.currentUser();
		$scope.property = property;
		$scope.properties = properties.properties;
		$scope.owners = owners.owners;
		console.log($scope.owners.length);
		if ($scope.owners.length == 1)
			$scope.property.owner = $scope.owners[0]._id;
		else if ($stateParams.owner)
			$scope.property.owner = $stateParams.owner;
		$scope.page = 'main';
		$scope.applications = applications.applications;
		$scope.application = {
			occupants: [{}],
			vehicles: [{}],
			pets: [{}]
		};
		if ($state.current.name == "app.properties.apply")
			$scope.$parent.setBack(false);
		else
			$scope.$parent.setBack({
				title: "Properties",
				link: "app.properties.list"
			});

		$scope.newProperty = function() {
			$scope.error = null;
			properties.create(property).success(function(property) {
				$state.go('app.properties.detail', { id: property._id });
			}).error(function(err) {
				$scope.error = err.message;
			});
		};

		$scope.openApplications = function() {
			properties.toggleApplications($scope.property._id, true).success(function(property) {
				$scope.property = property;
			}).error(function(err) {
				$scope.error = err.message;
			});
		};

		$scope.closeApplications = function() {
			properties.toggleApplications($scope.property._id, false).success(function(property) {
				$scope.property = property;
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
			switch ($scope.page) {
				case "main":
					$scope.$parent.setBack(false);
					break;
				case "property":
					$scope.$parent.setBack({
						title: "Pricing",
						link: "main"
					});
					break;
				case "contact":
					$scope.$parent.setBack({
						title: "Property Info",
						link: "property"
					});
					break;
				case "identification":
					$scope.$parent.setBack({
						title: "Contact Info",
						link: "contact"
					});
					break;
				case "emergency_contact":
					$scope.$parent.setBack({
						title: "Identification",
						link: "identification"
					});
					break;
				case "occupants":
					$scope.$parent.setBack({
						title: "Emergency Contact",
						link: "emergency_contact"
					});
					break;
				case "current_address":
					$scope.$parent.setBack({
						title: "Occupants",
						link: "occupants"
					});
					break;
				case "previous_address":
					$scope.$parent.setBack({
						title: "Current Address",
						link: "current_address"
					});
					break;
				case "employer":
					$scope.$parent.setBack({
						title: "Previous Address",
						link: "previous_address"
					});
					break;
				case "previous_employer":
					$scope.$parent.setBack({
						title: "Employer",
						link: "employer"
					});
					break;
				case "other_income":
					$scope.$parent.setBack({
						title: "Previous Employer",
						link: "previous_employer"
					});
					break;
				case "vehicles":
					$scope.$parent.setBack({
						title: "Other Income",
						link: "other_income"
					});
					break;
				case "pets":
					$scope.$parent.setBack({
						title: "Vehicles",
						link: "vehicles"
					});
					break;
				case "miscellaneous":
					$scope.$parent.setBack({
						title: "Pets",
						link: "pets"
					});
					break;
				case "additional_info":
					$scope.$parent.setBack({
						title: "Miscellaneous",
						link: "miscellaneous"
					});
					break;
				case "payment":
					$scope.$parent.setBack({
						title: "Additional Info",
						link: "additional_info"
					});
					break;
				case "legal":
					$scope.$parent.setBack({
						title: "Payment",
						link: "payment"
					});
					break;
				case "confirmation":
					$scope.$parent.setBack(false);
					break;
			}
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
				$scope.changePage('confirmation');
			}).error(function(err) {
				console.log(err);
				$scope.error = err.message;
			});
		};

		$scope.$on("goBack", function (event, args) {
			$scope.changePage(args.page, false);
		});
	}
]);