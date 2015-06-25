app.factory('auth', ['$http', '$window', '$filter', function($http, $window, $filter) {
	var auth = {
		currentUser: function() {
			return angular.fromJson($window.localStorage['doorway-user']);
		},
		getToken: function(token) {
			return $window.localStorage['doorway-token'];
		},
		isLoggedIn: function() {
			var token = auth.getToken();
			if (token) {
				var payload = JSON.parse($window.atob(token.split('.')[1]));
				return payload.exp > Date.now() / 1000;
			} else {
				return false;
			}
		},
		login: function(user) {
			return $http.post('/users/login', user).success(function(data) {
				auth.saveToken(data.token);
			})
		},
		logout: function() {
			$window.localStorage.removeItem('doorway-token');
			$window.localStorage.removeItem('doorway-user');
		},
		newTenantLogin: function(id, hash) {
			return $http.post('/tenants/' + id +'/login', { hash: hash }).success(function(data) {
				auth.saveToken(data.token);
				auth.saveCurrentUser(data.user);
			}).error(function(err) {
				console.log(err);
			});
		},
		saveCurrentUser: function(user) {
			$window.localStorage['doorway-user'] = angular.toJson(user);
		},
		saveToken: function(token) {
			$window.localStorage['doorway-token'] = token;
		}
	};
	return auth;
}]);