app.factory('tenants', ['$http', 'auth', function($http, auth){
	var o = {
		tenants: [],
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