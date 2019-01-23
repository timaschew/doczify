const fs = require('fs')
const path = require('path')

const walk = require('walk')

function walker(directory, handler, callback) {
    const walker = walk.walk(directory)
    let promise
    walker.on('file', function (parent, fileStats, next) {
        const filePath = path.resolve(parent, fileStats.name)
        const relative = path.relative(filePath, directory)
        const base = path.resolve(filePath, relative)
        const relativeFilePath = filePath.substr(base.length + 1)
        if (path.extname(fileStats.name) != '.md') {
            promise = handler(relativeFilePath)
            if (promise != null) {
                return promise.then(next).catch(console.error)
            } else {
                return next()
            }
        }
        fs.readFile(filePath, 'utf8', (err, content) => {
            if (err) {
                console.error(err)
                return next()
            }
            promise = handler(relativeFilePath, content)
            if (promise != null) {
                return promise.then(next).catch(console.error)
            } else {
                return next()
            }
        })
    })
    walker.on('errors', (_parent, _nodeStatsArray, next) => {
        console.log('error', arguments)
        return next()
    })
    walker.on('end', callback)
}

module.exports = function(directory, handler) {
    return new Promise((resolve, reject) => {
        walker(directory, handler, error => {
            if (error) {
                return reject(error)
            }
            return resolve()
        })
    })
}
