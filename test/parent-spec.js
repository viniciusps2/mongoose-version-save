const Parent = require('../lib/parent')
// const Child = require('../lib/child')

describe('parent-child', () => {
  beforeEach(function * () {
    yield Parent.remove()
  })

  it('should save', function * () {
    yield Parent.create({message: 'kkk', children: [{name: 'lll'}, {name: 'jjj'}]})
    const parent = yield Parent.findOne()
    const [child] = parent.children
    child.name = 'bbb'
    // child.status.statusType = 'st1'
    yield parent.save()
    const parentSaved = yield Parent.findOne()

    console.log('parentSaved', JSON.stringify(parentSaved.toObject(), null, 2))
    console.log('parentSaved', JSON.stringify(parentSaved.toJSON(), null, 2))
    console.log(' parentSaved.children[0].toJSON()',parentSaved.children[0].toJSON())
    expect(parentSaved.children[0].name).to.be.eq('bbb')
  })

  it('should not save when someone edited', function * () {
    yield Parent.create({message: 'kkk', children: [{name: 'lll'}, {name: 'jjj'}]})
    console.log('--')
    const parent = yield Parent.findOne()
    const parent2 = yield Parent.findOne()
    const [child] = parent.children
    const [child2] = parent2.children

    child.name = 'bbb'
    yield parent.save()

    child2.name = 'ppp'
    yield expect(parent2.save()).to.eventually.rejectedWith(Error)
  })

  it.only('should safe save', function * () {
    yield Parent.create({message: 'kkk', children: [{name: 'lll'}, {name: 'jjj'}]})
    console.log('--')
    const parent = yield Parent.findOne()

    parent.children[0].name = 'bbb'
    parent.children[1].name = 'ccc'

    // yield parent.save()
    yield parent.safeSave()

    // yield parent.saveChildsHistory()

    // const parent2 = yield Parent.findOne()
    // parent2.children[0].name = 'BBB'
    // yield parent2.saveChidren()


    const parentSaved = yield Parent.findOne()
    console.log(' parentSaved',parentSaved)
    // expect(parentSaved.children[0].name).to.be.eq('bbb')
    // expect(parentSaved.children[1].name).to.be.eq('ccc')
    // yield expect(parent2.save()).to.eventually.rejectedWith(Error)
  })
})