app.factory('applications', ['$http', 'auth', function($http, auth){
	var o = {
		applications: [],
		get: function(id) {
			return $http.get('/applications/' + id, {
				headers: { Authorization: 'Bearer ' + auth.getToken() }
			}).then(function(res) {
				return res.data;
			}).catch(function(err) {
				console.log(err)
			});
		},
		getAll: function(property) {
			return $http.get('/properties/' + property + '/applications', {
				headers: { Authorization: 'Bearer ' + auth.getToken() }
			}).success(function(data) {
				angular.copy(data, o.applications);
			}).error(function(err) {
				console.log(err);
			});
		}
	};
	return o;
}]);