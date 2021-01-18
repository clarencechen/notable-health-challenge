if (process.env.NODE_ENV !== 'production')
	process.env = require('dotenv-safe').load().parsed

const db = require('./db.js')

const list_query = "SELECT id, first, last, appt_time, is_followup FROM appts WHERE doctor = $1 AND DATE_TRUNC('day', appt_time) = $2"
const check_cap = 'SELECT count(*) FROM appts WHERE doctor = $1 AND appt_time = $2'
const insert_query = 'INSERT INTO appts (first, last, doctor, appt_time, is_followup) VALUES ($1, $2, $3, $4, $5)'
const delete_query = 'DELETE FROM appts WHERE id = $1'

async function list_appts(doctor_id, appt_date) {
	const { rows: appts } = await db.query(list_query, [doctor_id, appt_date])
	return {success: true, appts: appts}
}

async function create_appt(data) {
	const fifteen_mins = 1000 * 60 * 15
	const rounded_time = new Date(Math.round(new Date(data.time) / fifteen_mins) * fifteen_mins)
	const { rows: num } = await db.query(check_cap, [data.doctor, rounded_time])
	if (num[0].count > 3) {
		return {success: false, reason: "Doctor is booked to capacity at this time."}
	}
	const r = await db.query(insert_query, [data.first, data.last, data.doctor, rounded_time, data.is_followup])
	return {success: true, }
}

async function delete_appt(id) {
	const { rowcount } = await db.query(delete_query, [id])
	if (rowcount == 0) {
		return {success: false, reason: "Appointment with specified ID not found."}
	}
	return {success: true}
}


exports.list = function(req, res, next) {
	list_appts(req.params.id, req.params.date)
		.then((out) => res.json(out))
		.catch((e) => res.status(500).json(e))
}

exports.create = function(req, res, next) {
	create_appt(req.body)
		.then((out) => res.json(out))
		.catch((e) => res.status(500).json(e))
}

exports.delete = function(req, res, next) {
	delete_appt(req.body.id)
		.then((out) => res.json(out))
		.catch((e) => res.status(500).json(e))
}