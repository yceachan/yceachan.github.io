# LLCP Specification

### Page 3189 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 6, Part B Page 3190
Link Layer Specification
5 LINK LAYER CONTROL
The Link Layer Control protocol is used to control and negotiate aspects of the
operation of a connection between two Link Layers. This includes procedures for control
of the connection, starting and pausing encryption and other link procedures.
Procedures have specific timeout rules as defined in Section 5.2. The ACL Termination
procedure may be initiated at any time, even if any other Link Layer control procedure is
currently active. For all other Link Layer control procedures, only one Link Layer control
procedure shall be initiated in the Link Layer at a time per connection per device. A
new Link Layer control procedure shall not be initiated until any previous Link Layer
control procedure initiated by the same device on the same connection has completed.
However, except where forbidden elsewhere in this section, a Link Layer may initiate an
LL control procedure while responding to a procedure initiated by its peer device.
Except where stated otherwise in this section, there are no restrictions on the order that
Link Layer control procedures are carried out except that no procedure shall be started
until after entering the Connection state.
The prioritization of LL Control PDUs and LL Data PDUs is implementation specific. For
example, a Host cannot assume that pending data will be sent when a termination of
the link is requested without waiting for those data PDUs to have completed and be
indicated to the Host.
If the remote device does not support a procedure, the Link Layer will normally receive
an LL_UNKNOWN_RSP with the UnknownType field set to the opcode of the initiating
PDU. In this case, the procedure is terminated when the LL_UNKNOWN_RSP PDU is
received.
5.1 Link Layer ACL control procedures
Except for any wording describing the behavior of a Link Layer that does not support a
feature, the requirements in each subsection below only apply if the Link Layer supports
the relevant feature (see Section 4.6).
5.1.1 Connection Update procedure
The Central or Peripheral may update the Link Layer parameters for a connection
(connInterval, connPeripheralLatency, and connSupervisionTimeout) by applying the
following rules.
If both the Central and Peripheral support the Connection Parameters Request
procedure (see Section 5.1.7) then either device should use that procedure. However,
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 3190 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 6, Part B Page 3191
Link Layer Specification
if the Peripheral rejects the proposed connection parameters, the Central may update
them using the Connection Update procedure.
If the Central, the Peripheral, or both do not support the Connection Parameters
Request procedure, then the Central shall send an LL_CONNECTION_UPDATE_IND
PDU (the Peripheral shall not send this PDU) while the Peripheral shall use the L2CAP
LE Signaling channel (see [Vol 3] Part A, Section 4.20 and Section 4.21).
If a device supports the Connection Parameters Request procedure but does not know
whether its peer does because, in the current connection, neither device has previously
attempted that procedure or performed a Feature Exchange procedure, then it shall
initiate the Connection Parameters Request procedure and, if the peer responds with
an LL_UNKNOWN_RSP PDU, by then using the method described in the previous
paragraph.
A Central shall not issue the LL_CONNECTION_UPDATE_IND PDU when a CS
procedure or CS procedure repeat instances, as described in Section 4.5.18.1, a
Connection Rate Request procedure, or a Connection Rate Update procedure is in
progress.
The Link Layer of the Central shall determine the connInterval from the interval range
given by the Host (Connection_Interval_Min to Connection_Interval_Max); the value
chosen shall be at least connIntervalUncodedMin µs. However, if the current PHY
in either direction is the LE Coded PHY and the Controller supports the LE Data
Packet Length Extension feature, then the new connection interval shall be at least
connIntervalCodedMin µs.
The Link Layer shall indicate to the Host the selected interval value.
Section 5.5 shall apply to the LL_CONNECTION_UPDATE_IND PDU. The Central
should transmit on the connection event where connEventCount equals Instant and
the connection event before that event, irrespective of subrating. When the Peripheral
receives such a PDU with the instant in the future, it shall listen to the connection event
where connEventCount equals Instant and the connection event before that event, even
if subrating or Peripheral latency means it would not normally do so.
The connection interval used before the instant is known as connInterval . The
OLD
connection interval contained in the LL_CONNECTION_UPDATE_IND PDU and used
at the instant and after, is known as connInterval .
NEW
The connection Peripheral latency used before the instant is known as
connPeripheralLatency . The connection Peripheral latency contained in the
OLD
LL_CONNECTION_UPDATE_IND PDU and used at the instant and after, is known as
connPeripheralLatency .
NEW
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 3191 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 6, Part B Page 3192
Link Layer Specification
The connection supervision timeout used before the instant is known as
connSupervisionTimeout . The connection supervision timeout contained in the
OLD
LL_CONNECTION_UPDATE_IND PDU and used at the instant and after, is known
as connSupervisionTimeout . The connection supervision timer shall be reset at the
NEW
instant.
If the connection interval is changed, the subrate factor shall be set to 1 and the
continuation number shall be set to 0 at the instant.
transmitWindowSize
Instant
Transmit Window
transmitWindowOffset
Last event transmitted with First event transmitted with Second event transmitted with
old connection parameters new connection parameters new connection parameters
C→P P→C C→P P→C C→P P→C
T_IFS_ACL_CP transmitWindowOffset T_IFS_ACL_CP T_IFS_ACL_CP
 t 
