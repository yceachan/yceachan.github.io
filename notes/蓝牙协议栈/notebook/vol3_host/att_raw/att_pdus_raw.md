# ATT PDUs (Opcode与包结构)

> 本文档提取自 Vol 3, Part F Attribute Protocol (ATT)。

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

### Page 1501 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part F Page 1502
Attribute Protocol (ATT)
PDU with the Error Code parameter set to Unlikely Error (0x0E), with the Attribute
Handle In Error set to 0x0000.
3.3.1 Attribute PDU format
Attribute PDUs have the following format:
Name Size (octets) Description
Attribute Op- 1 The attribute PDU operation code
code
bit 7: Authentication Signature Flag
bit 6: Command Flag
bits 5-0: Method
Attribute Pa- 0 to (ATT_MTU The attribute PDU parameters
rameters - X)
X = 1 if Authentication Signature Flag of the Attribute Opcode is
0
X = 13 if Authentication Signature Flag of the Attribute Opcode is
1
Authentication 0 or 12 Optional authentication signature for the Attribute Opcode and
Signature Attribute Parameters
Table 3.2: Format of attribute PDU
Multi-octet fields within the Attribute Protocol shall be sent least significant octet first
(little-endian) with the exception of the Attribute Value field. The endian-ness of the
Attribute Value field is defined by a higher layer specification.
The Attribute Opcode is composed of three fields, the Authentication Signature Flag, the
Command Flag, and the Method. The Method is a 6-bit value that determines the format
and meaning of the Attribute Parameters.
If the Authentication Signature Flag of the Attribute Opcode is set to one, the
Authentication Signature value shall be appended to the end of the attribute PDU, and
X is 13. If the Authentication Signature Flag of the Attribute Opcode is set to zero, the
Authentication Signature value shall not be appended, and X is 1.
The Authentication Signature field is calculated as defined in Security Manager (see
[Vol 3] Part H, Section 2.4.5). This value provides an Authentication Signature for the
variable length message (m) consisting of the following values in this order: Attribute
Opcode, Attribute Parameters.
An Attribute PDU that includes an Authentication Signature should not be sent on an
encrypted link.
Note: An encrypted link already includes authentication data on every packet and
therefore adding more authentication data is not required.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1502 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part F Page 1503
Attribute Protocol (ATT)
If the Command Flag of the Attribute Opcode is set to one, the PDU shall be considered
to be a command.
Only the ATT_WRITE_CMD PDU may include an Authentication Signature (and
therefore becomes an ATT_SIGNED_WRITE_CMD PDU).
3.3.2 Sequential protocol
Many Attribute Protocol PDUs use a sequential request-response protocol.
Once a client sends a request to a server, that client shall send no other request to the
same server on the same ATT bearer until a response PDU has been received.
Indications sent from a server also use a sequential indication-confirmation protocol.
No other indications shall be sent to the same client from this server on the same ATT
bearer until a confirmation PDU has been received. The client, however, is free to send
commands and requests prior to sending a confirmation.
For notifications, which do not have a response PDU, there is no flow control and a
notification can be sent at any time.
For commands, which do not have a response PDU, there is no flow control and a
command can be sent at any time.
Note: A server can be flooded with commands, and a higher layer specification can
define how to prevent this from occurring.
Commands that are received but cannot be processed, due to buffer overflows or
a change-unaware client (see [Vol 3] Part G, Section 2.5.2.1), shall be discarded.
Therefore, those PDUs must be considered to be unreliable.
On an Unenhanced ATT bearer, notifications that are received but cannot be processed
due to buffer overflows shall be discarded. Therefore, those PDUs must be considered
to be unreliable.
On an Enhanced ATT bearer, notifications shall always be processed when received.
Note: Flow control for each client and a server is independent.
Note: It is possible for a server to receive a request, send one or more notifications, and
then the response to the original request. The flow control of requests is not affected by
the transmission of the notifications.
Note: It is possible for a server to receive a request and then a command before
responding to the original request. The flow control of requests is not affected by the
transmission of commands.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1503 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part F Page 1504
Attribute Protocol (ATT)
Note: It is possible for a notification from a server to be sent after an indication has been
sent but the confirmation has not been received. The flow control of indications is not
affected by the transmission of notifications.
Note: It is possible for a client to receive an indication from a server and then send
a request or command to that server before sending the confirmation of the original
indication.
3.3.3 Transaction
An Attribute Protocol request and response or indication-confirmation pair is considered
a single transaction. A transaction shall always be performed on one ATT bearer, and
shall not be split over multiple ATT bearers.
On the client, a transaction shall start when the request is sent by the client. A
transaction shall complete when the response is received by the client.
On a server, a transaction shall start when a request is received by the server. A
transaction shall complete when the response is sent by the server.
On a server, a transaction shall start when an indication is sent by the server. A
transaction shall complete when the confirmation is received by the server.
On a client, a transaction shall start when an indication is received by the client. A
transaction shall complete when the confirmation is sent by the client.
A transaction not completed within 30 seconds shall time out. Such a transaction shall
be considered to have failed and the local higher layers shall be informed of this failure.
No more Attribute Protocol requests, commands, indications or notifications shall be
sent to the target device on this ATT bearer.
To send another Attribute Protocol PDU, a new ATT bearer must be established
between these devices. The existing ATT bearer may need to be terminated before
the new ATT bearer is established.
If the ATT bearer is terminated during a transaction, then the transaction shall be
considered to be closed, and any values that were being modified on the server will be
in an undetermined state.
Note: Each ATT_PREPARE_WRITE_REQ and each ATT_READ_BLOB_REQ PDU
starts a separate request and therefore a separate transaction.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1504 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part F Page 1505
Attribute Protocol (ATT)
3.4 Attribute Protocol PDUs
3.4.1 Error handling
3.4.1.1 ATT_ERROR_RSP
The ATT_ERROR_RSP PDU is used to state that a given request cannot be performed,
and to provide the reason.
Note: Commands (i.e. the ATT_WRITE_CMD and ATT_SIGNED_WRITE_CMD PDUs)
do not generate this response.
Parameter Size (octets) Description
Attribute Opcode 1 0x01 = ATT_ERROR_RSP PDU
Request Opcode In Error 1 The request that generated this ATT_ERROR_RSP PDU
Attribute Handle In Error 2 The attribute handle that generated this ATT_ER-
ROR_RSP PDU
Error Code 1 The reason why the request has generated an ATT_ER-
ROR_RSP PDU
Table 3.3: Format of the ATT_ERROR_RSP PDU
The Request Opcode In Error parameter shall be set to the Attribute Opcode of the
request that generated this error.
The Attribute Handle In Error parameter shall be set to the attribute handle in the
original request that generated this error. If there was no attribute handle in the original
request or if the request is not supported, then the value 0x0000 shall be used for this
field.
The Error Code parameter shall be set to one of the following values:
Name Error Description
Code
Invalid Handle 0x01 The attribute handle given was not valid on this server.
Read Not Permitted 0x02 The attribute cannot be read.
Write Not Permitted 0x03 The attribute cannot be written.
Invalid PDU 0x04 The attribute PDU was invalid.
Insufficient Authenti- 0x05 The attribute requires authentication before it can be read or
cation written.
Request Not Suppor- 0x06 ATT Server does not support the request received from the cli-
ted ent.
Invalid Offset 0x07 Offset specified was past the end of the attribute.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1505 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part F Page 1506
Attribute Protocol (ATT)
Name Error Description
Code
Insufficient Authoriza- 0x08 The attribute requires authorization before it can be read or writ-
tion ten.
Prepare Queue Full 0x09 Too many prepare writes have been queued.
Attribute Not Found 0x0A No attribute found within the given attribute handle range.
Attribute Not Long 0x0B The attribute cannot be read using the ATT_READ_BLOB_REQ
PDU.
Encryption Key Size 0x0C The Encryption Key Size used for encrypting this link is too short.
Too Short1
Invalid Attribute Value 0x0D The attribute value length is invalid for the operation.
Length
Unlikely Error 0x0E The attribute request that was requested has encountered an
error that was unlikely, and therefore could not be completed as
requested.
Insufficient Encryption 0x0F The attribute requires encryption before it can be read or written.
Unsupported Group 0x10 The attribute type is not a supported grouping attribute as de-
Type fined by a higher layer specification.
Insufficient Resources 0x11 Insufficient Resources to complete the request.
Database Out Of Sync 0x12 The server requests the client to rediscover the database.
Value Not Allowed 0x13 The attribute parameter value was not allowed.
Application Error 0x80 – Application error code defined by a higher layer specification.
0x9F
Common Profile and 0xE0 – Common profile and service error codes defined in [1]
Service Error Codes 0xFF
Reserved for future All other Reserved for future use.
use values
Table 3.4: Error codes
1This was previously "Insufficient Encryption Key Size".
The Error Code values listed in Section 3.4.2 to Section 3.4.8 are not necessarily the
only ones permitted in response to those PDUs. See Section 3.4.9 for the definitive list
of which Error Code values are permitted.
If more than one error code applies, then it is vendor-specific which error code is
transmitted in the ATT_ERROR_RSP PDU.
If an error code is received in the ATT_ERROR_RSP PDU that is not understood by the
client, for example an error code that was reserved for future use that is now being used
in a future version of the specification, then the ATT_ERROR_RSP PDU shall still be
considered to state that the given request cannot be performed for an unknown reason.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1506 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part F Page 1507
Attribute Protocol (ATT)
Note: Sending an ATT_ERROR_RSP PDU should not cause the ATT Server to
disconnect from the client. The client may upgrade the security and retry the request, so
the server should give the client sufficient time to perform such an upgrade.
3.4.2 MTU exchange
3.4.2.1 ATT_EXCHANGE_MTU_REQ
The ATT_EXCHANGE_MTU_REQ PDU is used by the client to inform the server of the
client’s maximum receive MTU size and request the server to respond with its maximum
receive MTU size.
Parameter Size (octets) Description
Attribute Opcode 1 0x02 = ATT_EXCHANGE_MTU_REQ
Client Rx MTU 2 Client receive MTU size
Table 3.5: Format of ATT_EXCHANGE_MTU_REQ PDU
The Client Rx MTU shall be greater than or equal to the default ATT_MTU.
This request shall only be sent once during a connection by the client. The Client Rx
MTU parameter shall be set to the maximum size of the Attribute Protocol PDU that the
client can receive.
3.4.2.2 ATT_EXCHANGE_MTU_RSP
The ATT_EXCHANGE_MTU_RSP PDU is sent in reply to a received
ATT_EXCHANGE_MTU_REQ PDU.
Parameter Size (octets) Description
Attribute Opcode 1 0x03 = ATT_EXCHANGE_MTU_RSP
Server Rx MTU 2 ATT Server receive MTU size
Table 3.6: Format of ATT_EXCHANGE_MTU_RSP PDU
The Server Rx MTU shall be greater than or equal to the default ATT_MTU.
The Server Rx MTU parameter shall be set to the maximum size of the Attribute
Protocol PDU that the server can receive.
The server and client shall set ATT_MTU to the minimum of the Client Rx MTU and the
Server Rx MTU. The size is the same to ensure that a client can correctly detect the
final packet of a long attribute read.
This ATT_MTU value shall be applied in the server after this response has been sent
and before any other Attribute Protocol PDU is sent.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1507 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part F Page 1508
Attribute Protocol (ATT)
This ATT_MTU value shall be applied in the client after this response has been received
and before any other Attribute Protocol PDU is sent.
If either Client Rx MTU or Service Rx MTU are incorrectly less than the default
ATT_MTU, then the ATT_MTU shall not be changed and the ATT_MTU shall be the
default ATT_MTU.
If a device is both a client and a server, the following rules shall apply:
1. A device's ATT_EXCHANGE_MTU_REQ PDU shall contain the same MTU as the
device's ATT_EXCHANGE_MTU_RSP PDU (i.e. the MTU shall be symmetric).
2. If MTU is exchanged in one direction, that is sufficient for both directions.
3. It is permitted, (but not necessary - see 2.) to exchange MTU in both directions, but
the MTUs shall be the same in each direction (see 1.)
4. If an Attribute Protocol Request is received after the MTU Exchange Request is
sent and before the MTU Exchange Response is received, the associated Attribute
Protocol Response shall use the default MTU. Figure 3.1 shows an example that is
covered by this rule. In this case device A and device B both use the default MTU
for the Attribute Protocol Response.
5. Once the MTU Exchange Request has been sent, the initiating device shall not
send an Attribute Protocol Indication or Notification until after the MTU Exchange
Response has been received.
Note: This stops the risk of a cross-over condition where the MTU size is unknown
for the Indication or Notification.
A B
ExchangeMTUReq(150) ATTReq(usingMTU=23)
ExchangeMTURsp(100)
MTU=100
ATTRsp(usingMTU=23)
MTU=100
Figure 3.1: MTU Request and Response exchange
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1508 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part F Page 1509
Attribute Protocol (ATT)
3.4.3 Find information
3.4.3.1 ATT_FIND_INFORMATION_REQ
The ATT_FIND_INFORMATION_REQ PDU is used to obtain the mapping of attribute
handles with their associated types. This allows a client to discover the list of attributes
and their types on a server.
Parameter Size (octets) Description
Attribute Opcode 1 0x04 = ATT_FIND_INFORMATION_REQ
Starting Handle 2 First requested handle number
Ending Handle 2 Last requested handle number
Table 3.7: Format of ATT_FIND_INFORMATION_REQ PDU
Only attributes with attribute handles between the Starting Handle parameter and the
Ending Handle parameter will be returned. To read all attributes, the Starting Handle
parameter shall be set to 0x0001, and the Ending Handle parameter shall be set to
0xFFFF. The Starting Handle parameter shall be less than or equal to the Ending
Handle parameter.
If one or more attributes will be returned, an ATT_FIND_INFORMATION_RSP PDU
shall be sent.
If a server receives an ATT_FIND_INFORMATION_REQ PDU with the Starting Handle
parameter greater than the Ending Handle parameter or the Starting Handle parameter
is 0x0000, an ATT_ERROR_RSP PDU shall be sent with the Error Code parameter set
to Invalid Handle (0x01); the Attribute Handle In Error parameter shall be set to the
Starting Handle parameter.
If no attributes will be returned (e.g., because there are no attributes in the range), an
ATT_ERROR_RSP PDU shall be sent with the Error Code parameter set to Attribute
Not Found (0x0A); the Attribute Handle In Error parameter shall be set to the Starting
Handle parameter.
The server shall not respond to the ATT_FIND_INFORMATION_REQ PDU with
an ATT_ERROR_RSP PDU with the Error Code parameter set to Insufficient
Authentication (0x05), Insufficient Authorization (0x08), Encryption Key Size Too Short
(0x0C), Database Out of Sync (0x12), Application Error (0x80 to 0x9F), or Common
Profile and Service Error Codes (0xE0 to 0xFF).
3.4.3.2 ATT_FIND_INFORMATION_RSP
The ATT_FIND_INFORMATION_RSP PDU is sent in reply to a received
ATT_FIND_INFORMATION_REQ PDU and contains information about attributes on this
server.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1509 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part F Page 1510
Attribute Protocol (ATT)
Parameter Size (octets) Description
Attribute Opcode 1 0x05 = ATT_FIND_INFORMATION_RSP
Format 1 The format of the information data.
Information Data 4 to (ATT_MTU-2) The information data whose format is determined by the For-
mat field
Table 3.8: Format of ATT_FIND_INFORMATION_RSP PDU
The Find Information Response shall have complete handle-UUID pairs. Such pairs
shall not be split across response packets; this also implies that a handle-UUID pair
shall fit into a single response packet. The handle-UUID pairs shall be returned in
ascending order of attribute handles without omissions.
The Format parameter can contain one of two possible values.
Name Format Description
Handle(s) and 16-bit Bluetooth 0x01 A list of 1 or more handles with their 16-bit Bluetooth
UUID(s) UUIDs
Handle(s) and 128-bit UUID(s) 0x02 A list of 1 or more handles with their 128-bit UUIDs
Table 3.9: Format field values
The information data field is comprised of a list of data defined in Table 3.10 and
Table 3.11 depending on the value chosen for the format.
Handle 16-bit Bluetooth UUID
2 octets 2 octets
Table 3.10: Format 0x01 – handle and 16-bit Bluetooth UUIDs
Handle 128-bit UUID
2 octets 16 octets
Table 3.11: Format 0x02 – handle and 128-bit UUIDs
If sequential attributes have differing UUID sizes, the ATT_FIND_INFORMATION_RSP
PDU shall end with the first attribute of the pair even though this may mean that it is
not filled with the maximum possible amount of (handle, UUID) pairs. This is because
it is not possible to include attributes with differing UUID sizes into a single response
packet. In this situation, the client must use another ATT_FIND_INFORMATION_REQ
PDU with its starting handle updated to fetch the second attribute of the pair and any
further ones in its original request. However, the server may convert a 16-bit UUID to
the corresponding 128-bit UUID to allow it to be included in the response packet.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1510 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part F Page 1511
Attribute Protocol (ATT)
3.4.3.3 ATT_FIND_BY_TYPE_VALUE_REQ
The ATT_FIND_BY_TYPE_VALUE_REQ PDU is used to obtain the handles of
attributes that have a 16-bit UUID attribute type and attribute value.This allows the
range of handles associated with a given attribute to be discovered when the attribute
type determines the grouping of a set of attributes.
Note: GATT defines grouping of attributes by attribute type.
Parameter Size (octets) Description
Attribute Opcode 1 0x06 = ATT_FIND_BY_TYPE_VALUE_REQ PDU
Starting Handle 2 First requested handle number
Ending Handle 2 Last requested handle number
Attribute Type 2 2 octet UUID to find
Attribute Value 0 to (ATT_MTU-7) Attribute value to find
Table 3.12: Format of ATT_FIND_BY_TYPE_VALUE_REQ PDU
Only attributes with attribute handles between the Starting Handle parameter and the
Ending Handle parameter that match the requested attribute type and the attribute value
that have sufficient permissions to allow reading will be returned. To read all attributes,
the Starting Handle parameter shall be set to 0x0001, and the Ending Handle parameter
shall be set to 0xFFFF.
If one or more handles will be returned, an ATT_FIND_BY_TYPE_VALUE_RSP PDU
shall be sent.
Note: Attribute values will be compared in terms of length and binary representation.
Note: It is not possible to use this request on an attribute that has a value longer than
(ATT_MTU-7).
If a server receives an ATT_FIND_BY_TYPE_VALUE_REQ PDU with the Starting
Handle parameter greater than the Ending Handle parameter or the Starting Handle
parameter is 0x0000, an ATT_ERROR_RSP PDU shall be sent with the Error Code
parameter set to Invalid Handle (0x01). The Attribute Handle In Error parameter shall be
set to the Starting Handle parameter.
If no attributes will be returned, an ATT_ERROR_RSP PDU shall be sent by the server
with the Error Code parameter set to Attribute Not Found (0x0A). The Attribute Handle
In Error parameter shall be set to the starting handle.
The server shall not respond to the ATT_FIND_BY_TYPE_VALUE_REQ PDU with
an ATT_ERROR_RSP PDU with the Error Code parameter set to Insufficient
Authentication (0x05), Insufficient Authorization (0x08), Encryption Key Size Too Short
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1511 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part F Page 1512
Attribute Protocol (ATT)
(0x0C), Insufficient Encryption (0x0F), Database Out of Sync (0x12), Application Error
(0x80 to 0x9F), or Common Profile and Service Error Codes (0xE0 to 0xFF).
3.4.3.4 ATT_FIND_BY_TYPE_VALUE_RSP
The ATT_FIND_BY_TYPE_VALUE_RSP PDU is sent in reply to a received
ATT_FIND_BY_TYPE_VALUE_REQ PDU and contains information about this server.
Parameter Size (octets) Description
Attribute Opcode 1 0x07 = ATT_FIND_BY_TYPE_VALUE_RSP PDU
Handles Information List 4 to (ATT_MTU-1) A list of 1 or more Handle Informations
Table 3.13: Format of ATT_FIND_BY_TYPE_VALUE_RSP PDU
The Handles Information List field is a list of one or more Handle Informations. The
Handles Information field is an attribute handle range as defined in Table 3.14.
Found Attribute Handle Group End Handle
2 octets 2 octets
Table 3.14: Format of the Handles Information
The ATT_FIND_BY_TYPE_VALUE_RSP PDU shall contain one or more complete
Handles Information. Such Handles Information shall not be split across response
packets. The Handles Information List is ordered sequentially based on the found
attribute handles.
For each handle that matches the attribute type and attribute value in the
ATT_FIND_BY_TYPE_VALUE_REQ PDU a Handles Information shall be returned.
The Found Attribute Handle shall be set to the handle of the attribute that has the
exact attribute type and attribute value from the ATT_FIND_BY_TYPE_VALUE_REQ
PDU. If the attribute type in the ATT_FIND_BY_TYPE_VALUE_REQ PDU is a
grouping attribute as defined by a higher layer specification, the Group End Handle
shall be defined by that higher layer specification. If the attribute type in the
ATT_FIND_BY_TYPE_VALUE_REQ PDU is not a grouping attribute as defined by a
higher layer specification, the Group End Handle shall be equal to the Found Attribute
Handle.
Note: The Group End Handle may be greater than the Ending Handle in the
ATT_FIND_BY_TYPE_VALUE_REQ PDU.
If a server receives an ATT_FIND_BY_TYPE_VALUE_REQ PDU, the server shall
respond with the ATT_FIND_BY_TYPE_VALUE_RSP PDU containing as many handles
for attributes that match the requested attribute type and attribute value that exist in the
server that will fit into the maximum PDU size of (ATT_MTU-1).
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1512 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part F Page 1513
Attribute Protocol (ATT)
3.4.4 Reading attributes
3.4.4.1 ATT_READ_BY_TYPE_REQ
The ATT_READ_BY_TYPE_REQ PDU is used to obtain the values of attributes where
the attribute type is known but the handle is not known.
Parameter Size (octets) Description
Attribute Opcode 1 0x08 = ATT_READ_BY_TYPE_REQ PDU
Starting Handle 2 First requested handle number
Ending Handle 2 Last requested handle number
Attribute Type 2 or 16 2 or 16 octet UUID
Table 3.15: Format of ATT_READ_BY_TYPE_REQ PDU
Only the attributes with attribute handles between the Starting Handle and the Ending
Handle with the attribute type that is the same as the Attribute Type given will be
returned. To search through all attributes, the starting handle shall be set to 0x0001 and
the ending handle shall be set to 0xFFFF.
Note: All attribute types are effectively compared as 128-bit UUIDs, even if a 16-bit
UUID is provided in this request or defined for an attribute. See [Vol 3] Part B,
Section 2.5.1.
The starting handle shall be less than or equal to the ending handle. If a server
receives an ATT_READ_BY_TYPE_REQ PDU with the Starting Handle parameter
greater than the Ending Handle parameter or the Starting Handle parameter is 0x0000,
an ATT_ERROR_RSP PDU shall be sent with the Error Code parameter set to Invalid
Handle (0x01). The Attribute Handle In Error parameter shall be set to the Starting
Handle parameter.
If no attribute with the given type exists within the handle range, then no attribute handle
and value will be returned, and an ATT_ERROR_RSP PDU shall be sent with the
Error Code parameter set to Attribute Not Found (0x0A). The Attribute Handle In Error
parameter shall be set to the starting handle.
The attributes returned shall be the attributes with the lowest handles within the handle
range. These are known as the requested attributes.
If the attributes with the requested type within the handle range have attribute
values that have the same length, then these attributes can all be read in a
single request. However, if those attributes have different lengths, then multiple
ATT_READ_BY_TYPE_REQ PDUs must be issued.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1513 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part F Page 1514
Attribute Protocol (ATT)
The ATT Server shall include as many attributes as possible in the response in order to
minimize the number of PDUs required to read attributes of the same type.
When multiple attributes match, then the rules below shall be applied to each in turn.
• Only attributes that can be read shall be returned in an ATT_READ_BY_TYPE_RSP
PDU.
• If an attribute in the set of requested attributes would cause an ATT_ERROR_RSP
PDU then this attribute cannot be included in an ATT_READ_BY_TYPE_RSP PDU
and the attributes before this attribute shall be returned.
• If the first attribute in the set of requested attributes would cause an
ATT_ERROR_RSP PDU then no other attributes in the requested attributes can be
considered.
The server shall respond with an ATT_READ_BY_TYPE_RSP PDU if the requested
attributes have sufficient permissions to allow reading.
If the client has insufficient authorization to read the requested attribute then an
ATT_ERROR_RSP PDU shall be sent with the Error Code parameter set to Insufficient
Authorization (0x08). The Attribute Handle In Error parameter shall be set to the handle
of the attribute causing the error.
If the client has insufficient security to read the requested attribute then an
ATT_ERROR_RSP PDU shall be sent with the Error Code parameter set to Insufficient
Authentication (0x05). The Attribute Handle In Error parameter shall be set to the
handle of the attribute causing the error.
If the client has an encryption key size that is too short to read the requested attribute
then an ATT_ERROR_RSP PDU shall be sent with the Error Code parameter set to
Encryption Key Size Too Short (0x0C). The Attribute Handle In Error parameter shall be
set to the handle of the attribute causing the error.
If the client has not enabled encryption, and encryption is required to read the requested
attribute, then an ATT_ERROR_RSP PDU shall be sent with the Error Code parameter
set to Insufficient Encryption (0x0F). The Attribute Handle In Error parameter shall be
set to the handle of the attribute causing the error.
If the requested attribute’s value cannot be read due to permissions then an
ATT_ERROR_RSP PDU shall be sent with the Error Code parameter set to Read Not
Permitted (0x02). The Attribute Handle In Error parameter shall be set to the handle of
the attribute causing the error.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1514 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part F Page 1515
Attribute Protocol (ATT)
Note: If there are multiple attributes with the requested type within the handle range,
and the client would like to get the next attribute with the requested type, it would have
to issue another ATT_READ_BY_TYPE_REQ PDU with its starting handle updated.
The client can be sure there are no more such attributes remaining once it gets an
ATT_ERROR_RSP PDU with the Error Code parameter set to Attribute Not Found
(0x0A).
3.4.4.2 ATT_READ_BY_TYPE_RSP
The ATT_READ_BY_TYPE_RSP PDU is sent in reply to a received
ATT_READ_BY_TYPE_REQ PDU and contains the handles and values of the attributes
that have been read.
Parameter Size (octets) Description
Attribute Opcode 1 0x09 = ATT_READ_BY_TYPE_RSP PDU
Length 1 The size of each attribute handle-value pair
Attribute Data List 2 to (ATT_MTU-2) A list of Attribute Data
Table 3.16: Format of ATT_READ_BY_TYPE_RSP PDU
The ATT_READ_BY_TYPE_RSP PDU shall contain complete handle-value pairs. Such
pairs shall not be split across response packets. The handle-value pairs shall be
returned sequentially based on the attribute handle.
The Length parameter shall be set to the size of one attribute handle-value pair.
The maximum length of an attribute handle-value pair is 255 octets, bounded by the
Length parameter that is one octet. Therefore, the maximum length of an attribute value
returned in this response is (Length – 2) = 253 octets.
The attribute handle-value pairs shall be set to the value of the attributes identified by
the attribute type within the handle range within the request. If the attribute value is
longer than (ATT_MTU - 4) or 253 octets, whichever is smaller, then the first (ATT_MTU
- 4) or 253 octets shall be included in this response.
Note: The ATT_READ_BLOB_REQ PDU (see Section 3.4.4.5) can be used to read the
remaining octets of a long attribute value.
The Attribute Data field is comprised of a list of attribute handle and value pairs as
defined in Table 3.17.
Attribute Handle Attribute Value
2 octets (Length – 2) octets
Table 3.17: Format of the Attribute Data
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1515 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part F Page 1516
Attribute Protocol (ATT)
3.4.4.3 ATT_READ_REQ
The ATT_READ_REQ PDU is used to request the server to read the value of an
attribute and return its value in an ATT_READ_RSP PDU.
Parameter Size (octets) Description
Attribute Opcode 1 0x0A = ATT_READ_REQ PDU
Attribute Handle 2 The handle of the attribute to be read
Table 3.18: Format of ATT_READ_REQ PDU
The attribute handle parameter shall be set to a valid handle.
The server shall respond with an ATT_READ_RSP PDU if the handle is valid and the
attribute has sufficient permissions to allow reading.
If the client has insufficient authorization to read the requested attribute then an
ATT_ERROR_RSP PDU shall be sent with the Error Code parameter set to Insufficient
Authorization (0x08).
If the client has insufficient security to read the requested attribute then an
ATT_ERROR_RSP PDU shall be sent with the Error Code parameter set to Insufficient
Authentication (0x05).
If the client has an encryption key size that is too short to read the requested attribute
then an ATT_ERROR_RSP PDU shall be sent with the Error Code parameter set to
Encryption Key Size Too Short (0x0C).
If the client has not enabled encryption, and encryption is required to read the requested
attribute, then an ATT_ERROR_RSP PDU shall be sent with the Error Code parameter
set to Insufficient Encryption (0x0F).
If the handle is invalid, then an ATT_ERROR_RSP PDU shall be sent with the Error
Code parameter set to Invalid Handle (0x01).
If the attribute value cannot be read due to permissions then an ATT_ERROR_RSP
PDU shall be sent with the Error Code parameter set to Read Not Permitted (0x02).
3.4.4.4 ATT_READ_RSP
The ATT_READ_RSP PDU is sent in reply to a received Read Request and contains
the value of the attribute that has been read.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1516 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part F Page 1517
Attribute Protocol (ATT)
Parameter Size (octets) Description
Attribute Opcode 1 0x0B = ATT_READ_RSP PDU
Attribute Value 0 to (ATT_MTU-1) The value of the attribute with the handle given
Table 3.19: Format of ATT_READ_RSP PDU
The attribute value shall be set to the value of the attribute identified by the attribute
handle in the request. If the attribute value is longer than
(ATT_MTU-1) then the first (ATT_MTU-1) octets shall be included in this response.
Note: The ATT_READ_BLOB_REQ PDU (see Section 3.4.4.5) can be used to read the
remaining octets of a long attribute value.
3.4.4.5 ATT_READ_BLOB_REQ
The ATT_READ_BLOB_REQ PDU is used to request the server to read part of the
value of an attribute at a given offset and return a specific part of the value in an
ATT_READ_BLOB_RSP PDU.
Parameter Size (octets) Description
Attribute Opcode 1 0x0C = ATT_READ_BLOB_REQ PDU
Attribute Handle 2 The handle of the attribute to be read
Value Offset 2 The offset of the first octet to be read
Table 3.20: Format of ATT_READ_BLOB_REQ PDU
The attribute handle parameter shall be set to a valid handle.
The value offset parameter is based from zero; the first value octet has an offset of zero,
the second octet has a value offset of one, etc.
The server shall respond with an ATT_READ_BLOB_RSP PDU if the handle is valid
and the attribute and value offset is not greater than the length of the attribute value and
has sufficient permissions to allow reading.
If the client has insufficient authorization to read the requested attribute then an
ATT_ERROR_RSP PDU shall be sent with the Error Code parameter set to Insufficient
Authorization (0x08).
If the client has insufficient security to read the requested attribute then an
ATT_ERROR_RSP PDU shall be sent with the Error Code parameter set to Insufficient
Authentication (0x05).
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1517 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part F Page 1518
Attribute Protocol (ATT)
If the client has an encryption key size that is too short to read the requested attribute
then an ATT_ERROR_RSP PDU shall be sent with the Error Code parameter set to
Encryption Key Size Too Short (0x0C).
If the client has not enabled encryption, and encryption is required to read the requested
attribute, then an ATT_ERROR_RSP PDU shall be sent with the Error Code parameter
set to Insufficient Encryption (0x0F).
If the handle is invalid, then an ATT_ERROR_RSP PDU shall be sent with the Error
Code parameter set to Invalid Handle (0x01).
If the attribute value cannot be read due to permissions then an ATT_ERROR_RSP
PDU shall be sent with the Error Code parameter set to Read Not Permitted (0x02).
If the value offset of the Read Blob Request is greater than the length of the attribute
value, an ATT_ERROR_RSP PDU shall be sent with the Error Code parameter set to
Invalid Offset (0x07).
If the attribute value has a fixed length that is less than or equal to (ATT_MTU - 1) octets
in length, then an ATT_ERROR_RSP PDU may be sent with the Error Code parameter
set to Attribute Not Long (0x0B).
If the value offset of the ATT_READ_BLOB_REQ PDU is equal to the length of the
attribute value, then the length of the part attribute value in the response shall be zero.
Note: If the attribute is longer than (ATT_MTU-1) octets, the ATT_READ_BLOB_REQ
PDU is the only way to read the additional octets of a long attribute. The
first (ATT_MTU-1) octets may be read using an ATT_READ_RSP PDU; the first
(ATT_MTU-3) octets can be received in an ATT_HANDLE_VALUE_NTF or an
ATT_HANDLE_VALUE_IND PDU.
Note: Some, but not all, long attributes have their length specified by a higher layer
specification. If the long attribute has a variable length, the only way to get to the end
of it is to read it part by part until the value in the ATT_READ_BLOB_RSP PDU has a
length shorter than (ATT_MTU-1) or an ATT_ERROR_RSP PDU is sent with the Error
Code parameter set to Invalid Offset (0x07).
Note: The value of a Long Attribute may change between the server receiving one
ATT_READ_BLOB_REQ PDU and the next ATT_READ_BLOB_REQ PDU. A higher
layer specification should be aware of this and define appropriate behavior.
3.4.4.6 ATT_READ_BLOB_RSP
The ATT_READ_BLOB_RSP PDU is sent in reply to a received
ATT_READ_BLOB_REQ PDU and contains part of the value of the attribute that has
been read.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1518 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part F Page 1519
Attribute Protocol (ATT)
Parameter Size (octets) Description
Attribute Opcode 1 0x0D = ATT_READ_BLOB_RSP
Part Attribute Value 0 to (ATT_MTU-1) Part of the value of the attribute with the handle given
Table 3.21: Format of ATT_READ_BLOB_RSP PDU
The part attribute value shall be set to part of the value of the attribute identified by the
attribute handle and the value offset in the request. If the value offset is equal to the
length of the attribute value, then the length of the part attribute value shall be zero. If
the attribute value is longer than (Value Offset + ATT_MTU-1) then (ATT_MTU-1) octets
from Value Offset shall be included in this response.
3.4.4.7 ATT_READ_MULTIPLE_REQ
The ATT_READ_MULTIPLE_REQ PDU is used to request the server to read
two or more values of a set of attributes and return their values in an
ATT_READ_MULTIPLE_RSP PDU. Only values that have a known fixed size can
be read, with the exception of the last value that can have a variable length. The
knowledge of whether attributes have a known fixed size is defined in a higher layer
specification.
Parameter Size (octets) Description
Attribute Opcode 1 0x0E = ATT_READ_MULTIPLE_REQ PDU
Set Of Handles 4 to (ATT_MTU-1) A set of two or more attribute handles.
Table 3.22: Format of ATT_READ_MULTIPLE_REQ PDU
The attribute handles in the Set Of Handles parameter shall be valid handles.
The server shall respond with an ATT_READ_MULTIPLE_RSP PDU if all the handles
are valid and all attributes have sufficient permissions to allow reading.
Note: The attribute values for the attributes in the Set Of Handles parameters do not
have to all be the same size.
Note: The attribute handles in the Set Of Handles parameter do not have to be in
attribute handle order; they are in the order that the values are required in the response.
If the client has insufficient authorization to read any of the attributes then an
ATT_ERROR_RSP PDU shall be sent with the Error Code parameter set to Insufficient
Authorization (0x08).
If the client has insufficient security to read any of the attributes then an
ATT_ERROR_RSP PDU shall be sent with the Error Code parameter set to Insufficient
Authentication (0x05).
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1519 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part F Page 1520
Attribute Protocol (ATT)
If the client has an encryption key size that is too short to read any of the attributes
then an ATT_ERROR_RSP PDU shall be sent with the Error Code parameter set to
Encryption Key Size Too Short (0x0C).
If the client has not enabled encryption, and encryption is required to read the requested
attribute, then an ATT_ERROR_RSP PDU shall be sent with the Error Code parameter
set to Insufficient Encryption (0x0F).
If any of the handles are invalid, then an ATT_ERROR_RSP PDU shall be sent with the
Error Code parameter set to Invalid Handle (0x01).
If any of the attribute values cannot be read due to permissions then an
ATT_ERROR_RSP PDU shall be sent with the Error Code parameter set to Read Not
Permitted (0x02).
If an ATT_ERROR_RSP PDU is sent, the Attribute Handle In Error parameter shall be
set to the handle of the first attribute causing the error.
3.4.4.8 ATT_READ_MULTIPLE_RSP
The ATT_READ_MULTIPLE_RSP PDU is sent in reply to a received
ATT_READ_MULTIPLE_REQ PDU and contains the values of the attributes that have
been read.
Parameter Size (octets) Description
Attribute Opcode 1 0x0F = ATT_READ_MULTIPLE_RSP PDU
Set Of Values 0 to (ATT_MTU-1) A set of two or more values
Table 3.23: Format of ATT_READ_MULTIPLE_RSP PDU
The Set Of Values parameter shall be a concatenation of attribute values for each of
the attribute handles in the request in the order that they were requested. If the Set Of
Values parameter is longer than (ATT_MTU-1) then only the first (ATT_MTU-1) octets
shall be included in this response.
Note: A client should not use this request for attributes when the Set Of Values
parameter could be (ATT_MTU-1) as it will not be possible to determine if the last
attribute value is complete, or if it overflowed.
3.4.4.9 ATT_READ_BY_GROUP_TYPE_REQ
The ATT_READ_BY_GROUP_TYPE_REQ PDU is used to obtain the values of
attributes where the attribute type is known, the type of a grouping attribute as defined
by a higher layer specification, but the handle is not known.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1520 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part F Page 1521
Attribute Protocol (ATT)
Parameter Size (octets) Description
Attribute Opcode 1 0x10 = ATT_READ_BY_GROUP_TYPE_REQ PDU
Starting Handle 2 First requested handle number
Ending Handle 2 Last requested handle number
Attribute Group Type 2 or 16 2 or 16 octet UUID
Table 3.24: Format of ATT_READ_BY_GROUP_TYPE_REQ PDU
Only the attributes with attribute handles between the Starting Handle and the Ending
Handle with the attribute type that is the same as the Attribute Group Type given will be
returned. To search through all attributes, the starting handle shall be set to 0x0001 and
the ending handle shall be set to 0xFFFF.
Note: All attribute types are effectively compared as 128-bit UUIDs, even if a 16-bit
UUID is provided in this request or defined for an attribute. See [Vol 3] Part B,
Section 2.5.1.
The starting handle shall be less than or equal to the ending handle. If a server receives
an ATT_READ_BY_GROUP_TYPE_REQ PDU with the Starting Handle parameter
greater than the Ending Handle parameter or the Starting Handle parameter is 0x0000,
an ATT_ERROR_RSP PDU shall be sent with the Error Code parameter set to Invalid
Handle (0x01). The Attribute Handle In Error parameter shall be set to the Starting
Handle parameter.
If the Attribute Group Type is not a supported grouping attribute as defined by a
higher layer specification then an ATT_ERROR_RSP PDU shall be sent with the Error
Code parameter set to Unsupported Group Type (0x10). The Attribute Handle In Error
parameter shall be set to the Starting Handle.
If no attribute with the given type exists within the handle range, then no attribute handle
and value will be returned, and an ATT_ERROR_RSP PDU shall be sent with the
Error Code parameter set to Attribute Not Found (0x0A). The Attribute Handle In Error
parameter shall be set to the starting handle.
The attributes returned shall be the attributes with the lowest handles within the handle
range. These are known as the requested attributes.
If the attributes with the requested type within the handle range have attribute
values that have the same length, then these attributes can all be read in a
single request. However, if those attributes have different lengths, then multiple
ATT_READ_BY_GROUP_TYPE_REQ PDUs must be issued.
The ATT Server shall include as many attributes as possible in the response in order to
minimize the number of PDUs required to read attributes of the same type.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1521 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part F Page 1522
Attribute Protocol (ATT)
When multiple attributes match, then the rules below shall be applied to each in turn.
• Only attributes that can be read shall be returned in an
ATT_READ_BY_GROUP_TYPE_RSP PDU.
• If an attribute in the set of requested attributes would cause an
ATT_ERROR_RSP PDU then this attribute cannot be included in an
ATT_READ_BY_GROUP_TYPE_RSP PDU and the attributes before this attribute
shall be returned.
• If the first attribute in the set of requested attributes would cause an
ATT_ERROR_RSP PDU then no other attributes in the requested attributes can be
considered.
The server shall respond with an ATT_READ_BY_GROUP_TYPE_RSP PDU if the
requested attributes have sufficient permissions to allow reading.
If the client has insufficient authorization to read the requested attribute then an
ATT_ERROR_RSP PDU shall be sent with the Error Code parameter set to Insufficient
Authorization (0x08). The Attribute Handle In Error parameter shall be set to the handle
of the attribute causing the error.
If the client has insufficient security to read the requested attribute then an
ATT_ERROR_RSP PDU shall be sent with the Error Code parameter set to Insufficient
Authentication (0x05). The Attribute Handle In Error parameter shall be set to the
handle of the attribute causing the error.
If the client has an encryption key size that is too short to read the requested attribute
then an ATT_ERROR_RSP PDU shall be sent with the Error Code parameter set to
Encryption Key Size Too Short (0x0C). The Attribute Handle In Error parameter shall be
set to the handle of the attribute causing the error.
If the client has not enabled encryption, and encryption is required to read the requested
attribute, then an ATT_ERROR_RSP PDU shall be sent with the Error Code parameter
set to Insufficient Encryption (0x0F). The Attribute Handle In Error parameter shall be
set to the handle of the attribute causing the error.
If the requested attribute’s value cannot be read due to permissions then an
ATT_ERROR_RSP PDU shall be sent with the Error Code parameter set to Read Not
Permitted (0x02). The Attribute Handle In Error parameter shall be set to the handle of
the attribute causing the error.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1522 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part F Page 1523
Attribute Protocol (ATT)
Note: If there are multiple attributes with the requested type within the handle range,
and the client would like to get the next attribute with the requested type, it would have
to issue another ATT_READ_BY_GROUP_TYPE_REQ PDU with its starting handle
updated. The client can be sure there are no more such attributes remaining once it
gets an ATT_ERROR_RSP PDU with the Error Code parameter set to Attribute Not
Found (0x0A).
The server shall not respond to the ATT_READ_BY_GROUP_TYPE_REQ PDU with an
ATT_ERROR_RSP PDU with the error code Database Out of Sync (0x12).
3.4.4.10 ATT_READ_BY_GROUP_TYPE_RSP
The ATT_READ_BY_GROUP_TYPE_RSP PDU is sent in reply to a received
ATT_READ_BY_GROUP_TYPE_REQ PDU and contains the handles and values of the
attributes that have been read.
Parameter Size (octets) Description
Attribute Opcode 1 0x11 = ATT_READ_BY_GROUP_TYPE_RSP PDU
Length 1 The size of each Attribute Data
Attribute Data List 4 to (ATT_MTU-2) A list of Attribute Data
Table 3.25: Format of ATT_READ_BY_GROUP_TYPE_RSP PDU
The ATT_READ_BY_GROUP_TYPE_RSP PDU shall contain complete Attribute Data.
An Attribute Data shall not be split across response packets. The Attribute Data List is
ordered sequentially based on the attribute handles.
The Length parameter shall be set to the size of the one Attribute Data.
The maximum length of an Attribute Data is 255 octets, bounded by the Length
parameter that is one octet. Therefore, the maximum length of an attribute value
returned in this response is (Length – 4) = 251 octets.
The Attribute Data List shall be set to the value of the attributes identified by the
attribute type within the handle range within the request. If the attribute value is longer
than (ATT_MTU - 6) or 251 octets, whichever is smaller, then the first (ATT_MTU - 6) or
251 octets shall be included in this response.
Note: The ATT_READ_BLOB_REQ PDU (see Section 3.4.4.5) can be used to read the
remaining octets of a long attribute value.
The Attribute Data List is comprised of a list of Attribute Data as defined in Table 3.26.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1523 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part F Page 1524
Attribute Protocol (ATT)
Attribute Handle End Group Handle Attribute Value
2 octets 2 octets (Length - 4) octets
Table 3.26: Format of the Attribute Data
3.4.4.11 ATT_READ_MULTIPLE_VARIABLE_REQ
The ATT_READ_MULTIPLE_VARIABLE_REQ PDU is used to request that the server
read two or more values of a set of attributes that have a variable or unknown value
length and return their values in an ATT_READ_MULTIPLE_VARIABLE_RSP PDU.
Parameter Size (octets) Description
Attribute Opcode 1 0x20 = ATT_READ_MULTIPLE_VARIABLE_REQ PDU
Set Of Handles 4 to (ATT_MTU-1) A set of two or more attribute handles
Table 3.27: Format of ATT_READ_MULTIPLE_VARIABLE_REQ PDU
The attribute handles in the Set Of Handles parameter shall all be valid handles.
The server shall respond with an ATT_READ_MULTIPLE_VARIABLE_RSP PDU if all
attributes have sufficient permissions to allow reading.
Note: The attribute values for the attributes in the Set Of Handles parameters do not
have to all be the same size.
Note: The attribute handles in the Set Of Handles parameter do not have to be in
attribute handle order; they are in the order that the values are required in the response.
If the client has insufficient authorization to read any of the attributes, then an
ATT_ERROR_RSP PDU shall be sent with the error code Insufficient Authorization.
If the client has insufficient security to read any of the attributes, then an
ATT_ERROR_RSP PDU shall be sent with the error code Insufficient Authentication.
If the client has an encryption key size that is too short to read any of the attributes, then
an ATT_ERROR_RSP PDU shall be sent with the error code Encryption Key Size Too
Short.
If the client has not enabled encryption, and encryption is required to read any of the
attributes, then an ATT_ERROR_RSP PDU shall be sent with the error code Insufficient
Encryption.
If any of the handles are invalid, then an ATT_ERROR_RSP PDU shall be sent with the
error code Invalid Handle.
If any of the attribute values cannot be read due to permissions, then an
ATT_ERROR_RSP PDU shall be sent with the error code Read Not Permitted.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1524 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part F Page 1525
Attribute Protocol (ATT)
If an ATT_ERROR_RSP PDU is sent, the Attribute Handle In Error parameter in the
ATT_ERROR_RSP PDU (see Section 3.4.1.1) shall be set to the handle of the first
attribute causing the error.
3.4.4.12 ATT_READ_MULTIPLE_VARIABLE_RSP
The ATT_READ_MULTIPLE_VARIABLE_RSP PDU is sent in reply to a received
ATT_READ_MULTIPLE_VARIABLE_REQ PDU and contains the lengths and values of
the attributes that have been read.
Parameter Size (octets) Description
Attribute Opcode 1 0x21 = ATT_READ_MULTIPLE_VARIABLE_RSP
Length Value Tuple List 4 to (ATT_MTU-1) A list of Length Value Tuples
Table 3.28: Format of ATT_READ_MULTIPLE_VARIABLE_RSP PDU
The Length Value Tuple List shall be a concatenation of Length Value Tuples for each of
the attribute handles in the request in the order that they were requested. If the Length
Value Tuple List is longer than (ATT_MTU-1) octets, then it shall be truncated after
(ATT_MTU-1) or, if that would be within the Value Length field of a Length Value Tuple,
at the start of the Length Value Tuple.
Note: The ATT_READ_BLOB_REQ PDU (see Section 3.4.4.5) can be used to read the
remaining octets of a long attribute value.
The Value Length field in a Length Value Tuple shall be set to the length of the Attribute
Value field. The Attribute Value field in a Length Value Tuple shall be set to the value of
the attribute being read.
Value Length Attribute Value
2 octets (Value Length) octets
Table 3.29: Format of the Length Value Tuple
Note: If a Length Value Tuple is truncated, then the amount of Attribute Value will be
less than the value of the Value Length field. The client must therefore not use the Value
Length to determine the amount of the Attribute Value actually included in the PDU.
3.4.5 Writing attributes
3.4.5.1 ATT_WRITE_REQ
The ATT_WRITE_REQ PDU is used to request the server to write the value of an
attribute and acknowledge that this has been achieved in an ATT_WRITE_RSP PDU.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1525 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part F Page 1526
Attribute Protocol (ATT)
Parameter Size (octets) Description
Attribute Opcode 1 0x12 = ATT_WRITE_REQ PDU
Attribute Handle 2 The handle of the attribute to be written
Attribute Value 0 to (ATT_MTU-3) The value to be written to the attribute
Table 3.30: Format of ATT_WRITE_REQ PDU
The Attribute Handle shall be set to a valid handle.
The Attribute Value shall be set to the new value of the attribute.
If the attribute value has a variable length, then the attribute value shall be truncated or
lengthened to match the length of the Attribute Value parameter.
Note: If an attribute value has a variable length and if the Attribute Value parameter is of
zero length, the attribute value will be fully truncated.
If the attribute value has a fixed length and the Attribute Value parameter length is
less than or equal to the length of the attribute value, the octets of the attribute
value parameter length shall be written; all other octets in this attribute value shall be
unchanged.
The server shall respond with an ATT_WRITE_RSP PDU if the handle is valid, the
attribute has sufficient permissions to allow writing, and the attribute value has a valid
size and format, and it is successful in writing the attribute.
If the attribute value has a variable length and the Attribute Value parameter length
exceeds the maximum valid length of the attribute value then the server shall respond
with an ATT_ERROR_RSP PDU with the Error Code parameter set to Invalid Attribute
Value Length (0x0D).
If the attribute value has a fixed length and the requested attribute value parameter
length is greater than the length of the attribute value then the server shall respond with
an ATT_ERROR_RSP PDU with the Error Code parameter set to Invalid Attribute Value
Length (0x0D).
If the client has insufficient authorization to write the requested attribute then an
ATT_ERROR_RSP PDU shall be sent with the Error Code parameter set to Insufficient
Authorization (0x08).
If the client has insufficient security to write the requested attribute then an
ATT_ERROR_RSP PDU shall be sent with the Error Code parameter set to Insufficient
Authentication (0x05).
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1526 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part F Page 1527
Attribute Protocol (ATT)
If the client has an encryption key size that is too short to write the requested attribute
then an ATT_ERROR_RSP PDU shall be sent with the Error Code parameter set to
Encryption Key Size Too Short (0x0C).
If the client has not enabled encryption, and encryption is required to write the
requested attribute, then an ATT_ERROR_RSP PDU shall be sent with the Error Code
parameter set to Insufficient Encryption (0x0F).
If the handle is invalid, then an ATT_ERROR_RSP PDU shall be sent with the Error
Code parameter set to Invalid Handle (0x01).
If the attribute value cannot be written due to permissions then an ATT_ERROR_RSP
PDU shall be sent with the Error Code parameter set to Write Not Permitted (0x03).
If the attribute value cannot be written due to an application error then an
ATT_ERROR_RSP PDU shall be sent with an error code defined by a higher layer
specification.
3.4.5.2 ATT_WRITE_RSP
The ATT_WRITE_RSP PDU is sent in reply to a valid ATT_WRITE_REQ PDU and
acknowledges that the attribute has been successfully written.
Parameter Size (octets) Description
Attribute Opcode 1 0x13 = ATT_WRITE_RSP PDU
Table 3.31: Format of ATT_WRITE_RSP
The ATT_WRITE_RSP PDU shall be sent after the attribute value is written.
3.4.5.3 ATT_WRITE_CMD
The ATT_WRITE_CMD PDU is used to request the server to write the value of an
attribute, typically into a control-point attribute.
Parameter Size (octets) Description
Attribute Opcode 1 0x52 = ATT_WRITE_CMD PDU
Attribute Handle 2 The handle of the attribute to be set
Attribute Value 0 to (ATT_MTU-3) The value of be written to the attribute
Table 3.32: Format of ATT_WRITE_CMD PDU
The attribute handle parameter shall be set to a valid handle.
The attribute value parameter shall be set to the new value of the attribute.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1527 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part F Page 1528
Attribute Protocol (ATT)
If the attribute value has a variable length, then the attribute value shall be truncated or
lengthened to match the length of the attribute value parameter.
Note: If an attribute value has a variable length and if the attribute value parameter is of
zero length, the attribute value will be fully truncated.
If the attribute value has a fixed length and the attribute value parameter length is
less than or equal to the length of the attribute value, the octets up to the attribute
value parameter length shall be written; all other octets in this attribute value shall be
unchanged.
If the attribute value has a variable length and the attribute value parameter length
exceeds the maximum valid length of the attribute value then the server shall ignore the
command.
If the attribute value has a fixed length and the requested attribute value parameter
length is greater than the length of the attribute value then the server shall ignore the
command.
No ATT_ERROR_RSP or ATT_WRITE_RSP PDUs shall be sent in response to this
command. If the server cannot write this attribute for any reason the command shall be
ignored.
3.4.5.4 ATT_SIGNED_WRITE_CMD
This command shall not be used on an Enhanced ATT bearer.
The ATT_SIGNED_WRITE_CMD PDU is used to request the server to write the value
of an attribute with an authentication signature, typically into a control-point attribute.
Parameter Size (Octets) Description
Attribute Opcode 1 0xD2 = ATT_SIGNED_WRITE_CMD PDU
Attribute Handle 2 The handle of the attribute to be set
Attribute Value 0 to (ATT_MTU‑15) The value to be written to the attribute
Authentication Signature 12 Authentication signature for the Attribute Opcode, At-
tribute Handle and Attribute Value parameters
Table 3.33: Format of ATT_SIGNED_WRITE_CMD
The attribute handle parameter shall be set to a valid handle.
The attribute value parameter shall be set to the new value of the attribute.
The attribute signature shall be calculated as defined in Section 3.3.1.
For example, if the variable length message m to be signed is ‘D212001337’,
SignCounter is 0x00000001 and key is 0x611B64EBFBCD1FD372EC9196DF425E50,
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1528 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part F Page 1529
Attribute Protocol (ATT)
then message to be signed (M) by the CMAC function is the octet sequence
‘D21200133701000000’.
The padding(M) is 0x0000000137130012D280000000000000, resultant CMAC is
0xF20F903C931E87F159B64F012574B4D0 and Authentication Signature is the octet
sequence ‘01000000F1871E933C900FF2’.
The final signed message is ‘D21200133701000000F1871E933C900FF2’.
If the attribute value has a variable length, then the attribute value shall be truncated or
lengthened to match the length of the attribute value parameter.
Note: If an attribute value has a variable length and if the attribute value parameter is of
zero length, the attribute value will be fully truncated.
If the attribute value has a fixed length and the attribute value parameter length is
less than or equal to the length of the attribute value, the octets up to the attribute
value parameter length shall be written; all other octets in this attribute value shall be
unchanged.
If the attribute value has a variable length and the attribute value parameter length
exceeds the maximum valid length of the attribute value then the server shall ignore the
command.
If the attribute value has a fixed length and the requested attribute value parameter
length is greater than the length of the attribute value then the server shall ignore the
command.
If the authentication signature verification fails, then the server shall ignore the
command.
No ATT_ERROR_RSP PDU or ATT_WRITE_RSP PDU shall be sent in response to this
command. If the server cannot write this attribute for any reason the command shall be
ignored.
3.4.6 Queued writes
The purpose of queued writes is to queue up writes of values of multiple attributes in
a first-in first-out queue and then execute the write on all of them in a single atomic
operation.
Each client's queued values are separate; the execution of one queue shall not affect
the preparation or execution of any other client's queued values. Each client has a
single queue regardless of how many ATT bearers are currently established.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1529 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part F Page 1530
Attribute Protocol (ATT)
3.4.6.1 ATT_PREPARE_WRITE_REQ
The ATT_PREPARE_WRITE_REQ PDU is used to request the server to prepare
to write the value of an attribute. The server will respond to this request with an
ATT_PREPARE_WRITE_RSP PDU, so that the client can verify that the value was
received correctly.
A client may send more than one ATT_PREPARE_WRITE_REQ PDU to a server, which
will queue and send a response for each handle value pair.
A server may limit the number of prepared writes that it can queue. A higher layer
specification should define this limit.
After an ATT_PREPARE_WRITE_REQ PDU has been issued, and the response
received, any other attribute command or request can be issued from the same client to
the same server.
Any actions on attributes that exist in the prepare queue shall proceed as if the prepare
queue did not exist, and the prepare queue shall be unaffected by these actions. A
subsequent execute write will write the values in the prepare queue even if the value of
the attribute has changed since the prepared writes were started.
The Attribute Protocol makes no determination on the validity of the Part Attribute Value
or the Value Offset. A higher layer specification determines the meaning of the data.
Each ATT_PREPARE_WRITE_REQ PDU will be queued even if the attribute handle
is the same as a previous ATT_PREPARE_WRITE_REQ PDU. These will then be
executed in the order received, causing multiple writes for this attribute to occur.
If all ATT bearers belonging to the same client are lost while a number of pending
prepared write values have been queued, the queue will be cleared and no writes will
be executed.
Parameter Size (octets) Description
Attribute Opcode 1 0x16 = ATT_PREPARE_WRITE_REQ PDU
Attribute Handle 2 The handle of the attribute to be written
Value Offset 2 The offset of the first octet to be written
Part Attribute Value 0 to (ATT_MTU-5) The value of the attribute to be written
Table 3.34: Format of ATT_PREPARE_WRITE_REQ PDU
The Attribute Handle parameter shall be set to a valid handle.
The Value Offset parameter shall be set to the offset of the first octet where the Part
Attribute Value parameter is to be written within the attribute value. The Value Offset
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1530 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part F Page 1531
Attribute Protocol (ATT)
parameter is based from zero; the first octet has an offset of zero, the second octet has
an offset of one, etc.
The server shall respond with an ATT_PREPARE_WRITE_RSP PDU if the handle
is valid, the attribute has sufficient permissions to allow writing at this time, and the
prepare queue has sufficient space.
Note: The Attribute Value validation is done when an ATT_EXECUTE_WRITE_REQ
PDU is received. Hence, any Invalid Offset (0x07) or Invalid Attribute Value Length
(0x0D) errors are generated when an ATT_EXECUTE_WRITE_REQ PDU is received.
If the client has insufficient authorization to write the requested attribute then an
ATT_ERROR_RSP PDU shall be sent with the Error Code parameter set to Insufficient
Authorization (0x08).
If the client has insufficient security to write the requested attribute then an
ATT_ERROR_RSP PDU shall be sent with the Error Code parameter set to Insufficient
Authentication (0x05).
If the client has an encryption key size that is too short to write the requested attribute
then an ATT_ERROR_RSP PDU shall be sent with the Error Code parameter set to
Encryption Key Size Too Short (0x0C).
If the client has not enabled encryption, and encryption is required to write the
requested attribute, then an ATT_ERROR_RSP PDU shall be sent with the Error Code
parameter set to Insufficient Encryption (0x0F).
If the server does not have sufficient space to queue this request then an
ATT_ERROR_RSP PDU shall be sent with the Error Code parameter set to Prepare
Queue Full (0x09).
If the handle is invalid, then an ATT_ERROR_RSP PDU shall be sent with the Error
Code parameter set to Invalid Handle (0x01).
If the attribute value cannot be written then an ATT_ERROR_RSP PDU shall be sent
with the Error Code parameter set to Write Not Permitted (0x03).
The server shall not change the value of the attribute until an
ATT_EXECUTE_WRITE_REQ PDU is received.
If an ATT_PREPARE_WRITE_REQ PDU was invalid, and therefore an
ATT_ERROR_RSP PDU has been issued, then this prepared write will be considered to
have not been received. All existing prepared writes in the prepare queue shall not be
affected by this invalid request.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1531 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part F Page 1532
Attribute Protocol (ATT)
3.4.6.2 ATT_PREPARE_WRITE_RSP
The ATT_PREPARE_WRITE_RSP PDU is sent in response to a received
ATT_PREPARE_WRITE_REQ PDU and acknowledges that the value has been
successfully received and placed in the prepare write queue.
Parameter Size (octets) Description
Attribute Opcode 1 0x17 = ATT_PREPARE_WRITE_RSP PDU
Attribute Handle 2 The handle of the attribute to be written
Value Offset 2 The offset of the first octet to be written
Part Attribute Value 0 to (ATT_MTU-5) The value of the attribute to be written
Table 3.35: Format of ATT_PREPARE_WRITE_RSP PDU
The attribute handle shall be set to the same value as in the corresponding
ATT_PREPARE_WRITE_REQ PDU.
The value offset and part attribute value shall be set to the same values as in the
corresponding ATT_PREPARE_WRITE_REQ PDU.
3.4.6.3 ATT_EXECUTE_WRITE_REQ
The ATT_EXECUTE_WRITE_REQ PDU is used to request the server to write or cancel
the write of all the prepared values currently held in the prepare queue from this client.
This request shall be handled by the server as an atomic operation.
Parameter Size (octets) Description
Attribute Opcode 1 0x18 = ATT_EXECUTE_WRITE_REQ PDU
Flags 1 0x00 – Cancel all prepared writes
0x01 – Immediately write all pending prepared values
Table 3.36: Format of ATT_EXECUTE_WRITE_REQ PDU
When the flags parameter is set to 0x01, all pending prepared write values that are
currently queued shall be written in the order they were received in the corresponding
ATT_PREPARE_WRITE_REQ PDUs. The queue shall then be cleared and an
ATT_EXECUTE_WRITE_RSP PDU shall be sent.
When the flags parameter is set to 0x00 all pending prepared write values
shall be discarded for this client. The queue shall then be cleared, and an
ATT_EXECUTE_WRITE_RSP PDU shall be sent.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1532 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part F Page 1533
Attribute Protocol (ATT)
Note: If multiple ATT bearers were used to send the prepared write requests, then the
order that writes sent on different ATT bearers are executed is not specified and is
not reported to the client. In addition, if the ATT_EXECUTE_WRITE_REQ PDU is sent
before the client has received responses to all the prepared write requests, the requests
for which the client has not yet received a response might form part of a subsequent
write rather than this one; this is also not reported to the client.
If there are no pending prepared write values, then no values are written and an
ATT_EXECUTE_WRITE_RSP PDU shall be sent.
If the prepared Attribute Value exceeds the maximum valid length of the attribute value,
then all pending prepared write values shall be discarded for this client, the queue shall
then be cleared, and then an ATT_ERROR_RSP PDU shall be sent with the Error Code
parameter set to Invalid Attribute Value Length (0x0D).
If the prepared Value Offset is greater than the current length of the attribute value,
then all pending prepared write values shall be discarded for this client, the queue shall
be cleared, and then an ATT_ERROR_RSP PDU shall be sent with the Error Code
parameter set to Invalid Offset (0x07).
If the pending prepared write values cannot be written due to an application error, then
the queue shall be cleared and then an ATT_ERROR_RSP PDU shall be sent with a
higher layer specification defined error code. The Attribute Handle In Error parameter
shall be set to the attribute handle of the attribute from the prepare queue that caused
this application error. The state of the attributes that were to be written from the prepare
queue is not defined in this case.
If the pending prepared write values cannot be written due to a database change, then
the queue shall be cleared and then an ATT_ERROR_RSP PDU shall be sent with the
Error Code parameter set to Database Out Of Sync (0x12). The Attribute Handle In
Error parameter shall be set to the attribute handle of the attribute from the prepare
queue that caused this error. The state of the attributes that were to be written from the
prepare queue is not defined in this case.
3.4.6.4 ATT_EXECUTE_WRITE_RSP
The ATT_EXECUTE_WRITE_RSP PDU is sent in response to a received
ATT_EXECUTE_WRITE_REQ PDU.
Parameter Size Description
Attribute Opcode 1 0x19 - ATT_EXECUTE_WRITE_RSP PDU
Table 3.37: Format of ATT_EXECUTE_WRITE_RSP PDU
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1533 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part F Page 1534
Attribute Protocol (ATT)
The ATT_EXECUTE_WRITE_RSP PDU shall be sent after the attributes are written. In
case an action is taken in response to the write, an indication may be used once the
action is complete.
3.4.7 Server initiated
3.4.7.1 ATT_HANDLE_VALUE_NTF
A server can send a notification of an attribute’s value at any time.
Parameter Size (octets) Description
Attribute Opcode 1 0x1B = ATT_HANDLE_VALUE_NTF PDU
Attribute Handle 2 The handle of the attribute
Attribute Value 0 to (ATT_MTU-3) The current value of the attribute
Table 3.38: Format of ATT_HANDLE_VALUE_NTF PDU
The attribute handle shall be set to a valid handle.
The attribute value shall be set to the current value of the attribute identified by the
attribute handle.
If the attribute value is longer than (ATT_MTU-3) octets, then only the first (ATT_MTU-3)
octets of this attributes value can be sent in a notification.
Note: For a client to get a long attribute, it must use the ATT_READ_BLOB_REQ PDU
(see Section 3.4.4.5) following the receipt of this notification.
If the attribute handle or the attribute value is invalid, then this notification shall be
ignored upon reception.
3.4.7.2 ATT_HANDLE_VALUE_IND
A server can send an indication of an attribute’s value.
Parameter Size (octets) Description
Attribute Opcode 1 0x1D = ATT_HANDLE_VALUE_IND PDU
Attribute Handle 2 The handle of the attribute
Attribute Value 0 to (ATT_MTU-3) The current value of the attribute
Table 3.39: Format of ATT_HANDLE_VALUE_IND PDU
The attribute handle shall be set to a valid handle.
The attribute value shall be set to the current value of the attribute identified by the
attribute handle.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1534 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part F Page 1535
Attribute Protocol (ATT)
If the attribute value is longer than (ATT_MTU-3) octets, then only the first (ATT_MTU -
3) octets of this attributes value can be sent in an indication.
Note: For a client to get a long attribute, it must use the ATT_READ_BLOB_REQ PDU
(see Section 3.4.4.5) following the receipt of this indication.
The client shall send an ATT_HANDLE_VALUE_CFM PDU in response to an
ATT_HANDLE_VALUE_IND PDU. No further indications to this client shall occur until
the confirmation has been received by the server.
If the attribute handle or the attribute value is invalid, the client shall send an
ATT_HANDLE_VALUE_CFM PDU in response and shall discard the handle and value
from the received indication.
3.4.7.3 ATT_HANDLE_VALUE_CFM
The ATT_HANDLE_VALUE_CFM PDU is sent in response to a received
ATT_HANDLE_VALUE_IND PDU and confirms that the client has received an indication
of the given attribute.
Parameter Size (octets) Description
Attribute Opcode 1 0x1E = ATT_HANDLE_VALUE_CFM PDU
Table 3.40: Format of ATT_HANDLE_VALUE_CFM PDU
3.4.7.4 ATT_MULTIPLE_HANDLE_VALUE_NTF
A server can send a notification of two or more attributes' values at any time.
Parameter Size (octets) Description
Attribute Opcode 1 0x23 = ATT_MULTIPLE_-
HANDLE_VALUE_NTF
Handle Length Value Tuple List 8 to (ATT_MTU-1) A list of Handle Length Value Tuples
Table 3.41: Format of ATT_MULTIPLE_HANDLE_VALUE_NTF PDU
The Handle Length Value Tuple List shall be a concatenation of Handle Length Value
Tuples for each of the attributes being notified.
The server shall not truncate a Handle Length Value Tuple.
The Attribute Handle field in a Handle Length Value Tuple shall be set to the handle of
the attribute being notified. The Value Length field in a Handle Length Value Tuple shall
be set to the length of the Attribute Value field. The Attribute Value field in a Handle
Length Value Tuple shall be set to the value of the attribute being notified.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1535 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part F Page 1536
Attribute Protocol (ATT)
Attribute Handle Value Length Attribute Value
2 octets 2 octets (Value Length) octets
Table 3.42: Format of the Handle Length Value Tuple
If an attribute handle or an attribute value is invalid, then the client shall ignore that
attribute when receiving this notification.
3.4.8 Attribute Opcode summary
Table 3.43 gives a summary of the Attribute Protocol PDUs.
Attribute PDU Name Attribute Opcode Parameters
ATT_ERROR_RSP 0x01 Request Opcode in Error,
Attribute Handle In Error,
Error Code
ATT_EXCHANGE_MTU_REQ 0x02 Client Rx MTU
ATT_EXCHANGE_MTU_RSP 0x03 Server Rx MTU
ATT_FIND_INFORMATION_REQ 0x04 Starting Handle,
Ending Handle
ATT_FIND_INFORMATION_RSP 0x05 Format,
Information Data
ATT_FIND_BY_TYPE_VALUE_REQ 0x06 Starting Handle,
Ending Handle,
Attribute Type,
Attribute Value
ATT_FIND_BY_TYPE_VALUE_RSP 0x07 Handles Information List
ATT_READ_BY_TYPE_REQ 0x08 Starting Handle,
Ending Handle,
UUID
ATT_READ_BY_TYPE_RSP 0x09 Length,
Attribute Data List
ATT_READ_REQ 0x0A Attribute Handle
ATT_READ_RSP 0x0B Attribute Value
ATT_READ_BLOB_REQ 0x0C Attribute Handle,
Value Offset
ATT_READ_BLOB_RSP 0x0D Part Attribute Value
ATT_READ_MULTIPLE_REQ 0x0E Handle Set
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1536 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part F Page 1537
Attribute Protocol (ATT)
Attribute PDU Name Attribute Opcode Parameters
ATT_READ_MULTIPLE_RSP 0x0F Value Set
ATT_READ_BY_GROUP_TYPE_REQ 0x10 Start Handle,
Ending Handle,
UUID
ATT_READ_BY_GROUP_TYPE_RSP 0x11 Length,
Attribute Data List
ATT_WRITE_REQ 0x12 Attribute Handle,
Attribute Value
ATT_WRITE_RSP 0x13 none
ATT_WRITE_CMD 0x52 Attribute Handle,
Attribute Value
ATT_PREPARE_WRITE_REQ 0x16 Attribute Handle,
Value Offset,
Part Attribute Value
ATT_PREPARE_WRITE_RSP 0x17 Attribute Handle,
Value Offset,
Part Attribute Value
ATT_EXECUTE_WRITE_REQ 0x18 Flags
ATT_EXECUTE_WRITE_RSP 0x19 none
ATT_READ_MULTIPLE_VARIABLE_REQ 0x20 Set Of Handles
ATT_READ_MULTIPLE_VARIABLE_RSP 0x21 Length Value Tuple List
ATT_MULTIPLE_HANDLE_VALUE_NTF 0x23 Handle Length Value Tuple List
ATT_HANDLE_VALUE_NTF 0x1B Attribute Handle,
Attribute Value
ATT_HANDLE_VALUE_IND 0x1D Attribute Handle,
Attribute Value
ATT_HANDLE_VALUE_CFM 0x1E none
ATT_SIGNED_WRITE_CMD 0xD2 Attribute Handle,
Attribute Value,
Authentication Signature
Table 3.43: Attribute Protocol summary
3.4.9 Attribute PDU response summary
Table 3.44 gives a summary of the Attribute PDU Method responses that are allowed.
Each method indicates the method that should be sent as a successful response,
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1537 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part F Page 1538
Attribute Protocol (ATT)
and whether an ATT_ERROR_RSP PDU can be sent in response instead. If an
ATT_ERROR_RSP PDU can be sent, then Table 3.44 also indicates the error codes
that are valid within this ATT_ERROR_RSP PDU for the given method.
Attribute PDU Method Successful Response ATT_ERROR_- Valid Error Codes
PDU RSP Allowed
ATT_EXCHANGE_- ATT_EXCHANGE_- Yes Request Not Supported (0x06)
MTU_REQ MTU_RSP
ATT_FIND_- ATT_FIND_- Yes Invalid Handle (0x01),
INFORMATION_REQ INFORMATION_RSP
Attribute Not Found (0x0A)
ATT_FIND_BY_- ATT_FIND_BY_- Yes Invalid Handle (0x01),
TYPE_VALUE_REQ TYPE_VALUE_RSP
Request Not Supported
(0x06),
Attribute Not Found (0x0A)
ATT_READ_BY_- ATT_READ_BY_- Yes Invalid Handle (0x01),
TYPE_REQ TYPE_RSP
Database Out of Sync (0x12),
Request Not Supported
(0x06),
Attribute Not Found (0x0A),
Insufficient Authorization
(0x08),
Insufficient Authentication
(0x05),
Insufficient Encryption (0x0F),
Encryption Key Size Too Short
(0x0C),
Read Not Permitted (0x02),
Application Error (0x80 to
0x9F),
Common Profile and Service
Error Codes (0xE0 to 0xFF)
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1538 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part F Page 1539
Attribute Protocol (ATT)
Attribute PDU Method Successful Response ATT_ERROR_- Valid Error Codes
PDU RSP Allowed
ATT_READ_REQ ATT_READ_RSP Yes Invalid Handle (0x01),
Database Out Of Sync (0x12),
Insufficient Authorization
(0x08),
Insufficient Authentication
(0x05),
Insufficient Encryption (0x0F),
Encryption Key Size Too Short
(0x0C),
Read Not Permitted (0x02),
Application Error (0x80 to
0x9F),
Common Profile and Service
Error Codes (0xE0 to 0xFF)
ATT_READ_BLOB_- ATT_READ_BLOB_- Yes Invalid Handle (0x01),
REQ RSP
Database Out Of Sync (0x12),
Request Not Supported
(0x06),
Insufficient Authorization
(0x08),
Insufficient Authentication
(0x05),
Insufficient Encryption (0x0F),
Encryption Key Size Too Short
(0x0C),
Read Not Permitted (0x02),
Invalid Offset (0x07),
Attribute Not Long (0x0B),
Application Error (0x80 to
0x9F),
Common Profile and Service
Error Codes (0xE0 to 0xFF)
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1539 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part F Page 1540
Attribute Protocol (ATT)
Attribute PDU Method Successful Response ATT_ERROR_- Valid Error Codes
PDU RSP Allowed
ATT_READ_- ATT_READ_- Yes Invalid Handle (0x01),
MULTIPLE_REQ MULTIPLE_RSP
Database Out Of Sync (0x12),
Request Not Supported
(0x06),
Insufficient Authorization
(0x08),
Insufficient Authentication
(0x05),
Insufficient Encryption (0x0F),
Encryption Key Size Too Short
(0x0C),
Read Not Permitted (0x02),
Application Error (0x80 to
0x9F),
Common Profile and Service
Error Codes (0xE0 to 0xFF)
ATT_READ_BY_- ATT_READ_BY_- Yes Invalid Handle (0x01),
GROUP_TYPE_REQ GROUP_TYPE_RSP
Request Not Supported
(0x06),
Attribute Not Found (0x0A),
Insufficient Authorization
(0x08),
Insufficient Authentication
(0x05),
Insufficient Encryption (0x0F),
Encryption Key Size Too Short
(0x0C),
Read Not Permitted (0x02),
Unsupported Group Type
(0x10),
Application Error (0x80 to
0x9F),
Common Profile and Service
Error Codes (0xE0 to 0xFF)
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1540 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part F Page 1541
Attribute Protocol (ATT)
Attribute PDU Method Successful Response ATT_ERROR_- Valid Error Codes
PDU RSP Allowed
ATT_READ_- ATT_READ_- Yes Invalid Handle (0x01),
MULTIPLE_- MULTIPLE_-
Database Out Of Sync (0x12),
VARIABLE_REQ VARIABLE_RSP
Request Not Supported
(0x06),
Insufficient Authorization
(0x08),
Insufficient Authentication
(0x05),
Insufficient Encryption (0x0F),
Encryption Key Size Too Short
(0x0C),
Read Not Permitted (0x02),
Application Error (0x80 to
0x9F),
Common Profile and Service
Error Codes (0xE0 to 0xFF)
ATT_WRITE_REQ ATT_WRITE_RSP Yes Invalid Handle (0x01),
Database Out Of Sync (0x12),
Request Not Supported
(0x06),
Insufficient Authorization
(0x08),
Insufficient Authentication
(0x05),
Insufficient Encryption (0x0F),
Encryption Key Size Too Short
(0x0C),
Write Not Permitted (0x03),
Invalid Attribute Value Length
(0x0D),
Application Error (0x80 to
0x9F),
Common Profile and Service
Error Codes (0xE0 to 0xFF)
ATT_WRITE_CMD none No none
ATT_SIGNED_- none No none
WRITE_CMD
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1541 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part F Page 1542
Attribute Protocol (ATT)
Attribute PDU Method Successful Response ATT_ERROR_- Valid Error Codes
PDU RSP Allowed
ATT_PREPARE_- ATT_PREPARE_- Yes Invalid Handle (0x01),
WRITE_REQ WRITE_RSP
Database Out Of Sync (0x12),
Request Not Supported
(0x06),
Insufficient Authorization
(0x08),
Insufficient Authentication
(0x05),
Write Not Permitted (0x03),
Prepare Queue Full (0x09),
Insufficient Encryption (0x0F),
Encryption Key Size Too Short
(0x0C),
Application Error (0x80 to
0x9F),
Common Profile and Service
Error Codes (0xE0 to 0xFF)
ATT_EXECUTE_- ATT_EXECUTE_- Yes Application Error (0x80 to
WRITE_REQ WRITE_RSP 0x9F),
Common Profile and Service
Error Codes (0xE0 to 0xFF),
Invalid Offset (0x07),
Invalid Attribute Value Length
(0x0D),
Database Out Of Sync (0x12)
ATT_HANDLE_- none No none
VALUE_NTF
ATT_HANDLE_- ATT_HANDLE_- No none
VALUE_IND VALUE_CFM
ATT_MULTIPLE_- none No none
HANDLE_VALUE_-
NTF
Table 3.44: Attribute request and response summary
Bluetooth SIG Proprietary Version Date: 2025-11-03
