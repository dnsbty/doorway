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
			}]
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
			}]
		})
		.state('newAccount', {
			url: '/newAccount',
			templateUrl: './views/newAccount.html',
			controller: 'AccountController',
			onEnter: ['$state', 'auth', function($state, auth) {
				if (!auth.isLoggedIn())
					$state.go('home');
			}]
		})
		.state('verifyAccount', {
			url: '/verifyAccount',
			templateUrl: './views/verifyAccount.html',
			controller: 'AccountController',
			onEnter: ['$state', 'auth', function($state, auth) {
				if (!auth.isLoggedIn())
					$state.go('home');
			}]
		})
		.state('owners', {
			url: '/owners',
			templateUrl: './views/manager/owners.html',
			controller: 'ManagerController',
			onEnter: ['$state', 'auth', function($state, auth) {
				if (!auth.isLoggedIn() || !auth.isManager())
					$state.go('home');
			}]
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
			}
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