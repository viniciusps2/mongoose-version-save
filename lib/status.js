const wrapSchema = require('mongoose-async-class')
const mongoose = require('mongoose')
const {Schema} = mongoose
const ObjectIdSchema = Schema.ObjectId

class Status extends Schema {
  constructor () {
    super({
      statusType: {type: String}
    }, {toJSON: {transform: toJSONTransform}})

    this.post('init', function () {
      console.log('st init')
      this.ok2 = 2
    })

  }

  tr () {
  }
}

function toJSONTransform (doc, ret) {
  ret.ok = 11
  ret.ok2 = doc.ok2
}

module.exports = wrapSchema(Status)
