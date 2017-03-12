
function get_volunteer_list(successCallback, errorCallback) {
   // TODO: handle errors
   $.getJSON('/volunteer/volunteers', function(data) {
      successCallback(data)
   });
}