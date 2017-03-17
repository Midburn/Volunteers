
function get_volunteer_list(successCallback, errorCallback) {
   // TODO: handle errors
   $.getJSON('/volunteer/volunteers', function(data) {
      successCallback(data)
   });
}

function get_department_list(successCallback, errorCallback) {
   // TODO: handle errors
   $.getJSON('/volunteer/departments', function(data) {
      successCallback(data)
   });
}

function get_roles_list(successCallback, errorCallback) {
   // TODO: handle errors
   $.getJSON('/volunteer/roles', function(data) {
      successCallback(data)
   });
}