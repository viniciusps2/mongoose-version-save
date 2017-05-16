const assert = require('assert')
const {wrap} = require('co')
const mongoose = require('mongoose')
const {Schema} = mongoose
const ObjectIdSchema = Schema.ObjectId
const ObjectId = mongoose.Types.ObjectId

// const {each} = require('bluebird')

const each = (tasks, fn) => {
  let index = 0
  return tasks.reduce((promise, task) => promise.then(() => fn(task, index++)), Promise.resolve())
}

const toArray = (val) => val && Array.isArray(val) ? val : [val]
const wait = (ml) => new Promise((resolve) => process.nextTick(resolve))
// const wait = (ml) => new Promise((resolve) => setTimeout(resolve, ml || 1000))
// function noop () {}

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
    yield each(childProps, (childProp) => saveChildProps.call(this, childProp, promises))
    yield promises
    this.modifiedPathsCopy = undefined
  })
}

const saveChildProps = wrap(function * (childProp, promises) {
  yield each(this[childProp], wrap(function * (child, index) {
    console.log(' child',child.isModified(), child)
    if (!child.isModified()) return

    keepModifiedOnly.call(this, childProp, index)

    if (child.lastVersion) {
      this.$where = {[`${childProp}.${index}.${lastVersion}`]: child.lastVersion}
    }

    child.lastVersion = new ObjectId()
    yield wait(30)

    promises.push(this.save().catch(console.log))
  }).bind(this))
})

function keepModifiedOnly (prop, index) {
  console.log(' prop,index',prop,index)
  this.modifiedPathsCopy = this.modifiedPathsCopy || this.modifiedPaths()
  this.modifiedPathsCopy.forEach((path) => {
    console.log(' path',path, path.startsWith(prop + '.' + index))
    path.startsWith(prop + '.' + index) ? this.markModified(path) : this.unmarkModified(path)
  })
}
