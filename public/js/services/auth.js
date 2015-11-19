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
		isManager: function() {
			if (auth.isLoggedIn()) {
				user = auth.currentUser();
				return user._type == 'Manager';
			}
			else return false;
		},
		isTenant: function() {
			if (auth.isLoggedIn()) {
				user = auth.currentUser();
				return user._type == 'Tenant';
			}
			else return false;
		},
		login: function(user) {
			return $http.post('/users/login', user).success(function(data) {
				auth.saveToken(data.token);
				auth.saveCurrentUser(data.user);
			});
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
		register: function(user) {
			return $http.post('/managers', user).success(function(data) {
				auth.saveToken(data.token);
				auth.saveCurrentUser(data.user);
			});
		},
		resetPassword: function(user) {
			return $http.post('/users/' + user.email + '/password/reset').success(function(res) {
				return res.data;
			});
		},
		saveCurrentUser: function(user) {
			try {
				$window.localStorage['doorway-user'] = angular.toJson(user);
			} catch (e) {
				console.err("User info could not be saved to localStorage");
			}
		},
		savePasswordReset: function(user) {
			return $http.put('/users/' + user._id + '/password', {
				token: user.token, password: user.password
			}).success(function(res) {
				return res.data;
			});
		},
		saveToken: function(token) {
			try {
				$window.localStorage['doorway-token'] = token;
			} catch (e) {
				console.err("User token could not be saved to localStorage");
			}
		}
	};
	return auth;
}]);