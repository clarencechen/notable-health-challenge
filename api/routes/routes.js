'use strict';

const doctors = require('../controllers/doctors.js')
const appointments = require('../controllers/appts.js')

function authenticate(req, res, next) {
	if(req.session && req.session.user)
		next()
	else
		return res.status(401).send('Permission Denied')
}

module.exports = function(app) {
	const options = {root: '/app/public'}

	app.param('id', doctors.find_doctor)
	app.route('/').get((req, res, next) => {
		//main page
		if(req.session && req.session.user)
			res.sendFile('chat.html', options)
		else
			res.sendFile('login.html', options)
	})
	app.route('/doctors').get(doctors.list_all)
	app.route('/appts/:id/:date').get(appointments.list)
	app.route('/appts').post(appointments.create)
	.delete(appointments.delete)
}
