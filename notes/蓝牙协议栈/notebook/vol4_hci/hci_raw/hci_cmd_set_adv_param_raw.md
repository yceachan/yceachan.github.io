# HCI Command: LE Set Adv Params

> 本文档提取自 Vol 4, Part E HCI Functional Specification。

### Page 2510 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 4, Part E Page 2511
Host Controller Interface Functional Specification
7.8.5 LE Set Advertising Parameters command
Command OCF Command Parameters Return Parameters
HCI_LE_Set_Advertising_Parameters 0x0006 Advertising_Interval_Min, Status
Advertising_Interval_Max,
Advertising_Type,
Own_Address_Type,
Peer_Address_Type,
Peer_Address,
Advertising_Channel_Map,
Advertising_Filter_Policy
Description:
This command is used by the Host to set the advertising parameters.
The Advertising_Interval_Min shall be less than or equal to the
Advertising_Interval_Max. The Advertising_Interval_Min and Advertising_Interval_Max
should not be the same value to enable the Controller to determine the best advertising
interval given other activities.
For high duty cycle directed advertising, i.e. when Advertising_Type is
0x01 (ADV_DIRECT_IND, high duty cycle), the Advertising_Interval_Min and
Advertising_Interval_Max parameters are not used and shall be ignored.
The Advertising_Type is used to determine the packet type that is used for advertising
when advertising is enabled.
Own_Address_Type parameter indicates the type of address being used in the
advertising packets.
If Own_Address_Type equals 0x02 or 0x03, the Peer_Address parameter contains
the peer’s Identity Address and the Peer_Address_Type parameter contains the
Peer’s Identity Type (i.e. 0x00 or 0x01). These parameters are used to locate the
corresponding local IRK in the resolving list; this IRK is used to generate the own
address used in the advertisement.
If directed advertising is performed, i.e. when Advertising_Type is set to 0x01
(ADV_DIRECT_IND, high duty cycle) or 0x04 (ADV_DIRECT_IND, low duty cycle
mode), then the Peer_Address_Type and Peer_Address shall be valid.
If Own_Address_Type equals 0x02 or 0x03, the Controller generates the peer’s
Resolvable Private Address using the peer’s IRK corresponding to the peer’s Identity
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 2511 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 4, Part E Page 2512
Host Controller Interface Functional Specification
Address contained in the Peer_Address parameter and peer’s Identity Address Type
(i.e. 0x00 or 0x01) contained in the Peer_Address_Type parameter.
The Advertising_Channel_Map is a bit field that indicates the advertising channel
indices that shall be used when transmitting advertising packets. At least one channel
bit shall be set in the Advertising_Channel_Map parameter.
The Advertising_Filter_Policy parameter shall be ignored when directed advertising is
enabled.
Errors:
See Section 4.5.2 for a list of error types and descriptions.
Type Condition Error code
MC Advertising is enabled in the Controller. Command Disallowed
(0x0C)
MC The advertising interval range (Advertising_Interval_Min, Adver- Unsupported Feature or
tising_Interval_Max) does not overlap with the advertising inter- Parameter Value (0x11)
val range supported by the Controller.
Command parameters:
Advertising_Interval_Min: Size: 2 octets
Value Parameter Description
N = 0xXXXX Minimum advertising interval for undirected and low duty cycle directed ad-
vertising.
Range: 0x0020 to 0x4000
Default: 0x0800 (1.28 s)
Time = N × 0.625 ms
Time Range: 20 ms to 10.24 s
Advertising_Interval_Max: Size: 2 octets
Value Parameter Description
N = 0xXXXX Maximum advertising interval for undirected and low duty cycle directed
advertising.
Range: 0x0020 to 0x4000
Default: 0x0800 (1.28 s)
Time = N × 0.625 ms
Time Range: 20 ms to 10.24 s
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 2512 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 4, Part E Page 2513
Host Controller Interface Functional Specification
Advertising_Type: Size: 1 octet
Value Parameter Description
0x00 Connectable and scannable undirected advertising (ADV_IND) (default)
0x01 Connectable high duty cycle directed advertising
(ADV_DIRECT_IND, high duty cycle)
0x02 Scannable undirected advertising (ADV_SCAN_IND)
0x03 Non connectable undirected advertising (ADV_NONCONN_IND)
0x04 Connectable low duty cycle directed advertising
(ADV_DIRECT_IND, low duty cycle)
All other values Reserved for future use
Own_Address_Type: Size: 1 octet
Value Parameter Description
0x00 Public Device Address (default)
0x01 Random Device Address
0x02 Controller generates Resolvable Private Address based on the local IRK
from the resolving list. If the resolving list contains no matching entry, use
the public address.
0x03 Controller generates Resolvable Private Address based on the local IRK
from the resolving list. If the resolving list contains no matching entry, use
the random address from LE_Set_Random_Address.
All other values Reserved for future use
Peer_Address_Type: Size: 1 octet
Value Parameter Description
0x00 Public Device Address (default) or Public Identity Address
0x01 Random Device Address or Random (static) Identity Address
All other values Reserved for future use
Peer_Address: Size: 6 octets
Value Parameter Description
0xXXXXXXXXXXXX Public Device Address, Random Device Address, Public Identity Address, or
Random (static) Identity Address of the device to be connected.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 2513 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 4, Part E Page 2514
Host Controller Interface Functional Specification
Advertising_Channel_Map: Size: 1 octet
Bit Number Parameter Description
0 Channel 37 shall be used
1 Channel 38 shall be used
2 Channel 39 shall be used
All other bits Reserved for future use
The default is 0x07 (all three channels enabled).
Advertising_Filter_Policy: Size: 1 octet
Value Parameter Description
0x00 Process scan and connection requests from all devices (i.e., the Filter Ac-
cept List is not in use) (default).
0x01 Process connection requests from all devices and scan requests only from
devices that are in the Filter Accept List.
0x02 Process scan requests from all devices and connection requests only from
devices that are in the Filter Accept List.
0x03 Process scan and connection requests only from devices in the Filter Accept
List.
All other values Reserved for future use.
Return parameters:
Status: Size: 1 octet
Value Parameter Description
0x00 HCI_LE_Set_Advertising_Parameters command succeeded.
0x01 to 0xFF HCI_LE_Set_Advertising_Parameters command failed. See [Vol 1] Part F,
Controller Error Codes for a list of error codes and descriptions.
Event(s) generated (unless masked away):
When the HCI_LE_Set_Advertising_Parameters command has completed, an
HCI_Command_Complete event shall be generated.
Bluetooth SIG Proprietary Version Date: 2025-11-03
