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
		.state('newPayment', {
			url: '/newPayment',
			templateUrl: './views/tenant/newPayment.html',
			controller: 'MainController',
			onEnter: ['$state', 'auth', function($state, auth) {
				if (!auth.isLoggedIn() || !auth.isTenant())
					$state.go('home');
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