'use strict'

module.exports = function (schema) {
  schema.add({_lastVersion: {type: Number, default: () => new Date().getTime()}})
  schema.set('saveErrorIfNotFound', true)
  schema.set('versioning', true)

  const childProps = getChildFields(schema.paths)
  schema.childSchemas.forEach((child) => child.set('_isChild', true))

  schema.pre('save', function (next) {
    const isParent = !schema.get('_isChild')
    const isParentModified = isParent && checkParentModified(childProps, this.modifiedPaths())
    const isChildModified = !isParent && this.isModified()

    if (isParentModified || isChildModified) {
      if (this._lastVersion) this._previousLastVersion = this._lastVersion
      this._lastVersion = new Date().getTime()
    }

    if (isParent) {
      const modifiedPaths = this.modifiedPaths()
      this.$where = this.$where || {}

      modifiedPaths.forEach((path) => updateWhere.call(this, path))

      if (!modifiedPaths.length) {
        this.markModified('__patch_to_avoid_error_on_save_empty')
      }
    }

    next()
  })

  schema.post('save', function(error, res, next) {
   if (error.name === 'DocumentNotFoundError') {
     error = new Error('Somebody else updated the document!')
   }
   next(error)
  })
}

function updateWhere (pathStr) {
  const path = pathStr.split('.')
  if (path[path.length - 1] !== '_lastVersion') return

  path[path.length - 1] = '_previousLastVersion'    
  const previous = path.length > 1 ? this.get(path.join('.')) : this._previousLastVersion
  previous && (this.$where[pathStr] = previous)
}

function checkParentModified (childProps, paths) {
  for (let path of paths) {
    let firstPath = path.split('.')[0]
    if (childProps.indexOf(firstPath) === -1 && firstPath !== 'updatedAt') return true
  }
  return false
}

function getChildFields (pathsObj) {
  return Object.keys(pathsObj).map((path) => {
    const def = pathsObj[path]
    if (def.constructor.name === 'DocumentArray') {
      return def.schema && def.schema.options && def.schema.options.versioning && path
    }
  })
  .filter(Boolean)
}