connIntervalOLD transmitWindowOffset+transmitWindowSize connIntervalNEW
Figure 5.1: Connection event timing in the case of connection parameter update
For example, the interval between the preceding connection event before the instant
and the instant will be connInterval . The interval between the connection event after
OLD
the instant and the following connection event will be connInterval .
NEW
The Central may adjust the anchor point when deciding the timing of the first
packet transmitted with new connection parameters. A transmit window is used,
as defined in Section 4.5.3. The transmit window starts at connInterval +
OLD
transmitWindowOffset after the anchor point of the connection event before the instant.
The transmitWindowOffset shall be a multiple of 1.25 ms in the range 0 ms to
connInterval .The transmitWindowSize shall be a multiple of 1.25 ms in the range
NEW
1.25 ms to the lesser of 10 ms and (connInterval - 1.25 ms).
NEW
Note: If the Peripheral first receives the LL_CONNECTION_UPDATE_IND PDU on the
instant, it can immediately use that packet as the new anchor point and does not apply
the transmitWindowOffset and transmitWindowSize.
The Central shall start to send the first packet within the transmit window as defined in
Section 4.5.3. The Central’s first packet may extend beyond the transmit window.
The first packet sent after the instant by the Central determines the new anchor point for
the connection events, and therefore the timings of all future connection events in this
connection.
The instant occurs after connInterval and before transmitWindowOffset. All the
OLD
normal connection event transmission rules specified in Section 4.5.1 shall apply.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 3192 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 6, Part B Page 3193
Link Layer Specification
At the start of the transmit window, the Link Layer shall reset T .
LLconnSupervision
If the Link Layer of the Central transmits an LL_CONNECTION_UPDATE_IND PDU
autonomously, for example without being requested to by the Host, the Latency and
Timeout parameters shall not be changed and shall remain the same as in the last
LL_CONNECTION_UPDATE_IND, CONNECT_IND, or AUX_CONNECT_REQ PDU.
Any of the other parameters (transmitWindowSize, transmitWindowOffset, connInterval,
Instant) may be changed within the restrictions given above.
Note: Autonomous updates can be used to change the anchor points to allow the
Central to change the scheduling of the connection due to other activities.
The Link Layer shall notify its Host if any of the three connection parameters have
changed. If no connection parameters are changed, the Host would not be notified; this
is called an anchor point move.
The procedure has completed when the instant has passed, and the new connection
event parameters have been applied.
5.1.2 Channel Map Update procedure
The Central may update the Link Layer parameter for channel map (channelMap) by
sending an LL_CHANNEL_MAP_IND PDU. The Peripheral shall not send this PDU.
The Central’s Controller may update the channel map without being requested to by the
Host.
Section 5.5 shall apply to the LL_CHANNEL_MAP_IND PDU.
The channel map used before the instant is known as channelMap . The channel
OLD
map contained in the LL_CHANNEL_MAP_IND PDU and used at the instant and after,
is known as channelMap .
NEW
When connEventCount is equal to the Instant field, the channelMap shall
NEW
be the current channelMap. The lastUnmappedChannel shall not be reset. If the
unmappedChannel is an unused channel, then the channelMap will be used when
NEW
remapping. The only parameter that changes is the channelMap.
For example:
At connection set-up:
• initial channelMap : 0x1FFFFFFFFF (i.e., all channels enabled)
OLD
• initial hopIncrement: 10 (decimal)
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 3193 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 6, Part B Page 3194
Link Layer Specification
An LL_CHANNEL_MAP_IND PDU with the following parameters is then issued:
• Instant: 100 (decimal). Assume that no connection event count wrap-around occurred
since the start of the connection.
• channelMap : 0x1FFFFFF7FF (i.e. all channels enabled except channel 11)
NEW
Channels used:
• connEventCount 99 --> data channel index 1 (channelMap )
OLD
• connEventCount 100 --> data channel index 12 (remapped from 11)
(channelMap )
NEW
• connEventCount 101 --> data channel index 21 (channelMap )
NEW
The procedure has completed when the instant has passed and the new channel map
has been applied to the ACL. If the ACL has any associated CISes, the new channel
map shall be used on each CIS starting with the next CIS event after the instant.
5.1.3 Encryption procedure
The Link Layer of the Central or Peripheral, upon request from the Host, may enable the
encryption of packets using the encryption start procedure.
Once the connection is encrypted, the Link Layer may change the encryption key
by using the encryption pause procedure, which encapsulates the encryption start
procedure.
The Link Layer shall not initiate the encryption start procedure or pause procedure while
there is an established CIS associated with the ACL.
5.1.3.1 Encryption Start procedure
To enable encryption, two parameters have to be exchanged, IV and SKD. Both
are composed of two parts, a Central part and a Peripheral part, and exchanged
in LL_ENC_REQ and LL_ENC_RSP PDUs. After these are exchanged, and the
Peripheral's Host has notified its Link Layer of the Long Term Key to be used
on this connection, encryption is started using a three way handshake, using
LL_START_ENC_REQ and LL_START_ENC_RSP PDUs.
To start encryption, the Link Layer of the Central shall generate the Central’s part of the
initialization vector (IV_C) and the Central’s part of the session key diversifier (SKD_C).
IV_C shall be a 32 bit random number generated by the Link Layer of the Central.
SKD_C shall be a 64 bit random number generated by the Link Layer of the Central.
Both IV_C and SKD_C shall be generated using the requirements for random number
generation defined in [Vol 2] Part H, Section 2.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 3194 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 6, Part B Page 3195
Link Layer Specification
Before transmitting the LL_ENC_REQ PDU, the Link Layer of the Central shall finalize
the sending of the current Data Physical Channel PDU and may finalize the sending
of additional Data Physical Channel PDUs queued in the Controller. After these
Data Physical Channel PDUs are acknowledged, until this procedure has completed
or specifies otherwise, the Link Layer of the Central shall only send Empty PDUs,
LL_TERMINATE_IND PDUs, and PDUs required by this procedure.
The Link Layer of the Central shall then send an LL_ENC_REQ PDU; the Rand and
EDIV fields are provided by the Host. After the Central receives the LL_ENC_RSP PDU
in response, only PDUs required by this procedure are expected.
If encryption is not supported by the Link Layer of the Peripheral, the Link Layer of
the Peripheral shall send an LL_REJECT_IND or LL_REJECT_EXT_IND PDU with the
ErrorCode set to Unsupported Remote Feature (0x1A). The Link Layer of the Central
receiving the LL_REJECT_IND or LL_REJECT_EXT_IND PDU shall notify the Host.
The Link Layer of the Central may now send LL Data PDUs and LL Control PDUs;
these packets will not be encrypted. This procedure has completed in the Central
when the Central receives the LL_REJECT_IND or LL_REJECT_EXT_IND PDU from
the Peripheral. The Central should acknowledge this PDU using an Empty PDU. The
procedure has completed in the Peripheral when it sends the LL_REJECT_IND or
LL_REJECT_EXT_IND PDU to the Central.
Otherwise, when the Link Layer of the Peripheral receives an LL_ENC_REQ PDU it
shall generate the Peripheral’s part of the initialization vector (IV_P) and the Peripheral’s
part of the session key diversifier (SKD_P). IV_P shall be a 32 bit random number
generated by the Link Layer of the Peripheral. SKD_P shall be a 64 bit random
number generated by the Link Layer of the Peripheral. Both IV_P and SKD_P shall
be generated using the requirements for random number generation defined in [Vol 2]
Part H, Section 2.
The Link Layer of the Peripheral shall finalize the sending of the current Data Physical
Channel PDU and may finalize the sending of additional Data Physical Channel PDUs
queued in the Controller. After these Data Physical Channel PDUs are acknowledged,
until this procedure has completed or specifies otherwise, the Link Layer of the
Peripheral shall only send Empty PDUs, LL_TERMINATE_IND PDUs, and PDUs
required by this procedure.
If any of the Data Physical Channel PDUs sent by the Peripheral is an LL Control PDU,
the Link Layers shall resume any outstanding procedure(s) after the Encryption Start
procedure has completed.
The Link Layer of the Peripheral shall then send an LL_ENC_RSP PDU. The Link
Layer of the Peripheral shall then notify the Host with the Rand and EDIV fields. After
having sent the LL_ENC_RSP PDU, the Link Layer of the Peripheral can receive an
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 3195 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 6, Part B Page 3196
Link Layer Specification
LL_UNKNOWN_RSP PDU corresponding to an LL Control PDU sent by the Peripheral.
The Peripheral should not disconnect the link in this case.
Each Link Layer shall combine the initialization vector parts and session key diversifier
parts in the following manner:
SKD = SKD_P || SKD_C
IV = IV_P || IV_C
The SKD_C is concatenated with the SKD_P. The least significant octet of SKD_C
becomes the least significant octet of SKD. The most significant octet of SKD_P
becomes the most significant octet of SKD.
The IV_C is concatenated with the IV_P. The least significant octet of IV_C becomes
the least significant octet of IV. The most significant octet of IV_P becomes the most
significant octet of IV.
The Long Term Key is always provided by the Host to the Link Layer in the Central and
may be provided by the Host to the Link Layer in the Peripheral. One of the following
three actions shall occur:
• If this procedure is being performed after a Pause Encryption procedure, and the
Peripheral's Host does not provide a Long Term Key, the Peripheral shall perform the
ACL Termination procedure with the error code PIN or Key Missing (0x06).
• If the Peripheral's Host does not provide a Long Term Key, either because
the event to the Host was masked out or if the Host indicates that a key
is not available, the Peripheral shall either send an LL_REJECT_IND with the
ErrorCode set to PIN or Key Missing (0x06) or an LL_REJECT_EXT_IND PDU
with the RejectOpcode set to "LL_ENC_REQ" and the ErrorCode set to PIN or
Key Missing (0x06). Upon receiving an LL_REJECT_IND or LL_REJECT_EXT_IND
PDU, the Central's Link Layer shall notify its Host. Both Link Layers may now
send LL Data PDUs and LL Control PDUs; these packets will not be encrypted.
This procedure has completed in the Central when the Central receives the
LL_REJECT_IND or LL_REJECT_EXT_IND PDU from the Peripheral. The procedure
has completed in the Peripheral when the acknowledgment has been received for the
LL_REJECT_IND or LL_REJECT_EXT_IND PDU from the Central.
• If the Peripheral's Host does provide a Long Term Key, both Link Layers shall
calculate the session key as e(LTK, SKD), where e is defined in [Vol 3] Part H,
Section 2.2.1.
After the Peripheral's Link Layer has calculated the session key, it shall send an
LL_START_ENC_REQ PDU. This packet shall be sent unencrypted and the Link Layer
shall be set up to receive an encrypted packet in response.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 3196 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 6, Part B Page 3197
Link Layer Specification
When the Link Layer of the Central receives an LL_START_ENC_REQ PDU it shall
send an LL_START_ENC_RSP PDU. This PDU shall be sent encrypted and the Link
Layer shall be set up to receive an encrypted packet in response.
When the Link Layer of the Peripheral receives an LL_START_ENC_RSP PDU it shall
transmit an LL_START_ENC_RSP PDU. This packet shall be sent encrypted.
When the Link Layer of the Central receives the LL_START_ENC_RSP PDU, the
connection is encrypted. The Link Layer may now send LL Data PDUs and LL Control
PDUs; these PDUs will be encrypted.
The Link Layers shall notify the Hosts that the connection is encrypted.
The procedure has completed in the Central when the Central receives the
LL_START_ENC_RSP PDU from the Peripheral. The procedure has completed in
the Peripheral when the Peripheral receives the LL_START_ENC_RSP PDU from the
Central.
If, at any time during the encryption start procedure after the Peripheral has received
the LL_ENC_REQ PDU or the Central has received the LL_ENC_RSP PDU, the Link
Layer of the Central or the Peripheral receives an unexpected Data Physical Channel
PDU from the peer Link Layer, it shall immediately exit the Connection state, and
shall transition to the Standby state. The Host shall be notified that the link has been
disconnected with the error code Connection Terminated Due to MIC Failure (0x3D).
5.1.3.2 Encryption Pause procedure
To enable a new encryption key to be used without disconnecting the link, encryption
is disabled and then enabled again. During the pause, data PDUs shall not be sent
unencrypted to protect the data.
The Link Layer of the Central shall finalize the sending of the current Data Physical
Channel PDU and may finalize the sending of additional Data Physical Channel PDUs
queued in the Controller. After these Data Physical Channel PDUs are acknowledged,
until this procedure has completed, the Link Layer of the Central shall only send Empty
PDUs, LL_TERMINATE_IND PDUs, and PDUs required by this procedure.
The Link Layer of the Central shall then send an LL_PAUSE_ENC_REQ PDU. After the
Central receives the LL_PAUSE_ENC_RSP PDU in response, only PDUs required by
this procedure are expected.
When the Link Layer of the Peripheral receives an LL_PAUSE_ENC_REQ PDU it shall
finalize the sending of the current Data Physical Channel PDU and may finalize the
sending of additional Data Physical Channel PDUs queued in the Controller. After these
Data Physical Channel PDUs are acknowledged, until this procedure has completed,
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 3197 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 6, Part B Page 3198
Link Layer Specification
the Link Layer of the Peripheral shall only send Empty PDUs, LL_TERMINATE_IND
PDUs, and PDUs required by this procedure.
If any of the Data Physical Channel PDUs sent by the Peripheral is an LL Control PDU,
the Link Layers shall resume any outstanding procedure(s) after the Encryption Start
procedure has completed.
The Link Layer of the Peripheral shall then send an LL_PAUSE_ENC_RSP PDU. This
packet shall be sent encrypted and Link Layer shall be set up to receive an unencrypted
packet in response.
When the Link Layer of the Central receives an LL_PAUSE_ENC_RSP PDU it shall be
set up to send and receive unencrypted. It shall then send an LL_PAUSE_ENC_RSP
PDU to the Peripheral unencrypted.
When the Link Layer of the Peripheral receives an LL_PAUSE_ENC_RSP PDU it shall
be set up to also send unencrypted.
The two Link Layers shall then carry out the steps of the encryption start procedure
to re-enable encryption using a new session key. The encryption pause procedure has
completed when this encapsulated encryption start procedure has completed.
If, at any time during the encryption pause procedure after the Peripheral has received
the LL_PAUSE_ENC_REQ PDU or the Central has received the LL_PAUSE_ENC_RSP
PDU, the Link Layer of the Central or the Peripheral receives an unexpected
Data Physical Channel PDU from the peer Link Layer, it shall immediately exit the
Connection state, and shall transition to the Standby state. The Host shall be notified
that the link has been disconnected with the error code Connection Terminated Due to
MIC Failure (0x3D).
5.1.4 Feature Exchange procedure
The Central or Peripheral may initiate the Feature Exchange procedure to exchange the
Link Layer parameter for the current supported feature set (FeatureSet).
The FeatureSet information may be cached either during a connection or between
connections. A Link Layer should not request this information on every connection if
the information has been cached for this device. Cached information for a device from
a previous connection is not authoritative and, therefore, an implementation must be
able to accept the LL_UNKNOWN_RSP PDU if use of a feature is attempted that is not
currently supported or used by the peer (see Section 2.4.2).
The FeatureSet_C parameter is the feature capabilities of the Link Layer of the Central
with certain bits set to zero as specified in Section 4.6.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 3198 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 6, Part B Page 3199
Link Layer Specification
The FeatureSet_P parameter is the feature capabilities of the Link Layer of the
Peripheral with certain bits set to zero as specified in Section 4.6.
The FeatureSet_USED parameter is one octet long and is the logical AND of the least
significant octets of FeatureSet_C and FeatureSet_P.
5.1.4.1 Central-initiated Feature Exchange procedure
The Link Layer of the Central initiates this procedure by sending an LL_FEATURE_REQ
PDU to the Peripheral. This may be done on request from the Host or autonomously.
When the Link Layer of the Peripheral receives this, it shall respond by sending an
LL_FEATURE_RSP PDU.
When the Link Layer of the Central sends an LL_FEATURE_REQ PDU, the FeatureSet
field shall be set to the first 8 octets of FeatureSet_C.
When the Link Layer of the Peripheral sends an LL_FEATURE_RSP PDU, octet 0 of the
FeatureSet field shall be set to FeatureSet_USED and the remaining octets shall be set
to octets 1 to 7 of FeatureSet_P.
The procedure has completed when the Central receives the LL_FEATURE_RSP PDU
from the Peripheral.
5.1.4.2 Peripheral-initiated Feature Exchange procedure
The Link Layer of the Peripheral initiates this procedure by sending an
LL_PERIPHERAL_FEATURE_REQ PDU to the Central. This may be done on request
from the Host or autonomously. When the Link Layer of the Central receives this, it shall
respond by sending an LL_FEATURE_RSP PDU.
When the Link Layer of the Peripheral sends an LL_PERIPHERAL_FEATURE_REQ
PDU, the FeatureSet field shall be set to the first 8 octets of FeatureSet_P.
When the Link Layer of the Central sends an LL_FEATURE_RSP PDU, octet 0 of the
FeatureSet field shall be set to FeatureSet_USED and the remaining octets shall be set
to octets 1 to 7 of FeatureSet_C.
If the LL_PERIPHERAL_FEATURE_REQ PDU was issued as a result of a Host-initiated
read remote features procedure (see [Vol 4] Part E, Section 7.8.21) and the Central
does not support this procedure, then the Host shall be notified that the read remote
features procedure has completed with the ErrorCode set to Unsupported Remote
Feature (0x1A).
The procedure has completed when the Peripheral receives the LL_FEATURE_RSP
PDU from the Central.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 3199 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 6, Part B Page 3200
Link Layer Specification
5.1.4.3 Feature Page Exchange procedure
The Link Layer of the Central or Peripheral initiates this procedure by sending an
LL_FEATURE_EXT_REQ PDU to the peer device. This may be done on request from
the Host or autonomously. When the peer device receives this PDU, it shall respond by
sending an LL_FEATURE_EXT_RSP PDU to the initiating device.
The responding device shall set the PageNumber field of the LL_FEATURE_EXT_RSP
PDU to the same value as received in the PageNumber field of the
LL_FEATURE_EXT_REQ PDU. Each device shall set FeaturePage to the
corresponding page of FeatureSet_C if the device is the Central or of FeatureSet_P
if the device is the Peripheral.
Each device shall set MaxPage to the number of the highest-numbered page of
FeatureSet_C (if the device is the Central) or FeatureSet_P (if the device is the
Peripheral) containing at least one bit set to 1.
The procedure has completed when the initiating device receives the
LL_FEATURE_EXT_RSP PDU from the responding device.
5.1.5 Version Exchange procedure
The Central or Peripheral may initiate the Version Exchange procedure to exchange the
Link Layer parameters for version information (companyID, subVerNum, linkLayerVer,
as defined in Section 2.4.2.13) by sending an LL_VERSION_IND PDU. This procedure
should be used when requested by the Host. This procedure may be initiated
autonomously by the Link Layer.
The Link Layer shall only queue for transmission a maximum of one LL_VERSION_IND
PDU during a connection.
If the Link Layer receives an LL_VERSION_IND PDU and has not already sent an
LL_VERSION_IND then the Link Layer shall send an LL_VERSION_IND PDU to the
peer device.
If the Link Layer receives an LL_VERSION_IND PDU and has already sent an
LL_VERSION_IND PDU then the Link Layer shall not send another LL_VERSION_IND
PDU to the peer device.
The procedure has completed when an LL_VERSION_IND PDU has been received
from the peer device.
5.1.6 ACL Termination procedure
This procedure is used for voluntary termination of an ACL connection while in the
Connection state. Voluntary termination occurs when the Host requests the Link Layer
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 3200 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 6, Part B Page 3201
Link Layer Specification
to terminate the connection. Either the Link Layer of the Central or Peripheral may
initiate this procedure by sending an LL_TERMINATE_IND PDU. The ACL Termination
procedure is not used in the event of the loss of the connection, for example after link
supervision timeout or after a procedure timeout.
The Link Layer shall start a timer, T , when the LL_TERMINATE_IND PDU has
terminate
been queued for transmission. The initiating Link Layer shall send LL_TERMINATE_IND
PDUs until an acknowledgment is received or until the timer, T , expires, after
terminate
which it shall exit the Connection State and transition to the Standby State. The initial
value for T shall be set to the value of the connSupervisionTimeout.
terminate
When the Link Layer receives an LL_TERMINATE_IND PDU it shall send the
acknowledgment, exit the Connection State and shall transition to the Standby State.
As soon as the Link Layer has received or queued for transmission an
LL_TERMINATE_IND PDU all associated CISes shall be considered lost (see
Section 4.5.12). The Link Layer shall not send separate LL_CIS_TERMINATE_IND
PDUs when the Host requests termination.
The procedure has completed when the acknowledgment has been received or the
timer, T , expires.
terminate
5.1.7 Connection Parameters Request procedure
The Central or Peripheral may initiate a Connection Parameters Request procedure
to request the remote device to have the Link Layer parameters for the connection
(connInterval, connPeripheralLatency and connSupervisionTimeout) updated any time
after entering the Connection State.
A device shall only initiate this procedure when permitted by Section 5.1.1. A device
shall not initiate this procedure while a Connection Subrate Update procedure is in
progress. A device shall not initiate this procedure while a Connection Rate Request
procedure or a Connection Rate Update procedure is in progress. A device shall
not initiate this procedure while any CS procedures are in progress (as described in
Section 4.5.18.1).
5.1.7.1 Issuing an LL_CONNECTION_PARAM_REQ PDU
The Connection Parameters Request procedure is initiated by issuing an
LL_CONNECTION_PARAM_REQ PDU. The procedure may be initiated as a result of
a Host initiated connection update procedure (see [Vol 4] Part E, Section 7.8.18) or
autonomously by the Link Layer (that is, without being requested by the Host).
If the LL_CONNECTION_PARAM_REQ PDU was issued by the Link Layer of the
Peripheral as a result of a Host initiated connection update procedure and the Central
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 3201 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 6, Part B Page 3202
Link Layer Specification
does not support this procedure, then the Host shall be notified that the connection
update procedure has completed with the ErrorCode set to Unsupported Remote
Feature (0x1A).
If the Link Layer initiates this procedure as a result of a Host initiated connection update
procedure, then the Link Layer:
• Should set the Interval_Min, Interval_Max, Timeout, and Latency fields to the values
received from the Host.
Note: The Link Layer may modify the values of these fields, for example, because
the values received from the Host would prevent the Link Layer from meeting
commitments in another piconet.
• May indicate the preferred periodicity by setting the PreferredPeriodicity field to a
value other than zero, as described in Section 2.4.2.16.
• May set the Offset0 to Offset5 fields to a value other than 0xFFFF as described in
Section 2.4.2.16. If all of the Offset0 to Offset5 fields have been set to 0xFFFF, then
the Link Layer has no preference about the offset to be used. If one or more of the
Offset0 to Offset5 fields have been set to a value other than 0xFFFF, then:
– The ReferenceConnEventCount field shall be set to indicate that at least one of the
Offset0 to Offset5 fields is valid. If the ReferenceConnEventCount field is set, then
it shall always be set to the connEventCount of a connection event that is less than
32767 connection events in the future from the first transmission of the PDU.
Note: Retransmissions of the PDU can result in the ReferenceConnEventCount
to be up to 32767 events in the past when the PDU is successfully received
by the remote device. See Section 5.1.7.3.2 for examples on how to set the
ReferenceConnEventCount field.
– If Interval_Min is not equal to Interval_Max then the PerferredPeriodicity field shall
be set to a value other than zero. If Interval_Min is equal to Interval_Max then
the PreferredPeriodicity field may be set to any value and shall be ignored by the
recipient.
If the Link Layer initiates this procedure autonomously, then the Latency field shall be
set to the current value of connPeripheralLatency and the Timeout field (in milliseconds)
shall be set to the current value of connSupervisionTimeout. Any of the other
fields (Interval_Min, Interval_Max, PreferredPeriodicity, ReferenceConnEventCount and
Offset0 to Offset5) may be changed within the restrictions given above.
The Link Layer shall ensure that the parameters in the
LL_CONNECTION_PARAM_REQ shall not cause supervision timeout. That is, the Link
Layer shall ensure that the Timeout (in milliseconds) is greater than 2 × Interval_Max ×
(Latency + 1).
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 3202 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 6, Part B Page 3203
Link Layer Specification
5.1.7.2 Responding to LL_CONNECTION_PARAM_REQ and
LL_CONNECTION_PARAM_RSP PDUs
Upon receiving an LL_CONNECTION_PARAM_REQ PDU:
• The Peripheral shall respond with either an LL_CONNECTION_PARAM_RSP PDU or
an LL_REJECT_EXT_IND PDU.
• The Central shall respond with either an LL_CONNECTION_UPDATE_IND PDU or
an LL_REJECT_EXT_IND PDU.
If an LL_CONNECTION_PARAM_REQ PDU is received while a CS procedure or CS
procedure repeat instances, as described in Section 4.5.18.1, are in progress, then
the receiving Link Layer shall respond with an LL_REJECT_EXT_IND PDU with the
ErrorCode set to Controller Busy (0x3A).
Upon receiving an LL_CONNECTION_PARAM_RSP PDU, the Central shall respond
with either an LL_CONNECTION_UPDATE_IND PDU or an LL_REJECT_EXT_IND
PDU.
The Central shall not send the LL_CONNECTION_PARAM_RSP PDU. The Peripheral
shall send an LL_CONNECTION_PARAM_RSP PDU only in response to an
LL_CONNECTION_PARAM_REQ PDU.
If the received LL_CONNECTION_PARAM_REQ PDU contains parameters that are not
acceptable to the Link Layer, then the Link Layer of the device shall respond to the
LL_CONNECTION_PARAM_REQ PDU with one of the following:
• An LL_CONNECTION_PARAM_RSP PDU (if the Link Layer is the Peripheral of the
connection) or an LL_CONNECTION_UPDATE_IND PDU (if the Link Layer is the
Central of the connection), in each case containing alternative parameters.
• An LL_REJECT_EXT_IND PDU with the ErrorCode set to Unsupported LL Parameter
Value (0x20).
If the received LL_CONNECTION_PARAM_REQ PDU contains any fields that are out
of valid range, then the Link Layer shall reject the LL_CONNECTION_PARAM_REQ
PDU by issuing an LL_REJECT_EXT_IND PDU with the ErrorCode set to Invalid LL
Parameters (0x1E).
If an LL_REJECT_EXT_IND PDU is sent during the Connection Parameters Request
procedure, then the procedure has completed on a device when it receives
the LL_REJECT_EXT_IND PDU, and has completed on the device that issued
the LL_REJECT_EXT_IND PDU when it receives the acknowledgment for the
LL_REJECT_EXT_IND PDU.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 3203 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 6, Part B Page 3204
Link Layer Specification
If the received LL_CONNECTION_PARAM_REQ PDU requests only a change in the
anchor points of the LE connection, then the Link Layer shall not indicate this request to
its Host.
If the received LL_CONNECTION_PARAM_REQ PDU requests a change to one or
more of connInterval, connPeripheralLatency, and connSupervisionTimeout and if the
values selected by the Link Layer are, respectively, within the range of the connInterval,
the value of connPeripheralLatency and the value of connSupervisionTimeout provided
by the local Host, then the Link Layer may choose to not indicate this request to its Host
and proceed as if the Host has accepted the remote device’s request. Otherwise, if the
event to the Host is not masked, then the Link Layer shall first indicate this request to its
Host.
If the local Host has not provided the range of connInterval, the value of
connPeripheralLatency and the value of connSupervisionTimeout to the Link Layer of
the Peripheral, then the Link Layer of the Peripheral may indicate the received request
to its Host if the event to the Host is not masked.
If the request is being indicated to the Host and the event to the Host is masked, then
the Link Layer shall issue an LL_REJECT_EXT_IND PDU with the ErrorCode set to
Unsupported Remote Feature (0x1A).
Note: The device could have issued the LL_REJECT_EXT_IND PDU temporarily, and
thus the initiating device may retry.
Note: If the request is not being indicated to the Host, then the event mask is ignored.
If the Host is indicated of the request, it shall either accept or reject this request. If the
Host rejects this request, then the device shall issue an LL_REJECT_EXT_IND PDU
with the ErrorCode set to Unacceptable Connection Parameters (0x3B).
If the Host accepts this request or if the request was not indicated to the Host, then:
• The Peripheral shall respond to an LL_CONNECTION_PARAM_REQ PDU with
an LL_CONNECTION_PARAM_RSP PDU. The rules for filling in various fields
of the LL_CONNECTION_PARAM_RSP PDU are the same as those for filling
in various fields of the LL_CONNECTION_PARAM_REQ PDU, as described in
Section 5.1.7.1. The rules for handling a received LL_CONNECTION_PARAM_RSP
PDU on the Link Layer of the Central are identical to the rules for handling a received
LL_CONNECTION_PARAM_REQ PDU that are described earlier in this section.
• The Central shall respond to an LL_CONNECTION_PARAM_REQ PDU or an
LL_CONNECTION_PARAM_RSP PDU with an LL_CONNECTION_UPDATE_IND
PDU. The Central should try to choose a value of Interval that is a multiple of
PreferredPeriodicity if the Peripheral has set the PreferredPeriodicity field of the
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 3204 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 6, Part B Page 3205
Link Layer Specification
LL_CONNECTION_PARAM_REQ or LL_CONNECTION_PARAM_RSP PDU. The
chosen value shall be at least connIntervalUncodedMin µs. However, if the current
PHY in either direction is the LE Coded PHY and the Controller supports the LE
Data Packet Length Extension feature, then the new connection interval shall be at
least connIntervalCodedMin μs. The Central should try to pick the values of WinOffset
and WinSize such that the timing of the new connection events matches one of
the Offset0 to Offset5 fields of the LL_CONNECTION_PARAM_REQ PDU or the
LL_CONNECTION_PARAM_RSP PDU sent by the Peripheral. The Instant field of the
LL_CONNECTION_UPDATE_IND PDU is set as described in Section 5.1.1.
Once the Central issues the LL_CONNECTION_UPDATE_IND PDU, the connection
parameters get updated as described in Section 5.1.1.
If the connection interval is changed, the subrate factor shall be set to 1 and the
continuation number shall be set to 0 at the instant of the procedure.
The procedure has completed when the instant has passed and the new connection
event parameters have been applied.
5.1.7.3 Examples
5.1.7.3.1 Peripheral initiated anchor point move
The following example shows the Link Layer of the Peripheral requesting a change in
the anchor points of the LE connection by 3.75 ms.
The Link Layer of the Peripheral issues an LL_CONNECTION_PARAM_REQ PDU with
the following parameters:
• Interval_Min: connInterval
• Interval_Max: connInterval
• Latency: connPeripheralLatency
• Timeout: connSupervisionTimeout
• PreferredPeriodicity: 0
• ReferenceConnEventCount: <any value that is less than 32767 connection events in
the future>
• Offset0: 0x0003
• Offset1: 0xFFFF
• Offset2: 0xFFFF
• Offset3: 0xFFFF
• Offset4: 0xFFFF
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 3205 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 6, Part B Page 3206
Link Layer Specification
• Offset5: 0xFFFF
If the Link Layer of the Central accepts the Peripheral’s request, then it could respond
with an LL_CONNECTION_UPDATE_IND PDU that contains any one of the following
set of parameters. In all the sets, Interval is set to connInterval, Latency is set to
connPeripheralLatency, Timeout is set to connSupervisionTimeout and Instant is set to
any value that is less than 32767 connection events in the future.
• Option 1: the first packet sent after the instant by the Central is inside the Transmit
Window and 3.75 ms from the beginning of the Transmit Window.
– 3 ≤ WinSize ≤ 8
– WinOffset: 0
• Option 2: the first packet sent after the instant by the Central is inside the Transmit
Window and 2.5 ms from the beginning of the Transmit Window.
– 2 ≤ WinSize ≤ 8
– WinOffset: 1
• Option 3: the first packet sent after the instant by the Central is inside the Transmit
Window and 1.25 ms from the beginning of the Transmit Window.
– 1 ≤ WinSize ≤ 8
– WinOffset: 2
• Option 4: the first packet sent after the instant by the Central is inside the Transmit
Window and 0 ms from the beginning of the Transmit Window.
– 1 ≤ WinSize ≤ 8
– WinOffset: 3
5.1.7.3.2 ReferenceConnEventCount
Figure 5.2 and Figure 5.3 show examples of how the ReferenceConnEventCount
and the Offset0 to Offset5 fields of the LL_CONNECTION_PARAM_REQ and the
LL_CONNECTION_PARAM_RSP PDU can be utilized to indicate the possible position
of the anchor points of the connection with the new connection parameters relative to
the anchor points of the connection with the old connection parameters. This figure
only shows Offset0 (and not Offset1 to Offset5) for simplicity. The figure also shows the
Instant where the updated connection parameters are applied. The actual Instant occurs
connInterval after the last connection event transmitted with the old connection
OLD
parameters whereas the Instant field in the LL_CONNECTION_UPDATE_IND PDU is
set to the connEventCount of the connection event transmitted with the old connection
parameters.
The ReferenceConnEventCount is set to the connEventCount of the connection event
on the old connection parameters such that the start of the very next connection event
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 3206 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 6, Part B Page 3207
Link Layer Specification
on the new connection parameters is Offset0 (in milliseconds) away from the start of the
ReferenceConnEventCount connection event.
Figure 5.2 shows the case where the Instant is before the ReferenceConnEventCount.
Figure 5.3 shows the case where the Instant is after the ReferenceConnEventCount.
Imaginary connection events transmitted with the old connection parameters have been
shown beyond the Instant and imaginary connection events transmitted with the new
connection parameters have been shown before the Instant.
In Figure 5.2 and Figure 5.3, the time interval, Δt, between the Instant and the start
of the first connection event transmitted with the new connection parameters can be
calculated using the following equation:
Δt = (connInterval − ((Instant − ReferenceConnEventCount) × connInterval ) mod
NEW OLD
connInterval + offset0) mod connInterval
NEW NEW
Note: The case where the ReferenceConnEventCount and Instant are on different sides
of the eventCount wraparound point is not shown in the equations above.
Based on the calculated Δt, the WinOffset and WinSize fields in the
LL_CONNECTION_UPDATE_IND PDU could be set accordingly. See Section 5.1.7.3.3
for an example.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 3207 (Original)

