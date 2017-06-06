const mongoose = require('mongoose')
const {Schema} = mongoose

const Child = require('./child')
const VersionPlugin = require('..')

const Parent = Schema({
  one: {type: String, persist: false},
  message: String,
  children: [Child],
  other: {children: [Child]},
}, {timestamps: true})

Parent.plugin(VersionPlugin)

module.exports = mongoose.model('Parent', Parent)
