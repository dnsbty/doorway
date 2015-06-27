app.factory('owners', ['$http', 'auth', function($http, auth){
	var o = {
		owners: [],
		get: function(id) {
			return $http.get('/owners/' + id, {
				headers: { Authorization: 'Bearer ' + auth.getToken() }
			}).then(function(res) {
				console.log(res.data);
				return res.data;
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