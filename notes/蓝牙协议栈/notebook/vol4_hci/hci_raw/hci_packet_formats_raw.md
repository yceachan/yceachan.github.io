# HCI Packet Formats (Command, Event, ACL)

> 本文档提取自 Vol 4, Part E HCI Functional Specification。

### Page 1885 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 4, Part E Page 1886
Host Controller Interface Functional Specification
By following this procedure, the Controller can distinguish between the Broadcast
message sent by the Host and the new connection made (this could be even a new
synchronous link) even though the Connection_Handles are the same.
For an HCI ACL Data packet sent from the Controller to the Host where
the Broadcast_Flag is 01, the Connection_Handle parameter should contain the
Connection_Handle for the ACL connection to the Central that sent the broadcast.
For Connectionless Peripheral Broadcast, no Connection_Handle is assigned.
5.3.2 [This section is no longer used]
5.4 Exchange of HCI-specific information
The Host Controller Transport Layer provides transparent exchange of HCI specific
information. These transporting mechanisms provide the ability for the Host to send HCI
commands, receive HCI events, and send and receive data to the Controller. Since
the Host Controller Transport Layer provides transparent exchange of HCI-specific
information, the HCI specification specifies the format of the commands, events, and
data exchange between the Host and the Controller(s). The next sections specify the
HCI packet formats.
5.4.1 HCI Command packet
The HCI Command packet is used to send commands to the Controller from the Host.
The format of the HCI Command packet is shown in Figure 5.1, and the definition of
each field is explained below.
Controllers shall be able to accept HCI Command packets with up to 255 bytes of data
excluding the HCI Command packet header. The HCI Command packet header is the
first 3 octets of the packet.
Each command is assigned a 2 byte Opcode used to uniquely identify different types of
commands. The Opcode parameter is divided into two fields, called the Opcode Group
Field (OGF) and Opcode Command Field (OCF). The OGF occupies the upper 6 bits of
the Opcode, while the OCF occupies the remaining 10 bits. Any opcode not mentioned
in this Part is reserved for future use.
The OGF value 0x3E is reserved for specification development purposes.
The OGF of 0x3F is reserved for vendor-specific debug commands.
The organization of the opcodes allows additional information to be inferred without fully
decoding the entire Opcode.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1886 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 4, Part E Page 1887
Host Controller Interface Functional Specification
Note: The OGF composed of all ‘ones’ has been reserved for vendor-specific debug
commands. These commands are vendor-specific and are used during manufacturing,
for a possible method for updating firmware, and for debugging.
On receipt of a Vendor Specific Debug command the Controller should respond with
either:
1. An HCI_Command_Status event. If the status indicates success (Section 7.7.15)
then this event shall be followed by an HCI event with Event Code field of 0xFF
(Section 5.4.4).
2. An HCI_Command_Complete event specifying the corresponding Vendor Specific
Debug command opcode.
The Host shall assume that sending of an HCI_Vendor_Specific_Debug command will
consume an HCI command credit.
0 4 8 12 16 20 24 28 31
Opcode Parameter Total
Parameter 0
OCF OGF Length
Parameter 1 Parameter ...
Parameter N-1 Parameter N
Figure 5.1: HCI Command packet
Opcode: Size: 2 octets
Value Parameter Description
0xXXXX OGF Range (6 bits): 0x00 to 0x3F (0x3F reserved for vendor-specific debug com-
mands)
OCF Range (10 bits): 0x0000 to 0x03FF
Parameter_Total_Length: Size: 1 octet
Value Parameter Description
0xXX Lengths of all of the parameters contained in this packet measured in octets. (N.B.:
total length of parameters, not number of parameters)
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1887 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 4, Part E Page 1888
Host Controller Interface Functional Specification
Parameter 0 - N: Size: Parameter_Total_Length
Parameter Description
Each command has a specific number of parameters associated with it. These parameters and the
size of each of the parameters are defined for each command. Each parameter is an integer number of
octets in size.
5.4.2 HCI ACL Data packets
HCI ACL Data packets are used to exchange data between the Host and Controller.
There are two types of HCI ACL Data packets:
• Automatically-Flushable
• Non-Automatically-Flushable
Automatically-Flushable HCI ACL Data packets are flushed based on the setting of an
automatic flush timer (see Section 7.3.29). Non-Automatically-Flushable HCI ACL Data
packets are not controlled by the automatic flush timeout and shall not be automatically
flushed. The format of the HCI ACL Data packet is shown in Figure 5.2. The definition
for each of the fields in the data packets is explained below.
Hosts and Controllers shall be able to accept HCI ACL Data packets with up to 27 bytes
of data excluding the HCI ACL Data packet header on Connection_Handles associated
with an LE-U logical link.The HCI ACL Data packet header is the first 4 octets of the
packet.
0 4 8 12 16 20 24 28 31
PB BC
Handle Data Total Length
Flag Flag
Data
Figure 5.2: HCI ACL Data packet
Handle: Size: 12 Bits
Value Parameter Description
0xXXX Connection_Handle to be used for transmitting a data packet over a Controller.
Range: 0x000 to 0xEFF (all other values reserved for future use)
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1888 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 4, Part E Page 1889
Host Controller Interface Functional Specification
The Flag Bits consist of the Packet_Boundary_Flag and Broadcast_Flag. The
Packet_Boundary_Flag is located in bit 4 and bit 5, and the Broadcast_Flag is located in
bit 6 and bit 7 in the second octet of the HCI ACL Data packet.
Packet_Boundary_Flag: Size: 2 Bits
Value Parameter Description APB-U ACL-U LE-U
0b00 First non-automatically-flushable Host to Not al- Allowed Allowed
packet of a higher layer message Controller lowed
(start of a non-automatically-flusha-
Controller Not al- Not allowed Not al-
ble L2CAP PDU) from Host to Con-
to Host lowed (except dur- lowed
troller.
ing loop-
back)
0b01 Continuing fragment of a higher lay- Host to Allowed Allowed Allowed
er message Controller
Controller Allowed Allowed Allowed
to Host
0b10 First automatically flushable packet Host to Allowed Allowed C.1
of a higher layer message (start Controller
of an automatically-flushable L2CAP
Controller Allowed Allowed Allowed
PDU).
to Host
0b11 Previously used
C.1: Allowed if LE Feature (LE Flushable ACL Data packets) is supported, otherwise not allowed.
The start of a non-flushable packet of a higher layer message (start of a non-
automatically-flushable L2CAP PDU) with the PBF of 0b00 shall be transmitted with
an LLID of 0b10. All continuing fragment packets of a higher layer message shall be
transmitted with an LLID of 0b01.
Broadcast_Flag: Size: 2 Bits
Value Parameter Description
0b00 Point-to-point (ACL-U or LE-U)
0b01 BR/EDR broadcast (APB-U)
0b10 Reserved for future use.
0b11 Reserved for future use.
Note: The Broadcast_Flag value 0b01 may only be used in packets from Host to
Controller on the Central of a piconet and from Controller to Host on the Peripheral
of a piconet. Peripherals in Sniff mode will only receive a broadcast packet if it happens
to be sent in a sniff slot when the Peripheral is listening.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1889 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 4, Part E Page 1890
Host Controller Interface Functional Specification
Data_Total_Length: Size: 2 octets
Value Parameter Description
0xXXXX Length of data measured in octets.
5.4.3 HCI Synchronous Data packets
HCI Synchronous Data packets are used to exchange synchronous data (SCO and
eSCO) between the Host and Controller. The Controller may support HCI Synchronous
Data packets if the Baseband supports synchronous data, but not otherwise.
The format of the HCI Synchronous Data packet is shown in Figure 5.3. The definition
for each of the fields in the data packets is explained below. The HCI Synchronous Data
packet header is the first 3 octets of the packet.
0 4 8 12 16 20 24 28 31
Packet_
Connection_Handle Status_ RFU Data_Total_Length
Flag
Data
Figure 5.3: HCI Synchronous Data packet
Connection_Handle: Size: 12 Bits
Value Parameter Description
0xXXX Connection_Handle to be used to for transmitting a synchronous data packet.
Range: 0x0000 to 0x0EFF
The Packet_Status_Flag bits consist of two bits, which are located from bit 4 to 5 in the
second octet of the HCI Synchronous Data packet.
The Host shall set the Packet_Status_Flag bits to 0b00.
If the Erroneous_Data_Reporting parameter was set to disabled when the synchronous
connection was created, the Controller shall set the Packet_Status_Flag bits to 0b00
and whether or not data is provided for cases when a valid (e)SCO packet was not
received is unspecified.
If the Erroneous_Data_Reporting parameter was set to enabled when the synchronous
connection was created, the Controller shall set the Packet_Status_Flag according to
the following table.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1890 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 4, Part E Page 1891
Host Controller Interface Functional Specification
Packet_Status_Flag (in packets sent by the Controller): Size: 2 Bits
Value Parameter Description
0b00 Correctly received data. The payload data belongs to received eSCO or SCO packets that the
Baseband marked as “good data”.
0b01 Possibly invalid data. At least one eSCO packet has been marked by the Baseband as “data
with possible errors” and all others have been marked as “good data” in the eSCO interval(s)
corresponding to the HCI Synchronous Data packet.
0b10 No data received. All data from the Baseband received during the (e)SCO interval(s) corre-
sponding to the HCI Synchronous Data packet have been marked as "lost data" by the
Baseband. The Payload data octets shall be set to 0.
0b11 Data partially lost. Not all, but at least one (e)SCO packet has been marked as “lost data” by
the Baseband in the (e)SCO intervals corresponding to the HCI Synchronous Data packet.
The payload data octets corresponding to the missing (e)SCO packets shall be set to 0.
Note: Some HCI transports and/or Controller implementations will align the HCI
Synchronous Data packets with the (e)SCO Baseband packets such that data
integrity can be explicitly marked in the Packet_Status_Flag. For HCI transports or
Controller implementations that do not preserve this alignment, information in the
Packet_Status_Flag may be ambiguous.
Data_Total_Length: Size: 1 octet
Value Parameter Description
0xXX Length of synchronous data measured in octets
5.4.4 HCI Event packet
The HCI Event packet is used by the Controller to notify the Host when events occur. If
the Controller sends an HCI Event Packet containing an Event Code or an LE subevent
code that the Host has not masked out and does not support, the Host shall ignore that
packet. Any event code or LE subevent code not mentioned in this Part is reserved for
future use. The Host shall be able to accept HCI Event packets with up to 255 octets
of data excluding the HCI Event packet header. The format of the HCI Event packet is
shown in Figure 5.4, and the definition of each field is explained below. The HCI Event
packet header is the first 2 octets of the packet.
The event code 0xFE is reserved for specification development purposes. The event
code 0xFF is reserved for vendor-specific debugging events.
Note: An LE Controller uses a single Event Code (see Section 7.7.65) to transmit all LE
specific events from the Controller to the Host. The first Event Parameter is always a
subevent code identifying the specific event.
Controllers should use subevent codes with Event Codes 0xFE and 0xFF.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1891 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 4, Part E Page 1892
Host Controller Interface Functional Specification
0 4 8 12 16 20 24 28 31
Parameter Total
Event Code Event Parameter 0
Length
Event Parameter 1 Event Parameter 2 Event Parameter 3
Event Parameter N-1 Event Parameter N
Figure 5.4: HCI Event packet
Event_Code: Size: 1 octet
Value Parameter Description
0xXX Each event is assigned a 1-Octet event code used to uniquely identify different types of
events.
Parameter_Total_Length: Size: 1 octet
Value Parameter Description
0xXX Length of all of the parameters contained in this packet, measured in octets
Event_Parameter 0 - N: Size: Parameter_Total_Length
Value Parameter Description
0xXX Each event has a specific number of parameters associated with it. These parameters and
the size of each of the parameters are defined for each event. Each parameter is an integer
number of octets in size.
5.4.5 HCI ISO Data packets
HCI ISO Data packets are used to exchange isochronous data between the Host
and Controller. The Controller may support HCI ISO Data packets if the Link Layer
supports any of the LE features Connected Isochronous Stream - Central, Connected
Isochronous Stream - Peripheral, Isochronous Broadcaster, or Synchronized Receiver,
but not otherwise.
An HCI ISO Data packet holds either an SDU or part of an SDU. In the Host to
Controller direction, it cannot contain more data than the size of the buffer supported by
the Controller. If the length of an SDU is greater than the Controller's buffer size, the
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1892 (Original)

