# L2CAP MTU Specification

### Page 1147 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part A Page 1148
Logical Link Control and Adaptation Protocol Specification
5 CONFIGURATION PARAMETER OPTIONS
Options are a mechanism to extend the configuration parameters. Options shall be
transmitted as information elements containing an option type, an option length, and
one or more option data fields. Figure 5.1 illustrates the format of an option.
LSB MSB
octet 0 octet 1 octet 2 octet 3
Option Option
Option data
Type Length
Figure 5.1: Configuration option format
The configuration option fields are:
• Option Type (1 octet)
The Option Type field defines the parameters being configured. If the option is not
recognized (e.g. because the option is defined in a higher version of the specification
than the version the implementation conforms to) then:
– If the most significant bit of the type is 0 (i.e. types 0x00 to 0x7F), the recipient shall
refuse the entire configuration request.
– If the most significant bit of the type is 1 (i.e. types 0x80 to 0xFF), the recipient shall
ignore the option and continue processing with the next option (if any).
• Option Length (1 octet)
The Option Length field defines the number of octets in the option data. Thus an
option type without option data has a length of 0.
• Option data
The contents of this field are dependent on the option type.
5.1 Maximum Transmission Unit (MTU)
This option specifies the maximum SDU size the sender of this option is capable of
accepting for a channel. The Option Type is 0x01, and the Option Length is 2 octets,
carrying the two-octet MTU size value as the only information element (see Figure 5.2).
MTU is not a negotiated value, it is an informational parameter that each device can
specify independently. It indicates to the remote device that the local device can receive,
in this channel, an MTU larger than the minimum required. All L2CAP implementations
shall support a minimum MTU of 48 octets over the ACL-U logical link and 23 octets
over the LE-U logical link; however, some protocols and profiles explicitly require
support for a larger MTU. The minimum MTU for a channel is the larger of the L2CAP
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1148 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part A Page 1149
Logical Link Control and Adaptation Protocol Specification
minimum 48 octet MTU and any MTU explicitly required by the protocols and profiles
using that channel.
Note: The MTU is only affected by the profile directly using the channel. For example, if
a service discovery transaction is initiated by a non service discovery profile, that profile
does not affect the MTU of the L2CAP channel used for service discovery.
The following rules shall be used when responding to an
L2CAP_CONFIGURATION_REQ packet specifying the MTU for a channel:
• A request specifying any MTU greater than or equal to the minimum MTU for the
channel shall be accepted.
• A request specifying an MTU smaller than the minimum MTU for the channel may be
rejected.
The signaling described in Section 4.5 may be used to reject an MTU smaller than
the minimum MTU for a channel. The "failure-unacceptable parameters" result sent
to reject the MTU shall include the proposed value of MTU that the remote device
intends to transmit. It is implementation specific whether the local device continues the
configuration process or disconnects the channel.
If the remote device sends a positive L2CAP_CONFIGURATION_RSP packet it should
include the actual MTU to be used on this channel for traffic flowing into the local
device. Following the above rules, the actual MTU cannot be less than 48 bytes.This
is the minimum of the MTU in the L2CAP_CONFIGURATION_REQ packet and the
outgoing MTU capability of the device sending the L2CAP_CONFIGURATION_RSP
packet. The new agreed value (the default value in a future re-configuration) is the value
specified in the response.
Note: For backwards compatibility reception of the MTU option in a negative
L2CAP_CONFIGURATION_RSP packet where the MTU option is not in error should
be interpreted in the same way as it is in a positive L2CAP_CONFIGURATION_RSP
packet (e.g. the case where another configuration option value is unacceptable but the
negative L2CAP_CONFIGURATION_RSP packet contains the MTU option in addition to
the unacceptable option).
The MTU to be used on this channel for the traffic flowing in the opposite direction will
be established when the remote device sends its own L2CAP_CONFIGURATION_REQ
packet as explained in Section 4.4.
If the configured mode is Enhanced Retransmission mode or Streaming mode then
MTU shall not be reconfigured to a smaller size.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1149 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part A Page 1150
Logical Link Control and Adaptation Protocol Specification
LSB MSB
octet 0 octet 1 octet 2 octet 3
Option Option
MTU
Type=0x01 Length=2
Figure 5.2: MTU option format
The option data field is:
• Maximum Transmission Unit - MTU (2 octets)
The MTU field is the maximum SDU size, in octets, that the originator of the request
can accept for this channel. The MTU is asymmetric and the sender of the request
shall specify the MTU it can receive on this channel if it differs from the default value.
L2CAP implementations shall support a minimum MTU size of 48 octets. The default
value is 672 octets.
5.2 Flush Timeout option
This option is used to inform the recipient of the Flush Timeout the sender is going to
use. This option shall not be used if the Extended Flow Specification is used. The Flush
Timeout is defined in the BR/EDR Baseband specification [Vol 2] Part B, Section 3.3.
The Option Type is 0x02 and the Option Length is 2 octets (see Figure 5.3). The Flush
Timeout option is negotiable.
If the remote device returns a negative response to this option and the local device
cannot honor the proposed value, then it shall either continue the configuration process
by sending a new request with the original value, or disconnect the channel. The flush
timeout applies to all channels on the same ACL logical transport but may be overridden
on a packet by packet basis by marking individual L2CAP packets as non-automatically-
flushable via the Packet_Boundary_Flag in the HCI ACL Data packet (see Section 1.1).
LSB MSB
octet 0 octet 1 octet 2 octet 3
Option Option
Flush Timeout
Type=0x02 Length=2
Figure 5.3: Flush Timeout option format
The option data field is:
• Flush Timeout
This value is the Flush Timeout in milliseconds. This is an asymmetric value and the
sender of the request shall specify its flush timeout value if it differs from the default
value of 0xFFFF.
Bluetooth SIG Proprietary Version Date: 2025-11-03
