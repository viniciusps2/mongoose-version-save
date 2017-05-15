const assert = require('assert')
const {wrap} = require('co')
const mongoose = require('mongoose')
const {Schema} = mongoose
const ObjectIdSchema = Schema.ObjectId
const ObjectId = mongoose.Types.ObjectId

module.exports = function (schema, childProps) {
  childProps = toArray(childProps)
  assert(childProps.length, 'Should define at least one prop of subdocuments')
  schema.set('saveErrorIfNotFound', true)

  childProps.map((childProp) => {
    const child = schema.path(childProp).schema
    child.add({lastVersion: ObjectIdSchema})

    child.pre('save', function (next) {
      if (!this.lastVersion) this.lastVersion = new ObjectId()
      this.previousModified = this.isModified()
      next()
    })
  })

  schema.methods.safeSave = wrap(function * () {
    const promises = []
    yield Promise.each(childProps, (childProp) => saveChildProps.call(this, childProp, promises))
    yield promises
    this.modifiedPathsCopy = undefined
  })
}

const saveChildProps = wrap(function * (childProp, promises) {
  yield Promise.each(this[childProp], wrap(function * (child, index) {
    if (!child.isModified()) return

    keepModifiedOnly.call(this, childProp, index)
    if (child.lastVersion) {
      this.$where = {[`${childProp}.${index}.${lastVersion}`]: child.lastVersion}
    }
    child.lastVersion = new ObjectId()
    yield wait(10)
    promises.push(this.save().catch(console.log))
  }).bind(this))
})

function keepModifiedOnly (prop, index) {
  this.modifiedPathsCopy = this.modifiedPathsCopy || this.modifiedPaths()
  this.modifiedPathsCopy.forEach((path) => {
    path.startsWith(prop + '.' + index) ? this.markModified(path) : this.unmarkModified(path)
  })
}

function toArray (val) {
  return val && Array.isArray(val) ? val : [val]
}

function wait (ml) {
  return new Promise((resolve) => setTimeout(resolve, ml || 1000))
}

function noop () {}
