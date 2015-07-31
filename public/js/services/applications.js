app.factory('applications', ['$http', 'auth', function($http, auth){
	var o = {
		applications: [],
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