app.factory('requests', ['$http', 'auth', function($http, auth){
	var o = {
		requests: [],
		get: function(id) {
			return $http.get('/requests/' + id, {
				headers: { Authorization: 'Bearer ' + auth.getToken() }
			}).then(function(res) {
				return res.data;
			});
		},
		getAll: function() {
			return $http.get('/requests', {
				headers: { Authorization: 'Bearer ' + auth.getToken() }
			}).success(function(data) {
				angular.copy(data, o.requests);
			}).error(function(err) {
				console.log(err);
			});
		},
		create: function(request) {
			return $http.post('/requests', request, {
				headers: { Authorization: 'Bearer ' + auth.getToken() }
			}).error(function(err) {
				console.log(err);
			}).success(function(data) {
				console.log(data);
			});
		}
	};
	return o;
}]);