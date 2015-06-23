app.factory('emails', ['$http', function($http){
	var o = {
		emails: [],
		create: function(email) {
			return $http.post('/emails', email).success(function(data) {
				console.log(data);
			}).error(function(err) {
				console.log(err);
			});
		}
	};
	return o;
}]);