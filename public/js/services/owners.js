app.factory('owners', ['$http', 'auth', function($http, auth){
	var o = {
		owners: [],
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
				console.log(res.data);
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