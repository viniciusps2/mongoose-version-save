const mongoose = require('mongoose')

mongoose.connect('localhost', 'child_test')
mongoose.Promise = Promise
mongoose.set('debug', true)
