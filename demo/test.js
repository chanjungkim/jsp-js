const path = require('path');
const express = require('express');
const JSPJs = require('../').Renderer;

let app = express();
app.use(express.static(path.join(__dirname, 'static')));

const jsp = new JSPJs({
    root: [
        path.join(__dirname, 'jsp'),
        path.join(__dirname, 'jsp2')
    ],
    tags: {
        foo: {
            bar() {
                return '<h2>Baz</h2>';
            }
        }
    },
    globals: {
        name: 'John Doe',
        currentYear: new Date().getFullYear()
    }
});

app.get('/test', (req, res) => {
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
            userEmail: 'john.doe@company.com'
        }
    }));
});

app.get('/test2', (req, res) => {
    res.send(jsp.render('page/test2.jsp', {pageTitle: 'Template inheritance'}));
});

app.listen('8080');

console.log('started on 8080...');
