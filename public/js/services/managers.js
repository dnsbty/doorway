app.factory('managers', ['$http', 'auth', function($http, auth){
	var o = {
		managers: [],
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