'use strict';

function authenticate(req, res, next) {
	if(req.session && req.session.user)
		next()
	else
		return res.status(401).send('Permission Denied')
}

module.exports = function(app) {
	const options = {root: '/app/public'}

	app.route('/').get((req, res, next) => {
		//main page
		if(req.session && req.session.user)
			res.sendFile('chat.html', options)
		else
			res.sendFile('login.html', options)
	})
}
