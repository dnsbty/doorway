app.factory('tenants', ['$http', 'auth', function($http, auth){
	var o = {
		tenants: [],
		get: function(id) {
			return $http.get('/tenants/' + id, {
				headers: { Authorization: 'Bearer ' + auth.getToken() }
			}).then(function(res) {
				return res.data;
			});
		},
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
		},
		toggleAutoPay: function (tenant) {
			return $http.put('/tenants/' + tenant._id + '/autopay', { autopay: tenant.autopay }, {
				headers: { Authorization: 'Bearer ' + auth.getToken() }
			}).success(function (data) {
				console.log(data);
			}).error(function (err) {
				console.log(err);
			});
		},
		toggleLock: function (tenant, locked) {
			return $http.put('/tenants/' + tenant + '/lock', { locked: locked }, {
				headers: { Authorization: 'Bearer ' + auth.getToken() }
			}).success(function (data) {
				console.log(data);
			}).error(function (err) {
				console.log(err);
			});
		}
	};
	return o;
}]);
