var app = angular.module('doorway', ['ui.router', 'angular-stripe', 'angulartics', 'angulartics.google.analytics']);

app.config(function (stripeProvider) {
	stripeProvider.setPublishableKey(window.stripeKey);
});

app.config([
	'$stateProvider',
	'$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {
		$stateProvider
		.state('home', {
			url: '/',
			templateUrl: './views/home.html',
			controller: 'MainController',
			onEnter: ['$state', 'auth', function($state, auth) {
				if (auth.isLoggedIn())
					$state.go('dashboard');
			}]
		})
		.state('waiting', {
			url: '/waiting',
			templateUrl: './views/waiting.html',
			controller: 'MainController'
		})
		.state('dashboard', {
			url: '/',
			templateUrl: './views/dashboard.html',
			controller: 'MainController',
			onEnter: ['$state', 'auth', function($state, auth) {
				if (!auth.isLoggedIn())
					$state.go('home');
			}],
        	authenticate: true
		})
		.state('newTenant', {
			url: '/newTenant/{id}/{token}',
			templateUrl: './views/newTenant.html',
			controller: 'TenantController',
			onEnter: ['$stateParams', 'auth', function($stateParams, auth) {
				if ($stateParams.id == '' || $stateParams.token == '')
					$state.go('home');

				if (!auth.isLoggedIn())
					auth.newTenantLogin($stateParams.id, $stateParams.token);
			}]
		})
		.state('newTenantInfo', {
			url: '/newTenantInfo',
			templateUrl: './views/newTenantInfo.html',
			controller: 'TenantController',
			onEnter: ['$state', 'auth', function($state, auth) {
				if (!auth.isLoggedIn())
					$state.go('home');
			}],
        	authenticate: true
		})
		.state('newAccount', {
			url: '/newAccount',
			templateUrl: './views/newAccount.html',
			controller: 'TenantController',
			onEnter: ['$state', 'auth', function($state, auth) {
				if (!auth.isLoggedIn())
					$state.go('home');
			}],
        	authenticate: true
		})
		.state('verifyAccount', {
			url: '/verifyAccount',
			templateUrl: './views/verifyAccount.html',
			onEnter: ['$state', 'auth', function($state, auth) {
				if (!auth.isLoggedIn())
					$state.go('home');
			}],
        	authenticate: true
		})
		.state('accounts', {
			url: '/accounts',
			templateUrl: './views/tenant/accounts.html',
			controller: 'TenantController',
			onEnter: ['$state', 'auth', function($state, auth) {
				if (!auth.isLoggedIn() || !auth.isTenant())
					$state.go('home');
			}],
			resolve: {
				accountsPromise: ['accounts', function(accounts) {
					return accounts.getAll();
				}]
			},
        	authenticate: true
		})
		.state('accountDetails', {
			url: '/accountDetails/{id}',
			templateUrl: './views/tenant/account.html',
			controller: 'AccountController',
			onEnter: ['$state', 'auth', function($state, auth) {
				if (!auth.isLoggedIn() || !auth.isTenant())
					$state.go('home');
			}],
			resolve: {
				account: ['$stateParams', 'accounts', function($stateParams, accounts) {
					return accounts.get($stateParams.id);
				}]
			},
        	authenticate: true
		})
		.state('payments', {
			url: '/payments',
			templateUrl: './views/tenant/payments.html',
			controller: 'TenantController',
			onEnter: ['$state', 'auth', function($state, auth) {
				if (!auth.isTenant())
					$state.go('home');
			}],
			resolve: {
				paymentsPromise: ['payments', function(payments) {
					return payments.getAll();
				}]
			},
			authenticate: true
		})
		.state('payment', {
			url: '/payments/{id}',
			templateUrl: './views/tenant/payment.html',
			controller: 'PaymentController',
			onEnter: ['$state', 'auth', function($state, auth) {
				if (!auth.isLoggedIn() || !auth.isTenant())
					$state.go('home');
			}],
			resolve: {
				payment: ['$stateParams', 'payments', function($stateParams, payments) {
					return payments.get($stateParams.id);
				}]
			},
			authenticate: true
		})
		.state('newPayment', {
			url: '/newPayment',
			templateUrl: './views/tenant/newPayment.html',
			controller: 'TenantController',
			onEnter: ['$state', 'auth', function($state, auth) {
				if (!auth.isLoggedIn() || !auth.isTenant())
					$state.go('home');
				var user = auth.currentUser();
				if (!user.property || !user.property.rent) {
					auth.logout();
					$state.go('newPayment');
				}
			}],
        	authenticate: true
		})
		.state('owners', {
			url: '/owners',
			templateUrl: './views/manager/owners.html',
			controller: 'ManagerController',
			onEnter: ['$state', 'auth', function($state, auth) {
				if (!auth.isLoggedIn() || !auth.isManager())
					$state.go('home');
			}],
			resolve: {
				ownerPromise: ['owners', function(owners) {
					return owners.getAll();
				}]
			},
        	authenticate: true
		})
		.state('ownerDetails', {
			url: '/ownerDetails/{id}',
			templateUrl: './views/manager/owner.html',
			controller: 'OwnerController',
			onEnter: ['$state', 'auth', function($state, auth) {
				if (!auth.isLoggedIn() || !auth.isManager())
					$state.go('home');
			}],
			resolve: {
				owner: ['$stateParams', 'owners', function($stateParams, owners) {
					return owners.get($stateParams.id);
				}]
			},
        	authenticate: true
		})
		.state('newOwner', {
			url: '/newOwner',
			templateUrl: './views/manager/newOwner.html',
			controller: 'ManagerController',
			onEnter: ['$state', 'auth', function($state, auth) {
				if (!auth.isLoggedIn() || !auth.isManager())
					$state.go('home');
			}],
        	authenticate: true
		})
		.state('properties', {
			url: '/properties',
			template: '<ui-view/>',
			abstract: true
		})
		.state('properties.list', {
			url: '',
			controller: 'ManagerController',
			templateUrl: './views/manager/properties.html',
			onEnter: ['$state', 'auth', function($state, auth) {
				if (!auth.isLoggedIn() || !auth.isManager())
					$state.go('home');
			}],
			resolve: {
				propertyPromise: ['properties', function(properties) {
					return properties.getAll();
				}]
			},
        	authenticate: true
		})
		.state('properties.new', {
			url: '/new?owner',
			controller: 'PropertyController',
			templateUrl: './views/manager/newProperty.html',
			onEnter: ['$state', 'auth', function($state, auth) {
				if (!auth.isLoggedIn() || !auth.isManager())
					$state.go('home');
			}],
			resolve: {
				ownerPromise: ['owners', function(owners) {
					return owners.getAll();
				}],
				property: function() {
					return {};
				}
			},
			authenticate: true
		})
		.state('properties.detail', {
			url: '/{id}',
			controller: 'PropertyController',
			templateUrl: './views/manager/property.html',
			onEnter: ['$state', 'auth', function($state, auth) {
				if (!auth.isLoggedIn() || !auth.isManager())
					$state.go('home');
			}],
			resolve: {
				property: ['$stateParams', 'properties', function($stateParams, properties) {
					return properties.get($stateParams.id);
				}],
				applicationsPromise: ['$stateParams', 'applications', function($stateParams, applications) {
					return applications.getAll($stateParams.id);
				}]
			},
        	authenticate: true
		})
		.state('properties.apply', {
			url: '/{id}/apply',
			controller: 'PropertyController',
			templateUrl: './views/application.html',
			resolve: {
				property: ['$stateParams', 'properties', function($stateParams, properties) {
					return properties.get($stateParams.id);
				}]
			}
		})
		.state('tenants', {
			url: '/tenants',
			template: '<ui-view/>',
			abstract: true
		})
		.state('tenants.new', {
			url: '/new?property',
			controller: 'ManagerController',
			templateUrl: './views/manager/newTenant.html',
			onEnter: ['$state', 'auth', function($state, auth) {
				if (!auth.isLoggedIn() || !auth.isManager())
					$state.go('home');
			}],
			resolve: {
				propertyPromise: ['properties', function(properties) {
					return properties.getAll();
				}],
				tenant: function() {
					return {};
				}
			},
			authenticate: true
		})
		.state('connect', {
			url: '/owners/connect?state&code',
			controller: 'ManagerController',
			onEnter: ['$state', 'auth', '$stateParams', 'owners', function($state, auth, $stateParams, owners) {
				if (!auth.isLoggedIn() || !auth.isManager())
					$state.go('home');
				owners.connect($stateParams.state, $stateParams.code).success(function(data){
					$state.go('ownerDetails', { id: data._id });
				});
			}],
        	authenticate: true
		})
		.state('register', {
			url: '/register',
			templateUrl: './views/register.html',
			controller: 'AuthController',
			onEnter: ['$state', 'auth', function($state, auth) {
				if (auth.isLoggedIn())
					$state.go('home');
			}]
		})
		.state('login', {
			url: '/login',
			templateUrl: './views/login.html',
			controller: 'AuthController',
			onEnter: ['$state', 'auth', function($state, auth) {
				if (auth.isLoggedIn())
					$state.go('home');
			}]
		})
		.state('logout', {
			url: '/logout',
			controller: 'AuthController',
			onEnter: ['$state', 'auth', function($state, auth) {
				auth.logout();
				$state.go('home');
			}]
		});

		$urlRouterProvider.otherwise( function($injector, $location) {
            var $state = $injector.get('$state');
            $state.go('home');
        });
	}
]);

app.run(['$rootScope', '$location', 'auth', function ($rootScope, $location, auth) {
	// Redirect to login if route requires auth and you're not logged in
	$rootScope.$on('$stateChangeStart', function (event, destination, toParams) {
		if (destination.authenticate && !auth.isLoggedIn()) {
			$rootScope.returnToState = destination;
			$rootScope.returnToStateParams = toParams;
			$location.path('/login');
		}
	});
}]);