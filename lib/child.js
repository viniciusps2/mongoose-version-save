const wrapSchema = require('mongoose-async-class')
const mongoose = require('mongoose')
const {Schema} = mongoose
const ObjectIdSchema = Schema.ObjectId
const ObjectId = mongoose.Types.ObjectId
const Status = require('./status')

class Child extends Schema {
  constructor () {
    super({
      name: String,
      status: {type: Status, default: {}},
      lastVersion: ObjectIdSchema
    }, {timestamps: true, versionKey: false})

    this.post('init', function () {
      this.original = this.toObject()
    })

    this.pre('save', function (next) {
      console.log('pre save childs')
      next()
    })
  }

  * saveHistory () {
    if (this.previousModified) {
      console.log('saving history for', this.original, this)
    }
  }
}

module.exports = wrapSchema(Child)
