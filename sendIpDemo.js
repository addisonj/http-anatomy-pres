const raw = require('raw-socket')
const ip = require('ip')

function genTcp(srcIp, srcPort, destIp, destPort) {
  ...
}

function sendSyn(srcIp, srcPort, destIp, destPort) {
  const socket = raw.createSocket({protocol: raw.Protocol.TCP, addressFamily: raw.AddressFamily.IPv4})
  const ipBuffer = Buffer.from([
    0x45,                   // IP: Version (0x45 is IPv4)
    0x00,                   // IP: Differentiated Services Field
    0x00,0x3c,              // IP: Total Length
    0x00,0x00,              // IP: Identification
    0x40,                   // IP: Flags (0x20 Don't Fragment)
    0x00,                   // IP: Fragment Offset
    0x40,                   // IP: TTL (0x40 is 64)
    0x06,                   // IP: protocol (ICMP=1, IGMP=2, TCP=6, UDP=17, static value)
    0x00,0x00,              // IP: checksum for IP part of this packet
    0x00,0x00,0x00,0x00,    // IP: ip src
    0x00,0x00,0x00,0x00,    // IP: ip dst
  ])

  ipBuffer.writeUInt16BE(parseInt(Math.random()*0xffff), 4) // IP: set identification
  ip.toBuffer(src_ip, ipBuffer, 12) // IP: save ip src (src_ip var) into the buffer
  ip.toBuffer(dst_ip, ipBuffer, 16) // IP: save ip dst (dst_ip var) into the buffer

  raw.writeChecksum(ipBuffer, 10, raw.createChecksum(ipBuffer))

  function beforeSend() {
    socket.setOption(
      raw.SocketLevel.IPPROTO_IP,
      raw.SocketOption.IP_HDRINCL,
      new Buffer ([0x00, 0x00, 0x00, 0x01]),
      4
    )
  }

  const tcpBuffer = genTcp(srcIp, srcPort, destIp, destPort)
  const buffer = Buffer.concat([ipBuffer, tcpBuffer])
  socket.send(buffer, 0, buffer.length, destIp, beforeSend);

  // and that was just to send the first packet...
}
