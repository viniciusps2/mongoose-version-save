# mongoose-version-save
Protect your documents in MongoDB (Mongoose) from concurrency error while saving.

This plugin adds a version check when saving the document, or subdocuments (array of objects within a schema). Allows concurrency when saving subdocuments, and throws error when there is a change in the same subdocument.

## Install

npm i viniciusps2/mongoose-version-save

## Using

```
const VersionSavePlugin = require('mongoose-version-save')

const ChildSchema = Schema({
  name: String,
  age: Number
})

ChildSchema.plugin(VersionSavePlugin)

const ParentSchema = Schema({
  name: String,
  age: Number,
  children: [Child],
})

ParentSchema.plugin(VersionSavePlugin)

module.exports = mongoose.model('Parent', ParentSchema)

```
