app.factory('auth', ['$http', '$window', function($http, $window) {
	var auth = {
		saveToken: function(token) {
			$window.localStorage['doorway-token'] = token;
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
		currentUser: function() {
			if (auth.isLoggedIn()){
				var token = auth.getToken();
				var payload = JSON.parse($window.atob(token.split('.')[1]));
				return payload.username;
			}
		},
		login: function(username, password) {
			return $http.post('/users/login', user).success(function(data) {
				auth.saveToken(data.token);
			})
		},
		logout: function() {
			$window.localStorage.removeItem('doorway-token');
		}
	};
	return auth;
}]);