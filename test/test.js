var path = require('path')
var express = require('express')
var jspRender = require('../')

var app = express()

app.use(express.static(path.join(__dirname, 'static')))

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
		form: {
			action: '/form.do',
			userName: 'john',
			userEmail: 'john.doe@company.com',
		}
	}));
})

app.listen('8080')

console.log('started on 8080...')