app.factory('tenants', ['$http', 'auth', function($http, auth){
	var o = {
		tenants: [],
		create: function(tenant) {
			return $http.post('/properties/' + tenant.property + '/tenants', tenant, {
				headers: { Authorization: 'Bearer ' + auth.getToken() }
			}).error(function(err) {
				console.log(err);
			});
		},
		save: function(tenant) {
			return $http.put('/tenants/' + tenant._id, tenant, {
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