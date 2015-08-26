app.factory('managers', ['$http', '$window', 'auth', function($http, $window, auth){
	var o = {
		managers: [],
		connect: function(code) {
			return $http.post('/managers/' + auth.currentUser()._id + '/stripe', { code: code }, {
				headers: { Authorization: 'Bearer ' + auth.getToken() }
			}).success(function(data) {
				return data;
			}).error(function(err) {
				console.log(err);
			});
		},
		save: function(manager) {
			return $http.put('/managers/' + manager._id, manager, {
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