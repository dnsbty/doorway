var app = angular.module('doorway', ['ui.router', 'angular-stripe', 'angulartics', 'angulartics.google.analytics', 'ngMask']);

app.config(function (stripeProvider) {
	stripeProvider.setPublishableKey(window.stripeKey);
});

app.config([
	'$stateProvider',
	'$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {
		$stateProvider
		.state('home', {
			url: '',
			templateUrl: './views/home.html',
			controller: 'MainController',
			onEnter: ['$state', 'auth', function($state, auth) {
				if (auth.isLoggedIn())
					$state.go('app.dashboard');
			}]
		})
		.state('app', {
			url: '',
			templateUrl: './views/container.html',
			abstract: true
		})
		.state('app.dashboard', {
			url: '/',
			templateUrl: './views/dashboard.html',
			controller: 'MainController',
			onEnter: ['$state', 'auth', function($state, auth) {
				if (!auth.isLoggedIn())
					$state.go('home');
			}],
			authenticate: true
		})
		.state('app.newTenant', {
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
		.state('app.newTenantInfo', {
			url: '/newTenantInfo',
			templateUrl: './views/newTenantInfo.html',
			controller: 'TenantController',
			onEnter: ['$state', 'auth', function($state, auth) {
				if (!auth.isLoggedIn())
					$state.go('home');
			}],
			authenticate: true
		})
		.state('app.newAccount', {
			url: '/newAccount',
			templateUrl: './views/newAccount.html',
			controller: 'TenantController',
			onEnter: ['$state', 'auth', function($state, auth) {
				if (!auth.isLoggedIn())
					$state.go('home');
			}],
			authenticate: true
		})
		.state('app.verifyAccount', {
			url: '/verifyAccount',
			templateUrl: './views/verifyAccount.html',
			controller: 'TenantController',
			onEnter: ['$state', 'auth', function($state, auth) {
				if (!auth.isLoggedIn())
					$state.go('home');
			}],
			authenticate: true
		})
		.state('app.accounts', {
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
		.state('app.accountDetails', {
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
		.state('app.payments', {
			url: '/payments',
			template: '<ui-view/>',
			abstract: true
		})
		.state('app.payments.list', {
			url: '/',
			controller: function($scope, $state, auth) {
				console.log(auth.isManager());
				if (!auth.isLoggedIn())
					$state.go('home');
				else if (auth.isTenant())
					$state.go('app.payments.list_tenant');
				else if (auth.isManager())
					$state.go('app.payments.list_manager');
					
			},
			authenticate: true
		})
		.state('app.payments.list_tenant', {
			url: '',
			templateUrl: './views/tenant/payments.html',
			controller: 'TenantController',
			onEnter: ['$state', 'auth', function($state, auth) {
				if (!auth.isTenant())
					$state.go('app.payments.list_manager');
			}],
			resolve: {
				paymentsPromise: ['payments', function(payments) {
					return payments.getAll();
				}]
			},
			authenticate: true
		})
		.state('app.payments.list_manager', {
			url: '',
			templateUrl: './views/manager/payments.html',
			controller: 'ManagerController',
			onEnter: ['$state', 'auth', function($state, auth) {
				if (!auth.isManager())
					$state.go('app.payments.list_tenant');
			}],
			resolve: {
				paymentsPromise: ['payments', function(payments) {
					return payments.getAll();
				}]
			},
			authenticate: true
		})
		.state('app.payments.new', {
			url: '/new',
			templateUrl: './views/tenant/newPayment.html',
			controller: 'TenantController',
			onEnter: ['$state', 'auth', function($state, auth) {
				if (!auth.isLoggedIn() || !auth.isTenant())
					$state.go('home');
				var user = auth.currentUser();
				if (!user.property || !user.property.rent) {
					auth.logout();
					$state.go('app.payments.new');
				}
			}],
			authenticate: true
		})
		.state('app.payments.detail', {
			url: '/{id}',
			templateUrl: './views/tenant/payment.html',
			controller: 'PaymentController',
			onEnter: ['$state', 'auth', function($state, auth) {
				if (!auth.isLoggedIn())
					$state.go('home');
			}],
			resolve: {
				payment: ['$stateParams', 'payments', function($stateParams, payments) {
					return payments.get($stateParams.id);
				}]
			},
			authenticate: true
		})
		.state('app.autoPay', {
			url: '/autoPay',
			templateUrl: './views/tenant/autoPay.html',
			controller: 'TenantController',
			onEnter: ['$state', 'auth', function($state, auth) {
				if (!auth.isLoggedIn() || !auth.isTenant())
					$state.go('home');
			}],
			authenticate: true
		})
		.state('app.owners', {
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
		.state('app.ownerDetails', {
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
		.state('app.newOwner', {
			url: '/newOwner',
			templateUrl: './views/manager/newOwner.html',
			controller: 'ManagerController',
			onEnter: ['$state', 'auth', function($state, auth) {
				if (!auth.isLoggedIn() || !auth.isManager())
					$state.go('home');
			}],
			authenticate: true
		})
		.state('app.properties', {
			url: '/properties',
			template: '<ui-view/>',
			abstract: true
		})
		.state('app.properties.list', {
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
		.state('app.properties.new', {
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
		.state('app.properties.detail', {
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
		.state('app.properties.apply', {
			url: '/{id}/apply',
			controller: 'PropertyController',
			templateUrl: './views/application.html',
			resolve: {
				property: ['$stateParams', 'properties', function($stateParams, properties) {
					return properties.get($stateParams.id);
				}]
			}
		})
		.state('app.application', {
			url: '/applications/{id}',
			controller: 'ApplicationController',
			templateUrl: './views/manager/application.html',
			onEnter: ['$state', 'auth', function($state, auth) {
				if (!auth.isLoggedIn() || !auth.isManager())
					$state.go('home');
			}],
			resolve: {
				application: ['$stateParams', 'applications', function($stateParams, applications) {
					return applications.get($stateParams.id);
				}]
			},
			authenticate: true
		})
		.state('app.requests', {
			url: '/requests',
			template: '<ui-view/>',
			abstract: true
		})
		.state('app.requests.list', {
			url: '/',
			controller: function($scope, $state, auth) {
				console.log(auth.isManager());
				if (!auth.isLoggedIn())
					$state.go('home');
				else if (auth.isTenant())
					$state.go('app.requests.list_tenant');
				else if (auth.isManager())
					$state.go('app.requests.list_manager');
					
			},
			authenticate: true
		})
		.state('app.requests.list_tenant', {
			url: '',
			controller: 'TenantController',
			templateUrl: './views/tenant/requests.html',
			onEnter: ['$state', 'auth', function($state, auth) {
				if (!auth.isLoggedIn())
					$state.go('home');
				if (!auth.isTenant())
					$state.go('app.requests.list_manager');
			}],
			resolve: {
				requestPromise: ['requests', function(requests) {
					return requests.getAll();
				}]
			},
			authenticate: true
		})
		.state('app.requests.list_manager', {
			url: '',
			controller: 'ManagerController',
			templateUrl: './views/tenant/requests.html',
			onEnter: ['$state', 'auth', function($state, auth) {
				if (!auth.isLoggedIn())
					$state.go('home');
				if (!auth.isManager())
					$state.go('app.requests.list_tenant');
			}],
			resolve: {
				requestPromise: ['requests', function(requests) {
					return requests.getAll();
				}]
			},
			authenticate: true
		})
		.state('app.requests.new', {
			url: '/new',
			controller: 'RequestController',
			templateUrl: './views/tenant/newRequest.html',
			onEnter: ['$state', 'auth', function($state, auth) {
				if (!auth.isLoggedIn() || !auth.isTenant())
					$state.go('home');
			}],
			resolve: {
				request: function() {
					return {};
				}
			},
			authenticate: true
		})
		.state('app.requests.detail', {
			url: '/{id}',
			controller: 'RequestController',
			templateUrl: './views/tenant/request.html',
			onEnter: ['$state', 'auth', function($state, auth) {
				if (!auth.isLoggedIn())
					$state.go('home');
			}],
			resolve: {
				request: ['$stateParams', 'requests', function($stateParams, requests) {
					return requests.get($stateParams.id);
				}]
			},
			authenticate: true
		})
		.state('app.tenants', {
			url: '/tenants',
			template: '<ui-view/>',
			abstract: true
		})
		.state('app.tenants.new', {
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
		.state('app.tenants.detail', {
			url: '/{id}',
			controller: 'ManageTenantController',
			templateUrl: './views/manager/tenant.html',
			onEnter: ['$state', 'auth', function($state, auth) {
				if (!auth.isLoggedIn() || !auth.isManager())
					$state.go('home');
			}],
			resolve: {
				tenant: ['$stateParams', 'tenants', function($stateParams, tenants) {
					return tenants.get($stateParams.id);
				}]
			},
			authenticate: true
		})
		.state('app.connectOwner', {
			url: '/owners/connect?state&code',
			controller: 'ManagerController',
			onEnter: ['$state', 'auth', '$stateParams', 'owners', function($state, auth, $stateParams, owners) {
				if (!auth.isLoggedIn() || !auth.isManager())
					$state.go('home');
				owners.connect($stateParams.state, $stateParams.code).success(function(data){
					$state.go('app.ownerDetails', { id: data._id });
				});
			}],
			authenticate: true
		})
		.state('app.connectManager', {
			url: '/managers/connect?code',
			controller: 'ManagerController',
			onEnter: ['$state', 'auth', '$stateParams', 'managers', function($state, auth, $stateParams, managers) {
				if (!auth.isLoggedIn() || !auth.isManager())
					$state.go('home');
				managers.connect($stateParams.code).success(function(data){
					auth.saveCurrentUser(data);
					$state.go('app.dashboard');
				});
			}],
			authenticate: true
		})
		.state('auth', {
			url: '',
			controller: 'MainController',
			templateUrl: './views/container.html',
			abstract: true
		})
		.state('auth.forgotPassword', {
			url: '/forgotPassword',
			templateUrl: './views/forgotPassword.html',
			controller: 'AuthController',
			onEnter: ['$state', 'auth', function($state, auth) {
				if (auth.isLoggedIn())
					$state.go('home');
			}]
		})
		.state('auth.resetPassword', {
			url: '/resetPassword/{id}/{token}',
			templateUrl: './views/resetPassword.html',
			controller: 'AuthController',
			onEnter: ['$state', 'auth', function($state, auth) {
				if (auth.isLoggedIn())
					$state.go('home');
			}]
		})
		.state('auth.register', {
			url: '/register',
			templateUrl: './views/register.html',
			controller: 'AuthController',
			onEnter: ['$state', 'auth', function($state, auth) {
				if (auth.isLoggedIn())
					$state.go('home');
			}]
		})
		.state('auth.login', {
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
		})
		.state('app.support', {
			url: '/support',
			controller: function($scope) {
				$scope.$parent.setBack({
					title: "Home",
					link: "app.dashboard"
				});
			},
			templateUrl: './views/support.html'
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
