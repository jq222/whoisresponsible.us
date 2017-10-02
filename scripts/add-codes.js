
const jsonfile = require('jsonfile')
const contributions = require('../src/resources/contributions.json')
const codes = require('../src/resources/codes.json')
const file = 'contributes-new.json'
const obj = contributions.map(t => {
  const newT = Object.assign({}, t)
  const code = codes.find(c => c.country.toLowerCase() === t.Country.toLowerCase())
  if (!code) console.log('missing', t.Country)
  newT.code = (code || {}).code || ''
  return newT
})

jsonfile.writeFile(file, obj, console.error)
