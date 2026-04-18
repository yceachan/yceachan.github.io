# ATT Concepts (属性类型, Handle, 权限)

> 本文档提取自 Vol 3, Part F Attribute Protocol (ATT)。

### Page 1492 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part F Page 1493
Attribute Protocol (ATT)
2 PROTOCOL OVERVIEW
The Attribute Protocol defines two roles; a server role and a client role. It allows a server
to expose a set of attributes to a client that are accessible using the Attribute Protocol.
An attribute is a discrete value that has the following three properties associated with it:
a. attribute type, defined by a UUID
b. attribute handle
c. a set of permissions that are defined by each higher layer specification that utilizes
the attribute; these permissions cannot be accessed using the Attribute Protocol.
The attribute type specifies what the attribute represents. Bluetooth SIG defined
attribute types are defined in Assigned Numbers and used by an associated higher
layer specification. Non-Bluetooth SIG attribute types may also be defined.
The attribute handle uniquely identifies an attribute on a server, allowing a client to
reference the attribute in read or write requests; see Section 3.4.4, Section 3.4.5,
and Section 3.4.6. It allows a client to uniquely identify the attribute being notified or
indicated, see Section 3.4.7. Clients are able to discover the handles of the server’s
attributes; see Section 3.4.3. Permissions may be applied to an attribute to prevent
applications from obtaining or altering an attribute’s value. An attribute may be defined
by a higher layer specification to be readable or writable or both, and may have
additional security requirements. For more information, see Section 3.2.5.
A client may send Attribute Protocol requests to a server, and the server shall respond
to all requests that it receives. A device can implement both client and server roles,
and both roles can function concurrently in the same device and between the same
devices. There shall be only one instance of a server on each Bluetooth device; this
implies that the attribute handles shall be identical for all supported bearers. For a given
client, the server shall have one set of attributes, which shall have the same value and
properties irrespective of which bearer is used. The server can support multiple clients.
The attribute values can be the same or different for each client as defined by GATT or
a higher layer specification.
Note: Multiple services may be exposed on a single server by allocating separate
ranges of handles for each service. The discovery of these handle ranges is defined by
a higher layer specification.
The Attribute Protocol has notification and indication capabilities that provide an efficient
way of sending attribute values to a client without the need for them to be read; see
Section 3.3.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1493 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part F Page 1494
Attribute Protocol (ATT)
All Attribute Protocol requests are sent over an ATT bearer. There can be multiple ATT
bearers established between two devices. Each ATT bearer uses a separate L2CAP
channel and can have a different configuration.
In LE, there is a single ATT bearer that uses a fixed channel that is available as soon
as the ACL connection is established. Additional ATT bearers can be established using
L2CAP (see Section 3.2.11).
In BR/EDR, one or more ATT bearers can be established using L2CAP (see
Section 3.2.11).
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1494 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part F Page 1495
Attribute Protocol (ATT)
3 PROTOCOL REQUIREMENTS
3.1 Introduction
Each attribute has an attribute type that identifies, by means of a UUID (Universally
Unique IDentifier), what the attribute represents so that a client can understand the
attributes exposed by a server. Each attribute has an attribute handle that is used for
accessing the attribute on a server, as well as an attribute value.
An attribute value is accessed using its attribute handle. The attribute handles are
discovered by a client using Attribute Protocol PDUs (Protocol Data Unit). Attributes that
have the same attribute type may exist more than once in a server. Attributes also have
a set of permissions that controls whether they can be read or written, or whether the
attribute value shall be sent over an encrypted link. Security aspects of the Attribute
Protocol are defined in Section 4.
3.2 Basic concepts
3.2.1 Attribute type
A universally unique identifier (UUID) is used to identify every attribute type. A UUID is
considered unique over all space and time. A UUID can be independently created by
anybody and distributed or published as required. There is no central registry for UUIDs,
as they are based off a unique identifier that is not duplicated. The Attribute Protocol
allows devices to identify attribute types using UUIDs regardless of the local handle
used to identify them in a read or write request.
Universal unique identifiers are defined in SDP [Vol 3] Part B, Section 2.5.1.
All 32-bit Attribute UUIDs shall be converted to 128-bit UUIDs when the Attribute UUID
is contained in an ATT PDU.
3.2.2 Attribute handle
An attribute handle is a 16-bit value that is assigned by each server to its own attributes
to allow a client to reference those attributes. An attribute handle shall not be reused
while an ATT bearer exists between a client and its server.
Attribute handles on any given server shall have unique, non-zero values. Attributes are
ordered by attribute handle.
An attribute handle of value 0x0000 is reserved for future use. An attribute handle of
value 0xFFFF is known as the maximum attribute handle.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1495 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part F Page 1496
Attribute Protocol (ATT)
Note: Attributes can be added or removed while an ATT bearer is established; however,
an attribute that has been removed cannot be replaced by another attribute with the
same handle while any ATT bearer is established.
3.2.3 Attribute handle grouping
Grouping is defined by a specific attribute placed at the beginning of a range of other
attributes that are grouped with that attribute, as defined by a higher layer specification.
Clients can request the first and last handles associated with a group of attributes.
3.2.4 Attribute value
An attribute value is an octet array that may be either fixed or variable length. For
example, it can be a one octet value, or a four octet integer, or a variable length string.
An attribute may contain a value that is too large to transmit in a single PDU and can be
sent using multiple PDUs. The values that are transmitted are opaque to the Attribute
Protocol. The encoding of these octet arrays is defined by the attribute type.
When transmitting attribute values in a request, a response, a notification or an
indication, the attribute value length is not sent in any field of the majority of PDUs.
The length of a variable length field in those PDUs is implicitly given by the length of the
packet that carries this PDU. This implies that:
• Only one attribute value can be placed in a single request, response, notification
or indication unless the attribute values have lengths known by both the server and
client, as defined by the attribute type.
• This attribute value will always be the only variable length field of a request,
response, notification or indication.
• The bearer protocol (e.g. L2CAP) preserves datagram boundaries.
Note: Some responses include multiple attribute values, for example when client
requests multiple attribute reads. For the client to determine the attribute value
boundaries, the attribute values must have a fixed size defined by the attribute type.
There are some PDUs where the length of attribute values is included as a field within
the PDU and therefore the above implications do not apply to these PDUs.
3.2.5 Attribute permissions
An attribute has a set of permission values associated with it. The permissions
associated with an attribute specifies that it may be read and/or written. The
permissions associated with the attribute specifies the security level required for read
and/or write access, as well as notification and/or indication. The permissions of a given
attribute are defined by a higher layer specification, and are not discoverable using the
Attribute Protocol.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1496 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part F Page 1497
Attribute Protocol (ATT)
If access to a secure attribute requires an authenticated link, and the client
is not already authenticated with the server with sufficient security, then an
ATT_ERROR_RSP PDU shall be sent with the Error Code parameter set to Insufficient
Authentication (0x05). When a client receives this error code it may try to authenticate
the link, and if the authentication is successful, it can then access the secure attribute.
If access to a secure attribute requires an encrypted link, and the link is not encrypted,
then an ATT_ERROR_RSP PDU shall be sent with the Error Code parameter set to
Insufficient Encryption (0x0F). When a client receives this error code it may try to
encrypt the link and if the encryption is successful, it can then access the secure
attribute.
If access to a secure attribute requires an encrypted link, and the link is encrypted but
with an encryption key size that is too short for the level of security required, then an
ATT_ERROR_RSP PDU shall be sent with the Error Code parameter set to Encryption
Key Size Too Short (0x0C). When a client receives this error code it may try to encrypt
the link with a longer key size, and if the encryption is successful, it can then access the
secure attribute.
Attribute permissions are a combination of access permissions, encryption permissions,
authentication permissions and authorization permissions.
The following access permissions are possible:
• Readable
• Writable
• Readable and writable
The following encryption permissions are possible:
• Encryption required
• No encryption required
The following authentication permissions are possible:
• Authentication required
• No authentication required
The following authorization permissions are possible:
• Authorization required
• No authorization required
Encryption, authentication, and authorization permissions can have different
possibilities; for example, a specific attribute could require a particular kind of
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1497 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part F Page 1498
Attribute Protocol (ATT)
authentication or a certain minimum encryption key length. An attribute can have
several combinations of permissions that apply; for example, a specific attribute could
allow any of the following:
• Read if encrypted (authentication not required)
• Write if authenticated and encrypted
• Read or write if authenticated and authorized (irrespective of encryption)
Access permissions are used by a server to determine if a client can read and/or write
an attribute value.
Encryption permissions are used by a server to determine if an encrypted physical link
is required when a client attempts to access an attribute or if the server is going to send
a notification or indication to a client.
Authentication permissions are used by a server to determine if an authenticated
physical link is required when a client attempts to access an attribute. Authentication
permissions are also used by a server to determine if an authenticated physical link is
required before sending a notification or indication to a client.
Authorization permissions determine if a client needs to be authorized before accessing
an attribute value.
Different bearers for the same client may be on links with different security properties.
Therefore, the server must not assume that when a client has been authenticated on
the link carrying one bearer, it has been authenticated on all bearers. The different
security properties might have other implications that an implementation needs to take
into account.
3.2.6 Control-point attributes
Attributes that cannot be read, but can only be written, notified or indicated are called
control-point attributes. These control-point attributes can be used by higher layers
to enable device specific procedures, for example the writing of a command or the
indication when a given procedure on a device has completed.
3.2.7 Protocol methods
The Attribute Protocol uses methods defined in Section 3.4 to find, read, write,
notify, and indicate attributes. A method is categorized as either a command, a
request, a response, a notification, an indication, or a confirmation; see Section 3.3.
Some Attribute Protocol PDUs can also include an Authentication Signature, to allow
authentication of the originator of this PDU without requiring encryption. The method
and signed bit are known as the opcode.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1498 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part F Page 1499
Attribute Protocol (ATT)
3.2.8 Exchanging MTU size
ATT_MTU is defined as the maximum size of any packet sent between a client and a
server. A higher layer specification defines the default ATT_MTU value.
When using an L2CAP channel with a fixed CID, the client and server may
exchange the maximum size of a packet that can be received using the
ATT_EXCHANGE_MTU_REQ and ATT_EXCHANGE_MTU_RSP PDUs. Both devices
then use the minimum of these exchanged values for all further communication (see
Section 3.4.2). A device that is acting as a server and client at the same time shall use
the same value for Client Rx MTU and Server Rx MTU.
When using an L2CAP channel with a dynamically allocated CID, the ATT_MTU shall
be set to the L2CAP MTU size.
The ATT_MTU value is a per ATT bearer value. A device with multiple ATT bearers may
have a different ATT_MTU value for each ATT bearer.
3.2.9 Long attribute values
The longest attribute that can be sent in a single packet is (ATT_MTU-1) octets in size.
At a minimum, the Attribute Opcode is included in an Attribute PDU.
An attribute value may be defined to be larger than (ATT_MTU-1) octets in size. These
attributes are called long attributes.
To read the entire value of an attributes larger than (ATT_MTU-1) octets, the
ATT_READ_BLOB_REQ PDU is used. It is possible to read the first (ATT_MTU-1)
octets of a long attribute value using the ATT_READ_REQ PDU.
To write the entire value of an attribute larger than (ATT_MTU-3) octets, the
ATT_PREPARE_WRITE_REQ and ATT_EXECUTE_WRITE_REQ PDUs are used. It
is possible to write the first (ATT_MTU-3) octets of a long attribute value using the
ATT_WRITE_CMD PDU.
It is not possible to determine if an attribute value is longer than (ATT_MTU-3) octets
using this protocol. A higher layer specification will state that a given attribute can have
a maximum length larger than (ATT_MTU-3) octets.
The maximum length of an attribute value shall be 512 octets.
Note: The protection of an attribute value changing when reading the value using
multiple Attribute Protocol PDUs is the responsibility of the higher layer.
3.2.10 Atomic operations
The server shall treat each request or command as an atomic operation that cannot be
affected by another ATT bearer sending a request or command at the same time. If an
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1499 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part F Page 1500
Attribute Protocol (ATT)
ATT bearer is terminated for any reason (user action or loss of the radio link), the value
of any modified attribute is the responsibility of the higher layer specification.
Long attributes cannot be read or written in a single atomic operation.
3.2.11 ATT bearers
An ATT bearer is a channel used to send Attribute Protocol PDUs. Each ATT bearer
uses an L2CAP channel which shall be either a dynamically allocated channel or the
LE Attribute Protocol fixed channel (see [Vol 3] Part A, Section 2.1). A device may have
any number of dynamically allocated channels and at most one fixed channel as ATT
bearers to a peer device.
An ATT bearer connects an ATT Client on one device to an ATT Server on the peer
device and may also connect an ATT Server on the first device to an ATT Client on the
peer device. Whether a received Attribute PDU is intended for the ATT Client or for the
ATT Server is determined by the PDU type (see Section 3.3).
The L2CAP channel mode determines the behavior of Attribute Protocol on that ATT
bearer. If the L2CAP channel is using Enhanced Credit Based Flow Control mode or
(on BR/EDR) Enhanced Retransmission mode, then the ATT bearer is known as an
Enhanced ATT bearer. Any ATT bearer that is not an Enhanced ATT bearer, using any
other L2CAP channel mode, is known as an Unenhanced ATT bearer. Except where
explicitly stated, the behavior of an Enhanced ATT bearer shall be identical to the
behavior of an Unenhanced ATT bearer.
An ATT bearer is terminated when either the L2CAP channel (if dynamically allocated)
or the underlying physical link is disconnected.
An LE fixed channel can only be terminated by disconnecting the physical link.
A higher-layer specification may require an Enhanced ATT bearer.
A device that supports L2CAP over multiple logical transports may, subject to any
other requirements in this specification, support ATT bearers on some or all of those
transports.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1500 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part F Page 1501
Attribute Protocol (ATT)
3.3 Attribute PDU
Attribute PDUs have one of six types, which are indicated by the suffix to the PDU name
as shown in Table 3.1:
Type Purpose Suffix
Commands PDUs sent to a server by a client that do not invoke a response. CMD
Requests PDUs sent to a server by a client that invoke a response. REQ
Responses PDUs sent to a client by a server in response to a request. RSP
Notifications Unsolicited PDUs sent to a client by a server that do not invoke a confirma- NTF
tion.
Indications Unsolicited PDUs sent to a client by a server that invoke a confirmation. IND
Confirmations PDUs sent to a server by a client to confirm receipt of an indication. CFM
Table 3.1: Attribute PDUs
A server shall be able to receive and properly respond to the following request PDUs:
• ATT_FIND_INFORMATION_REQ
• ATT_READ_REQ
Support for all other PDU types in a server can be specified in a higher layer
specification, see Section 3.4.8.
If a client sends a request, then the client shall support all possible response PDUs for
that request.
If a server receives a request that it does not support, then the server shall respond
with the ATT_ERROR_RSP PDU with the Error Code parameter set to Request Not
Supported (0x06), with the Attribute Handle In Error set to 0x0000.
If a server receives a command that it does not support, indicated by the Command
Flag of the PDU set to one, then the server shall ignore the command.
If the server receives an invalid request – for example, the PDU is the wrong length
– then the server shall respond with the ATT_ERROR_RSP PDU with the Error Code
parameter set to Invalid PDU (0x04), with the Attribute Handle In Error set to 0x0000.
If a server does not have sufficient resources to process a request, then the server
shall respond with the ATT_ERROR_RSP PDU with the Error Code parameter set to
Insufficient Resources (0x11), with the Attribute Handle In Error set to 0x0000.
If a server cannot process a request because an error was encountered during the
processing of this request, then the server shall respond with the ATT_ERROR_RSP
Bluetooth SIG Proprietary Version Date: 2025-11-03
