// Note: This cannot be used in client files!

function Debug() {}
Debug.prototype = {
	activated: true,
	log: function(message) {
		if (this.activated) {
			console.log(message);
		}
	}
};
var Debug = new Debug();