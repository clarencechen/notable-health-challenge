if (process.env.NODE_ENV !== 'production')
	process.env = require('dotenv-safe').load().parsed

const db = require('./db.js')

const list_query = 'SELECT id, first, last FROM doctors'
const find_query = 'SELECT first, last FROM doctors WHERE id = $1'

async function list_all() {
	const { rows: doctors } = await db.query(list_query)
	return {success: true, doctors: doctors}
}

async function find_doctor(id) {
	const { rows: doctors } = await db.query(find_query, [id])
	if (doctors.length < 1) {
		return {success: false, reason: "Doctor not found."}
	}
	return {success: true}
}

exports.list_all = function(req, res, next) {
	list_all()
		.then((out) => res.json(out))
		.catch((e) => res.status(500).json(e))
}

exports.find_doctor = function(req, res, next, id) {
	find_doctor(id)
		.then((out) => {
			if (!out.success) {
				res.status(400).json(out)
			} else {
				next()
			}
		}).catch((e) => res.status(500).json(e))
}