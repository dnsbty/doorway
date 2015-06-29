app.factory('accounts', ['$http', 'auth', function($http, auth){
	var o = {
		accounts: [],
		get: function(id) {
			return $http.get('/accounts/' + id, {
				headers: { Authorization: 'Bearer ' + auth.getToken() }
			}).then(function(res) {
				return res.data;
			});
		},
		getAll: function() {
			return $http.get('/accounts', {
				headers: { Authorization: 'Bearer ' + auth.getToken() }
			}).success(function(data) {
				angular.copy(data, o.accounts);
			}).error(function(err) {
				console.log(err);
			});
		},
		newAccount: function(id, account) {
			return $http.post('/tenants/' + id + '/accounts', account, {
				headers: { Authorization: 'Bearer ' + auth.getToken() }
			}).success(function(data) {
				console.log(data);
			}).error(function(err) {
				console.log(err);
			});
		},
		verifyAccount: function(id, amount1, amount2) {
			return $http.post('/accounts/' + id + '/verify', {
				amount1: amount1,
				amount2: amount2
			}, {
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