// require all modules
var _ = require('lodash')
var Buffer = require('Buffer')
var fs = require('fs')

/*
* LSDSNG class
*/
function LSDSNG(buffer) {
  // check if param is string
  if (_.isString(buffer)) {
    // GO GET IT, JOHNSON !
    buffer = fs.readFileSync(buffer)
  } else if (!Buffer.isBuffer(buffer)){
    throw "Could not read buffer"
  }

  // get name of the song
  this.title = _.map(_.range(8), function(i) {
    return String.fromCharCode(buf.readUInt8(i))
  }).join('')
  // get version
  this.version = buf.readUInt8(8)
  // get raw data
  this.data = this.unpack(buffer)
  // parse data

}

LSDSNG.unpack = function(buffer) {
  // initialize counter and raw data container
  var rawdata = []
  var i = 9

  // let's do a loop-dee-loop
  while (i < buffer.length) {
      // get data
      var current = buffer.readUInt8(i)
      // increment counter
      i = i+1

      // check type
      switch(current) {
        // run length encoding
        case 0xC0:
          // get directive
          var directive = buffer.readUInt8(i)
          i = i+1
          // check directive
          if (directive == 0xC0) {
            rawdata.append(0xC0)
          } else {
            // get count
            var count = buffer.readUInt8(i)
            i = i+1
            // add directive, exactly count times
            rawdata.concat(Array.apply(null, Array(count)).map(Number.prototype.valueOf, directive))
          }
          break

        // special action byte
        case 0xE0:
          // get directive
          var directive = buffer.readUInt8(i)
          i = i+1

          // check directive
          if (directive == 0xE0) {        // special byte
            // add special byte instruction
            rawdata.push(0xE0)
          } else if (directive == 0xF0) { // default wave byte
            // get count
            var count = buffer.readUInt8(i)
            i = i+1
            // add data
            _.times(count, function() { rawdata.concat([0x8e, 0xcd, 0xcc, 0xbb, 0xaa, 0xa9, 0x99, 0x88, 0x87, 0x76, 0x66, 0x55, 0x54, 0x43, 0x32, 0x31]) })
          } else if (directive == 0xF1) { // default instrument byte
            // get count
            var count = buffer.readUInt8(i)
            i = i+1
            // add data
            _.times(count, function() { rawdata.concat([0xa8, 0, 0, 0xff, 0, 0, 3, 0, 0, 0xd0, 0, 0, 0, 0xf3, 0, 0]) })
          } else if (directive == 0xFF) { // eof byte
            throw "Unexpected EOF command encountered while decompressing"
          } else {
            throw "Unexpected sequence " + current + " " + directive
          }
          break

        // data
        default:
          rawdata.push(current)
          break
      }
  // export data (god, finally)
  return raw_data
}

// exports
module.exports = LSDSNG