tnuoCtnevEnnoCecnerefeR
tnatsnI
tneve
tsaL
htiw
dettimsnart
noitcennoc
dlo
sretemarap
C→P
P→C
C→P
P→C
C→P
P→C
C→P
P→C
C→P
P→C
C→P
P→C
DLOlavretnInnoc
DLOlavretnInnoc
DLOlavretnInnoc
DLOlavretnInnoc
DLOlavretnInnoc
)sm
ni(
0tesffO
eziSwodniWtimsnart wodniW
timsnarT
tesffOwodniWtimsnart
tneve
dnoceS
dettimsnart
tneve
tsriF
wen
htiw
dettimsnart
noitcennoc
wen
htiw
t∆
sretemarap
noitcennoc
sretemarap
C→P
P→C
C→P
P→C
C→P
P→C
C→P
P→C
WENlavretnInnoc
WENlavretnInnoc
WENlavretnInnoc
WENlavretnInnoc
tneve
noitcennoc
yranigami
nA
C→P
P→C
tneve
noitcennoc
lautca
nA
C→P
P→C
BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 6, Part B Page 3208
Link Layer Specification
Figure 5.2: Utilizing the ReferenceConnEventCount and Offset0 fields to indicate position of the new
anchor points (Instant is before the ReferenceConnEventCount)
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 3208 (Original)

tnatsnI
tnuoCtnevEnnoCecnerefeR
tneve
tsaL
htiw
dettimsnart
noitcennoc
dlo
sretemarap
C→P
P→C
C→P
P→C
C→P
P→C
C→P
P→C
C→P
P→C
C→P
P→C
DLOlavretnInnoc
DLOlavretnInnoc
DLOlavretnInnoc
DLOlavretnInnoc
DLOlavretnInnoc
eziSwodniWtimsnart
wodniW
timsnarT
tesffOwodniWtimsnart
tneve
dnoceS
tneve
tsriF
htiw
dettimsnart
noitcennoc
wen
htiw
dettimsnart
)sm
ni(
0tesffO
noitcennoc
wen
t∆
sretemarap
sretemarap
C→P
P→C
C→P
P→C
C→P
P→C
C→P
P→C
WENlavretnInnoc
WENlavretnInnoc
WENlavretnInnoc
tneve
noitcennoc
yranigami
nA
C→P
P→C
tneve
noitcennoc
lautca
nA
C→P
P→C
BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 6, Part B Page 3209
Link Layer Specification
Figure 5.3: Utilizing the ReferenceConnEventCount and Offset0 fields to indicate position of the new
anchor points (Instant is after the ReferenceConnEventCount)
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 3209 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 6, Part B Page 3210
Link Layer Specification
5.1.7.3.3 Peripheral initiated interval and anchor point move
The following example shows the Link Layer of the Peripheral requesting a change
in both the connection interval (by indicating a PreferredPeriodicity such that
PreferredPeriodicity and connInterval are not integer multiples of one another)
OLD
and a change in anchor points of the LE connection by 3.75 ms with respect to the
ReferenceConnEventCount.
In this example, connInterval is 0x0C (15 ms). The Link Layer of the Peripheral
OLD
issues an LL_CONNECTION_PARAM_REQ PDU with the following parameters:
• Interval_Min: 0x16
• Interval_Max: 0x20
• Latency: connPeripheralLatency
• Timeout: connSupervisionTimeout
• PreferredPeriodicity: 0x0A
• ReferenceConnEventCount: 0x1F00
• Offset0: 0x0003
• Offset1: 0xFFFF
• Offset2: 0xFFFF
• Offset3: 0xFFFF
• Offset4: 0xFFFF
• Offset5: 0xFFFF
If the Link Layer of the Central accepts the Peripheral’s request, then it could respond
with an LL_CONNECTION_UPDATE_IND PDU that contains any one of the following
set of parameters. In all the sets, the new connection interval connInterval is
NEW
set to 0x1E (37.5 ms), Latency is set to connPeripheralLatency, Timeout is set to
connSupervisionTimeout and Instant is set to 0x1F06.
Δt, as described in Section 5.1.7.3.2 is calculated as 21 (26.25 ms).
The WinSize and WinOffset fields in the LL_CONNECTION_UPDATE_IND PDU can
contain any of the following example set of parameters:
• Option 1: the first packet sent after the instant by the Central is inside the Transmit
Window and 3.75 ms from the beginning of the Transmit Window.
– 3 ≤ WinSize ≤ 8
– WinOffset: 18
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 3210 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 6, Part B Page 3211
Link Layer Specification
• Option 2: the first packet sent after the instant by the Central is inside the Transmit
Window and 2.5 ms from the beginning of the Transmit Window.
– 2 ≤ WinSize ≤ 8
– WinOffset: 19
• Option 3: the first packet sent after the instant by the Central is inside the Transmit
Window and 1.25 ms from the beginning of the Transmit Window.
– 1 ≤ WinSize ≤ 8
– WinOffset: 20
• Option 4: the first packet sent after the instant by the Central is inside the Transmit
Window and 0 ms from the beginning of the Transmit Window.
– 1 ≤ WinSize ≤ 8
– WinOffset: 21
5.1.7.4 Packet transmit time restrictions
This section only applies if the current PHY in either direction is the LE Coded PHY and
the Controller supports the LE Data Packet Length Extension feature.
After having sent or received an LL_CONNECTION_UPDATE_IND PDU that decreases
the connection interval, and until the instant has been reached, the Link Layer shall not
transmit a packet that would take longer than connEffectiveMaxTxTime microseconds
(see Section 4.5.10) to transmit, calculated using the connection interval that will apply
after the instant.
After a Peripheral sends an LL_CONNECTION_PARAM_REQ or
LL_CONNECTION_PARAM_RSP PDU where Interval_Min indicates an interval
less than the current connection interval, and until it receives an
LL_CONNECTION_UPDATE_IND, LL_UNKNOWN_RSP, or LL_REJECT_EXT_IND
PDU in response, its Link Layer shall not transmit a packet that would take longer
than connEffectiveMaxTxTime microseconds to transmit, calculated using a connection
interval corresponding to the Interval_Min value in the transmitted PDU.
If the value of connEffectiveMaxTxTime changes during the procedure, the above
requirements apply to the value at the moment the LL Data PDU is queued for
transmission.
Note: The requirements of this section are in addition to, and do not override, those in
Section 4.5.10.
Note: If a Link Layer has any LL Data PDUs queued for transmission at the start of the
procedure or queues any during the procedure, it may need to re-fragment those PDUs
in order to meet these requirements.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 3211 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 6, Part B Page 3212
Link Layer Specification
5.1.8 LE Ping procedure
The Link Layer may use the LE Ping procedure, when supported, to verify the presence
of the remote Link Layer, or to verify message integrity on the LE ACL logical transport,
by forcing the remote device to send an LE ACL packet that contains a valid MIC.
This procedure may be used even if it is not supported by the peer’s Link Layer.
Either the Central or the Peripheral Link Layer may initiate this procedure at any time
after entering the Connection state by sending an LL_PING_REQ PDU. The responding
Link Layer responds with the LL_PING_RSP PDU.
The Link Layer supporting this feature shall send an LL_PING_REQ PDU when the
remote device has not sent a packet containing a Payload field protected by a MIC
within the authenticated payload timeout set by the Host ([Vol 4] Part E, Section 7.3.94).
The Link Layer should send an LL_PING_REQ PDU in advance enough of the
expiration of the authenticated payload timeout to allow the remote device reasonable
time to respond with an LL_PING_RSP PDU before the timeout expires.
The procedure has completed when an LL_PING_RSP is received.
5.1.9 Data Length Update procedure
A Controller uses the Data Length Update procedure to transmit the latest values
of the current maximum Receive LL Data PDU Payload length and PDU Time
(connMaxRxOctets and connMaxRxTime) and the current maximum Transmit LL Data
PDU Payload length and PDU Time (connMaxTxOctets and connMaxTxTime) to the
peer device.
Both the Central and Peripheral may initiate this procedure by sending an
LL_LENGTH_REQ PDU. This procedure shall be initiated by the Link Layer whenever
any of these parameters change, whether requested by the Host or autonomously by
the Link Layer. However, if this procedure has already been initiated by the remote
Controller and the local Controller has not yet responded, it shall use the response to
communicate the changes instead of initiating a new procedure.
If the Link Layer receives an LL_LENGTH_REQ, or an LL_LENGTH_RSP PDU
that was a response to an LL_LENGTH_REQ PDU, then it shall update its
connRemoteMaxTxOctets, connRemoteMaxRxOctets, connRemoteMaxTxTime, and
connRemoteMaxRxTime parameters for the connection with the values in the PDU.
It shall immediately start using the updated values for all new LL Data PDUs queued for
transmission (including any response as specified in the next paragraph). The lengths
of any LL Data PDUs that have already been queued for transmission or transmitted at
least once shall not be changed.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 3212 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 6, Part B Page 3213
Link Layer Specification
Note: Because Link Layer PDUs are not required to be processed in real time,
it is possible for the local Controller to have queued but not yet transmitted an
LL_LENGTH_REQ PDU when it receives an LL_LENGTH_REQ PDU from the peer
device. In this situation each device responds as normal; the resulting collision is
harmless.
Upon receiving an LL_LENGTH_REQ PDU, the Link Layer shall respond with an
LL_LENGTH_RSP PDU containing its own connMaxTxOctets, connMaxRxOctets,
connMaxTxTime, and connMaxRxTime values for the connection (which it may have
updated based on the values received, for example so as to allow the remote device to
transmit longer packets).
If the peer device does not support the LE Coded PHY feature, then the MaxRxTime
and MaxTxTime fields in the LL_LENGTH_REQ and LL_LENGTH_RSP PDUs shall be
set to a value less than or equal to 2128 microseconds.
The procedure has completed when the initiating Controller receives an
LL_LENGTH_RSP PDU.
5.1.10 PHY Update procedure
The Central or Peripheral may use the PHY Update procedure, when supported, to
change the transmit or receive PHYs, or both, of an ACL connection; it does not affect
the transmit or receive PHY of any associated Connected Isochronous Streams. The
procedure may be initiated either on a request by the Host or autonomously by the
Link Layer. Link Layer PHY preferences may change during a connection or between
connections and, therefore, they should not be cached by the peer device.
When this procedure is initiated by the Central, it sends an LL_PHY_REQ PDU. The
Peripheral responds with an LL_PHY_RSP PDU. The Central then responds to this with
an LL_PHY_UPDATE_IND PDU.
When this procedure is initiated by the Peripheral, it sends an LL_PHY_REQ PDU. The
Central responds with an LL_PHY_UPDATE_IND PDU.
The TX_PHYS and RX_PHYS fields of the LL_PHY_REQ and LL_PHY_RSP PDUs
shall be used to indicate the PHYs that the sending Link Layer prefers to use. These
shall represent PHYs that the sending Link Layer supports. The sender can request a
symmetric connection (one where the two PHYs are the same) by making both fields
the same, only specifying a single PHY.
The PHY_C_TO_P and PHY_P_TO_C fields of the LL_PHY_UPDATE_IND PDU shall
indicate the PHYs that shall be used after the instant.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 3213 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 6, Part B Page 3214
Link Layer Specification
If the Central initiated the procedure, it shall determine the PHY to use in each
direction based on the contents of the LL_PHY_REQ and LL_PHY_RSP PDUs using
the following rules:
• the PHY_C_TO_P field of the LL_PHY_UPDATE_IND PDU shall be determined from
the Central's TX_PHYS field and the Peripheral's RX_PHYS field;
• the PHY_P_TO_C field of the LL_PHY_UPDATE_IND PDU shall be determined from
the Central's RX_PHYS field and the Peripheral's TX_PHYS field.
In each of those cases the following rules apply:
• if, for at least one PHY, the corresponding bit is set to 1 in both the TX_PHYS and
RX_PHYS fields, the Central shall select any one of those PHYs for that direction;
• if there is no PHY for which the corresponding bit is set to 1 in both the TX_PHYS and
RX_PHYS fields, the Central shall not change the PHY for that direction.
If the Peripheral initiated the procedure, the Central shall determine the PHY to use in
each direction based on the contents of the LL_PHY_REQ PDU sent by the Peripheral
using the following rules:
• the PHY_C_TO_P field of the LL_PHY_UPDATE_IND PDU shall be determined from
the RX_PHYS field of the Peripheral’s PDU;
• the PHY_P_TO_C field of the LL_PHY_UPDATE_IND PDU shall be determined from
the TX_PHYS field of the Peripheral’s PDU.
In each of those cases the following rules apply:
• if, for at least one PHY, the PHY is one that the Central prefers to use and the
corresponding bit is set to 1 in the relevant field of the Peripheral’s PDU, the Central
shall select any one of those PHYs for that direction;
• if there is no PHY which the Central prefers to use and for which the corresponding
bit is set to 1 in the relevant field of the Peripheral’s PDU, the Central shall not change
the PHY for that direction.
The remainder of this section shall apply irrespective of which device initiated the
procedure.
Irrespective of the above rules, the Central may leave both directions unchanged. If the
Peripheral specified a single PHY in both the TX_PHYS and RX_PHYS fields and both
fields are the same, the Central shall either select the PHY specified by the Peripheral
for both directions or shall leave both directions unchanged.
If either PHY will change, Section 5.5 shall apply to the LL_PHY_UPDATE_IND PDU.
Both devices shall use the new PHYs starting at the instant.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 3214 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 6, Part B Page 3215
Link Layer Specification
The procedure has completed when:
• an LL_REJECT_EXT_IND PDU has been sent or received;
• an LL_PHY_UPDATE_IND PDU indicating that neither PHY will change has been
sent or received; or
• the Central sends an LL_PHY_UPDATE_IND PDU indicating that at least one PHY
will change and the instant has been reached. In this case, the procedure response
timeout shall be stopped on the Central when it sends that PDU and on the Peripheral
when it receives that PDU.
If the Peripheral receives an LL_PHY_UPDATE_IND where either PHY field specifies a
PHY that the Peripheral does not support, has a bit set that is reserved for future use, or
has more than one bit set, the Peripheral shall not change the PHY in that direction.
The Controller shall notify the Host of the PHYs now in effect when the PHY Update
procedure completes if either it has resulted in a change of one or both PHYs or if the
procedure was initiated by a request from the Host. Otherwise, it shall not notify the
Host that the procedure took place.
The Link Layer can reject a proposed change to either PHY (by not setting the
corresponding bit in its response) because, for example, a PHY with a lower bit rate
could not be scheduled among other activities or because the requested PHY does not
support Constant Tone Extensions. Such a rejection could, however, result in link loss if
the change was requested to improve reliability.
5.1.10.1 Packet transmit restrictions
For each row of Table 5.1, on the Link Layer(s) in the role(s) listed in the first column
and during the period starting with the event described in the second column and
ending with the event described in the third column, the Link Layer shall not transmit
either of:
• any packet that would take longer than connEffectiveMaxTxTime microseconds (see
Section 4.5.10) to transmit on any relevant PHY
• any packet with a Constant Tone Extension if any relevant PHY does not allow
Constant Tone Extensions
where a “relevant PHY” is a PHY described in the fourth column.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 3215 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 6, Part B Page 3216
Link Layer Specification
Role(s) Starting event Ending event Relevant PHY(s)
Either the Link Layer sends the instant the PHY that will apply after the
or receives an instant
LL_PHY_UPDATE_-
IND PDU that
changes either PHY
Peripheral the Link Layer sends the Link Layer receives any PHY that appears in
an LL_PHY_REQ an LL_PHY_UPDATE_IND, the TX_PHYS field of that
PDU LL_UNKNOWN_RSP, or LL_PHY_REQ PDU
LL_REJECT_EXT_IND PDU
in response
Peripheral the Link Layer sends the Link Layer receives the any PHY that appears in both
an LL_PHY_RSP LL_PHY_UPDATE_IND PDU the TX_PHYS field of the Pe-
PDU in response ripheral’s LL_PHY_RSP PDU
and the RX_PHYS field of the
Central's LL_PHY_REQ PDU
Table 5.1: PHY update packet transmit restrictions
If the value of connEffectiveMaxTxTime changes during the procedure (for example,
if the Data Length Update procedure is performed before the Instant is reached), the
above requirements apply to the value at the moment the LL Data PDU is queued for
transmission.
Note: The requirements of this section are in addition to, and do not override, those in
Section 4.5.10.
If a Link Layer has any LL Data PDUs queued for transmission at the start of the
procedure or queues any during the procedure, it might need to re-fragment those
PDUs in order to obey the requirements in this section. This can be necessary if, for
example, the transmit PHY changes from the LE 2M PHY to the LE 1M PHY and the
value of connEffectiveMaxTxTime does not increase enough to compensate for the
lower bit rate.If a Link Layer has any packets with a Constant Tone Extension queued
for transmission at the start of the procedure or queues any during the procedure, it
might need to delay them, cancel them, or (if the packets contain an LL_CTE_RSP
PDU) replace them by LL_REJECT_EXT_IND PDUs in order to obey the requirements
in this section.
5.1.11 Minimum Number Of Used Channels procedure
A Peripheral's Controller may use the Minimum Number Of Used Channels procedure
to request that the peer device uses a minimum number of channels on a given PHY.
The Peripheral initiates this procedure by sending an LL_MIN_USED_CHANNELS_IND
PDU. The Central shall not send this PDU.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 3216 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 6, Part B Page 3217
Link Layer Specification
If the Link Layer receives an LL_MIN_USED_CHANNELS_IND PDU, it should ensure
that, whenever the Peripheral-to-Central PHY is one of those specified, the connection
uses at least the number of channels given in the MinUsedChannels field of the PDU.
The procedure has completed when the Link Layer acknowledgment of the
LL_MIN_USED_CHANNELS_IND PDU is sent or received.
If the channel map does not include the minimum number of channels the Peripheral
requires for regulatory compliance, the Peripheral must take steps to remain regulatory
compliant, which can include disconnecting the link or reducing the output power.
5.1.12 Constant Tone Extension Request procedure
The Central or Peripheral may use the Constant Tone Extension Request procedure,
when supported, to request the remote Link Layer to send a packet containing an
LL_CTE_RSP PDU and a Constant Tone Extension (see Section 2.5.3).
Either the Central or the Peripheral Link Layer initiates this procedure by sending an
LL_CTE_REQ PDU.
If:
• Constant Tone Extension responses are enabled;
• the current transmitter PHY is one that allows Constant Tone Extensions;
• Section 5.1.10.1 would not prohibit the response from being transmitted;
• the length of Constant Tone Extension requested in the LL_CTE_REQ PDU is not
greater than the maximum length the responding device supports; and
• the responding device is currently configured to respond with the type of Constant
Tone Extension requested in the LL_CTE_REQ PDU;
then the remote Link Layer shall respond with an LL_CTE_RSP PDU that includes
a Constant Tone Extension of the requested type and whose length is greater than
or equal to that requested. Otherwise the remote Link Layer shall respond with an
LL_REJECT_EXT_IND PDU. If Constant Tone Extension responses are disabled or
the Link Layer is not currently configured to respond with the type and length of the
requested Constant Tone Extension, the ErrorCode shall be set to Unsupported LMP
Parameter Value/Unsupported LL Parameter Value (0x20). If Constant Tone Extensions
are not allowed on the current transmitter PHY, the ErrorCode shall be set to Invalid
LMP Parameters/Invalid LL Parameters (0x1E). If Section 5.1.10.1 would prohibit the
response from being transmitted, the ErrorCode shall be set to Different Transaction
Collision (0x2A).
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 3217 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 6, Part B Page 3218
Link Layer Specification
IQ sampling (see Section 2.5.4) shall be performed while receiving the Constant Tone
Extension of the LL_CTE_RSP PDU and the sampling results shall be reported to the
Host.
The procedure has completed when either an LL_CTE_RSP PDU has been sent or
received or an LL_REJECT_EXT_IND PDU is sent or received with the RejectOpcode
set to LL_CTE_REQ.
5.1.13 Periodic Advertising Sync Transfer procedure
A Controller may use the Periodic Advertising Sync Transfer procedure to transfer, to a
connected peer device, the synchronization information necessary to synchronize to a
periodic advertising train (see Section 4.4.3.4).
Either the Central or the Peripheral Link Layer initiates this procedure by sending
an LL_PERIODIC_SYNC_IND PDU or an LL_PERIODIC_SYNC_WR_IND PDU.
The PDU used is determined by the type of the periodic advertising used.
For PAwR, the LL_PERIODIC_SYNC_WR_IND PDU shall be used, otherwise the
LL_PERIODIC_SYNC_IND PDU shall be used. If the LL_PERIODIC_SYNC_WR_IND
PDU is used, then the RspAA shall be set to an Access Address value as specified in
Section 2.1.2.
If the Host has enabled receipt of transfers and the Link Layer receives an
LL_PERIODIC_SYNC_IND PDU or an LL_PERIODIC_SYNC_WR_IND PDU that
describes a periodic advertising train that the Link Layer is neither already synchronized
with nor in the process of synchronizing with, the Link Layer shall synchronize with the
described periodic advertising train and then notify the Host; it shall also notify the Host
if synchronization fails. However, if the PHY field of the LL_PERIODIC_SYNC_IND PDU
or the LL_PERIODIC_SYNC_WR_IND PDU has no bits or more than one bit set, or the
bit set corresponds to a PHY that the recipient does not support or is reserved for future
use, the recipient shall ignore the PDU.
The procedure has completed when an LL_PERIODIC_SYNC_IND PDU or an
LL_PERIODIC_SYNC_WR_IND PDU has been sent or received.
5.1.13.1 Timing considerations
This section explains the issues in handling the relative drifts of three separate device
clocks and does not create any requirements. This section does not apply when devices
A and B are the same because there is then no clock drift between the two.
In general there are three devices involved in the Periodic Advertising Sync Transfer
procedure: the periodic advertiser A, the initiating device B, and the receiving device
C. Each of these can have a different sleep clock accuracy. Therefore device C needs
to carry out various steps to determine the timing and required receive window for
synchronizing to the periodic advertising.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 3218 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 6, Part B Page 3219
Link Layer Specification
In the following formulae and in Figure 5.4:
• PEa is the value of paEventCounter stored in the SyncInfo within the
LL_PERIODIC_SYNC_IND PDU.
• PEb is the value of paEventCounter for a recent AUX_SYNC_IND PDU that
device B has received; this value is stored in the lastPaEventCounter field of the
LL_PERIODIC_SYNC_IND PDU.
• PEc is the value of paEventCounter for the AUX_SYNC_IND PDU that device C is
attempting to receive.
Note: PEc can be before, after, or the same as PEa.
• PAI is the periodic advertising interval as represented by the Interval field of the
SyncInfo within the LL_PERIODIC_SYNC_IND PDU.
• CEs is the value of connEventCounter for the connection event when devices
B and C synchronized their anchor points and that device B used to determine
the contents of the LL_PERIODIC_SYNC_IND PDU; this value is stored in the
syncConnEventCount field of the PDU.
• CEt is the value of connEventCounter for the connection event when the
LL_PERIODIC_SYNC_IND PDU was (re)transmitted by device B and received by
device C.
• CEref is the value of connEventCount in the LL_PERIODIC_SYNC_IND PDU.
• CEc is a connection event before the AUX_SYNC_IND PDU that device C is
attempting to receive.
• CI is the connection interval for the connection between devices B and C.
• Offset is the value represented by the syncPacketWindowOffset value within the
LL_PERIODIC_SYNC_IND PDU.
• Target is the time from the anchor point of connection event CEc to the
AUX_SYNC_IND PDU that device C is attempting to receive.
• CAa, CAb, and CAc are the clock accuracies of devices A, B, and C respectively. CAa
is stored in the SCA field of the SyncInfo within the LL_PERIODIC_SYNC_IND PDU
and CAb is stored in the SCA field of the LL_PERIODIC_SYNC_IND PDU.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 3219 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 6, Part B Page 3220
Link Layer Specification
PEb PEc PEa
... ...
AUX_SYNC_IND AUX_SYNC_IND AUX_SYNC_IND AUX_SYNC_IND AUX_SYNC_IND
Periodic advertising from device A
PAI
Target Offset
Connections on device B
... ...
LL_PERIODIC_SYNC_IND
CEs CEt CEc CEref
CI
... ...
Connections on device C
Figure 5.4: Periodic Advertising Sync Transfer procedure timings
If all three devices had a perfectly accurate clock, then:
Tnominal ≤ Target < Tnominal + U
where:
Tnominal = (CEref – CEc) × CI + Offset – (PEa – PEc) × PAI
U = 30 µs or 300 µs depending on the value of the Offset Units field of the SyncInfo
Because of clock drift and jitter, this becomes:
Tnominal – D – 16 µs ≤ Target < Tnominal + U + D + 16 µs
where:
D = (Da + Db) x (1 + CAa + CAb + CAc)
Da represents the drift of the periodic advertising and Db the drift of B's clock between
CEs and PEb:
Da = |PEc – PEb| × PAI × (CAa + CAc)
Db = |CEt – CEs| × CI × (CAb + CAc)
D should be rounded to the next whole microsecond above.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 3220 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 6, Part B Page 3221
Link Layer Specification
These values are derived from the assumption that device B will have calculated Offset
without making any allowance for drift in its own clock. So if PEb occurred at time TPEb
and CEs at time TCEs, both according to its own clock, device B will have chosen
values for PEa and CEref and then calculated:
Offset = (TPEb + (PEa – PEb) × PAI) – (TCEs + (CEref – CEs) × CI)
When device C calculates Tnominal, it again does so without allowing for drift. So, by
substituting the above expression for Offset in that for Tnominal above, we find that:
Tnominal
= (CEref – CEc) × CI + (TPEb + (PEa – PEb) × PAI) – (TCEs + (CEref – CEs) × CI) –
(PEa – PEc) × PAI
= TPEb + (PEa – PEb) × PAI – (PEa – PEc) × PAI – TCEs – (CEref – CEs) × CI +
(CEref – CEc) × CI
= TPEb + (PEc – PEb) × PAI – TCEs – (CEc – CEs) × CI
= (PEc – PEb) × PAI + (TPEb – TCEs) – (CEc – CEs) × CI
Each of these three terms is based on a different clock:
• The first term depends on PAI, which is measured using device A's clock. However,
since device C is calculating Tnominal, device C’s clock must be allowed for as well.
The drift in this term is represented by Da.
• The expression (TPEb – TCEs) is the change in B's clock between the two events
and so is measured using that clock; again, it is necessary to allow for device C’s
clock as well. The drift in this term is represented by Db; the term in parentheses in
the expression for Db is an upper bound for the difference.
• The last term is on device C's clock and therefore does not require any adjustment.
The second factor in the formula for D allows for second-order effects: if the relevant
periodic events are 12 seconds apart, a 500 ppm drift will result in a 20 × 0.00052 = 3 µs
residual error in the required window.
If device C allows for clock drift when making these calculations, it may be able
to reduce the window it uses accordingly. If device B allows for clock drift (e.g. by
measuring the drift in the periodic advertising timing), the actual drift will be less than
that calculated above but device C will not be aware of this. A more detailed analysis
based on the exact techniques used in the implementation may allow device C to
compute a narrower window.
5.1.14 Sleep Clock Accuracy Update procedure
The Link Layer of the Central or Peripheral may inform its peer of a change to its sleep
clock accuracy (centralSCA or peripheralSCA – see Section 4.2.2), or may query the
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 3221 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 6, Part B Page 3222
Link Layer Specification
peer’s sleep clock accuracy, by sending an LL_CLOCK_ACCURACY_REQ PDU. The
procedure may be initiated either on a request by the Host or autonomously by the Link
Layer. A device should not initiate this procedure more than once per second.
Where the Link Layer will specify a more accurate clock than that currently in use, it
shall switch to that clock before initiating or responding to this procedure.
When the Link Layer receives an LL_CLOCK_ACCURACY_REQ PDU, it shall send an
LL_CLOCK_ACCURACY_RSP PDU in reply. The sleep clock accuracy specified in the
reply shall not be less than the value in use when the request was received on the Link
Layer sending that reply.
Note: The Link Layer can delay its response in order to make any necessary internal
adjustments to the accuracy change, but not for so long as to trigger a timeout. To
change to a less accurate clock, the responding device, as this section requires, must
initiate this procedure separately.
The procedure has completed when the LL_CLOCK_ACCURACY_RSP is sent or
received. Where the initiating Link Layer has specified a less accurate clock than
that currently in use, it shall not switch to that clock until it has received the
LL_CLOCK_ACCURACY_RSP PDU in reply. If it receives an LL_UNKNOWN_RSP
PDU, it shall maintain at least the accuracy specified in the CONNECT_IND or
AUX_CONNECT_REQ PDU that created the connection.
5.1.15 Connected Isochronous Stream Creation procedure
The Central Link Layer may use the Connected Isochronous Stream Creation
procedure to create a CIS between a Central and a Peripheral. The Central Link
Layer initiates this procedure by sending an LL_CIS_REQ PDU. The Peripheral Link
Layer shall not initiate this procedure. The Central’s Link Layer shall only create a CIS
when requested by the Host, only using a CIS_ID that the Host has already stored a
configuration for in this CIG, and not using a CIS_ID that corresponds to an existing
CIS in the CIG (see Section 4.5.14.3). The Central shall not initiate this procedure if the
Connected Isochronous Stream (Host Support) feature bit is not set in its Controller.
When the Peripheral’s Link Layer receives the LL_CIS_REQ PDU, it shall either reject
the proposed CIS immediately or notify the Host. In the latter case, the Host requests
the Link Layer to either accept or reject the proposed CIS. If the Connected Isochronous
Stream (Host Support) feature bit is not set in the local Link Layer, then the Peripheral
shall reject the proposed CIS with the error code Unsupported Remote Feature (0x1A).
If either PHY field of the LL_CIS_REQ PDU has no bits or more than one bit set, or
if the bit set corresponds to a PHY that the recipient does not support or is reserved
for future use, then the Peripheral shall reject the proposed CIS. If the Peripheral does
not support the BN, FT, and NSE values in the LL_CIS_REQ PDU, it shall reject the
proposed CIS with the error code Parameter Out of Mandatory Range (0x30). If the
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 3222 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 6, Part B Page 3223
Link Layer Specification
Framing_Mode field of the LL_CIS_REQ PDU specifies a mode that the Peripheral
does not support, then the Peripheral shall reject the proposed CIS. If the Peripheral
rejects the proposed CIS, then it shall send an LL_REJECT_EXT_IND PDU with the
appropriate reason code. If it accepts the CIS, then it shall send an LL_CIS_RSP PDU.
When the Central’s Link Layer receives an LL_CIS_RSP PDU, it shall either create
the CIS by replying with an LL_CIS_IND PDU or shall cancel it by replying with an
LL_REJECT_EXT_IND PDU with the appropriate reason code. The Central shall not
cancel the CIS if the proposed timings are within those specified in the LL_CIS_REQ
PDU unless the Host requested that the CIS be terminated.
When the Central sends and the Peripheral receives the LL_CIS_IND PDU, both
devices shall stop the procedure response timeout timer, create the CIS, and
start transmitting and receiving CIS PDUs. The first anchor point of the CIS, with
cisEventCounter equal to zero, shall be at the moment specified in the LL_CIS_IND
PDU. The CIS is considered established by each Link Layer when that Link Layer has
received a CIS PDU from the peer that is part of the CIS.
The Central’s Link Layer shall calculate CIG_Sync_Delay and CIS_Sync_Delay for each
CIS and send them to the Peripheral in the LL_CIS_IND PDU.
If either Link Layer sends or receives an LL_REJECT_EXT_IND PDU, it shall terminate
the procedure immediately and not create the CIS. The CIS configuration nevertheless
remains stored within the CIG and the corresponding CIS can be created later. The
procedure has completed on each Link Layer when the CIS is established or when an
LL_REJECT_EXT_IND PDU has been sent or received. Each Link Layer shall notify its
Host when the procedure has completed.
The values of the CIS_Offset_Min, CIS_Offset_Max, and connEventCount fields of
the LL_CIS_REQ and LL_CIS_RSP PDUs each specify a window for the CIS anchor
point. The window specified by the LL_CIS_RSP PDU shall lie entirely within a window
equivalent to that specified by the LL_CIS_REQ PDU. The first CIS anchor point shall
lie within a window equivalent to that specified by the LL_CIS_RSP PDU. For this
purpose, two windows are equivalent if they have the same width and the difference
between their start times is an integer multiple of ISO_Interval for the CIS. The edges of
each window are part of the window so, for example, the two windows can be identical.
Section 5.5 shall apply to the LL_CIS_IND PDU as if the connEventCount field was an
Instant.
The Link Layer should schedule the CIS so that the CIS events do not overlap with the
connection events on the associated ACL.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 3223 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 6, Part B Page 3224
Link Layer Specification
5.1.16 Connected Isochronous Stream Termination procedure
The Central or Peripheral may use this procedure for voluntary termination of a CIS
while in the Connection state. Voluntary termination occurs when the Host requests
the Link Layer to terminate the connection. The Link Layer initiates this procedure by
sending an LL_CIS_TERMINATE_IND PDU.
The Link Layer shall not transmit or receive on the CIS after it has received or queued
for transmission the LL_CIS_TERMINATE_IND PDU.
The procedure has completed when the Link Layer acknowledgment has been sent or
received.
Note: Terminating a CIS does not affect the associated ACL.
5.1.17 Power Control Request procedure
The Link Layer of the Central or Peripheral may use the Power Control Request
procedure, when supported, to request a remote Controller to adjust its transmit power
level on a specified PHY by a given amount. Power Control requests carried over an
LE-ACL logical link only affect the power level used on that link and any associated
physical link(s) such as isochronous physical links and CS physical links; they do not
affect the power level used on the physical links to other connected and unconnected
devices.
The Link Layer initiates this procedure by sending an LL_POWER_CONTROL_REQ
PDU.
The Link Layer can query the current transmit power level and acceptable power
reduction of the remote Controller by sending an LL_POWER_CONTROL_REQ PDU
with Delta set to zero.
The responding Link Layer shall make the requested change to its transmit power level
unless that would take it above the maximum or below the minimum supported power
levels or unless it is not currently managing power levels on the requested PHY. If the
requested change would take it above the maximum, it shall change the power level
to the maximum supported. Otherwise, if it is unable to make exactly the requested
change, it shall change the power level to the lowest available level greater than the
requested level. In any case, it shall then reply with an LL_POWER_CONTROL_RSP
PDU whose contents indicate the actual change made, if any, or that it is not managing
the power level for the requested PHY (by setting the power level to 126).
Note: A request to make a small decrease in the power level can result in the power
level not changing.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 3224 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 6, Part B Page 3225
Link Layer Specification
Note: A request with delta equal to zero on a PHY that is not an active PHY can indicate
that the sender is about to make that PHY an active PHY.
The Link Layer shall not initiate the Power Control Request procedure until any
outstanding CS Start procedure, as described in Section 5.1.26, has completed. If the
LL_POWER_CONTROL_REQ PDU is received in this case, then the receiving Link
Layer shall respond with an LL_REJECT_EXT_IND PDU with the ErrorCode set to
Controller Busy (0x3A).
If the Link Layer has sent an LL_POWER_CONTROL_REQ PDU and not yet received
a response, or has an LL_POWER_CONTROL_REQ PDU queued for transmission,
and then receives an LL_POWER_CONTROL_REQ PDU from the same peer device,
it shall set the APR field to 0xFF in its response to that PDU. A responding Link Layer
may also set the APR field to 0xFF when it is not managing the power level of the
requested PHY, if it does not have a valid value to report, or if it does not support
this field. Otherwise the responding Link Layer shall set the APR field as described in
Section 5.1.17.1.
The new power level for the PHY shall take effect before the response is sent.
Note: The Link Layer may request the remote Link Layer to change the preferred
transmit power level for a different PHY, for example before initiating a PHY Update
procedure or creating an associated CIS on a PHY different from the one used for the
ACL. To do this, it may query the remote Link Layer for the transmit power level that it
would use for that PHY and then request a change to the transmit power level.
If the PHY in the LL_POWER_CONTROL_REQ PDU is not supported by the remote
Link Layer in its transmit direction or the PHY field contains no set bits, more than
one set bit, or a bit set that is reserved for future use, the remote Link Layer shall
respond with an LL_REJECT_EXT_IND PDU with the ErrorCode set to Unsupported
LMP Parameter Value/Unsupported LL Parameter Value (0x20).
If the TxPower in the LL_POWER_CONTROL_REQ PDU is set to 126, the remote
Link Layer shall respond with an LL_REJECT_EXT_IND_PDU with the ErrorCode set to
Invalid LL Parameters (0x1E).
The procedure has completed when either an LL_POWER_CONTROL_RSP PDU has
been sent or received or an LL_REJECT_EXT_IND PDU has been sent or received
with the RejectOpcode field set to LL_POWER_CONTROL_REQ.
5.1.17.1 Acceptable power reduction
A radio receiver may have a “golden range” of RSSI that it prefers the incoming signal
to remain within. A device with such a receiver can use the Power Control Request
procedure to bring the current RSSI (RSSI ) of the incoming signal to a preferred
curr
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 3225 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 6, Part B Page 3226
Link Layer Specification
value within its golden range. Nevertheless, it may still be able to receive the signal at
a level that is equal to or above a minimum acceptable RSSI (RSSI ) that is lower
min
than the current RSSI. A device can use the Power Control Request procedure to check
whether its peer can accept such a reduction in power and, if so, adjust its transmit
power based on the response.
When a device sends an LL_POWER_CONTROL_RSP PDU, it should set the APR
field to the value given by the following equation:
0, if RSSI curr ≤ RSSI min
APR =
RSSI curr – RSSI min, if RSSI curr > RSSI min
When a device reports an APR value to the peer device other than zero or 0xFF,
it should wait at least two connection intervals to see if the peer device has made
use of it to change its local transmit power before initiating a new Power Control
Request procedure to request a remote transmit power level change. A device
can determine if the peer device has changed its transmit power by sending an
LL_POWER_CONTROL_REQ PDU with Delta set to zero, by looking for changes in
the RSSI of incoming packets, or by the receipt of an LL_POWER_CHANGE_IND PDU.
When a device receives an APR value from the peer device other than 0xFF, the time
period for which that value is considered to remain valid is implementation-specific; for
example, the Link Layer can examine changes in received RSSI and remote transmit
power level since the APR value was received. When a device receives an APR value
other than 0xFF from the peer device, it shall not reduce its power level more than
the value specified. When the device receives an APR value of 0xFF, it may choose to
ignore any previous APR values.
5.1.18 Power Change Indication procedure
The Link Layer uses the Power Change Indication procedure, when supported, to notify
the remote Link Layer of transmit power changes.
After the peer has sent at least one LL_POWER_CONTROL_REQ PDU, a Link Layer
shall send an autonomous notification consisting of an LL_POWER_CHANGE_IND
PDU each time that any of the following happens:
• It changes the power level autonomously on any PHY that it is managing power levels
for.
• It changes the maximum power level on its current transmit PHY to the current power
level.
• It starts managing the power level for a PHY.
• It stops managing the power level for a PHY.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 3226 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 6, Part B Page 3227
Link Layer Specification
A Link Layer shall not send the LL_POWER_CHANGE_IND PDU in any other
circumstance. If two or more of the above situations occur for the same PHY at
the same time or within a connection interval, it may combine the reports into a
single LL_POWER_CHANGE_IND PDU. A Link Layer should not perform autonomous
power level updates more than once per second to avoid sending too many
LL_POWER_CHANGE_IND PDUs to the remote device.
If the notification is for the current ACL PHY, it shall be sent at the power level specified
in the notification.
The procedure has completed when the LL_POWER_CHANGE_IND PDU has been
sent or received.
The recipient shall ignore all bits of the PHY field of the LL_POWER_CHANGE_IND
PDU that correspond to PHYs that it does not support or are reserved for future use. If
the PHY field has no bits set or if every bit set corresponds to a PHY that the recipient
does not support or is reserved for future use, the recipient shall ignore the PDU.
5.1.19 Connection Subrate Update procedure
The Central's Link Layer may update the subrate parameters (connSubrateBaseEvent,
connSubrateFactor, and connContinuationNumber), connPeripheralLatency, and
connSupervisionTimeout of a connection by sending an LL_SUBRATE_IND PDU. The
Peripheral shall not send this PDU. The Central shall only initiate this procedure
when requested by the Host, when requested by the Peripheral via the Connection
Subrate Request procedure, or as recommended in Section 5.5. The Central shall
not initiate this procedure while a Connection Parameters Request procedure is in
progress. The Central shall not initiate this procedure until it has performed a Feature
Exchange procedure (see Section 5.1.4) to determine that the Connection Subrating
(Host Support) bit is set in the Peripheral's FeatureSet. In addition, the Central shall
not initiate this procedure while any CS procedures are in progress (as described in
Section 4.5.18.1). The Central shall not initiate this procedure while a Connection Rate
Request procedure or a Connection Rate Update procedure is in progress.
After the Central transmits this PDU for the first time during a Connection Subrate
Update procedure, it shall enter subrate transition mode. The Central leaves subrate
transition mode when it receives the Link Layer acknowledgment for the PDU and
then uses the new subrate base event, subrate factor, continuation number, Peripheral
latency, and supervision timeout.
During subrate transition mode, the Central shall retransmit the PDU on all connection
events which are subrated connection events based on the old subrate base event
and subrate factor or are subrated connection events based on the new subrate base
event and subrate factor (ignoring Peripheral latency). It shall continue to use the
old supervision timeout. If the new continuation number is non-zero then the Central
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 3227 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 6, Part B Page 3228
Link Layer Specification
may also transmit on other connection events. The Central's Link Layer may take the
Peripheral's opportunities for reception into account when determining which connection
events it chooses to transmit on while in subrate transition mode.
When the Peripheral receives this PDU it shall immediately switch to the new subrate
base event, subrate factor, continuation number, Peripheral latency, and supervision
timeout.
For example, as shown in Figure 5.5, if the old subrate base event is 32, the old
subrate factor is 5, the new subrate base event is 38, the new subrate factor is 3, and
the Central transmitted the LL_SUBRATE_IND PDU on connection event 42, then the
old parameters will result in the devices using connection events 37, 42, 47, 52, 57
etc. while the new parameters will result in the devices using connection events 44,
47, 50, 53, 56, etc. Therefore, while it is in subrate transition mode, the Central will
use connection events 42, 44, 47, 50, 52, 53, 56, 57, and so on until it receives the
acknowledgment.
Old base event New base event LL_SUBRATE_IND
32 33 34 35 36 37 38 39 40 41 42 43 44 45 46 47 48 49 50 51 52 53 54 55 56 57
Connection Old subrated connection events
Interval
New subrated connection events
Unused underlying connection events
Figure 5.5: Connection events used during subrate transition mode
The Central shall set the value of SubrateBaseEvent ("S") in the PDU so that S
15-14
= E , where E is the value of connEventCount for the connection event when the
15-14
PDU is first queued for transmission. If the Peripheral receives an LL_SUBRATE_IND
PDU with S = 0b11 in a connection event with connEventCounter = 0b00 then,
15-14 15-14
immediately after updating the parameters, it shall change connSubrateBaseEvent as
described in Section 4.5.1 as if the value of connEventCount had just wrapped.
The requirement on the value of S means the Peripheral can determine whether
15-14
the Central intended to send the PDU before or after connEventCount wrapped. For
example, consider the situation where the current connSubrateFactor is 10 and the
current connSubrateBaseEvent is 12002. As the point of wrap approaches, these
parameters mean that the connection events used are 65522, 65532, 6, 16, 26, etc.
If the LL_SUBRATE_IND PDU contained those values for these two parameters then,
if the PDU was queued, sent, and received on event 65532, it indicated that the same
connection events are to be used; on the other hand, if the PDU was queued, sent,
and received on event 6, then it implies a change of phase so that connection events
12, 22, 32, etc. are to be used instead. Since internal queues and retransmissions can
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 3228 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 6, Part B Page 3229
Link Layer Specification
mean that a packet queued for event 65532 could be received in event 6, the Peripheral
needs to be able to distinguish these two cases, which it does by making the test
described.
The procedure has completed when the Link Layer acknowledgment for the
LL_SUBRATE_IND PDU has been sent or received.
The Peripheral shall accept an LL_SUBRATE_IND PDU. However, if the Peripheral's
Host would prefer a different subrate factor it may, after this procedure has completed,
initiate the Connection Subrate Request procedure or the Connection Parameters
Request procedure to change the connection parameters.
5.1.20 Connection Subrate Request procedure
The Peripheral's Link Layer may request the Central to update the subrate factor,
Peripheral latency, continuation number, and supervision timeout by sending an
LL_SUBRATE_REQ PDU. The Central shall not send this PDU. The Peripheral shall
only initiate this procedure when requested by the Host.
A device shall not initiate this procedure while any CS procedures are in progress
(as described in Section 4.5.18.1). A device shall not initiate this procedure while a
Connection Rate Request procedure or a Connection Rate Update procedure is in
progress.
When the Central receives this PDU it shall either initiate the Connection Subrate
Update procedure or shall respond with an LL_REJECT_EXT_IND PDU to reject the
request. If the Central's Host has not set the Connection Subrating (Host Support) bit
in the FeatureSet, the Central's Link Layer shall reject the request. If the Central's Host
has provided acceptable subrate parameters for requests from the Peripheral, then the
Central's Link Layer shall initiate the Connection Subrate Update procedure if and only
if all of the following are true ("acceptable" indicates values provided by the Host, see
[Vol 4] Part E, Section 7.8.123 and [Vol 4] Part E, Section 7.8.124; "requested" indicates
values in the LL_SUBRATE_REQ PDU):
• Max_Latency ≤ Max_Latency ,
requested acceptable
• Timeout ≤ Supervision_Timeout ,
requested acceptable
• SubrateFactorMax ≥ Subrate_Min ,
requested acceptable
• SubrateFactorMin ≤ Subrate_Max ,
requested acceptable
• (connInterval × SubrateFactorMin × (Max_Latency + 1))×2 <
current requested requested
Timeout
requested
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 3229 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 6, Part B Page 3230
Link Layer Specification
If the Central accepts the Peripheral’s request, then:
• the new connSubrateFactor shall be between Subrate_Min and
acceptable
Subrate_Max and shall also be between SubrateFactorMin and
acceptable requested
SubrateFactorMax ,
requested
• the new connContinuationNumber shall equal
min(max(Continuation_Number , ContinuationNumber ), (new
acceptable requested
connSubrateFactor) - 1),
• the new connPeripheralLatency shall be less than or equal to
min(Max_Latency , Max_Latency ,
requested acceptable)
• the new connSupervisionTimeout shall equal min(Timeout ,
requested
Supervision_Timeout .
acceptable)
The procedure has completed when the resulting Connection Subrate Update
procedure has completed or an LL_REJECT_EXT_IND PDU has been sent or received.
5.1.21 Channel Classification Enable procedure
A Controller uses the Channel Classification Enable procedure to enable or disable
reporting of channel classification information on the peer device. Until the Central
initiates this procedure, reporting shall be disabled.
The Central can initiate this procedure at any time after entering the Connection state
by sending an LL_CHANNEL_REPORTING_IND PDU. The Peripheral shall not send
this PDU.
When a Peripheral that supports the Channel Classification feature receives this PDU,
it shall enable or disable reporting of channel classification information to the Central as
specified in the PDU. When reporting is enabled, the Peripheral should send channel
classification information by initiating the Channel Classification Reporting procedure
(see Section 5.1.22). When reporting is disabled, the Peripheral shall not send channel
classification information.
The procedure has completed when the Link Layer acknowledgment of the
LL_CHANNEL_REPORTING_IND PDU is sent or received.
5.1.22 Channel Classification Reporting procedure
A Controller uses the Channel Classification Reporting procedure to report channel
classification information to the peer device.
The Peripheral may initiate this procedure by sending an LL_CHANNEL_STATUS_IND
PDU after channel classification reporting has been enabled by the Central. The Central
shall not send this PDU.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 3230 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 6, Part B Page 3231
Link Layer Specification
If channel classification information has not changed since the last time the Peripheral
reported the information to the Central, then the Peripheral shall not initiate this
procedure. Otherwise, the Peripheral shall initiate this procedure within, or in the first
subrated connection event after, the maximum reporting delay from determining that a
change in channel classification has occurred or from channel classification reporting
being enabled, whichever is later. Two consecutive channel classification reports shall
be spaced apart by a duration that is greater than or equal to the minimum reporting
spacing.
The procedure has completed when the Link Layer acknowledgment of the
LL_CHANNEL_STATUS_IND PDU is sent or received.
5.1.23 Channel Sounding Security Start procedure
The Link Layer, upon request from the Host, may enable ciphered bit stream generation
for CS after the Encryption Start procedure has successfully completed as specified in
Section 5.1.3.1, using the CS Security Start procedure.
To start or restart CS security, three parameters are exchanged: the CS_IV, CS_IN, and
the CS_PV. Each value is composed of two parts: a Central part and a Peripheral part.
Both parts are exchanged in the LL_CS_SEC_REQ and LL_CS_SEC_RSP PDUs. After
these parameters are exchanged, CS security is also started.
To start CS security, the Link Layer of the Central shall generate the Central’s part of the
CS initialization vector (CS_IV_C), instantiation nonce (CS_IN_C), and personalization
vector (CS_PV_C). CS_IV_C shall be a 64-bit random number and CS_IN_C shall be
a 32-bit random number. Both shall be generated using the requirements for random
number generation defined in [Vol 2] Part H, Section 2.
The CS_PV_C shall be a 64-bit value. There are no requirements on the content of the
personalization vector, and it is not considered a critical security parameter. The intent
of this value is to introduce additional input into the DRBG instantiation function, as
described in [Vol 6] Part E, Section 3.1.5. The personalization vector may be generated
from a cryptographic module or from other pseudo-random sources.
The Link Layer of the Central initiates the CS Security Start procedure by sending an
LL_CS_SEC_REQ PDU to the Peripheral. Before transmitting the LL_CS_SEC_REQ
PDU, the Link Layer of the Central shall have completed all outstanding CS procedures,
including CS procedure repeats, associated with the ACL. While the CS Security Start
procedure is in progress, the local Link Layer shall reject the CS Start Procedure
invoked from either the local or remote host until the CS Security Start procedure has
completed.
The Central or Peripheral shall not enable the CS Security Start procedure if the
Channel Sounding (Host Support) feature bit is not set in the Controller. If the remote
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 3231 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 6, Part B Page 3232
Link Layer Specification
Link Layer sends an LL_CS_SEC_REQ PDU when the Channel Sounding (Host
Support) feature bit is not set in the local Link Layer, then the local Link Layer shall send
an LL_REJECT_EXT_IND PDU with the error code Unsupported Remote Feature /
Unsupported LMP Feature (0x1A).
The Central or Peripheral shall not enable a CS Security Start procedure if
the Encryption Start procedure has not successfully completed, as specified in
Section 5.1.3.1. If the remote Link Layer sends an LL_CS_SEC_REQ PDU without
the Encryption Start procedure having successfully completed, the local Link Layer shall
send an LL_REJECT_EXT_IND PDU with the error code Insufficient Security (0x2F).
If the Encryption Start procedure has successfully completed, then when the Link Layer
of the Peripheral receives an LL_CS_SEC_REQ PDU, it shall generate the Peripheral’s
part of the CS initialization vector (CS_IV_P), instantiation nonce (CS_IN_P), and
personalization vector (CS_PV_P). CS_IV_P shall be a 64-bit random number and
CS_IN_P shall be a 32-bit random number. Both shall be generated using the same
requirements used for the generation of CS_IV_C and CS_IN_C. The CS_PV_P shall
be a 64-bit value generated using the same requirements used for the generation of the
CS_PV_C.
The Link Layer of the Peripheral shall then transmit these values back to the Central by
sending an LL_CS_SEC_RSP PDU.
Each Link Layer shall combine the initialization vector, instantiation nonce, and
personalization vector parts in the following manner:
CS_IV = CS_IV_P || CS_IV_C
CS_IN = CS_IN_P || CS_IN_C
CS_PV = CS_PV_P || CS_PV_C
The CS_IV_C is concatenated with the CS_IV_P. The least significant octet of CS_IV_C
becomes the least significant octet of CS_IV. The most significant octet of CS_IV_P
becomes the most significant octet of CS_IV.
The CS_IN_C is concatenated with the CS_IN_P. The least significant octet of CS_IN_C
becomes the least significant octet of CS_IN. The most significant octet of CS_IN_P
becomes the most significant octet of CS_IN.
The CS_PV_C is concatenated with the CS_PV_P. The least significant octet of
CS_PV_C becomes the least significant octet of CS_PV. The most significant octet
of CS_PV_P becomes the most significant octet of CS_PV.
The procedure has completed when the LL_CS_SEC_RSP PDU has been sent or
received. On completion, the CSProcCount shall be initialized to 0.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 3232 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 6, Part B Page 3233
Link Layer Specification
5.1.24 Channel Sounding Capabilities Exchange procedure
The Link Layer parameters for CS capabilities information are exchanged before
executing the CS Configuration procedure described in Section 5.1.25. The Link
Layer of either the initiator or reflector can initiate the Channel Sounding Capabilities
Exchange procedure by sending an LL_CS_CAPABILITIES_REQ PDU. This procedure
should be used when requested by the Host. The procedure may also be initiated
autonomously by the Link Layer. The Link Layer shall not allow the CS Capability
Exchange procedure if the Channel Sounding (Host Support) feature bit is not set in
the Controller. If the remote Link Layer sends an LL_CS_CAPABILITIES_REQ PDU
when the Channel Sounding (Host Support) feature bit is not set in the local Link Layer,
the local Link Layer shall send an LL_REJECT_EXT_IND PDU with the error code
Unsupported Remote Feature / Unsupported LMP Feature (0x1A).
CS capabilities of the peer device may be supplied by the Host if previously
known, or cached by the Controller, including between connections. A Link Layer
should not send an LL_CS_CAPABILITIES_REQ PDU on every connection if the
information has been cached for this device. A Link Layer, however, may send
an LL_CS_CAPABILITIES_REQ PDU to refresh this cached information. Cached
information for a device from a previous connection may have changed and an
implementation shall be able to accept an error response from a subsequent CS Link
Layer control exchange if a capability is not supported or not used by the peer.
The Link Layer that receives an LL_CS_CAPABILITIES_REQ PDU shall respond with
an LL_CS_CAPABILITIES_RSP PDU.
The peer device’s capabilities shall be reported to the local Host on successful
completion of this exchange.
The procedure has completed when either an LL_CS_CAPABILITIES_RSP PDU or the
LL_REJECT_EXT_IND PDU has been sent or received.
5.1.25 Channel Sounding Configuration procedure
The Host may supply CS procedure configuration parameters and a previously
associated configuration ID parameter if previously cached from a prior connection by
that Host. Otherwise, the CS procedure configuration parameters shall be exchanged
before starting a CS procedure. This exchange shall only occur after the peer device’s
CS capabilities are known, as described in Section 5.1.24. A configuration ID is
selected by the Host of the Link Layer issuing the LL_CS_CONFIG_REQ PDU and
is assigned to each CS parameter group. The ID assigned shall be unique among all
created configuration parameter sets between two devices. The parameter exchange
may be started by either side. CS configuration parameters may be exchanged by
sending an LL_CS_CONFIG_REQ PDU. A Link Layer shall only begin the exchange
of CS configuration parameters when requested by the Host. The Central or Peripheral
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 3233 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 6, Part B Page 3234
Link Layer Specification
device shall not allow an exchange of CS configuration parameters if the Channel
Sounding (Host Support) feature bit is not set in the Controller. If the remote Link Layer
sends an LL_CS_CONFIG_REQ PDU when the Channel Sounding (Host Support)
feature bit is not set in the local Link Layer, then the local Link Layer shall send
an LL_REJECT_EXT_IND PDU with the error code Unsupported Remote Feature /
Unsupported LMP Feature (0x1A).
If the parameters received in an LL_CS_CONFIG_REQ PDU are not acceptable to
that Link Layer, then it shall immediately reject the configuration parameter set with
an LL_REJECT_EXT_IND PDU with the error code Unsupported LL Parameter Value
(0x20). If the receiving Link Layer accepts the LL_CS_CONFIG_REQ PDU parameters,
then it shall send an LL_CS_CONFIG_RSP PDU.
Several CS procedure configuration parameter sets may be supported concurrently
between Link Layers and shall be identified by the Config_ID parameter. The value of
the Config_ID parameter returned in the LL_CS_CONFIG_RSP PDU shall be the same
as the value received in the LL_CS_CONFIG_REQ PDU.
Configuration parameter sets may be changed using the CS Configuration procedure,
with the same configuration ID used to set up the configuration parameter set. A device
shall not initiate this procedure while a CS procedure or CS procedure repeat instances,
as described in Section 4.5.18.1, with the same configuration ID is in progress. A Link
Layer receiving an LL_CS_CONFIG_REQ PDU while a CS procedure or CS procedure
repeat instances using the same configuration ID is in progress shall immediately
respond with an LL_REJECT_EXT_IND with the error code Command Disallowed
(0x0C).
If an attempt to change or remove a configuration parameter set is rejected, then that
configuration set and the associated configuration ID shall not be updated by both Link
Layers. Otherwise, if an LL_CS_CONFIG_REQ Action field is set to removed, then
that configuration set shall no longer be used for subsequent CS procedures. Either
device may remove a configuration ID even if the peer device originally created that
configuration ID. A previously removed configuration ID may be reused to establish a
new configuration parameter set.
The procedure collision rules described in Section 5.3 apply so that the Central and
the Peripheral cannot simultaneously create or update a configuration parameter set.
These procedure collision rules may result in the Peripheral Link Layer receiving an
LL_REJECT_EXT_IND PDU to allow the Central initiated procedure to complete.
The Link Layer transmitting the LL_CS_CONFIG_REQ PDU shall select either the
initiator or reflector role for that configuration, as requested by the Host. The Link Layer
responding with the LL_CS_CONFIG_RSP PDU is then in the other role for the duration
of that configuration.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 3234 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 6, Part B Page 3235
Link Layer Specification
Devices may support various parameter values or ranges of values that are discovered
during the CS Capabilities Exchange procedure, as described in Section 5.1.24. If the
Link Layer that receives the LL_CS_CONFIG_REQ PDU does not support a suggested
parameter selection, then it shall respond with an LL_REJECT_EXT_IND PDU with the
error code Unsupported LL Parameter Value (0x20).
Table 5.2 describes how the values suggested in the LL_CS_CONFIG_REQ PDU shall
take into account the various capabilities of the peer device. Values suggested in
Table 5.2 shall also take into account the CS capabilities supported by the local device.
Parameters with mandatory settings are always included in both the local and peer
device settings as if they were included in either the LL_CS_CAPABILITIES_REQ or
LL_CS_CAPABILITIES_RSP PDU.
Parameter Content of the LL_CS_CONFIG_REQ PDU
Main_Mode Shall be selected from one of the valid Main_Mode and Sub_Mode
combinations described in [Vol 6] Part H, Table 4.11 that al-
so uses one of the Main_Mode types included in the peer’s
LL_CS_CAPABILITIES_REQ or LL_CS_CAPABILITIES_RSP PDU.
Sub_Mode Shall be selected from one of the valid Main_Mode and Sub_Mode
combinations described in [Vol 6] Part H, Table 4.11 that al-
so uses one of the Sub_Mode types included in the peer’s
LL_CS_CAPABILITIES_REQ or LL_CS_CAPABILITIES_RSP PDU.
CS_SYNC_PHY_Capability Shall be selected from one of the CS_SYNC_PHY_Capability
values included in both the local and peer device’s
LL_CS_CAPABILITIES_REQ or LL_CS_CAPABILITIES_RSP PDU.
RTT_Type Shall be selected based on the supported RTT capabili-
ties indicated in the peer’s LL_CS_CAPABILITIES_REQ or
LL_CS_CAPABILITIES_RSP PDU.
Role Shall be selected to be compatible with what was included in the
peer’s LL_CS_CAPABILITIES_REQ or LL_CS_CAPABILITIES_RSP
PDU. Specifically, if the peer indicated support for the initiator role,
then the reflector role may be selected; if the peer indicated support for
the reflector role, then the initiator role may be selected.
ChSel Shall be set by default to Channel Selection Algorithm #3b and
may be set to Channel Selection Algorithm #3c if support for this
parameter was indicated in the peer’s LL_CS_CAPABILITIES_REQ or
LL_CS_CAPABILITIES_RSP PDU.
T_IP1 Shall be selected from one of the valid values for T_IP1_Capability
described in [Vol 6] Part H, Section 4.3.1 that is greater than or equal
to the value contained in the peer’s LL_CS_CAPABILITIES_REQ or
LL_CS_CAPABILITIES_RSP PDU.
T_IP2 Shall be selected from one of the valid values for T_IP2_Capability
described in [Vol 6] Part H, Section 4.3.3 that is greater than or equal
to the value contained in the peer’s LL_CS_CAPABILITIES_REQ or
LL_CS_CAPABILITIES_RSP PDU.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 3235 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 6, Part B Page 3236
Link Layer Specification
Parameter Content of the LL_CS_CONFIG_REQ PDU
T_FCS Shall be selected from one of the valid values for T_FCS_Capability
described in Section 4.5.18.1 that is greater than or equal to
the value contained in the peer’s LL_CS_CAPABILITIES_REQ or
LL_CS_CAPABILITIES_RSP PDU.
T_PM Shall be selected from one of the valid values for T_PM_Capability
described in [Vol 6] Part H, Section 4.3.3 that is greater than or equal
to the value contained in the peer’s LL_CS_CAPABILITIES_REQ or
LL_CS_CAPABILITIES_RSP PDU.
Table 5.2: Content of the CS_CONFIG_REQ_PDU as limited by the peer's LL_CS_CAPABILITIES
content
After the LL_CS_CONFIG_RSP PDU has been received, then the CS configuration
associated with the configuration ID shall be considered available for use within the CS
Start procedure, as described in Section 5.1.26.
The CS Start procedure has completed when an LL_CS_CONFIG_RSP PDU or the
LL_REJECT_EXT_IND PDU has been sent or received. Each Link Layer shall notify its
Host when the Configuration procedure has completed.
5.1.26 Channel Sounding Start procedure
CS procedures may be initiated by either the initiator or reflector. Initiators and reflectors
may be in either the Central or Peripheral role. A CS Start procedure shall only be
started by sending an LL_CS_REQ PDU, which may be sent any time after entering
the Connection state, but only after the CS Security Start procedure has completed,
the CS Capability Exchange procedure has completed or the capabilities are previously
known, the CS Configuration procedure has completed or the configuration content is
previously known, and either the mode‑0 FAE table is previously known or the Channel
Sounding Mode‑0 FAE Table Request procedure has completed. A Link Layer shall
only begin a CS Start procedure when configured to do so by the Host. The Central
or Peripheral shall not allow a CS procedure to start if the Channel Sounding (Host
Support) feature bit is not set in the Controller. If the remote Link Layer sends an
LL_CS_REQ PDU when the Channel Sounding (Host Support) feature bit is not set in
the local Link Layer, the local Link Layer shall send an LL_REJECT_EXT_IND PDU with
the error code Unsupported Remote Feature / Unsupported LMP Feature (0x1A).
The Link Layer shall not initiate the CS Start procedure until any outstanding
CS Procedure Repeat Termination procedure, as described in Section 5.1.27, or
Power Control Request procedure, as described in Section 5.1.17, or Connection
Update procedure, as described in Section 5.1.1, or Connection Parameters Request
procedure, as described in Section 5.1.7, or Connection Subrate Update procedure, as
described in Section 5.1.19, or Connection Subrate Request procedure, as described in
Section 5.1.20, has completed. CS procedures are dependent on parameters selected
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 3236 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 6, Part B Page 3237
Link Layer Specification
during a previous Power Control Request procedure. After a CS procedure starts,
including when an individual instance of a CS procedure starts within procedure repeat
activity, the selected transmit power values relative to the values selected in a prior
Power Control Request procedure shall remain unchanged for the duration of that
procedure instance, regardless of later changes to the respective ACL power control
parameters.
CS procedures are also dependent on parameters selected during the CS Configuration
procedure, as described in Section 5.1.25, which are identified by the Config_ID
identifier. If the CS configuration ID received during the CS Start procedure is not
properly created, then the receiving Link Layer shall immediately respond with an
LL_REJECT_EXT_IND PDU with the error code Invalid LL Parameters (0x1E).
If the receiving Link Layer is in the Peripheral role and accepts the parameters received
in the LL_CS_REQ PDU or chooses to select alternative parameters, then it shall
send an LL_CS_RSP PDU. If the parameters received in an LL_CS_REQ PDU are not
acceptable to the receiving Link Layer (Central or Peripheral), then that Link Layer shall
immediately reject the procedure by sending an LL_REJECT_EXT_IND PDU with the
appropriate error code.
When a Link Layer in the Central role receives either an LL_CS_REQ PDU or an
LL_CS_RSP PDU, it shall either prepare to start the CS procedure by replying with
an LL_CS_IND PDU or it shall cancel the CS Start procedure by replying with an
LL_REJECT_EXT_IND PDU with the appropriate error code.
When an LL_CS_IND PDU is sent by the Link Layer of the Central and received by the
Link Layer of the Peripheral, both devices shall stop the procedure response timeout
timer and start the CS procedure. The first CS subevent shall be anchored at the
connection event specified in the LL_CS_IND PDU.
If either Link Layer sends or receives an LL_REJECT_EXT_IND PDU, that Link Layer
shall terminate the CS Start procedure. The CS Start procedure has completed on each
Link Layer when the LL_REJECT_EXT_IND PDU has been transmitted or received.
If a Link Layer agrees with suggested parameters received in the LL_CS_REQ
PDU, then it shall reply with the same Config_ID, and with the same parameter
or set of parameters that are within the suggested range in the LL_CS_RSP or
LL_CS_IND PDU. Alternatively, the values of connEventCount, Offset_Min, Offset_Max,
Event_Interval, Subevents_Per_Event, Subevent_Interval, Subevent_Len, and ACI may
be re-suggested to better suit the internal scheduling and resource availability of the
Link Layer replying with the LL_CS_RSP PDU. Because some of these values are
related to Link Layer scheduling, changes to the values might not coincide with the
scheduling constraints of the Link Layer that transmitted the LL_CS_REQ PDU and
might cause that Link Layer to reject the suggested values.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 3237 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 6, Part B Page 3238
Link Layer Specification
The value of the connEventCount field specifies the LE connection event anchor point
from which the first CS event within a CS procedure is offset. The connEventCount
value supplied in either the LL_CS_RSP or LL_CS_IND PDU shall be no sooner in
time than the value received in the LL_CS_REQ or LL_CS_RSP PDU that is being
responded to.
Section 5.3 shall apply to the LL_CS_IND PDU as if the connEventCount field were
an instant. The selection of the connEventCount field supplied in the LL_CS_RSP or
LL_CS_IND PDU shall follow the requirements specified in Section 5.5. The instant
passed requirements specified in Section 5.5.1 do not apply to this connEventCount
field and instead the following requirements apply.
Let currConnEventCount represent the current connEventCount value as described
in Section 4.5.1. The connEventCount field is determined to be in the past when
(connEventCount – currConnEventCount) mod 65535 is greater than or equal to 32767.
In this case, the first few CS subevents of the CS procedure may be lost and if so, the
requirements described in [Vol 6] Part H, Section 4.4.5 shall apply.
The values of the Offset_Min and Offset_Max fields of the LL_CS_REQ and
LL_CS_RSP PDUs each specify a window for the start of the first CS event within a
CS procedure. The window specified in the LL_CS_RSP PDU shall lie entirely within
that the window specified by the LL_CS_REQ PDU. The start of the first CS event
within a CS procedure shall lie within the window specified by the LL_CS_REQ PDU
and the LL_CS_RSP PDU.
The value of Subevent_Interval supplied in either the LL_CS_RSP PDU or the
LL_CS_IND_PDU shall be greater than or equal to the value received in the
LL_CS_REQ or LL_CS_RSP PDU that is being responded to.
The Subevent_Interval shall be greater than or equal to the sum of the Subevent_Len
selected plus T_MES. A Controller shall be capable of supporting a minimum
Subevent_Len of 2.5 ms. The value of Subevent_Len supplied in either the
LL_CS_RSP or LL_CS_IND PDU shall be less than or equal to the value received
in the LL_CS_REQ or LL_CS_RSP PDU that is being responded to.
Suggesting different values for Event_Interval, Subevents_Per_Event,
Subevent_Interval, or Subevent_Len in the LL_CS_RSP or the LL_CS_IND PDU
should result in an overall CS procedure duration that is less than or equal to
the value of Max_Procedure_Len specified in the CS_REQ_PDU. If the Link Layer
previously transmitted an LL_CS_REQ PDU, then received an LL_CS_RSP PDU
without any changes to the Event_Interval, Subevents_Per_Event, Subevent_Interval,
or Subevent_Len fields, then the Link Layer shall not alter those values when sending
the LL_CS_IND PDU.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 3238 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 6, Part B Page 3239
Link Layer Specification
The ACI parameter is set according to the Num_Ant and Max_Ant_Path parameters
from the CS Capabilities Exchange procedure described in Section 5.1.24. The
Num_Ant value reflected in the peer’s LL_CS_CAPABILITIES_REQ PDU or the
LL_CS_CAPABILITIES_RSP PDU indicates the maximum number of antenna elements
supported by the sending Link Layer. The Max_Ant_Path value reflected in the peer’s
LL_CS_CAPABILITIES_REQ PDU or the LL_CS_CAPABILITIES_RSP PDU indicates
the maximum number of antenna paths supported by the sending Link Layer. The ACI
parameter selected for the LL_CS_REQ PDU and finalized in the LL_CS_IND PDU
shall yield an antenna configuration setting with an antenna element count that is equal
to or less than the Num_Ant limit indicated for both Link Layers. The ACI parameter
shall also contain an antenna path count that is equal to or less than the value for
Max_Ant_Path indicated by both Link Layers. The ACI parameter shall be selected
according to the ACI value described in [Vol 6] Part A, Section 5.3. Re-suggested ACI
values shall only propose modification for the local device antenna selection and shall
use a setting that contains antenna element numbers that are equal to or less than
those suggested.
Example 1:
Device A supports a value of two for Num_Ant and a value of four for Max_Ant_Path.
Device B supports a value of four Num_Ant and a value of four Max_Ant_Path. Device
A initially suggests a 1:4 ACI configuration. Device B can then re-suggest a 1:3 ACI
configuration but cannot re-suggest a 2:2 ACI configuration.
Example 2:
Device A supports a value of three for Num_Ant and a value of four for Max_Ant_Path.
Device B supports a value of one Num_Ant and a value of two Max_Ant_Path. Device
A can initially suggest a 2:1 ACI configuration but cannot initially suggest a 3:1 ACI
configuration.
The Preferred_Peer_Ant field indicates the preferred ordered antenna elements that
should be used, if possible, by the device that receives the LL_CS_REQ PDU. This
ordering is described in Section 2.4.2.44 in the description for the Num_Ant field. The
number of bits set in this field shall not exceed the Num_Ant parameter from the CS
Capabilities Exchange procedure described in Section 5.1.24. The number of bits set
in this field shall be greater than or equal to the number of antenna elements denoted
by the ACI field. If the number of bits set in this field exceeds the number of antenna
elements denoted by the ACI field, then the ordered antenna elements specified should
be used, with the lowest ordered antenna elements denoted by this field preferred. If the
local device is not concerned with the peer's ordered antenna selection, then it shall set
the lowest ordered Num_Ant (received from the CS Capabilities Exchange) bits within
this field.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 3239 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 6, Part B Page 3240
Link Layer Specification
Each Link Layer may use the PHY and Pwr_Delta fields to request the peer Controller
to adjust the transmit power level it uses during the CS procedure. The power control
adjustment is specified relative to the current power level of the ACL connection
PHY specified by the PHY parameter. The Link Layer receiving the LL Control PDU
shall adjust its transmit power level as requested during all transmissions within the
CS procedure. If the requested change would take the Link Layer receiving the LL
Control PDU above the maximum power level the device supports, it shall change
the power level to the maximum supported. If it is unable to make the requested
change for any other reason, the Link Layer receiving the LL Control PDU shall change
the power level to the lowest available level greater than the requested level. If the
power level of the local transmit PHY indicated by the PHY parameter received during
the CS Start procedure is not the PHY in use by the current ACL connection and
is not currently being managed (as described in Section 5.1.17 and Section 5.1.18)
by the receiving Link Layer, then that Link Layer shall immediately respond with an
LL_REJECT_EXT_IND PDU with the error code Unsupported LMP Parameter Value /
Unsupported LL Parameter Value (0x20). Refer to Section 5.1.17 for information on
managing power levels for specific PHYs.
If the local CS role is that of the initiator, then the value of the TX_SNR_I field
shall be selected from one of the TX_SNR_Capabilities included in the local device’s
LL_CS_CAPABILITIES_REQ or LL_CS_CAPABILITIES_RSP PDU. Similarly, the value
of the TX_SNR_R field shall be selected from one of the TX_SNR_Capabilities included
in the peer device’s LL_CS_CAPABILITIES_REQ or LL_CS_CAPABILITIES_RSP PDU.
Alternatively, if the local CS role is that of the reflector, then the value of the
TX_SNR_R field shall be selected from one of the TX_SNR_Capabilities included
in the local device’s LL_CS_CAPABILITIES_REQ or LL_CS_CAPABILITIES_RSP
PDU. Similarly, the value of the TX_SNR_I field shall be selected from one of the
TX_SNR_Capabilities included in the peer device’s LL_CS_CAPABILITIES_REQ or
LL_CS_CAPABILITIES_RSP PDU.
If the Link Layer that transmits the LL_CS_IND PDU also previously transmitted the
LL_CS_REQ PDU within the same CS Start procedure, then it shall use the same
values for the PHY and Pwr_Delta fields in both transmissions.
CSChM shall be set to the ChM parameter value of the CS configuration used for the
procedure.
CSNumRepetitions shall be set to the ChM_Repetition parameter value of the CS
configuration used for the procedure.
CSMode0Steps shall be set to the Mode_0_Steps parameter value of the CS
configuration used for the procedure.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 3240 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 6, Part B Page 3241
Link Layer Specification
CSShapeSelection shall be set to Ch3cShape parameter value of the CS configuration
used for the procedure.
CSChannelJump shall be set to the Ch3cJump parameter value of the CS configuration
used for the procedure.
Parameter values exchanged during the CS Start procedure are used to select the
values for CS event and subevent scheduling, as described in Section 4.5.18.1.
Table 5.3 shows this mapping.
LL_CS_REQ, LL_CS_RSP, LL_CS_IND Parameter CS Event/Subevent Parameter
Offset_Min, Offset_Max, Offset T_EVENT_OFFSET
Event_Interval T_EVENT_INTERVAL
Subevents_Per_Event N_SUBEVENTS_PER_EVENT
Subevent_Interval T_SUBEVENT_INTERVAL
Subevent_Len T_SUBEVENT_LEN
Procedure_Interval T_PROCEDURE_INTERVAL
Procedure_Count N_PROCEDURE_COUNT
Max_Procedure_Len T_MAX_PROCEDURE_LEN
Table 5.3: CS LL PDU parameter versus CS Event/Subevent parameter
The procedure has completed when the LL_CS_IND PDU or an LL_REJECT_EXT_IND
PDU has either been transmitted or received. The Controller shall notify its Host when
the CS Start procedure completes either if it has completed successfully or if the
procedure was initiated by a request from the Host. Otherwise, it shall not notify the
Host that the procedure took place.
The CS procedure counter CSProcCount shall be incremented by one after
every successful completion of the CS Start procedure, except for the occurrence
that immediately follows the completion of the CS Security Start procedure (see
Section 5.1.23). CSProcCount shall also be incremented by one at the start of each
subsequent CS procedure repeat. The CSProcCount value shall wrap from 0xFFFF to
0x0000. Between any initiator and reflector pair, the CS Start procedure may be invoked
again before the completion of an ongoing CS procedure. However, the timing and
execution of two CS procedures between that pair, which includes the timing of any
procedure repeat activity, shall not overlap.
5.1.27 Channel Sounding Procedure Repeat Termination procedure
The initiator or reflector may only use the Channel Sounding Procedure Repeat
Termination procedure to terminate repetitions of CS procedure instances if
N_PROCEDURE_COUNT has been set to 0 or a value greater than 1 (see
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 3241 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 6, Part B Page 3242
Link Layer Specification
Section 4.5.18.1). The CS Procedure Repeat Termination procedure is started by
sending an LL_CS_TERMINATE_REQ PDU.
The procedure collision rules described in Section 5.3 apply so that the Central
and Peripheral cannot simultaneously execute the CS Procedure Repeat Termination
procedure. These procedure collision rules may result in the Peripheral Link Layer
receiving an LL_REJECT_EXT_IND PDU to allow the Central initiated procedure to
complete.
If N_PROCEDURE_COUNT (as described in Section 5.1.26) is greater than 1, then
the CS procedure repeat instance series is bounded by a maximum procedure count
value. For this purpose, let StartCSProcCount be defined as the starting CSProcCount
value used for the first instance of the CS procedure series that is being terminated.
The Link Layer receiving the LL_CS_TERMINATE_REQ PDU shall respond by sending
an LL_REJECT_EXT_IND PDU with the error code Command Disallowed (0x0C) if the
ProcCount value received in the LL_CS_TERMINATE_REQ PDU satisfies the following
condition:
(ProcCount - StartCSProcCount + 1) mod 65536 > N_PROCEDURE_COUNT
Additionally, the Link Layer receiving the LL_CS_TERMINATE_REQ PDU shall respond
by sending an LL_REJECT_EXT_IND PDU with error code Command Disallowed
(0x0C) if the Config_ID value received is not associated with the CS procedure repeat
series associated with the received ProcCount value.
Otherwise, the Link Layer receiving the LL_CS_TERMINATE_REQ PDU shall respond
by transmitting an LL_CS_TERMINATE_RSP PDU.
This procedure shall complete at most once per CS procedure repeat instance series.
Termination of all subsequent procedure instances shall occur when the
LL_CS_TERMINATE_REQ PDU is sent or received. This termination shall occur before
the start of the next procedure instance and shall not be applied to a CS procedure that
is in progress.
Based on implementation delays, the ProcCount value received in either the
LL_CS_TERMINATE_REQ PDU or the LL_CS_TERMINATE_RSP PDU may differ from
the value transmitted. In this case, the higher of the two values shall be used by the
two Link Layers to keep their respective DRBGs synchronized as it relates to the DRBG
backtracking resistance as described in [Vol 6] Part E, Section 3.1.7. The higher of
the two values is determined by subtracting the transmitted ProcCount value from the
received ProcCount value modulo 65536. If this result is greater than or equal to 32767,
then the transmitted ProCount value is higher, otherwise the received ProcCount value
is higher.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 3242 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 6, Part B Page 3243
Link Layer Specification
The CS Procedure Repeat Termination procedure has completed when an
LL_CS_TERMINATE_RSP PDU or the LL_REJECT_EXT_IND PDU has been sent or
received.
5.1.28 Channel Sounding Channel Map Update procedure
The channel map used in any CS procedure may be updated before initiating the start
of that procedure (see Section 5.1.26) or before the start of any procedure instance (see
Section 4.5.18.1). The Link Layer initiating the start of the CS procedure can update the
channel map by sending the LL_CS_CHANNEL_MAP_IND PDU.
Because either the initiator or reflector may initiate the start of a CS
procedure by transmitting an LL_CS_REQ PDU, either side may issue the
LL_CS_CHANNEL_MAP_IND PDU. However, only the channel map update issued by
the Link Layer initiating a subsequent CS procedure shall be applied toward that CS
procedure.
An LL_CS_CHANNEL_MAP_IND PDU sent or received while any CS procedure is in
progress shall not take effect for that CS procedure. These updates shall apply to all
CS procedures starting after the specified instant, until the next occurrence of the CS
Channel Map Update procedure.
An LL_CS_CHANNEL_MAP_IND PDU sent or received while both no CS procedure is
in progress and no CS procedure instances are pending shall take effect immediately
and the Instant parameter shall be processed as if that field was RFU.
The value of the instant parameter supplied in the LL_CS_CHANNEL_MAP_UPDATE_-
IND PDU shall follow the requirements specified in Section 5.5. The instant passed
requirements specified in Section 5.5.1 do not apply to the instant parameter of the
LL_CS_CHANNEL_MAP_IND PDU, and instead the following requirements apply.
Any pending CS procedure repeat instances shall be terminated using the rules defined
in Section 5.1.27 with error code Instant Passed (0x28) if the instant is determined to be
in the past. An instant is determined to be in the past when (Instant – connEventCount)
mod 65535 is greater than or equal to 32767. In this case, updates include in the
LL_CS_CHANNEL_MAP_UPDATE_IND PDU shall still be applied to all subsequent CS
procedures, until the next occurrence of the CS Channel Map Update procedure.
The default channel map shall include all allowed CS channels as defined in [Vol 6] Part
H, Section 1 and is equivalent to the ChM field of the LL_CS_CHANNEL_MAP_IND
PDU with all valid channel bits set to 1.
The channel map derived from the CS Channel Map Update procedure shall be
combined with the CSChM parameter selected during the CS Start procedure (see
Section 5.1.26) with a logical AND operation to generate the CSFilteredChM channel
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 3243 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 6, Part B Page 3244
Link Layer Specification
map value. This value has the same format as the ChM parameter used in this update
procedure and represents the filtered channel map to be used in the next CS procedure.
CSFilteredChM = CSChM & (CS Channel Map Update procedure parameter ChM)
The CSFilteredChM shall be used in the Channel Selection Algorithm #3 procedure as
described in [Vol 6] Part H, Section 4.1.
The minimum number of channels in CSFilteredChM shall be 15. If, at the start of any
procedure instance and after applying a channel map update, the number of channels
is less than 15, then that CS procedure shall not start, and the Host shall be notified of
this. If a series of procedure instances are in progress (see Section 4.5.18.1), and at the
start of a procedure instance the number of channels in CSFilteredChM is less than 15,
then that specific procedure instance shall not start, the procedure instance series shall
terminate, and the Host shall be notified that the procedure instance series has been
aborted.
The procedure has completed when the instant has passed and the new channel map
has been applied.
5.1.29 Channel Sounding Mode-0 FAE Table Request procedure
This Table Request procedure shall only be used when the peer’s No_FAE bit is set to 0
in its CS capabilities, as described in Section 2.4.2.44.
A reflector’s mode-0 FAE table shall be known by the initiator before starting a CS
procedure as described in Section 5.1.26. The reflector’s mode-0 FAE table may be
provided by the initiator’s Host to the local Controller if known previously by that Host.
If not previously known, then a potential initiator shall issue the LL_CS_FAE_REQ PDU
to a prospective reflector to request the table. A Link Layer shall only begin a request
for a peer device’s mode‑0 FAE table when requested by the Host. A Controller shall
not allow a local Host to request a peer’s FAE table if the Channel Sounding (Host
Support) feature bit is not set in the Controller. Likewise, a Link Layer shall not allow
the exchange of its mode‑0 FAE table if the Channel Sounding (Host Support) feature
bit is not set in that Controller. If a remote Link Layer sends an LL_CS_FAE_REQ PDU
when the Channel Sounding (Host Support) feature bit is not set in the local Link Layer,
then the local Link Layer shall send an LL_REJECT_EXT_IND PDU with the error code
Unsupported Remote Feature / Unsupported LMP Feature (0x1A).
The Link Layer shall not transmit the LL_CS_FAE_REQ PDU if that peer device has
indicated support for zero FAE in its CS capabilities (see Section 5.1.24).
Because either side may be the initiator of a CS procedure, either side may issue the
LL_CS_FAE_REQ PDU.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 3244 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 6, Part B Page 3245
Link Layer Specification
A Link Layer receiving an LL_CS_FAE_REQ PDU after having set the No_FAE bit in its
CS capabilities shall immediately respond with an LL_REJECT_EXT_IND PDU with the
error code Unsupported Feature or Parameter Value (0x11). Otherwise, the Link Layer
that receives the LL_CS_FAE_REQ PDU shall respond with the LL_CS_FAE_RSP PDU
and its local per-channel mode‑0 FAE table.
The procedure has completed when an LL_CS_FAE_RSP PDU or the
LL_REJECT_EXT_IND PDU has been sent or received.
5.1.30 Frame Space Update procedure
The Central or Peripheral may initiate the Frame Space Update procedure, when
supported, to change one or more of the following frame space parameters:
• T_IFS_ACL_CP
• T_IFS_ACL_PC
• T_MCES
• T_IFS_CIS
• T_MSS_CIS
The Frame Space Update procedure may be initiated when requested by the Host, or
autonomously by the Link Layer.
The Spacing_Types and PHYS fields shall be used to indicate the parameters and
PHYs to be changed.
The procedure shall affect the ACL and any CIS associated with the ACL created
after the procedure has completed; it does not affect any other ACL connections or
any existing CISes. Subject to Section 5.1.30.1, the affected values shall change on
the initiating device no later than the 6th connection anchor point after it receives the
LL_FRAME_SPACE_RSP PDU and on the responding device before it first sends the
LL_FRAME_SPACE_RSP PDU.
When the Controller receives an LL_FRAME_SPACE_REQ PDU, it shall respond with
an LL_FRAME_SPACE_RSP PDU to accept the request or an LL_REJECT_EXT_IND
PDU to reject the request. The Controller may reject the request for any reason.
FS_Max shall be greater than or equal to the frame space value in use. If FS_Min
and FS_Max in the LL_FRAME_SPACE_REQ PDU are both less than the frame space
value in use for any of the selected frame space types and PHYs, then the responding
device may reject the request by sending an LL_REJECT_EXT_IND PDU with the error
code set to Unsupported Feature or Parameter Value (0x11).
If the resulting frame space value causes connIntervalUncodedMin (if the current PHY
in each direction is an LE Uncoded PHY) or connIntervalCodedMin (if the current
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 3245 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 6, Part B Page 3246
Link Layer Specification
PHY in either direction is the LE Coded PHY) to exceed the connection interval and
the change is being done on the existing ACL connection on the current PHY in
either direction, then the responding device shall reject the request by sending an
LL_REJECT_EXT_IND PDU with the error code set to Unsupported LMP Parameter
Value / Unsupported LL Parameter Value (0x20).
The responding device shall set the FS field of the LL_FRAME_SPACE_RSP PDU to
a value between the FS_Min and FS_Max of the LL_FRAME_SPACE_REQ PDU, and
should set it to the lowest value the responding device supports within that range.
All bits set to 0 in the PHYS and Spacing_Types fields of an LL_FRAME_SPACE_REQ
PDU shall be set to 0 in the LL_FRAME_SPACE_RSP PDU sent in response. If a bit is
set to 1 in the PHYS field or the Spacing_Types field of the LL_FRAME_SPACE_RSP
PDU and the corresponding bit(s) are not set in the LL_FRAME_SPACE_REQ PDU,
then this is considered invalid behavior (see [Vol 1] Part E, Section 2.7).
If either the PHYS or the Spacing_Types field of an LL_FRAME_SPACE_REQ PDU
is set to 0, then the responding device shall reject the request by sending an
LL_REJECT_EXT_IND PDU with the error code set to Invalid LL Parameters (0x1E).
The procedure has completed when an LL_FRAME_SPACE_RSP PDU or
LL_REJECT_EXT_IND PDU has been sent or received.
If the procedure results in a change to one or more frame space values regardless of
whether the PHYs or Frame_Space changed is in use, then each Controller shall notify
the Host about the change.
5.1.30.1 Adjacent packets in the same connection event
For the purposes of this section:
• TIA_C is the T_IFS_ACL_CP for the PHY(s) in use on the ACL.
• TIA_P is the T_IFS_ACL_PC for the PHY(s) in use on the ACL.
• If the initiating device is the Central, then TIA_I is TIA_C and TIA_R is TIA_P.
• If the initiating device is the Peripheral, then TIA_I is TIA_P and TIA_R is TIA_C.
If the Frame Space Update procedure affects TIA_I, then the initiating device
shall use the following parameters instead of those in Table 4.1 during the period
between transmitting the first packet containing the LL_FRAME_SPACE_REQ PDU and
receiving an LL_FRAME_SPACE_RSP PDU or LL_REJECT_EXT_IND PDU:
• receiveWindowStart shall be the smaller of FS_Min and TIA_I after the end of the
previous packet
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 3246 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 6, Part B Page 3247
Link Layer Specification
• receiveWindowEnd shall be the greater of FS_Max and TIA_I after the end of the
previous packet
where FS_Min and FS_Max are the corresponding values in the
LL_FRAME_SPACE_REQ PDU. In addition, during the period between transmitting the
first packet containing the LL_FRAME_SPACE_RSP PDU and receiving either an ACK
or a new PDU:
• If the responding device is the Central and the response is sent as a continuation of a
connection event, then the LL_FRAME_SPACE_RSP PDU shall be transmitted after
an Inter Frame Space specified by the FS value in the LL_FRAME_SPACE_RSP
PDU.
• If the responding device is the Peripheral, then the LL_FRAME_SPACE_RSP PDU
shall be transmitted after an Inter Frame Space specified by the FS value in the
LL_FRAME_SPACE_RSP PDU.
If the Frame Space Update procedure affects TIA_R, then the responding device shall
use the following parameters instead of those in Table 4.1 during the period between
transmitting the first packet containing the LL_FRAME_SPACE_RSP PDU and receiving
a packet using the new frame space value:
• receiveWindowStart shall be the smaller of FS and TIA_R after the end of the
previous packet
• receiveWindowEnd shall be the greater of FS and TIA_R after the end of the previous
packet
where FS is the value in the LL_FRAME_SPACE_RSP PDU.
5.1.31 UTP OTA mode procedure
A Controller uses the UTP OTA mode procedure to enter the RFPHY test mode.
The Central or Peripheral can initiate this procedure at any time after entering the
connection state by sending an LL_OTA_UTP_IND PDU.
The procedure has completed when the Link Layer acknowledgment to the
LL_OTA_UTP_IND PDU is sent or received.
The Unified Test Protocol described in [Vol 6] Part F, Section 5 is transported using
LL_OTA_UTP_IND PDUs. How the Controller uses these PDUs is described in [Vol 6]
Part F, Section 6.4.
UTP PDUs shall be processed if and only if the ACL is encrypted, the UTP OTA mode
feature is supported, and UTP OTA mode is enabled at the IUT.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 3247 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 6, Part B Page 3248
Link Layer Specification
If UTP OTA mode is enabled but the ACL is not encrypted when one of the UTP
PDUs is received, then the Controller shall immediately reject the PDU by sending an
LL_REJECT_EXT_IND PDU with the error code Insufficient Security (0x2F).
If UTP OTA mode is not enabled when one of the UTP PDUs is received, then the
Controller shall immediately reject the PDU by sending an LL_REJECT_EXT_IND PDU
with the error code Command Disallowed (0x0C).
5.1.32 Connection Rate Update procedure
The Central may update the connInterval, connSubrateBaseEvent, connSubrateFactor,
connPeripheralLatency, connContinuationNumber, and connSupervisionTimeout by
sending an LL_CONNECTION_RATE_IND PDU. The Peripheral shall not send this
PDU. The Central shall only initiate the Connection Rate Update Procedure when
requested by the Host or when requested by the Peripheral via the Connection
Rate Request procedure. The Central shall not initiate the Connection Rate Update
procedure while a Connection Parameters Request procedure or a Connection Subrate
Request procedure is in progress. The Central shall not initiate this procedure until
the Central has performed a Feature Exchange procedure (see Section 5.1.4) and
has determined that the Connection Rate (Host Support) bit is set in the Peripheral's
FeatureSet. The Central shall not initiate this procedure while any CS procedures are in
progress (see Section 4.5.18.1).
The Link Layer of the Central shall select the connInterval from the interval range given
by the Host (i.e., connInterval and connInterval ). The selected value shall be at
min max
least connIntervalUncodedMin on the LE Uncoded PHY and connIntervalCodedMin on
the LE Coded PHY.
The requirements of Section 5.5 shall apply to the LL_CONNECTION_RATE_IND PDU.
The Central shall transmit on the connection event where connEventCount equals
Instant and the connection event before that event, irrespective of subrating. When
the Peripheral receives such a PDU with the instant in the future, it shall listen to
the connection event where connEventCount equals Instant and the connection event
before that event, even if subrating or Peripheral latency means it would not normally do
so.
The values of connInterval, connSubrateFactor, connPeripheralLatency,
connContinuationNumber, and connSupervisionTimeout specified in the
LL_CONNECTION_RATE_IND PDU shall be used starting at the instant. At the
instant, the value of connSubrateBaseEvent shall be set to the instant specified in the
LL_CONNECTION_RATE_IND PDU. The connection interval used before the instant is
known as connInterval ; the connection interval used at the instant and after is known
OLD
as connInterval .
NEW
Figure 5.6 shows the connection event timing around the instant.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 3248 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 6, Part B Page 3249
Link Layer Specification
Instant
Last event transmitted with
First event transmitted with Second event transmitted with
old connection parameters
new connection parameters new connection parameters
C->P P->C C->P P->C C->P P->C
transmitWindowOffset
T_IFS_ACL_CP T_IFS_ACL_CP T_IFS_ACL_CP
connInterval connInterval
OLD NEW
Figure 5.6: Connection event timing in the case of Connection Rate Update
The Central may adjust the anchor point when deciding the timing of the first packet
transmitted with new connection parameters. The first connection event at or after the
instant shall start at connInterval + transmitWindowOffset after the anchor point
OLD
of the last connection event before the instant. The transmitWindowOffset shall be a
multiple of 125 µs in the range 0 µs to connInterval . The Central and the Peripheral
NEW
shall follow the timing requirements in Section 4.2 when switching between the last
event transmitted with old connection parameters and the first event transmitted with
new connection parameters.
The instant occurs after connInterval and before transmitWindowOffset. All the
OLD
connection event transmission rules and subrating rules specified in Section 4.5.1 shall
apply.
The connection supervision timer T shall be reset at the anchor point of
LLconnSupervision
the first connection event at or after the instant.
If the received LL_CONNECTION_RATE_IND PDU contains any fields that are out of
valid range or unsupported by the Peripheral’s Link Layer, then the Peripheral’s Link
Layer shall respond with LL_UNKNOWN_RSP PDU to signal back to the Central’s Link
Layer that it does not continue the procedure.
The Link Layer shall notify the Host of the new connection event parameters upon
completion of the procedure.
The procedure is complete when the instant has passed and the new connection event
parameters have been applied, or an LL_UNKNOWN_RSP PDU has been sent or
received.
Note: Depending on the connection parameters in effect after this procedure completes,
there can be LL Control PDUs that are longer than can fit in a single connection event
together with an empty PDU sent in the other direction. If so, then the Link Layer cannot
use a procedure that includes such an LL Control PDU without first increasing the
connection interval.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 3249 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 6, Part B Page 3250
Link Layer Specification
5.1.33 Connection Rate Request procedure
The Peripheral may initiate a Connection Rate Request procedure to request
the Central to update the connInterval, connSubrateBaseEvent, connSubrateFactor,
connPeripheralLatency, connContinuationNumber, and connSupervisionTimeout any
valid time after entering the Connection state.
The Connection Rate Request procedure is initiated by issuing an
LL_CONNECTION_RATE_REQ PDU. The Link Layer shall only initiate this procedure
when requested by the Host. The Link Layer shall not initiate this procedure if the
Connection Rate (Host Support) feature bit is not set in both the local and the remote
Controller.
A Peripheral shall not initiate the Connection Rate Request procedure while
a Connection Parameters Request procedure or a Connection Subrate Request
procedure is in progress. The Peripheral shall not initiate this procedure while any CS
procedures are in progress (see Section 4.5.18.1).
The Peripheral’s Link Layer shall select the values of the
LL_CONNECTION_RATE_REQ PDU for Interval_Min, Interval_Max, Timeout,
PreferredPeriodicity, ReferenceConnEventCount, Offset0, Offset1, Offset2, and Offset3
according to the rules specified in the Connection Parameters Request procedure (see
Section 5.1.7).
The Peripheral’s Link Layer shall select the values of the
LL_CONNECTION_RATE_REQ PDU for SubrateFactorMin, SubrateFactorMax,
Max_Latency, and Continuation_Number according to the rules specified in the
Connection Subrate Request procedure (see Section 5.1.20).
Upon receiving an LL_CONNECTION_RATE_REQ PDU, the Central shall respond
either by initiating the Connection Rate Update procedure (see Section 5.1.32)
or by sending an LL_REJECT_EXT_IND PDU. The Central shall follow the rules
specified in Section 5.1.7 when accepting the Interval_Min, Interval_Max, Timeout,
PreferredPeriodicity, ReferenceConnEventCount, Offset0, Offset1, Offset2, and Offset3
values. The Central shall follow the rules specified in Section 5.1.20 when accepting the
SubrateFactorMin, SubrateFactorMax, Max_Latency, and Continuation_Number values.
If an LL_CONNECTION_RATE_REQ PDU is received while a CS procedure or CS
procedure instance repeats, as described in Section 4.5.18.1, are in progress, then the
receiving Link Layer shall respond with an LL_REJECT_EXT_IND PDU with the error
code Controller Busy (0x3A).
If the received LL_CONNECTION_RATE_REQ PDU contains parameters that are not
acceptable to the Link Layer, then the Link Layer of the device shall respond to the
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 3250 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 6, Part B Page 3251
Link Layer Specification
LL_CONNECTION_RATE_REQ PDU with an LL_REJECT_EXT_IND PDU with the
error code Unsupported LL Parameter Value (0x20).
If the received LL_CONNECTION_RATE_REQ PDU contains any fields that are out of
valid range, then the Link Layer shall reject the LL_CONNECTION_RATE_REQ PDU
by issuing an LL_REJECT_EXT_IND PDU with the error code Invalid LL Parameters
(0x1E).
If the received LL_CONNECTION_RATE_REQ PDU has Interval_Max set to a value
lower than connIntervalRequired (see Section 4.5.10), then the Link Layer shall reject
the LL_CONNECTION_RATE_REQ PDU by issuing an LL_REJECT_EXT_IND PDU
with the error code Unsupported Feature or Parameter Value (0x11).
Note: The Central’s reason for any rejection could have been temporary (e.g., due to
other activities) and, therefore, the initiating device can retry.
The procedure has completed when the resulting Connection Rate Update procedure
has completed or an LL_REJECT_EXT_IND PDU has been sent or received.
5.2 Procedure response timeout
This section specifies procedure timeout rules that shall be applied to all the Link Layer
control procedures specified in Section 5.1, except for the Connection Update and
Channel Map Update procedures for which there are no timeout rules.
To be able to detect a non-responsive Link Layer Control procedure, both the Central
and the Peripheral shall use a procedure response timeout timer, T . Upon the
PRT
initiation of a procedure, the procedure response timeout timer shall be reset and
started.
Each LL Control PDU that is queued for transmission resets the procedure response
timeout timer.
When the procedure has completed, the procedure response timeout timer shall be
stopped.
If the procedure response timeout timer reaches 40 seconds, the ACL connection is
considered lost (see Section 4.5.12). The Link Layer exits the Connection state and
shall transition to the Standby state. The Host shall be notified of the loss of connection.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 3251 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 6, Part B Page 3252
Link Layer Specification
5.3 Procedure collisions
Since LL Control PDUs are not interpreted in real time, collisions can occur where
the Link Layer of the Central and the Link Layer of the Peripheral initiate incompatible
procedures. Two procedures are incompatible in the following cases:
• The two procedures both involve an instant.
• The two procedures are both the Channel Sounding Configuration procedure (see
Section 5.1.25).
• The two procedures are both the Channel Sounding Procedure Repeat Termination
procedure (see Section 5.1.27).
• One procedure is the Connection Subrate Request procedure (see Section 5.1.20)
and the other is the Channel Sounding Start procedure (see Section 5.1.26).
• One procedure is the Frame Space Update procedure (see Section 5.1.30); the other
is either the Frame Space Update procedure or the Connected Isochronous Stream
Creation procedure (see Section 5.1.15).
• One procedure is either the Connection Subrate Update procedure (see
Section 5.1.19) or the Connection Subrate Request procedure (see Section 5.1.20)
and the other is either the Connection Rate Update procedure (see Section 5.1.32) or
the Connection Rate Request procedure (see Section 5.1.33).
In these cases, the rules in this section shall be followed:
A device shall not initiate a procedure after responding to a PDU that had initiated an
incompatible procedure until that procedure has completed.
If device initiates a procedure A and, while that procedure has not completed, receives
a PDU from its peer that initiates an incompatible procedure B, then:
• If the peer has already sent at least one PDU as part of procedure A, the device
should immediately exit the Connection State and transition to the Standby State.
• Otherwise, if the device is the Central, it shall reject the PDU received from the
Peripheral by issuing an LL_REJECT_EXT_IND (if supported by both devices) or
LL_REJECT_IND (otherwise) PDU. It shall then proceed with procedure A.
• Otherwise (the device is the Peripheral) it shall proceed to handle the Central-initiated
procedure B and take no further action in the Peripheral-initiated procedure A except
processing the rejection from the Central.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 3252 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 6, Part B Page 3253
Link Layer Specification
The Host shall be notified that the link has been disconnected with, or the rejection PDU
shall use (as appropriate):
• the error code LMP Error Transaction Collision / LL Procedure Collision (0x23) if
procedures A and B are the same procedure;
• the error code LMP Error Transaction Collision / LL Procedure Collision (0x23) if
procedure A is the Connection Update procedure and procedure B is the Connection
Parameters Request procedure;
• the error code Different Transaction Collision (0x2A) otherwise.
5.4 LE Authenticated Payload Timeout
LE Authenticated Payload Timeout (authenticatedPayloadTO) is a parameter
that defines the maximum amount of time, in milliseconds, allowed between
receiving ACL packets containing a valid MIC. The Host can change the value
of authenticatedPayloadTO using the HCI_Write_Authenticated_Payload_Timeout
command ([Vol 4] Part E, Section 7.3.94). The default value for
authenticatedPayloadTO is 30 seconds.
When the connection is encrypted, a device supporting LE Ping feature shall start the
LE Authenticated Payload timer T to monitor the time since the last
LE_Authenticated_Payload
reception of a packet containing a valid MIC from the remote device. Each device shall
reset the timer T upon reception of a packet with a valid MIC. The
LE_Authenticated_Payload
timer shall not be reset upon the reception of a resent packet.
If at any time in the CONNECTION state the timer T
LE_Authenticated_Payload
reaches the authenticatedPayloadTO value, the Host shall be notified (using the
HCI_Authenticated_Payload_Timeout_Expired event if the Controller supports HCI; see
[Vol 4] Part E, Section 7.7.75). The T Timer restarts after it is
LE_Authenticated_Payload
expired.
The timer T shall continue to run during encryption pause
LE_Authenticated_Payload
procedure.
Whenever the Host sets the authenticatedPayloadTO while the timer
T is running, the timer shall be reset.
LE_Authenticated_Payload
5.5 Procedures with Instants
Where a procedure involves a PDU with an Instant field, then the following rules shall
apply.
The Instant field shall be used to indicate the connEventCount or bigEventCounter
when the relevant change shall be applied; this is known as the instant for the
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 3253 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 6, Part B Page 3254
Link Layer Specification
procedure. In the case of the LL_CS_CHANNEL_MAP_IND PDU, either Link Layer may
select the instant value. In all other cases, only the Link Layer of the Central shall select
the instant value.
If the Link Layer of the Central is selecting the instant value, then the Central should
allow a minimum of 6 connection events when it intends to transmit and that the
Peripheral will be listening for before the instant occurs, considering that the Peripheral
may only be listening once every connSubrateFactor × (connPeripheralLatency + 1)
events. If the Link Layer of the Peripheral is selecting the instant value, then the
Peripheral should allow a minimum of 6 connection events that it intends to schedule
before the instant occurs, considering that the Central may only transmit once every
connSubrateFactor events. The event shall be the next one with the specified value of
connEventCount or of bigEventCounter .
15-0
Note: Comparisons of the connEventCount or bigEventCounter and the Instant field are
performed using mod 65536 math (only values from 0 to 65535 are allowed).
When performing a Link Layer procedure that has an instant that is selected by the
Central's Link Layer, it may (particularly for large values of the subrate factor) use the
Connection Subrate Update procedure to set the subrate factor to 1 and the Peripheral
latency to 0 before performing the procedure and then use it again to restore the
previous values afterwards. If the Link Layer does so, it should not notify the Host of
these changes. However, the Link Layer shall not restore the settings autonomously
after a Connection Update procedure that changed the connection interval and shall not
restore connPeripheralLatency or connSupervisionTimeout after a Connection Update
procedure that did not change the connection interval.
5.5.1 ACL control procedures
When a Peripheral receives such a PDU where (Instant – connEventCount) mod 65536
is less than 32767 and Instant is not equal to connEventCount, the Peripheral shall
listen to all the connection events until it has confirmation that the Central has received
its acknowledgment of the PDU or connEventCount equals Instant.
When a Peripheral receives such a PDU where (Instant – connEventCount) mod 65536
is greater than or equal to 32767 (because the instant is in the past), it shall take the
following actions:
• If the PDU is an LL_CONNECTION_UPDATE_IND, the Link Layer of the Peripheral
shall consider the connection to be lost.
• Otherwise, the Link Layer of the Peripheral may consider the connection to be lost.
If the connection is considered to be lost, the Link Layer of the Peripheral shall exit the
Connection state and transition to the Standby state, and shall notify the Host using the
error code Instant Passed (0x28).
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 3254 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 6, Part B Page 3255
Link Layer Specification
5.5.2 BIG control procedures
The Isochronous Broadcaster shall set the instant at least 6 BIG events after the first
BIG event where the BIG Control PDU is transmitted.
When a Synchronized Receiver receives such a PDU where (Instant –
bigEventCounter) mod 65536 is greater than or equal to 32767 (because the instant
is in the past), the Link Layer may stop synchronization with the BIG.
5.6 BIG control procedures
BIG control procedures are used to send control information concerning a BIG from the
Isochronous Broadcaster to the Synchronized Receivers.
Each BIG Control procedure involves transmitting a single BIG Control PDU during the
control subevent of BIG events. Each such PDU shall be transmitted in six consecutive
BIG events and may be transmitted in other BIG events (not necessarily consecutive)
after these six; the procedure ends when the BIG Control PDU has been retransmitted
for the last time. Only one BIG control procedure shall be in progress at a time for a
given BIG.
5.6.1 BIG Channel Map Update procedure
The BIG Channel Map Update procedure is used to send a new channel map for all
BISes in a BIG.
When instructed by the Host or autonomously, the Link Layer of an Isochronous
Broadcaster shall initiate this procedure by transmitting a BIG_CHANNEL_MAP_IND
PDU.
The Link Layer of the Isochronous Broadcaster shall not initiate a subsequent instance
of this procedure until the instant has passed.
The Link Layer of both Isochronous Broadcaster and Synchronized Receiver shall
use the new channel map starting with the BIG event identified by the instant. The
Link Layer shall update the ChM field in the BIGInfo and send the updated BIGInfo
in the associated periodic advertising train (if enabled) at the nearest future periodic
advertising event to the instant.
5.6.2 BIG Termination procedure
The BIG Termination procedure is used to notify all Synchronized Receivers of a BIG
that the transmission of that BIG is about to be terminated.
When instructed by the Host, the Link Layer shall initiate this procedure by transmitting
a BIG_TERMINATE_IND PDU. The Link Layer shall stop transmitting BIG events at the
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 3255 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 6, Part B Page 3256
Link Layer Specification
instant and shall return to the Standby state. If the Link Layer is still transmitting the
associated BIGInfo, it shall stop doing so no later than the instant.
The Link Layer shall terminate the BIG no later than when the bisPayloadCounter
equals 239 – 1.
When the Link Layer receives a BIG_TERMINATE_IND PDU, it shall stop
synchronization with the BIG and, unless it is still synchronized to the periodic
advertising train, shall return to the Standby state.
Bluetooth SIG Proprietary Version Date: 2025-11-03
