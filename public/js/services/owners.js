app.factory('owners', ['$http', 'auth', '$window', function($http, auth, $window){
	var o = {
		owners: [],
		connect: function(token, code) {
			var id = o.getIdFromJWT(token);
			return $http.post('/owners/' + id + '/stripe', { code: code }, {
				headers: { Authorization: 'Bearer ' + auth.getToken() }
			}).success(function(data) {
				return data;
			}).error(function(err) {
				console.log(err);
			});
		},
		create: function(owner) {
			return $http.post('/owners', owner, {
				headers: { Authorization: 'Bearer ' + auth.getToken() }
			}).success(function(data) {
				o.owners.push(data);
			})
		},
		get: function(id) {
			return $http.get('/owners/' + id, {
				headers: { Authorization: 'Bearer ' + auth.getToken() }
			}).then(function(res) {
				return res.data;
			});
		},
		getAll: function() {
			return $http.get('/owners', {
				headers: { Authorization: 'Bearer ' + auth.getToken() }
			}).success(function(data) {
				angular.copy(data, o.owners);
			});
		},
		getIdFromJWT: function(token) {
			if (token) {
				var payload = JSON.parse($window.atob(token.split('.')[1]));
				return payload.owner;
			} else {
				return false;
			}
		},
		save: function(owner) {
			return $http.put('/owners/' + owner._id, owner, {
				headers: { Authorization: 'Bearer ' + auth.getToken() }
			}).success(function(data) {
				console.log(data);
			}).error(function(err) {
				console.log(err);
			});
		}
	};
	return o;
}]);