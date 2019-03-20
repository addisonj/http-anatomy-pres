const raw = require('raw-socket')
const ip = require('ip')

function sendSyn(srcIp, srcPort, destIp, destPort) {
  const socket = raw.createSocket({protocol: raw.Protocol.TCP, addressFamily: raw.AddressFamily.IPv4})
  const tcpBuffer = Buffer.from([
    0x00,0x00,              // TCP: src port (should be random)
    0x00,0x00,              // TCP: dst port (should be the port you want to connect to)
    0x00,0x00,0x00,0x00,    // TCP: sequence number (should be random)
    0x00,0x00,0x00,0x00,    // TCP: acquitment number (must be null because WE are intiating the SYN, static value)
    0x00,0x02,              // TCP: header length (data offset) && flags (fin=1,syn=2,rst=4,psh=8,ack=16,urg=32, static value)
    0x72,0x10,              // TCP: window
    0x00,0x00,              // TCP: checksum for TCP part of this packet)
    0x00,0x00,              // TCP: ptr urgent
    0x02,0x04,              // TCP: options
    0x05,0xb4,              // TCP: padding (mss=1460, static value)
    0x04,0x02,              // TCP: SACK Permitted (4) Option
    0x08,0x0a,              // TCP: TSval, Length
      0x01,0x75,0xdd,0xe8,  // value
      0x00,0x00,0x00,0x00,  // TSecr
    0x01,                   // TCP: NOP
    0x03,0x03,0x07          // TCP: Window scale
 ])

  tcpBuffer.writeUInt32BE(parseInt(Math.random()*0xffffffff), 4) // TCP: create random sequence number
  tcpBuffer.writeUInt8(tcpBuffer.length << 2, 12) // TCP: write Header Length
  tcpBuffer.writeUInt16BE(srcPort, 0) // TCP: save src port into the buffer
  tcpBuffer.writeUInt16BE(destPort, 2) // TCP: save dst port into the buffer

  const pseudoBuffer = new Buffer.from([
    0x00,0x00,0x00,0x00,    // IP: ip src
    0x00,0x00,0x00,0x00,    // IP: ip dst
    0x00,
    0x06, // IP: protocol (ICMP=1, IGMP=2, TCP=6, UDP=17, static value)
    (tcpBuffer.length >> 8) & 0xff, tcpBuffer.length & 0xff
  ])
  ip.toBuffer(srcIp, pseudoBuffer, 0) // IP: save ip src into the buffer
  ip.toBuffer(destIp, pseudoBuffer, 4) // IP: save ip dst into the buffer
  pseudoBuffer = Buffer.concat([pseudoBuffer, tcpBuffer])

  raw.writeChecksum(tcpBuffer, 16, raw.createChecksum(pseudoBuffer))
  socket.send(tcpBuffer, 0, tcpBuffer.length, destIp)

  // and that was just to send the first packet...
}
