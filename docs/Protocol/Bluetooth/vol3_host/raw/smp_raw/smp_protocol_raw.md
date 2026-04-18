# SMP Protocol Commands (PDU 格式与密钥分发)

> 本文档提取自 Vol 3, Part H Security Manager Specification。

### Page 1679 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part H Page 1680
Security Manager Specification
3 SECURITY MANAGER PROTOCOL
3.1 Introduction
The Security Manager Protocol (SMP) is used for pairing and transport specific key
distribution.
3.2 Security Manager Channel over L2CAP
All SMP commands are sent over the Security Manager Channel which is an L2CAP
fixed channel (see [Vol 3] Part A, Section 2.1). The configuration parameters for the
Security Manager Channel when LE Secure Connections is not supported shall be as
shown below in Table 3.1.
Parameter Value
MTU 23
Flush Timeout 0xFFFF (Infinite)
QoS Best Effort
Mode Basic Mode
Table 3.1: Security Manager Channel configuration parameters without LE Secure Connections
The configuration parameters for the Security Manager Channel when LE Secure
Connections is supported shall be as shown below in Table 3.2.
Parameter Value
MTU 65
Flush Timeout 0xFFFF (Infinite)
QoS Best Effort
Mode Basic Mode
Table 3.2: Security Manager Channel configuration parameters with LE Secure Connections
3.3 Command format
The general format for all SMP commands is shown in Figure 3.1.
LSB 1 octet 0 to 22 or 64 octets MSB
Code Data
Figure 3.1: SMP command format
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1680 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part H Page 1681
Security Manager Specification
The following are the fields shown:
• Code (1 octet)
The Code field is one octet long and identifies the type of command. Table 3.3 lists
the codes defined by this document. If a packet is received with a Code that is
reserved for future use it shall be ignored.
Code Description Logical Link Supported
0x01 Pairing Request LE-U, ACL-U
0x02 Pairing Response LE-U, ACL-U
0x03 Pairing Confirm LE-U
0x04 Pairing Random LE-U
0x05 Pairing Failed LE-U, ACL-U
0x06 Encryption Information LE-U
0x07 Central Identification LE-U
0x08 Identity Information LE-U, ACL-U
0x09 Identity Address Information LE-U, ACL-U
0x0A Signing Information LE-U, ACL-U
0x0B Security Request LE-U
0x0C Pairing Public Key LE-U
0x0D Pairing DHKey Check LE-U
0x0E Pairing Keypress Notification LE-U
All other values Reserved for future use
Table 3.3: SMP command codes
• Data (0 or more octets)
The Data field is variable in length. The Code field determines the format of the Data
field.
If a device does not support pairing then it shall respond with a Pairing Failed command
with the reason set to “Pairing Not Supported” (see Section 3.5.5) when any command
is received. If pairing is supported then all commands shall be supported.
3.4 SMP timeout
To protect the Security Manager protocol from stalling, a Security Manager Timer is
used. Upon transmission of the Security Request command or reception of the Security
Request command, the Security Manager Timer shall be reset and restarted. Upon
transmission of the Pairing Request command or reception of the Pairing Request
command, the Security Manager Timer shall be reset and started.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1681 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part H Page 1682
Security Manager Specification
The Security Manager Timer shall be reset when an L2CAP SMP command is queued
for transmission. The Security Manager Timer should be reset upon reception of a
Keypress Notification (if the timer is not reset on receipt of a Keypress Notification, the
Security Manager can time out before the peer's Security Manager because there is no
response to a Keypress Notification).
When a Pairing process completes (whether successfully or not), the Security Manager
Timer shall be stopped.
If the Security Manager Timer reaches 30 seconds, the procedure shall be considered
to have failed, and the local higher layer shall be notified. No further SMP commands
shall be sent over the L2CAP Security Manager Channel. A new Pairing process shall
only be performed when a new physical link has been established.
3.5 Pairing methods
The SMP commands defined in this section are used to perform Pairing Feature
Exchange and key generation (see Section 2.1).
3.5.1 Pairing Request
The initiator starts the Pairing Feature Exchange by sending a Pairing Request
command to the responding device. The Pairing Request command is defined in
Figure 3.2.
The rules for handing a collision between a pairing procedure on the LE transport and a
pairing procedure on the BR/EDR transport are defined in [Vol 3] Part C, Section 14.2.
LSB MSB
octet 0 octet 1 octet 2 octet 3
IO OOB
Code=0x01 AuthReq
Capability data flag
Maximum Responder
Initiator Key
Encryption Key
Distribution
Key Size Distribution
Figure 3.2: Pairing Request packet
The following data fields are used:
• IO Capability (1 octet)
Table 3.4 defines the values which are used when exchanging IO capabilities (see
Section 2.3.2).
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1682 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part H Page 1683
Security Manager Specification
Value Description
0x00 DisplayOnly
0x01 DisplayYesNo
0x02 KeyboardOnly
0x03 NoInputNoOutput
0x04 KeyboardDisplay
0x05 to 0xFF Reserved for future use
Table 3.4: IO capability values
• OOB data flag (1 octet)
Table 3.5 defines the values which are used when indicating whether OOB
authentication data is available (see Section 2.3.3).
Value Description
0x00 OOB Authentication data not present
0x01 OOB Authentication data from remote device present
0x02 to 0xFF Reserved for future use
Table 3.5: OOB data present values
• AuthReq (1 octet)
The AuthReq field is a bit field that indicates the requested security properties (see
Section 2.3.1) for the STK and LTK and GAP bonding information (see [Vol 3] Part C,
Section 9.4).
Figure 3.3 defines the authentication requirements bit field.
LSB MSB
Bonding_Flags MITM SC Keypress CT2 RFU
(2 bits) (1 bit) (1 bit) (1 bit) (1 bit) (2 bits)
Figure 3.3: Authentication requirements flags
The Bonding_Flags field is a 2-bit field that indicates the type of bonding being
requested by the initiating device as defined in Table 3.6.
Bonding_Flags Bonding Type
b b
1 0
00 No Bonding
01 Bonding
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1683 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part H Page 1684
Security Manager Specification
Bonding_Flags Bonding Type
b b
1 0
10 Reserved for future use
11 Reserved for future use
Table 3.6: Bonding flags
The MITM field is a 1-bit flag that is set to one if the device is requesting MITM
protection, otherwise it shall be set to 0. A device sets the MITM flag to one to request
an Authenticated security property for the STK when using LE legacy pairing and the
LTK when using LE Secure Connections.
The SC field is a 1 bit flag. If LE Secure Connections pairing is supported by the device,
then the SC field shall be set to 1, otherwise it shall be set to 0. If both devices support
LE Secure Connections pairing, then LE Secure Connections pairing shall be used,
otherwise LE Legacy pairing shall be used.
The keypress field is a 1-bit flag that is used only in the Passkey Entry protocol and
shall be ignored in other protocols. When both sides set that field to one, Keypress
notifications shall be generated and sent using SMP Pairing Keypress Notification
PDUs.
The CT2 field is a 1-bit flag that shall be set to 1 upon transmission to indicate support
for the h7 function. See Section 2.4.2.4 and Section 2.4.2.5.
• Maximum Encryption Key Size (1 octet)
This value defines the maximum encryption key size in octets that the device can
support. The maximum key size shall be in the range 7 to 16 octets.
• Initiator Key Distribution / Generation (1 octet)
The Initiator Key Distribution / Generation field indicates which keys the initiator
is requesting to distribute / generate or use during the Transport Specific Key
Distribution phase (see Section 2.4.3). The Initiator Key Distribution / Generation field
format and usage is defined in Section 3.6.1.
• Responder Key Distribution / Generation (1 octet)
The Responder Key Distribution / Generation field indicates which keys the initiator
is requesting the responder to distribute / generate or use during the Transport
Specific Key Distribution phase (see Section 2.4.3). The Responder Key Distribution /
Generation field format and usage is defined in Section 3.6.1.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1684 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part H Page 1685
Security Manager Specification
If Secure Connections pairing has been initiated over BR/EDR, the following fields of
the SM Pairing Request PDU are reserved for future use:
• the IO Capability field,
• the OOB data flag field, and
• all bits in the Auth Req field except the CT2 bit.
3.5.2 Pairing Response
This command is used by the responding device to complete the Pairing Feature
Exchange after it has received a Pairing Request command from the initiating device,
if the responding device allows pairing. The Pairing Response command is defined in
Figure 3.4.
The rules for handing a collision between a pairing procedure on the LE transport and a
pairing procedure on the BR/EDR transport are defined in [Vol 3] Part C, Section 14.2.
If a Pairing Request is received over the BR/EDR transport when either cross-transport
key derivation/generation is not supported or the BR/EDR transport is not encrypted
using a Link Key generated using P256, a Pairing Failed shall be sent with the error
code Cross-Transport Key Derivation/Generation Not Allowed (0x0E).
If a Pairing Request is received and the device is not ready to perform the pairing
procedure, a Pairing Failed may be sent with the error code Busy (0x10).
LSB MSB
octet 0 octet 1 octet 2 octet 3
IO OOB
Code=0x02 AuthReq
Capability data flag
Maximum Responder
Initiator Key
Encryption Key
Distribution
Key Size Distribution
Figure 3.4: Pairing Response packet
The following data fields are used:
• IO Capability (1 octet)
Table 3.4 defines the values which are used when exchanging IO capabilities (see
Section 2.3.2).
• OOB data flag (1 octet)
Table 3.5 defines the values which are used when indicating whether OOB
authentication data is available (see Section 2.3.3).
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1685 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part H Page 1686
Security Manager Specification
• AuthReq (1 octet)
The AuthReq field is a bit field that indicates the requested security properties (see
Section 2.3.1) for the STK or LTK and GAP bonding information (see [Vol 3] Part C,
Section 9.4).
Figure 3.3 defines the authentication requirements bit field.
The Bonding_Flags field is a 2-bit field that indicates the type of bonding being
requested by the responding device as defined in Table 3.6.
The MITM field is a 1-bit flag that is set to one if the device is requesting MITM
protection, otherwise it shall be set to 0. A device sets the MITM flag to one to request
an Authenticated security property for the STK when using LE legacy pairing and the
LTK when using LE Secure Connections.
The SC field is a 1 bit flag. If LE Secure Connections pairing is supported by the
device, then the SC field shall be set to 1, otherwise it shall be set to 0. If both
devices support LE Secure Connections pairing, then LE Secure Connections pairing
shall be used, otherwise LE Legacy pairing shall be used.
The keypress field is a 1-bit flag that is used only in the Passkey Entry protocol and
shall be ignored in other protocols. When both sides set that field to one, Keypress
notifications shall be generated and sent using SMP Pairing Keypress Notification
PDUs.
The CT2 field is a 1-bit flag that shall be set to 1 upon transmission to indicate
support for the h7 function. See Section 2.4.2.4 and Section 2.4.2.5.
• Maximum Encryption Key Size (1 octet)
This value defines the maximum encryption key size in octets that the device can
support. The maximum key size shall be in the range 7 to 16 octets.
• Initiator Key Distribution (1 octet)
The Initiator Key Distribution field defines which keys the initiator shall distribute and
use during the Transport Specific Key Distribution phase (see Section 2.4.3). The
Initiator Key Distribution field format and usage are defined in Section 3.6.1.
• Responder Key Distribution (1 octet)
The Responder Key Distribution field defines which keys the responder shall
distribute and use during the Transport Specific Key Distribution phase (see
Section 2.4.3). The Responder Key Distribution field format and usage are defined
in Section 3.6.1.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1686 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part H Page 1687
Security Manager Specification
If Secure Connections pairing has been initiated over BR/EDR, the following fields of
the SM Pairing Response PDU are reserved for future use:
• the IO Capability field,
• the OOB data flag field, and
• all bits in the Auth Req field except the CT2 bit.
3.5.3 Pairing Confirm
This is used following a successful Pairing Feature Exchange to start STK Generation
for LE legacy pairing and LTK Generation for LE Secure Connections pairing. The
Pairing Confirm command is defined in Figure 3.5.
This command is used by both devices to send the confirm value to the peer
device, see Section 2.3.5.5 for LE legacy pairing and Section 2.3.5.6 for LE Secure
Connections pairing.
The initiating device starts key generation by sending the Pairing Confirm command
to the responding device. The initiating device can transmit a Pairing Failed command
instead to abort pairing.
The responding device sends the Pairing Confirm command after it has received a
Pairing Confirm command from the initiating device.
LSB octet 0 octet 1 octet 2 octet 3 MSB
Code=0x03 Confirm Value
Confirm Value
Confirm Value
Confirm Value
Confirm
Value
Figure 3.5: Pairing Confirm packet
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1687 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part H Page 1688
Security Manager Specification
The following data field is used:
• Confirm value (16 octets)
In LE legacy pairing, the initiating device sends LP_CONFIRM_I and the responding
device sends LP_CONFIRM_R as defined in Section 2.3.5.5. In LE Secure
Connections, Ca and Cb are defined in Section 2.2.6.
3.5.4 Pairing Random
This command is used by the initiating and responding device to send the random
number used to calculate the Confirm value sent in the Pairing Confirm command. The
Pairing Random command is defined in Figure 3.6.
The initiating device sends a Pairing Random command after it has received a Pairing
Confirm command from the responding device.
In LE legacy pairing, the responding device shall send a Pairing Random command
after it has received a Pairing Random command from the initiating device if the Confirm
value calculated on the responding device matches the Confirm value received from the
initiating device. If the calculated Confirm value does not match then the responding
device shall respond with the Pairing Failed command.
In LE Secure Connections, the responding device shall send a Pairing Random
command after it has received a Pairing Random command from the initiating device. If
the calculated Confirm value does not match then the responding device shall respond
with the Pairing Failed command.
The initiating device shall encrypt the link using the generated key (STK in LE legacy
pairing or LTK in LE Secure Connections) if the Confirm value calculated on the
initiating device matches the Confirm value received from the responding device. The
successful encryption or re-encryption of the link is the signal to the responding device
that key generation has completed successfully. If the calculated Confirm value does not
match then the initiating device shall respond with the Pairing Failed command.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1688 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part H Page 1689
Security Manager Specification
LSB octet 0 octet 1 octet 2 octet 3 MSB
Code=0x04 Random value
Random value
Random value
Random value
Random
value
Figure 3.6: Pairing Random packet
The following are the data fields:
• Random value (16 octets)
In LE legacy pairing, the initiating device sends LP_RAND_I and the responding
device sends LP_RAND_R as defined in Section 2.3.5.5. In LE Secure Connections,
the initiating device sends Na and the responding device sends Nb.
3.5.5 Pairing Failed
This is used when there has been a failure during pairing and reports that the pairing
procedure has been stopped and no further communication for the current pairing
procedure is to occur. The Pairing Failed command is defined in Figure 3.7.
Any subsequent pairing procedure shall restart from the Pairing Feature Exchange
phase.
This command may be sent at any time during the pairing process by either device in
response to a message from the remote device.
During LE Secure Connections pairing, this command shall be sent if the remote
device's public key is invalid (see Section 2.3.5.6.1). The Reason field shall be set
to "DHKey Check Failed".
LSB octet 0 octet 1 M SB
Code=0x05 Reason
Figure 3.7: Pairing Failed packet
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1689 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part H Page 1690
Security Manager Specification
The following data field is used:
• Reason (1 octets)
The Reason field indicates why the pairing failed. The reason codes are defined in
Table 3.7.
Value Name Description
0x01 Passkey Entry The user input of passkey failed, for example, the user cancelled the
Failed operation.
0x02 OOB Not Available The OOB data is not available.
0x03 Authentication Re- The pairing procedure cannot be performed as authentication re-
quirements quirements cannot be met due to IO capabilities of one or both
devices.
0x04 Confirm Value The confirm value does not match the calculated compare value.
Failed
0x05 Pairing Not Suppor- Pairing is not supported by the device.
ted
0x06 Encryption Key The resultant encryption key size is not long enough for the security
Size requirements of this device.
0x07 Command Not Sup- The SMP command received is not supported on this device.
ported
0x08 Unspecified Rea- Pairing failed due to an unspecified reason.
son
0x09 Repeated Attempts Pairing or authentication procedure is disallowed because too little
time has elapsed since last pairing request or security request.
0x0A Invalid Parameters The Invalid Parameters error code indicates that the command
length is invalid or that a parameter is outside of the specified range.
0x0B DHKey Check Indicates to the remote device that the DHKey Check value received
Failed doesn’t match the one calculated by the local device.
0x0C Numeric Compari- Indicates that the confirm values in the numeric comparison protocol
son Failed do not match.
0x0D BR/EDR pairing in Indicates that the pairing over the LE transport failed due to a Pair-
progress ing Request sent over the BR/EDR transport in progress.
0x0E Cross-transport Indicates that the BR/EDR Link Key generated on the BR/EDR
Key Deriva- transport cannot be used to derive and distribute keys for the LE
tion/Generation not transport or the LE LTK generated on the LE transport cannot be
allowed used to derive a key for the BR/EDR transport.
0x0F Key Rejected Indicates that the device chose not to accept a distributed key.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1690 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part H Page 1691
Security Manager Specification
Value Name Description
0x10 Busy Indicates that the device is not ready to perform a pairing procedure.
All other Reserved for future use.
values
Table 3.7: Pairing Failed reason codes
3.5.6 Pairing Public Key
This message is used to transfer the device’s local public key (X and Y co-ordinates) to
the remote device. This message is used by both the initiator and responder. This PDU
is only used for Secure Connections. Its format is specified in Figure 3.8.
LSB Octet 0 Octet 1 Octet 2 Octet 3 MSB
Code = 0x0C Public Key X [0-2]
Public Key X [3-6]
Public Key X [7-10]
Public Key X [11-14]
Public Key X [15-18]
Public Key X [19-22]
Public Key X [23-26]
Public Key X [27-30]
Public Key X
Public Key Y [0-2]
[31]
Public Key Y [3-6]
Public Key Y [7-10]
Public Key Y [11-14]
Public Key Y [15-18]
Public Key Y [19-22]
Public Key Y [23-26]
Public Key Y [27-30]
Public Key Y
[31]
Figure 3.8: Pairing Public Key PDU
3.5.7 Pairing DHKey Check
This message is used to transmit the 128-bit DHKey Check values (Ea and Eb)
generated using f6. These are confirmation values generated using the DHKey. This
message is used by both initiator and responder. This PDU is only used for LE Secure
Connections. Its format is specified in Figure 3.9.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1691 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part H Page 1692
Security Manager Specification
LSB Octet 0 Octet 1 Octet 2 Octet 3 MSB
Code = 0x0D DHKey Check (E) [0-2]
DHKey Check (E) [3-6]
DHKey Check (E) [7-10]
DHKey Check (E) [11-14]
DHKey check
(E) [15]
Figure 3.9: Pairing DHKey Check PDU
3.5.8 Keypress Notification
This message is used during the Passkey Entry protocol by a device with KeyboardOnly
IO capabilities to inform the remote device when keys have been entered or erased. Its
format is specified in Figure 3.10.
LSB Octet 0 Octet 1 MSB
Code = 0x0E Notification Type
Figure 3.10: Pairing Keypress Notification PDU
Notification Type can take one of the following values:
Value Parameter Description
0 Passkey entry started
1 Passkey digit entered
2 Passkey digit erased
3 Passkey cleared
4 Passkey entry completed
5 to 255 Reserved for future use
Table 3.8: Notification Type
3.6 Security in Bluetooth Low Energy
3.6.1 Key distribution and generation
Bluetooth Low Energy devices can distribute keys from the Peripheral to the Central
and from the Central to the Peripheral. When using LE legacy pairing, the following keys
may be distributed from the Peripheral to the Central:
• LTK using Encryption Information command
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1692 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part H Page 1693
Security Manager Specification
• EDIV and Rand using Central Identification command
• IRK using Identity Information command
• Public device or static random address using Identity Address Information command
• CSRK using Signing Information command
When using LE Secure Connections, the following keys may be distributed from the
Peripheral to the Central:
• IRK using Identity Information command
• Public device or static random address using Identity Address Information command
• CSRK using Signing Information command
When using LE legacy pairing, the Central may distribute to the Peripheral the following
key:
• LTK using Encryption Information command
• EDIV and Rand using Central Identification command
• IRK using Identity Information command
• Public device or static random address using Identity Address Information command
• CSRK using Signing Information command
When using LE Secure Connections, the Central may distribute to the Peripheral the
following key:
• IRK using Identity Information command
• Public device or static random address using Identity Address Information command
• CSRK using Signing Information command
The keys which are to be distributed in the Transport Specific Key Distribution phase
are indicated in the Key Distribution field of the Pairing Request and Pairing Response
commands see Section 3.5.1 and Section 3.5.2.
The format of the Initiator Key Distribution / Generation field and Responder Key
Distribution / Generation field in the Pairing Request and Pairing Response commands
for LE is defined in Figure 3.11.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1693 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part H Page 1694
Security Manager Specification
LSB MSB
EncKey IdKey SignKey LinkKey RFU
(1 bit) (1 bit) (1 bit) (1 bit) (4 bits)
Figure 3.11: LE Key Distribution format
The Key Distribution / Generation field has the following flags:
• In LE legacy pairing, EncKey is a 1-bit field that is set to one to indicate that the
device shall distribute LTK using the Encryption Information command followed by
EDIV and Rand using the Central Identification command.
In LE Secure Connections pairing, when SMP is running on the LE transport, then the
EncKey field shall be ignored. EDIV and Rand shall be set to zero and shall not be
distributed.
When SMP is running on the BR/EDR transport, the EncKey field is set to one to
indicate that the device would like to derive the LTK from the BR/EDR Link Key. When
EncKey is set to 1 by both devices in the initiator and responder Key Distribution /
Generation fields, the procedures for calculating the LTK from the BR/EDR Link Key
shall be used.
• IdKey is a 1-bit field that is set to one to indicate that the device shall distribute IRK
using the Identity Information command followed by its public device or static random
address using Identity Address Information.
• SignKey is a 1-bit field that is set to one to indicate that the device shall distribute
CSRK using the Signing Information command.
• LinkKey is a 1-bit field. When SMP is running on the LE transport, the LinkKey field
is set to one to indicate that the device would like to derive the Link Key from the
LTK. When LinkKey is set to 1 by both devices in the initiator and responder Key
Distribution / Generation fields, the procedures for calculating the BR/EDR link key
from the LTK shall be used. Devices not supporting LE Secure Connections shall
set this bit to zero and ignore it on reception. When SMP is running on the BR/EDR
transport, the LinkKey field is reserved for future use.
The Initiator Key Distribution / Generation field in the Pairing Request command is
used by the Central to request which keys are distributed or generated by the initiator
to the responder. The Responder Key Distribution / Generation field in the Pairing
Request command is used by the Central to request which keys are distributed or
generated by the responder to the initiator. The Initiator Key Distribution / Generation
field in the Pairing Response command from the Peripheral defines the keys that
shall be distributed or generated by the initiator to the responder. The Responder Key
Distribution / Generation field in the Pairing Response command from the Peripheral
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1694 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part H Page 1695
Security Manager Specification
defines the keys that shall be distributed or generated by the responder to the initiator.
The Peripheral shall not set to one any flag in the Initiator Key Distribution / Generation
or Responder Key Distribution / Generation field of the Pairing Response command that
the Central has set to zero in the Initiator Key Distribution / Generation and Responder
Key Distribution / Generation fields of the Pairing Request command.
When using LE legacy pairing, the keys shall be distributed in the following order:
1. LTK by the Peripheral
2. EDIV and Rand by the Peripheral
3. IRK by the Peripheral
4. BD_ADDR by the Peripheral
5. CSRK by the Peripheral
6. LTK by the Central
7. EDIV and Rand by the Central
8. IRK by the Central
9. BD_ADDR by the Central
10. CSRK by the Central
When using LE Secure Connections, the keys shall be distributed in the following order:
1. IRK by the Peripheral
2. BD_ADDR by the Peripheral
3. CSRK by the Peripheral
4. IRK by the Central
5. BD_ADDR by the Central
6. CSRK by the Central
If a key is not being distributed then the command to distribute that key shall not be
sent.
Note: If a key is not distributed, then the capabilities that use this key will not be
available. For example, if an LTK is not distributed from the Peripheral to the Central,
then the Central cannot encrypt a future link with that Peripheral, therefore pairing would
have to be performed again.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1695 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part H Page 1696
Security Manager Specification
Note: The initiator should determine the keys needed based on the capabilities that
are required by higher layer specifications. For example, if the initiator determines that
encryption is required in a future link with that Peripheral, then the initiator must request
that Peripheral's LTK is distributed by setting the EncKey bit to one in the Responder
Key Distribution / Generation field of the Pairing Request command.
A device may reject a distributed key by sending the Pairing Failed command with the
reason set to "Key Rejected".
If EncKey, IdKey, and SignKey are set to zero in the Initiator Key Distribution /
Generation and Responder Key Distribution / Generation fields, then no keys shall be
distributed or generated and the link will be encrypted using the generated STK when
using LE legacy pairing and LTK when using LE Secure Connections pairing.
Key distribution is complete in the device sending the final key when it receives the
Baseband acknowledgment for that key and is complete in the receiving device when it
receives the final key being distributed.
3.6.2 Encryption Information
Encryption Information is used in the LE legacy pairing Transport Specific Key
Distribution to distribute LTK that is used when encrypting future connections. The
Encryption Information command is defined in Figure 3.12.
The Encryption Information command shall only be sent when the link has been
encrypted or re-encrypted using the generated STK.
LSB octet 0 octet 1 octet 2 octet 3 MSB
Code=0x06 Long Term Key
Long Term Key
Long Term Key
Long Term Key
Long Term
Key
Figure 3.12: Encryption Information packet
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1696 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part H Page 1697
Security Manager Specification
The following is the data field:
• Long Term Key (16 octets)
The generated LTK value being distributed, see Section 2.4.2.3.
3.6.3 Central Identification
Central Identification is used in the LE legacy pairing Transport Specific Key Distribution
phase to distribute EDIV and Rand which are used when encrypting future connections.
The Central Identification command is defined in Figure 3.13.
The Central Identification command shall only be sent when the link has been encrypted
or re-encrypted using the generated STK.
LSB octet 0 octet 1 octet 2 octet 3 MSB
Code=0x07 EDIV Rand
Rand
Rand
Figure 3.13: Central Identification packet
The following data fields are used:
• EDIV (2 octets)
The EDIV value being distributed (see Section 2.4.2.3).
• Rand (8 octets)
64-bit Rand value being distributed (see Section 2.4.2.3).
3.6.4 Identity Information
Identity Information is used in the Transport Specific Key Distribution phase to distribute
the IRK. The Identity Information command is defined in Figure 3.14.
The Identity Information command shall only be sent when the link has been encrypted
or re-encrypted using the generated key.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1697 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part H Page 1698
Security Manager Specification
LSB octet 0 octet 1 octet 2 octet 3 MSB
Code=0x08 Identity Resolving Key
Identity Resolving Key
Identity Resolving Key
Identity Resolving Key
Identity
Resolving
Key
Figure 3.14: Identity Information packet
The following are the data fields:
• Identity Resolving Key (16 octets)
128-bit IRK value being distributed (see Section 2.4.2.1).
An all zero Identity Resolving Key data field indicates that a device does not have a
valid resolvable private address.
3.6.5 Identity Address Information
Identity Address Information is used in the Transport Specific Key Distribution phase
to distribute its public device address or static random address. The Identity Address
Information command is defined in Figure 3.15.
The Identity Address Information command shall only be sent when the link has been
encrypted or re-encrypted using the generated key.
LSB octet 0 octet 1 octet 2 octet 3 MSB
Code=0x09 AddrType BD_ADDR
BD_ADDR
Figure 3.15: Identity Address Information packet
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1698 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part H Page 1699
Security Manager Specification
The data fields are:
• AddrType (1 octet)
If BD_ADDR is a public device address, then AddrType shall be set to 0x00. If
BD_ADDR is a static random device address then AddrType shall be set to 0x01.
• BD_ADDR (6 octets)
This field is set to the distributing device’s public device address or static random
address.
3.6.6 Signing Information
Signing Information is used in the Transport Specific Key Distribution to distribute the
CSRK which a device uses to sign data. The Signing Information command is defined in
Figure 3.16.
The Signing Information command shall only be sent when the link has been encrypted
or re-encrypted using the generated key.
LSB octet 0 octet 1 octet 2 octet 3 MSB
Code=0x0A Signature Key
Signature Key
Signature Key
Signature Key
Signature
Key
Figure 3.16: Signing Information packet
The following data field is used:
• Signature Key (16 octets)
128-bit CSRK that is being distributed; see Section 2.4.2.2.
3.6.7 Security Request
The Security Request command is used by the Peripheral to request that the Central
initiates security with the requested security properties, see Section 2.4.6. The Security
Request command is defined in Figure 3.17.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1699 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part H Page 1700
Security Manager Specification
LSB octet 0 octet 1 MSB
Code=0x0B AuthReq
Figure 3.17: Security Request packet
The following data field is used:
• AuthReq (1 octet)
The AuthReq field is a bit field that indicates the requested security properties (see
Section 2.3.1) for the STK or LTK and GAP bonding information (see [Vol 3] Part C,
Section 9.4).
Figure 3.3 defines the authentication requirements bit field.
The Bonding_Flags field is a 2-bit field that indicates the type of bonding being
requested by the responding device as defined in Table 3.6.
The MITM field is a 1-bit flag that is set to one if the device is requesting MITM
protection, otherwise it shall be set to 0. A device sets the MITM flag to one to request
an Authenticated security property for the STK when using LE legacy pairing and the
LTK when using LE Secure Connections.
The SC field is a 1 bit flag. If LE Secure Connections pairing is supported by the
device, then the SC field shall be set to 1, otherwise it shall be set to 0. If both
devices support LE Secure Connections pairing, then LE Secure Connections pairing
shall be used, otherwise LE Legacy pairing shall be used.
The keypress field is a 1-bit flag that is used only in the Passkey Entry protocol and
shall be ignored in other protocols. When both sides set that field to one, Keypress
notifications shall be generated and sent using SMP Pairing Keypress Notification
PDUs.
Bluetooth SIG Proprietary Version Date: 2025-11-03
