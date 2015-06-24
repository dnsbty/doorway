app.factory('accounts', ['$http', 'auth', function($http, auth){
	var o = {
		newAccount: function(id, account) {
			return $http.post('/tenants/' + id + '/accounts', account, {
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