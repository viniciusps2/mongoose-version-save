const mongoose = require('mongoose')
const {Schema} = mongoose
const VersionPlugin = require('..')

const Child = Schema({
  name: String,
}, {timestamps: true})

Child.plugin(VersionPlugin)

module.exports = Child
