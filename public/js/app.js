var app = angular.module('doorway', ['ui.router', 'angular-stripe']);

app.config(function (stripeProvider) {
	stripeProvider.setPublishableKey('pk_test_g2I23aSpNGR3NmKm5uhzDaBC');
});

app.config([
	'$stateProvider',
	'$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {
		$stateProvider
		.state('home', {
			url: '/home',
			templateUrl: './views/home.html',
			controller: 'MainController'
		})
		.state('waiting', {
			url: '/waiting',
			templateUrl: './views/waiting.html',
			controller: 'MainController'
		})
		.state('newTenant', {
			url: '/newTenant/{id}/{token}',
			templateUrl: './views/newTenant.html',
			controller: 'TenantController',
			onEnter: ['$stateParams', 'auth', function($stateParams, auth) {
				if ($stateParams.id == '' || $stateParams.token == '')
					$state.go('home');
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