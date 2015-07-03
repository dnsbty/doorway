app.factory('payments', ['$http', 'auth', function($http, auth){
	var o = {
		payments: [],
		get: function(id) {
			return $http.get('/payments/' + id, {
				headers: { Authorization: 'Bearer ' + auth.getToken() }
			}).then(function(res) {
				return res.data;
			});
		},
		getAll: function() {
			return $http.get('/payments', {
				headers: { Authorization: 'Bearer ' + auth.getToken() }
			}).success(function(data) {
				angular.copy(data, o.payments);
			}).error(function(err) {
				console.log(err);
			});
		},
		create: function(payment) {
			return $http.post('/payments', { payment: payment }, {
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