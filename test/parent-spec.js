const Parent = require('./parent')

describe('parent-child', () => {
  beforeEach(function * () {
    yield Parent.remove()
  })

  it('should not throw when save without changes', function * () {
    yield Parent.create({message: 'kkk', children: [{name: 'lll'}, {name: 'jjj'}]})
    const parent = yield Parent.findOne()
    yield parent.save()
    const parentSaved = yield Parent.findOne()

    expect(parentSaved.children[0].name).to.be.eq('lll')
  })

  it('should not save when someone edited one child', function * () {
    yield Parent.create({message: 'kkk', children: [{name: 'lll'}, {name: 'jjj'}]})
    const parent = yield Parent.findOne()
    const parent2 = yield Parent.findOne()
    const [child] = parent.children
    const [child2] = parent2.children

    child.name = 'bbb'
    yield parent.save()

    child2.name = 'ppp'
    yield expect(parent2.save()).to.eventually.rejectedWith(Error)
  })

  it('should not save when someone edited parent', function * () {
    yield Parent.create({message: 'kkk', children: [{name: 'lll'}, {name: 'jjj'}]})
    const parent = yield Parent.findOne()
    const parent2 = yield Parent.findOne()

    parent.message = 'bbb'
    console.log(' parent.lastVersion',parent.lastVersion)
    yield parent.save()

    parent2.message = 'ccc'
    yield expect(parent2.save()).to.eventually.rejectedWith(Error)
  })

  it('when someone edit item 1, and other edit item 2, should save', function * () {
    yield Parent.create({message: 'kkk', children: [{name: 'lll'}, {name: 'jjj'}]})
    const parent = yield Parent.findOne()
    const parent2 = yield Parent.findOne()

    parent.children[0].name = 'bbb'
    parent2.children[1].name = 'ccc'
    parent2.message = 'okkk1'

    yield parent.save()
    yield parent2.save()

    const parentSaved = yield Parent.findOne()
    expect(parentSaved.children[0].name).to.be.eq('bbb')
    expect(parentSaved.children[1].name).to.be.eq('ccc')
  })
})