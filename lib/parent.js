const {wrap} = require('co')
const wrapSchema = require('mongoose-async-class')
const mongoose = require('mongoose')
const Promise = require('bluebird')
const {Schema} = mongoose
const ObjectIdSchema = Schema.ObjectId
const ObjectId = mongoose.Types.ObjectId

const Child = require('./child')
const SafeSave = require('./safe-save-plugin')

class Parent extends Schema {
  constructor () {
    super({
      message: String,
      lastVersion: ObjectIdSchema,
      children: [Child]
    }, {timestamps: true, versionKey: false})

    this.plugin(SafeSave, ['children'])

    this.post('save', function(error, res, next) {
      console.log('save error',error, res)
     // if (error instanceof MongooseError.DocumentNotFoundError) {
     //   error = new Error('Somebody else updated the document!')
     // }
     next(error)
    })

  }

  * saveChildsHistory () {
    console.log('saving history for items')
    yield this.children.map((child) => child.saveHistory())
  }
}

module.exports = mongoose.model('Parent', wrapSchema(Parent))
