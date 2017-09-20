const path = require('path')
const express = require('express')
const jspRender = require('../')

let app = express();
app.use(express.static(path.join(__dirname, 'static')));

const jsp = new jspRender({
	root: path.join(__dirname, 'jsp'),
	tags: {
		foo: {
			bar() {
				return "<h2>Baz</h2>";
			}
		}
	},
	globals: {
		name: 'John Doe',
		currentYear: new Date().getFullYear()
	}
});

app.get('/', (req, res) => {
	res.send(jsp.render('page/test.jsp', {
		errorMessage: '',
		x: 2,
		sweets: [
			'muffins',
			'donuts',
			'shortbreads'
		],
		form: {
			action: '/form.do',
			userName: 'john',
			userEmail: 'john.doe@company.com',
		}
	}));
});

app.listen('8080');

console.log('started on 8080...');
