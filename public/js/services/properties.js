app.factory('properties', ['$http', 'auth', function($http, auth){
	var o = {
		properties: [],
		get: function(id) {
			return $http.get('/properties/' + id, {
				headers: { Authorization: 'Bearer ' + auth.getToken() }
			}).then(function(res) {
				return res.data;
			});
		},
		getAll: function() {
			return $http.get('/properties', {
				headers: { Authorization: 'Bearer ' + auth.getToken() }
			}).success(function(data) {
				angular.copy(data, o.properties);
			}).error(function(err) {
				console.log(err);
			});
		},
		create: function(property) {
			return $http.post('/properties', property, {
				headers: { Authorization: 'Bearer ' + auth.getToken() }
			}).error(function(err) {
				console.log(err);
			});
		},
		toggleApplications: function(id, open) {
			return $http.put('/properties/' + id + '/applications', { applications_open: open }, {
				headers: { Authorization: 'Bearer ' + auth.getToken() }
			}).error(function(err) {
				console.log(err);
			});
		},
		inviteToApply: function(id, info) {
			return $http.post('/properties/' + id + '/applications/invite', info, {
				headers: { Authorization: 'Bearer ' + auth.getToken() }
			}).error(function(err) {
				console.error(err);
			});
		},
		apply: function(property, application) {
			return $http.post('/properties/' + property._id + '/applications', application).error(function(err) {
				console.log(err);
			});
		}
	};
	return o;
}]);