// Note: This cannot be used in client files!

function Debug() {}
Debug.prototype = {
	activated: false,
	log: function(message) {
		if (this.activated) {
			console.log(message);
		}
	}
};
var Debug = new Debug();