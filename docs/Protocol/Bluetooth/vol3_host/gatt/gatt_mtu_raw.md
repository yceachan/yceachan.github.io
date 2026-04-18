# GATT MTU Specification

### Page 1579 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part G Page 1580
Generic Attribute Profile (GATT)
Feature Sub-Procedure Ref. Support in Support in
Client Server
Characteristic Descriptor Read Characteristic De- 4.12.1 O C.4
Value Read scriptor
Read Long Characteristic 4.12.2 O C.4
Descriptor
Characteristic Descriptor Write Characteristic De- 4.12.3 O C.4
Value Write scriptor
Write Long Characteristic 4.12.4 O O
Descriptor
C.1: Write Without Response is mandatory if Signed Write Without Response or Enhanced ATT
Bearers are supported otherwise optional
C.2: Write Characteristic Value is mandatory if Write Long Characteristic Value or Enhanced ATT
Bearers are supported otherwise optional
C.3: If Service Changed Characteristic is present, this feature is mandatory, otherwise optional.
C.4: If Enhanced ATT Bearers are supported then this feature is mandatory, otherwise optional.
Table 4.1: GATT feature mapping to procedures
4.3 Server configuration
This procedure is used by the client to configure the Attribute Protocol. This procedure
has only one sub-procedure used to set the MTU sizes.
4.3.1 Exchange MTU
This sub-procedure is used by the client to set the ATT_MTU to the maximum possible
value that can be supported by both devices when the client supports a value greater
than the default ATT_MTU for the Attribute Protocol. This sub-procedure shall only be
initiated once during a connection.
This sub-procedure shall not be used on a BR/EDR physical link since the MTU size is
negotiated using L2CAP channel configuration procedures.
The ATT_EXCHANGE_MTU_REQ PDU is used by this sub-procedure. The Client Rx
MTU parameter shall be set to the maximum MTU that this client can receive.
Two possible responses can be sent from the server for
the ATT_EXCHANGE_MTU_REQ PDU: ATT_EXCHANGE_MTU_RSP and
ATT_ERROR_RSP PDUs.
An ATT_ERROR_RSP PDU is returned if an error occurred on the server.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1580 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part G Page 1581
Generic Attribute Profile (GATT)
The server shall respond to this message with an ATT_EXCHANGE_MTU_RSP PDU
with the Server Rx MTU parameter set to the maximum MTU that this server can
receive.
If the ATT_ERROR_RSP PDU is sent by the server with the Error Code parameter set
to Request Not Supported (0x06), the Attribute Opcode is not supported and the default
MTU shall be used.
Once the messages have been exchanged, the ATT_MTU shall be set to the minimum
of the Client Rx MTU and Server Rx MTU values.
Client Server
ATT_EXCHANGE_MTU_REQ(0x0200)
ATT_EXCHANGE_MTU_RSP(0x0032)
Figure 4.1: Exchange MTU
For example, in Figure 4.1, based on the exchanged ATT_MTU values, the ATT_MTU
would be 0x0032.
4.4 Primary Service Discovery
This procedure is used by a client to discover primary services on a server. Once the
primary services are discovered, additional information about the primary services can
be accessed using other procedures, including characteristic discovery and relationship
discovery to find other related primary and secondary services.
There are two sub-procedures that can be used for primary service discovery: Discover
All Primary Services and Discover Primary Service by Service UUID.
4.4.1 Discover All Primary Services
This sub-procedure is used by a client to discover all the primary services on a server.
The ATT_READ_BY_GROUP_TYPE_REQ PDU shall be used with the Attribute Type
parameter set to the UUID for «Primary Service». The Starting Handle shall be set to
0x0001 and the Ending Handle shall be set to 0xFFFF.
Two possible responses can be sent from the server for the
ATT_READ_BY_GROUP_TYPE_REQ PDU: ATT_READ_BY_GROUP_TYPE_RSP
and ATT_ERROR_RSP PDUs.
An ATT_ERROR_RSP PDU is returned if an error occurred on the server.
Bluetooth SIG Proprietary Version Date: 2025-11-03
