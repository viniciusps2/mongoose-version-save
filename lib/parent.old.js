const {wrap} = require('co')
const wrapSchema = require('mongoose-async-class')
const mongoose = require('mongoose')
const Promise = require('bluebird')
const {Schema} = mongoose
const ObjectIdSchema = Schema.ObjectId
const ObjectId = mongoose.Types.ObjectId

const Child = require('./child')

class Parent extends Schema {
  constructor () {
    super({
      message: String,
      lastVersion: ObjectIdSchema,
      children: [Child]
    }, {timestamps: true, versionKey: false, saveErrorIfNotFound: true})

    this.post('save', function(error, res, next) {
      console.log('save error',error, res)
     // if (error instanceof MongooseError.DocumentNotFoundError) {
     //   error = new Error('Somebody else updated the document!')
     // }
     next(error)
    })
  }

  * saveChidren () {
    const promises = []
    yield Promise.each(this.children, wrap(function * (child, index) {
      if (!child.isModified()) return

      this.keepModifiedOnly('children', index)
      if (child.lastVersion) {
        this.$where = {['children.' + index + '.lastVersion']: child.lastVersion}
      }
      child.lastVersion = new ObjectId()
      yield wait(10)
      promises.push(this.save().catch(console.log))
    }).bind(this))

    yield promises
    this.modifiedPathsCopy = undefined
  }

  keepModifiedOnly (prop, index) {
    this.modifiedPathsCopy = this.modifiedPathsCopy || this.modifiedPaths()
    this.modifiedPathsCopy.forEach((path) => {
      path.startsWith(prop + '.' + index) ? this.markModified(path) : this.unmarkModified(path)
    })
  }

  * saveChildsHistory () {
    console.log('saving history for items')
    yield this.children.map((child) => child.saveHistory())
  }
}

module.exports = mongoose.model('Parent', wrapSchema(Parent))

function wait (ml) {
  return new Promise((resolve) => setTimeout(resolve, ml || 1000))
}

function noop () {}