Host may need to fragment that SDU. The Controller shall not start sending an SDU or
fragments of an SDU to the Host until all the PDUs containing data from that SDU have
either been received or can no longer be received because the last opportunity for them
to be transmitted has passed. SDU fragments generated over HCI are unrelated to the
SDU fragments generated by ISOAL.
The format of the HCI ISO Data packet is shown in Figure 5.5. The definition of each
field in the packet is given below. The HCI ISO Data packet header is the first 4 octets
of the packet.
0 4 8 12 16 20 24 28 31
Connection_Handle
galF_BP galF_ST
UFR Data_Total_Length UFR
Time_Stamp
Packet_Sequence_Number ISO_SDU_Length UFR _tekcaP _sutatS
galF
BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 4, Part E Page 1893
Host Controller Interface Functional Specification
ISO_SDU_Fragment
Figure 5.5: Format of an HCI ISO Data packet
If PB_Flag equals 0b00 or 0b10, then the Packet_Sequence_Number,
ISO_SDU_Length, and Packet_Status_Flag fields (plus the intermediate RFU field)
shall all be present in the packet and the Time_Stamp field may be present. If PB_Flag
equals 0b01 or 0b11, then none of these fields shall be included in the packet.
Connection_Handle: Size: 12 bits
Value Parameter Description
0xXXX Connection_Handle to be used for transmitting an ISO SDU or fragment.
Range: 0x000 to 0xEFF
PB_Flag: Size: 2 bits
Value Parameter Description
0b00 The ISO_SDU_Fragment field contains the first fragment of a fragmented SDU.
0b01 The ISO_SDU_Fragment field contains an intermediate fragment of an SDU.
0b10 The ISO_SDU_Fragment field contains a complete SDU.
0b11 The ISO_SDU_Fragment field contains the last fragment of an SDU.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1893 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 4, Part E Page 1894
Host Controller Interface Functional Specification
TS_Flag: Size: 1 bit
Value Parameter Description
0 The Time_Stamp field is not present in the packet.
1 The Time_Stamp field is present in the packet.
Data_Total_Length: Size: 14 bits
Value Parameter Description
0xXXXX Length of the packet, excluding the packet header, in octets.
In the Host to Controller direction, Data_Total_Length shall be less than or equal
to the size of the buffer supported by the Controller (which is returned using the
ISO_Data_Packet_Length return parameter of the LE Read Buffer Size command).
If PB_Flag is 0b01 or 0b11, then Data_Total_Length may be zero. Otherwise
Data_Total_Length is at least 4 if TS_Flag is 0 and at least 8 if TS_Flag is 1.
Time_Stamp: Size: 32 bits
Value Parameter Description
0xXXXXXXXX A time, in microseconds (see [Vol 6] Part G, Section 3).
Packet_Sequence_Number: Size: 16 bits
Value Parameter Description
0xXXXX The sequence number of the SDU (see [Vol 6] Part G, Section 2).
ISO_SDU_Length: Size: 12 bits
Value Parameter Description
0xXXXX The total length of the SDU (and not of any individual fragments), in octets.
The Packet_Status_Flag field indicates the status of the packet that the Controller
receives over the isochronous physical channel. The Packet_Status_Flag field is only
valid in HCI ISO Data packets sent by the Controller and is reserved for future use in
packets sent by the Host.
Packet_Status_Flag (in packets sent by the Controller) Size: 2 bits
Value Parameter Description
0b00 Valid data. The complete SDU was received correctly.
Bluetooth SIG Proprietary Version Date: 2025-11-03
