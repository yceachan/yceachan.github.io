# GAP Modes & Procedures (LE 发现与连接模式)

> 本文档提取自 Vol 3, Part C Generic Access Profile (GAP)。

### Page 1389 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part C Page 1390
Generic Access Profile
9 OPERATIONAL MODES AND PROCEDURES – LE
PHYSICAL TRANSPORT
Several different modes and procedures may be performed simultaneously over an LE
physical transport. The following modes and procedures are defined for use over an LE
physical transport:
• Broadcast mode and Observation procedure
• Discovery modes and procedures
• Connection modes and procedures
• Bonding modes and procedures
• Periodic advertising modes and procedure
• Isochronous broadcast modes and procedures
• Channel Sounding procedures
Each of the above modes and procedures are independent from each other but are
closely related since a combination of the modes and procedures are necessary for
most devices to communicate with each other. Both the modes and procedures may be
entered or executed respectively as a result of direct user action or autonomously by a
device.
The Host shall configure the Controller with its local Link Layer feature information as
defined in [Vol 6] Part B, Section 4.6 before performing any of the above modes and
procedures.
The types of advertising used in these modes and procedures for each of the
associated GAP roles are defined in Section 2.2.2 Table 2.1.
9.1 Broadcast mode and Observation procedure
The Broadcast mode and Observation procedure allow two devices to communicate in
a unidirectional connectionless manner using the advertising events. The requirements
for a device operating in a specific GAP role to support the Broadcast mode and
Observation procedure are defined in Table 9.1.
Broadcast Mode and Observation Ref. Peripheral Central Broadcaster Observer
procedure
Broadcast mode 9.1.1 E E M E
Observation procedure 9.1.2 E E E M
Table 9.1: Broadcast mode and observation procedure requirements
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1390 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part C Page 1391
Generic Access Profile
9.1.1 Broadcast mode
9.1.1.1 Definition
The Broadcast mode provides a method for a device to send connectionless data in
advertising events.
9.1.1.2 Conditions
A device in the Broadcast mode shall send data using non-connectable advertising
events.
A device in the Broadcast mode may send non-connectable and non-scannable
undirected or non-connectable and non-scannable directed advertising events
anonymously by omitting the Broadcaster's address.
The advertising data shall be formatted using the Advertising Data (AD) type format
as defined in Section 1.3 of [4]. A device in the Broadcast mode shall not set the ‘LE
General Discoverable Mode’ flag or the ‘LE Limited Discoverable Mode’ flag in the Flags
AD Type as defined in Section 1.3 of [4].
Note: All data sent by a device in the Broadcast mode is considered unreliable since
there is no acknowledgment from any device that may have received the data.
The device may configure and enable multiple independent advertising sets. Each
advertising set may have an independent advertising filter policy.
9.1.2 Observation procedure
9.1.2.1 Definition
The Observation procedure provides a method for a device to receive connectionless
data from a device that is sending advertising events.
9.1.2.2 Conditions
A device performing the Observation procedure may use passive scanning or active
scanning to receive advertising events.
A device performing the Observation procedure may use active scanning to also receive
scan response data sent by any device in the Broadcast mode that advertises using
scannable advertising events.
When a device performing the Observation procedure receives a resolvable private
address in the advertising event, the device may resolve the private address by using
the resolvable private address resolution procedure as defined in Section 10.8.2.3.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1391 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part C Page 1392
Generic Access Profile
Note: In use cases where a device in the Broadcast mode sends dynamic data, the
receiving device should disable duplicate filtering capability in the Controller so that the
Host receives all advertising packets received by the Controller.
9.2 Discovery modes and procedures
All devices shall be in either non-discoverable mode or one of the discoverable
modes. A device in the discoverable mode shall be in either the general discoverable
mode or the limited discoverable mode. A device in the non-discoverable mode is
not discoverable. Devices operating in either the general discoverable mode or the
limited discoverable mode can be found by the discovering device. A device that is
discovering other devices performs either the limited discovery procedure as defined in
Section 9.2.5 or the general discovery procedure as defined in Section 9.2.6.
Some devices may only scan for advertising events using legacy advertising PDUs.
It is therefore recommended that devices using advertising events with the extended
advertising PDUs also use an advertising set with advertising events that use legacy
advertising PDUs.
If the device is in one of the discoverable modes, and if multiple advertising sets are
used with the same Identity Address or the same IRK, then those advertising sets shall
also share the same advertising filter policy.
9.2.1 Requirements
Discovery modes and procedures Ref. Peripheral Central Broadcaster Observer
Non-Discoverable mode 9.2.2 M E E E
Limited Discoverable mode 9.2.3 O E E E
General Discoverable mode 9.2.4 C.1 E E E
Limited Discovery procedure 9.2.5 E O E E
General Discovery procedure 9.2.6 E M E E
Name Discovery procedure 9.2.7 O O E E
C.1: Optional if limited discoverable mode is supported, otherwise mandatory.
Table 9.2: Device Discovery requirements
9.2.2 Non-discoverable mode
9.2.2.1 Description
A device configured in non-discoverable mode will not be discovered by any device that
is performing either the general discovery procedure or the limited discovery procedure.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1392 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part C Page 1393
Generic Access Profile
9.2.2.2 Conditions
A device in the non-discoverable mode may send advertising events. If the device
sends advertising events, it shall not set the ‘LE General Discoverable Mode’ flag or ‘LE
Limited Discoverable Mode’ flag in the Flags AD type (see Section 1.3 of [4]).
If the device sends advertising events, then it is recommended that the Host configures
the Controller as follows:
• The Host should set the advertising filter policy for all advertising sets to either
‘process scan and connection requests only from devices in the Filter Accept List’ or
‘process scan and connection requests from all devices’.
• The Host should set the advertising intervals as defined in Section 9.3.11.
9.2.3 Limited Discoverable mode
9.2.3.1 Description
Devices configured in the limited discoverable mode are discoverable for a limited
period of time by other devices performing the limited or general device discovery
procedure. Devices typically enter the limited discoverable mode when a user performs
a specific action.
There are two common reasons to use limited discoverable mode:
• Limited discoverable mode can be used to allow remote devices using the general
discovery procedure to prioritize or otherwise identify devices in limited discoverable
mode when presenting discovered devices to the end user because, typically, the
user is interacting with them.
• Limited discoverable mode can also be used to allow remote devices using the limited
discovery procedure to filter out devices using the general discoverable mode.
9.2.3.2 Conditions
A device in the limited discoverable mode shall send advertising event types with the
advertising data including the Flags AD type as defined in Section 1.3 of [4] with all the
following flags set as described:
• The LE Limited Discoverable Mode flag set to one.
• The LE General Discoverable Mode flag set to zero.
• For an LE-only implementation with all the following flags set as described:
a. The ‘BR/EDR Not Supported’ flag to set one.
b. The ‘Simultaneous LE and BR/EDR to Same Device Capable (Controller)’ flag
set to zero.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1393 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part C Page 1394
Generic Access Profile
The advertising data should also include the following AD types to enable a faster
connectivity experience:
• TX Power Level AD type defined in Section 1.5 of [4].
• Local Name AD type defined in Section 1.2 of [4].
• Service or Service Class UUIDs AD type defined in Section 1.1 of [4].
• Peripheral Connection Interval Range AD type as defined in Section 1.9 of [4].
Devices shall remain in the limited discoverable mode no longer than
T (lim_adv_timeout).
GAP
While a device is in limited discoverable mode the Host configures the Controller as
follows:
• The Host shall set the advertising filter policy for all advertising sets that share the
same Identity Address or the same IRK to ‘process scan and connection requests
from all devices’.
• The Host should set the advertising intervals as defined in Section 9.3.11.
The device shall remain in limited discoverable mode until a connection is established
or the Host terminates the mode.
Note: The choice of advertising interval is a trade-off between power consumption and
device discovery time.
The device may configure and enable multiple independent advertising sets.
9.2.4 General Discoverable mode
9.2.4.1 Description
Devices configured in the general discoverable mode are discoverable for an indefinite
period of time by devices performing the general discovery procedure. Devices typically
enter general discoverable mode autonomously.
Devices in the general discoverable mode will not be discovered by devices performing
the limited discovery procedure. General discoverable mode should not be used if
it is known that the device performing discovery will be using the limited discovery
procedure (see Section 9.2.5).
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1394 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part C Page 1395
Generic Access Profile
9.2.4.2 Conditions
A device in general discoverable mode shall send advertising events with the
advertising data including the Flags AD data type as defined in Section 1.3 of [4] with all
the following flags set as described:
• The LE Limited Discoverable Mode flag set to zero.
• The LE General Discoverable Mode flag set to one.
• For an LE-only implementation with all the following flags set as described:
a. The ‘BR/EDR Not Supported’ flag set to one.
b. The ‘Simultaneous LE and BR/EDR to Same Device Capable (Controller)’ flag
set to zero.
The advertising data should also include the following AD types to enable a faster
connectivity experience:
• TX Power Level AD type as defined in Section 1.5 of [4].
• Local Name AD type as defined in Section 1.2 of [4].
• Service or Service Class UUIDs AD type as defined in Section 1.1 of [4].
• Peripheral Connection Interval Range AD type as defined in Section 1.9 of [4].
While a device is in general discoverable mode the Host configures the Controller as
follows:
• The Host shall set the advertising filter policy for all advertising sets that share the
same Identity Address or the same IRK to ‘process scan and connection requests
from all devices’.
• The Host should set the advertising intervals as defined in Section 9.3.11.
The device shall remain in general discoverable mode until a connection is established
or the Host terminates the mode.
Note: Host data used in legacy advertising events that change frequently should be
placed in the advertising data and static data should be placed in the scan response
data.
Note: The choice of advertising interval is a trade-off between power consumption and
device discovery time.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1395 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part C Page 1396
Generic Access Profile
9.2.5 Limited Discovery procedure
9.2.5.1 Description
A device performing the limited discovery procedure receives the device address,
advertising data and scan response data from devices in the limited discoverable mode
only.
The limited discovery procedure should only be used when it is known that the devices
to be discovered are using limited discoverable mode. The general discovery procedure
(see Section 9.2.6) should be used for general purpose discovery when it is desired to
discover all devices regardless of whether they are using limited discoverable mode or
general discoverable mode.
Central Peripheral Peripheral
makegeneral
discoverable
startscanning
makelimiteddiscoverable
advertisingevent(‘limited’)
advertisingevent(‘general’)
stopscanning
listoflimited
discoverable
mode
devicesonly
Figure 9.1: A Central performing limited discovery procedure discovering Peripherals in the limited
discoverable mode
9.2.5.2 Conditions
It is recommended that the device scan on all the PHYs it supports.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1396 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part C Page 1397
Generic Access Profile
When a Host performs the limited discovery procedure, the Host configures the
Controller as follows:
1. The Host shall set the scanning filter policy to an unfiltered scanning policy (see
[Vol 6] Part B, Section 4.3.3).
2. The Host should set the scan interval and scan window as defined in
Section 9.3.11.
3. The Host should configure the Controller to use active scanning.
The Host shall begin scanning for advertising packets and should continue for
a minimum of T (lim_disc_scan_min) when scanning on the LE 1M PHY and
GAP
T (lim_disc_scan_min_coded) when scanning on the LE Coded PHY, unless the Host
GAP
ends the limited discovery procedure.
The Host shall check for the Flags AD type in the advertising data. If the Flags AD
type is present and the LE Limited Discoverable Flag is set to one then the Host shall
consider the device as a discovered device, otherwise the advertising data shall be
ignored. The Flag AD type is defined in Section 1.3 of [4]. The advertising data of the
discovered device may contain data with other AD types, e.g. Service or Service Class
UUIDs AD type, TX Power Level AD type, Local Name AD type, Peripheral Connection
Interval Range AD type. The Host may use the data in performing any of the connection
establishment procedures.
The Host shall ignore the 'Simultaneous LE and BR/EDR to Same Device Capable
(Controller)' bit in the Flags AD type.
9.2.6 General Discovery procedure
9.2.6.1 Description
A device performing the general discovery procedure receives the device address,
advertising data and scan response data from devices in the limited discoverable mode
or the general discoverable mode.
The general discovery procedure should be used for general purpose discovery, i.e. to
discover all discoverable devices regardless of whether they are in general discoverable
mode or limited discoverable mode. A device which discovers devices using the general
discovery procedure and presents them to users in some fashion should distinguish
devices in the limited discoverable mode from those in the general discoverable mode,
e.g., by sorting them to the top of a list of discovered devices or highlighting them in
some way.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1397 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part C Page 1398
Generic Access Profile
Note: The rationale for distinguishing the devices in limited discoverable mode to the
end user is that devices typically enter limited discoverable mode only after explicit
action by the end user, indicating that the user’s immediate goal is to discover and
interact with that specific device.
Central Peripheral Peripheral
makegeneral
discoverable
startscanning
makelimiteddiscoverable
advertisingevent(‘limited’)
advertisingevent(‘general’)
stopscanning
listofall
limitedand
general
discoverable
mode
devices
Figure 9.2: A Central performing General Discovery procedure discovering Peripherals in the Limited
Discoverable mode and General Discoverable mode
9.2.6.2 Conditions
It is recommended that the device scan on all the PHYs it supports.
When a Host performs the general discovery procedure, the Host configures the
Controller as follows:
1. The Host shall set the scanning filter policy to an unfiltered scanning policy (see
[Vol 6] Part B, Section 4.3.3).
2. The Host should set the scan interval and scan window as defined in
Section 9.3.11.
3. The Host should configure the Controller to use active scanning.
The Host shall begin scanning for advertising packets and should continue for
a minimum of T (gen_disc_scan_min) when scanning on the LE 1M PHY and
GAP
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1398 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part C Page 1399
Generic Access Profile
T (gen_disc_scan_min_coded) when scanning on the LE Coded PHY. The procedure
GAP
may be terminated early by the Host.
The Host shall check for the Flags AD type in the advertising data. If the Flags AD
type (see Section 1.3 of [4]) is present and either the LE General Discoverable Mode
flag is set to one or the LE Limited Discoverable Mode flag is set to one then the Host
shall consider the device as a discovered device, otherwise the advertising data shall
be ignored. The advertising data of the discovered device may contain data with other
AD types, e.g., Service or Service Class UUIDs AD type, TX Power Level AD type,
Local Name AD type, Peripheral Connection Interval Range AD type. The Host may use
the data in performing any of the connection establishment procedures as defined in
Section 9.3.
The Host shall ignore the 'Simultaneous LE and BR/EDR to Same Device Capable
(Controller)' bit in the Flags AD type.
9.2.7 Name Discovery procedure
9.2.7.1 Description
The name discovery procedure is used to obtain the Bluetooth Device Name of a
remote connectable device.
9.2.7.2 Conditions
If the complete device name is not acquired while performing either the limited
discovery procedure or the general discovery procedure, then the name discovery
procedure may be performed.
The name discovery procedure shall be performed as follows:
1. The Host shall establish a connection using one of the connection establishment
procedures as defined in Section 9.3.
2. The Host shall read the device name characteristic using the GATT procedure
Read Using Characteristic UUID [Vol 3] Part G, Section 4.8.2
3. The connection may be terminated after the GATT procedure has completed.
9.3 Connection modes and procedures
The connection modes and procedures allow a device to establish a connection to
another device.
When devices are connected, the parameters of the connection can be updated with
the Connection Parameter Update procedure. The connected device may terminate
the connection using the Terminate Connection procedure. The requirements for a
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1399 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part C Page 1400
Generic Access Profile
device to support the connection modes and procedures are defined in Table 9.3. These
requirements refer to the specific role a device is operating in. Devices supporting
multiple roles shall support the specified modes and procedures for a given role while
operating in that role.
9.3.1 Requirements
Connection Modes and Procedures Ref. Peripheral Central Broadcaster Observer
Non-connectable mode 9.3.2 M E M M
Directed connectable mode 9.3.3 O E E E
Undirected connectable mode 9.3.4 M E E E
Auto connection establishment proce- 9.3.5 E O E E
dure
General connection establishment pro- 9.3.6 E O E E
cedure
Selective connection establishment pro- 9.3.7 E O E E
cedure
Direct connection establishment proce- 9.3.8 E M E E
dure
Periodic Advertising Connection proce- 9.3.17 C.3 C.4 E E
dure
Connection parameter update procedure 9.3.9 O M E E
Terminate connection procedure 9.3.10 M M E E
Connected Isochronous Stream Central 9.3.13 E C.1 E E
Establishment procedure
Connected Isochronous Stream Periph- 9.3.14 C.5 E E E
eral Establishment procedure
Connected Isochronous Stream Termi- 9.3.15 C.5 C.1 E E
nate procedure
Connection Subrate procedure 9.3.16 C.2 C.2 E E
C.1: Mandatory if the Connected Isochronous Stream - Central feature is supported, otherwise
excluded.
C.2: Mandatory if the Connection Subrating feature is supported, otherwise excluded.
C.3: Mandatory if the Periodic Advertising with Responses - Scanner feature is supported, other-
wise Excluded
C.4: Mandatory if the Periodic Advertising with Responses - Advertiser feature is supported, other-
wise Excluded
C.5: Mandatory if the Connected Isochronous Stream - Peripheral feature is supported, otherwise
excluded.
Table 9.3: Connection modes and procedures requirements
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1400 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part C Page 1401
Generic Access Profile
9.3.2 Non-connectable mode
9.3.2.1 Description
A device in the non-connectable mode shall not allow a connection to be established.
9.3.2.2 Conditions
A Peripheral in the non-connectable mode may send non-connectable advertising
events. In this case it is recommended that the Host configures the Controller as
follows:
• The Host should set the advertising filter policy to either ‘process scan and
connection requests only from devices in the Filter Accept List’ or ‘process scan and
connection requests from all devices’.
• The Host should set the advertising intervals as defined in Section 9.3.11.
The device may configure and enable multiple independent advertising sets. Each
advertising set may have an independent advertising filter policy.
9.3.3 Directed Connectable mode
9.3.3.1 Description
A device in the directed connectable mode shall accept a connection request from
a known peer device performing the auto connection establishment procedure or the
general connection establishment procedure.
9.3.3.2 Conditions
A Peripheral shall send connectable directed advertising events.
The device may configure and enable multiple independent advertising sets. Each
advertising set may have an independent advertising filter policy.
9.3.4 Undirected Connectable mode
9.3.4.1 Description
A device in the undirected connectable mode shall accept a connection request from
a device performing the auto connection establishment procedure or the general
connection establishment procedure.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1401 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part C Page 1402
Generic Access Profile
9.3.4.2 Conditions
A Peripheral should follow the guidelines defined in Section 9.3.11. A Peripheral shall
send either connectable and scannable undirected advertising events or connectable
undirected advertising events.
The device may configure and enable multiple independent advertising sets. Each
advertising set may have an independent advertising filter policy.
9.3.5 Auto Connection Establishment procedure
9.3.5.1 Description
The auto connection establishment procedure allows the Host to configure the
Controller to autonomously establish a connection with one or more devices in the
directed connectable mode or the undirected connectable mode. This procedure uses
the Filter Accept List in the initiator to store the addresses of the devices that can be
connected to. The Controller autonomously establishes a connection with a device with
the device address that matches the address stored in the Filter Accept List.
9.3.5.2 Conditions
Figure 9.3 shows the flow chart for a device performing the auto connection
establishment procedure.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1402 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part C Page 1403
Generic Access Profile
Auto connection
establishment
procedure
Host writes list of device addresses to
the Controller Filter Accept List
Host sets initiator filter policy to:
‘process connectable advertising packets
from all devices in the Filter Accept List’
Host sets connection, Peripheral
latency and scan parameters
End of procedure
Figure 9.3: Flow chart for a device performing the Auto Connection Establishment procedure
When a Host performs the auto connection establishment procedure, the Host
configures the Controller as follows:
1. The Host shall write the list of device addresses that are to be auto connected to
into the Filter Accept List.
2. The Host shall set the initiator filter policy to ‘process connectable advertising
packets from all devices in the Filter Accept List’.
3. The Host should set the scan interval and scan window as defined in
Section 9.3.11.
4. The Host should set connection parameters as defined in Section 9.3.12.
This procedure is terminated when a connection is established or when the Host
terminates the procedure.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1403 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part C Page 1404
Generic Access Profile
9.3.6 General Connection Establishment procedure
9.3.6.1 Description
The general connection establishment procedure allows the Host to establish a
connection with a set of known peer devices in the directed connectable mode or the
undirected connectable mode.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1404 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part C Page 1405
Generic Access Profile
9.3.6.2 Conditions
Figure 9.4 shows the flow chart for a device performing the general connection
establishment procedure.
General connection
establishment procedure
Host sets scanning filter policy to
an unfiltered scanning policy
Host sets scan parameters and starts
scanning
Host compares received
advertisers address with the list of
target devices
No
Connect to
Peripheral
device?
Yes
Stop scanning
Initiate connection using the
direct connection establishment
procedure
Connection successful
End of procedure
Figure 9.4: Flow chart for a device performing the General Connection Establishment procedure
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1405 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part C Page 1406
Generic Access Profile
When a Host performs the general connection establishment procedure, the Host
configures the Controller as follows:
1. The Host shall set the scanning filter policy to an unfiltered scanning policy (see
[Vol 6] Part B, Section 4.3.3).
2. The Host should set the scan interval as defined in Section 9.3.11.
3. The Host should set the scan window as defined in Section 9.3.11.
4. The Host shall start active scanning or passive scanning.
5. The Host should set connection parameters as defined in Section 9.3.12.
When the Host discovers a device to which the Host may attempt to connect, the
Host shall stop the scanning, and initiate a connection using the direct connection
establishment procedure.
This procedure is terminated when a connection is established or when the Host
terminates the procedure.
9.3.7 Selective Connection Establishment procedure
9.3.7.1 Description
The selective connection establishment procedure allows the Host to establish a
connection, using the Host selected connection configuration parameters, with any
device whose address is stored in the Filter Accept List.
9.3.7.2 Conditions
Figure 9.5 shows the flow chart for a device performing the selective connection
establishment procedure.
When a Host performs the selective connection establishment procedure, the Host
configures the Controller as follows:
1. The Host shall write the list of device addresses that are to be selectively
connected into the Filter Accept List.
2. The Host shall set the scanning filter policy to a filtered scanning policy (see [Vol 6]
Part B, Section 4.3.3).
3. The Host should set the scan interval as defined in Section 9.3.11.
4. The Host should set the scan window as defined in Section 9.3.11.
5. The Host shall start active scanning or passive scanning.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1406 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part C Page 1407
Generic Access Profile
When the Host discovers one of the peer devices it is connecting to, the Host shall stop
scanning, and initiate a connection using the direct connection establishment procedure
with the connection configuration parameters for that peer device.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1407 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part C Page 1408
Generic Access Profile
This procedure is terminated when a connection is established or when the Host
terminates the procedure.
Selective connection
establishment procedure
Host writes list of device addresses to
the Controller Filter Accept List
to selectively connect to
Host sets scanning filter policy
to a filtered scanning policy
Host sets scan parameters
Start scanning
Host compares received
advertiser’s address with the list of
target devices
Connect to
Peripheral
no
device?
yes
Stop scanning
Initiate connection using the direct
connection establishment procedure
with the connection configuration
parameters for the Peripheral
End of procedure
Figure 9.5: Flow chart for a device performing the Selective Connection Establishment procedure
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1408 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part C Page 1409
Generic Access Profile
9.3.8 Direct Connection Establishment procedure
9.3.8.1 Description
The direct connection establishment procedure allows the Host to establish a
connection with the Host selected connection configuration parameters with a single
peer device.
9.3.8.2 Conditions
Figure 9.6 shows the flow chart for a device performing the direct connection
establishment procedure.
Direct connection
establishment procedure
Host sets initiator filter policy to ‘ignore the
Filter Accept List and process connectable
advertising packets from a specific single
device specified by the Host’
Host sets the connection parameters for
the Peripheral
Host Initiates a connection to the
Peripheral
End of procedure
Figure 9.6: Flow chart for a device performing the Direct Connection Establishment procedure
When a Host performs the direct connection establishment procedure, the Host
configures the Controller as follows:
1. The Host shall set the initiator filter policy to ‘ignore the Filter Accept List and
process connectable advertising packets from a specific single device specified by
the Host’.
2. The Host shall set the peer address to the device address of the specific single
device.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1409 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part C Page 1410
Generic Access Profile
3. The Host should set connection parameters as defined in Section 9.3.12.
4. The Host shall initiate a connection.
This procedure is terminated when a connection is established or when the Host
terminates the procedure.
9.3.9 Connection Parameter Update procedure
9.3.9.1 Description
The connection parameter update procedure allows a Peripheral or Central to update
the parameters of an established ACL connection.
9.3.9.2 Conditions
A Central initiating the connection parameter update procedure shall use the Link Layer
Connection Update procedure defined in [Vol 6] Part B, Section 5.1.1 with the required
connection parameters if either the Central or the Peripheral does not support the
Connection Parameters Request Link Layer Control procedure, the Connection Rate
Request Link Layer Control procedure, or the Connection Rate Update Link Layer
Control procedure.
If both the Central and Peripheral support the Connection Parameters Request Link
Layer control procedure, the Connection Rate Request Link Layer Control procedure,
or the Connection Rate Update Link Layer Control procedure, then the Central
or Peripheral initiating the connection parameter update procedure should use the
Connection Parameters Request Link Layer Control procedure defined in [Vol 6] Part
B, Section 5.1.7, the Connection Rate Request Link Layer Control procedure defined
in [Vol 6] Part B, Section 5.1.33, or the Connection Rate Update Link Layer Control
procedure defined in [Vol 6] Part B, Section 5.1.32 with the required connection
parameters.
If either the Central or the Peripheral does not support the Connection
Parameters Request Link Layer Control procedure or the Connection
Rate Request Link Layer Control procedure, then the Peripheral
initiating the connection parameter update procedure shall use the
L2CAP_CONNECTION_PARAMETER_UPDATE_REQ command defined in [Vol
3] Part A, Section 4.20 with the required connection parameters. The
Peripheral shall not send an L2CAP_CONNECTION_PARAMETER_UPDATE_REQ
command within T (conn_param_timeout) of an
GAP
L2CAP_CONNECTION_PARAMETER_UPDATE_RSP being received. When the
Central accepts the Peripheral initiated Connection Parameter Update, the
Central should initiate the Link Layer Connection Update procedure defined in
[Vol 6] Part B, Section 5.1.1 with the required connection parameters within
TGAP(conn_param_timeout).
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1410 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part C Page 1411
Generic Access Profile
If the requested or updated connection parameters are unacceptable to the Central
or Peripheral then it may disconnect the connection with the error code 0x3B
(Unacceptable Connection Parameters). Devices should be tolerant of connection
parameters given to them by the remote device.
9.3.10 Terminate Connection procedure
9.3.10.1 Description
The Terminate Connection procedure allows a Host to terminate the connection with a
peer device.
9.3.10.2 Conditions
The Host should first terminate any associated CIS(es) prior to terminating the ACL.
The Host initiating the terminate connection procedure shall use the Link Layer ACL
Termination procedure defined in [Vol 6] Part B, Section 5.1.6.
9.3.11 Connection Establishment Timing parameters
9.3.11.1 Description
The connection establishment timing parameters are used during initial connection
establishment between a Central and a Peripheral.
A Central should use one of the GAP connection establishment procedures to initiate a
connection to a Peripheral in a connectable mode. The procedures and modes that may
use these timing parameters are defined in Section 9.3.4 to Section 9.3.8.
9.3.11.2 Conditions
A Central starting a user-initiated GAP connection establishment procedure should
use the recommended scan interval T (scan_fast_interval) and scan window
GAP
T (scan_fast_window) for T (scan_fast_period) when scanning on the LE 1M
GAP GAP
PHY and should use scan interval T (scan_fast_interval_coded) and scan window
GAP
T (scan_fast_window_coded) for T (scan_fast_period) when scanning on the LE
GAP GAP
Coded PHY.
A Central that is background scanning (i.e. as part of a GAP connection
establishment procedure that is not user-initiated) should use the recommended
scan interval T (scan_slow_interval1) and scan window T (scan_slow_window1)
GAP GAP
when scanning on the LE 1M PHY and should use scan interval
T (scan_slow_interval1_coded) and scan window T (scan_slow_window1_coded)
GAP GAP
when scanning on the LE Coded PHY. Alternatively the Central may use
T (scan_slow_interval2) and scan window T (scan_slow_window2) when
GAP GAP
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1411 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part C Page 1412
Generic Access Profile
scanning on the LE 1M PHY and should use T (scan_slow_interval2_coded) and
GAP
scan window T (scan_slow_window2_coded) when scanning on the LE Coded PHY.
GAP
A Peripheral entering any of the following GAP Modes should use the
recommended advertising interval T (adv_fast_interval1) for T (adv_fast_period)
GAP GAP
when advertising on the LE 1M PHY and should use T (adv_fast_interval1_coded)
GAP
for T (adv_fast_period) when advertising on the LE Coded PHY:
GAP
• Undirected Connectable Mode
• Limited Discoverable Mode and sending connectable undirected advertising events
• General Discoverable Mode and sending connectable undirected advertising events
• Directed Connectable Mode and sending low duty cycle connectable directed
advertising events
A Peripheral when entering any of the following GAP Modes and sending non-
connectable advertising events should use the recommended advertising interval
T (adv_fast_interval2) for T (adv_fast_period) when advertising on the LE 1M
GAP GAP
PHY and should use T (adv_fast_interval2_coded) for T (adv_fast_period) when
GAP GAP
advertising on the LE Coded PHY:
• Non-Discoverable Mode
• Non-Connectable Mode
• Limited Discoverable Mode
• General Discoverable Mode
A Peripheral that is background advertising in any GAP Mode other than GAP Directed
Connectable Mode with high duty cycle connectable directed advertising events should
use the recommended advertising interval T (adv_slow_interval) when advertising
GAP
on the LE 1M PHY and should use T (adv_slow_interval_coded) when advertising
GAP
on the LE Coded PHY.
Note: When advertising interval values of less than 100 ms are used for non-
connectable or scannable undirected advertising in environments where the advertiser
can interfere with other devices, it is recommended that steps be taken to minimize the
interference. For example, the advertising might be alternately enabled for only a few
seconds and disabled for several minutes.
9.3.12 Connection interval timing parameters
9.3.12.1 Description
The connection interval timing parameters are used within a connection. Initial
connection interval is used to ensure procedures such as bonding, encryption setup and
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1412 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part C Page 1413
Generic Access Profile
service discovery are completed quickly. The connection interval should be changed
to the value in the Peripheral Preferred Connection Parameters characteristic after
initiating procedures are complete.
9.3.12.2 Conditions
The Central should either read the Peripheral Preferred Connection Parameters
characteristic (see Section 12.3) or retrieve the parameters from advertising data (see
Section 12.3).
The connection interval should be set to T (initial_conn_interval) when establishing
GAP
a connection on the LE 1M PHY and to T (initial_conn_interval_coded) when
GAP
establishing a connection on the LE Coded PHY and connPeripheralLatency should be
set to zero. These parameters should be used until the Central has no further pending
actions to perform or until the Peripheral performs a Connection Parameter Update
procedure (see Section 9.3.9).
After the Central has no further pending actions to perform and the Peripheral has not
initiated any other actions within T (conn_pause_central), then the Central should
GAP
invoke the Connection Parameter Update procedure (see Section 9.3.9) and change the
connection interval to that specified in the Peripheral Preferred Connection Parameters
characteristic.
If the Central has not read the Peripheral Preferred Connection Parameters
characteristic, then the Central may choose the connection parameters to be used.
After the Peripheral has no further pending actions to perform and the Central has
not initiated any other actions within T (conn_pause_central), then the Peripheral
GAP
may perform a Connection Parameter Update procedure (see Section 9.3.9). The
Peripheral should not perform a Connection Parameter Update procedure within
T (conn_pause_peripheral) after establishing a connection.
GAP
At any time a key refresh or encryption setup procedure is required and the current
connection interval is greater than T (initial_conn_interval) when connected on the
GAP
LE 1M PHY or LE 2M PHY or greater than T (initial_conn_interval_coded) when
GAP
connected on the LE Coded PHY, the key refresh or encryption setup procedure should
be preceded with a Connection Parameter Update procedure (see Section 9.3.9).
The connection interval should be set to T (initial_conn_interval) when connected
GAP
on the LE 1M PHY or the LE 2M PHY and T (initial_conn_interval_coded) when
GAP
connected on the LE Coded PHY, connSubrateFactor should be set to 1, and
connPeripheralLatency should be set to zero. This fast connection interval should
be maintained until the key refresh or encryption setup procedure is complete. It
should then switch to the value in the Peripheral Preferred Connection Parameters
characteristic.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1413 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part C Page 1414
Generic Access Profile
9.3.13 Connected Isochronous Stream Central Establishment procedure
9.3.13.1 Description
The Connected Isochronous Stream Central Establishment procedure allows the Host
of a Central to establish a CIS with a Peripheral using the Host selected parameters.
9.3.13.2 Conditions
When two devices are connected, a Central may establish one or more CISes with
a Peripheral. A CIS is established by the Central using the Connected Isochronous
Stream Creation procedure (see [Vol 6] Part B, Section 5.1.15). The Central and or
Peripheral may send isochronous data over the established CIS.
9.3.14 Connected Isochronous Stream Peripheral Establishment procedure
9.3.14.1 Description
The Connected Isochronous Stream Peripheral Establishment procedure allows the
Host of the Peripheral to accept or reject the request from a Central to establish a CIS.
9.3.14.2 Conditions
When two devices are connected, the Peripheral may receive a request from the
Central to establish a CIS. Once the request is received, the Host in the Peripheral shall
either accept or reject the request. If it accepts the request, the CIS can be established
using the Connected Isochronous Stream Creation procedure defined in [Vol 6] Part B,
Section 5.1.15.
9.3.15 Connected Isochronous Stream Terminate procedure
9.3.15.1 Description
The Connected Isochronous Stream Terminate procedure allows a Host to terminate
a CIS with a peer device. The CIS shall also be terminated when the ACL between
the Central and Peripheral is terminated, using the Terminate Connection procedure
(Section 9.3.10).
9.3.15.2 Conditions
The Host initiating the Connected Isochronous Stream Terminate procedure shall use
the Connected Isochronous Stream Termination control procedure defined in [Vol 6]
Part B, Section 5.1.16.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1414 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part C Page 1415
Generic Access Profile
9.3.16 Connection Subrate procedure
9.3.16.1 Description
The Connection Subrate procedure allows a Peripheral or Central to modify the
connection subrating and other connection parameters of an established ACL
connection.
9.3.16.2 Conditions
The Central initiating this procedure shall use the Link Layer Connection Subrate
Update procedure defined in [Vol 6] Part B, Section 5.1.19 or the Connection Rate
Update Link Layer Control procedure defined in [Vol 6] Part B, Section 5.1.32, and the
Peripheral initiating this procedure shall use the Connection Subrate Request procedure
defined in [Vol 6] Part B, Section 5.1.20 or the Connection Rate Request Link Layer
Control procedure defined in [Vol 6] Part B, Section 5.1.33.
If the requested subrate connection parameters are unacceptable to the Central then it
may reject them. If the updated subrate connection parameters are unacceptable to the
Peripheral it cannot reject them but may follow up by using the Connection Parameters
Request procedure (see [Vol 6] Part B, Section 5.1.7), the Connection Subrate Request
procedure (see [Vol 6] Part B, Section 5.1.20), or the Connection Rate Request Link
Layer Control procedure (see [Vol 6] Part B, Section 5.1.33) to change them. Devices
should be tolerant of the connection parameters requested by the peer device.
9.3.17 Periodic Advertising Connection procedure
9.3.17.1 Definition
The periodic advertising connection procedure provides a method for a periodic
advertiser to initiate a Link Layer connection with a synchronized device.
9.3.17.2 Conditions
A device performing the periodic advertising connection procedure shall initiate the Link
Layer connection procedure using periodic advertising trains with responses (see [Vol 6]
Part B, Section 4.4.2.12.2).
9.4 Bonding modes and procedures
Bonding allows two connected devices to exchange and store security and identity
information to create a trusted relationship. The security and identity information as
defined in [Vol 3] Part H, Section 2.4.1 is also known as the bonding information. When
the devices store the bonding information, it is known as the phrases ‘devices have
bonded’ or ‘a bond is created’.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1415 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part C Page 1416
Generic Access Profile
There are two modes for bonding, non-bondable mode and bondable mode. Bonding
may only occur between two devices in bondable mode. The requirements for a device
to support the bonding modes and procedure are defined in Table 9.4.
9.4.1 Requirements
Bonding Ref. Peripheral Central Broadcaster Observer
Non-Bondable mode 9.4.2 M M E E
Bondable mode 9.4.3 O O E E
Bonding procedure 9.4.4 C.1 C.1 E E
C.1: Mandatory if Bondable mode is supported, otherwise Excluded.
Table 9.4: Bonding requirements
9.4.2 Non-bondable mode
9.4.2.1 Description
A device in the non-bondable mode does not allow a bond to be created with a peer
device.
9.4.2.2 Conditions
If a device does not support pairing as defined in the Security Manager section then it is
considered to be in non-bondable mode.
If Security Manager pairing is supported, the Host shall set the Bonding_Flags to ‘No
Bonding’ as defined in [Vol 3] Part H, Section 3.5.1 and bonding information shall not be
exchanged or stored.
9.4.3 Bondable mode
9.4.3.1 Description
A device in the bondable mode allows a bond to be created with a peer device in the
bondable mode.
9.4.3.2 Conditions
The Host shall set the Bonding_Flags to ‘Bonding’ as defined in [Vol 3] Part H,
Section 3.5.1 during the pairing procedure.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1416 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part C Page 1417
Generic Access Profile
9.4.4 Bonding procedure
9.4.4.1 Description
The bonding procedure may be performed when a non-bonded device tries to access
a service that requires bonding. The bonding procedure may be performed for the
purpose of creating a bond between two devices.
Central Peripheral
establishedlink
Accesstoserviceis protectedandbonding
isrequired
SMpairing(generalbonding)
updatelistofpaireddevices updatelistofpaireddevices
Figure 9.7: Bonding requirements
9.4.4.2 Conditions
The Central shall be in the bondable mode and shall initiate the pairing process as
defined in Section 2.1. If the Peripheral is in the bondable mode, the devices shall
exchange and store the bonding information in the security database.
If a device supports the generation of resolvable private addresses as defined in
Section 10.8.2.2 and generates a resolvable private address for its local address, it shall
send Identity Information with SMP, including a valid IRK. If a device does not generate
a resolvable private address for its own address and the Host sends Identity Information
with SMP, the Host shall send an all-zero IRK. If a device supports resolving resolvable
private addresses as defined in Section 10.8.2.3, it shall request the peer device to
send its Identity Information with SMP. The Host can abort the pairing procedure if the
authentication requirements are not sufficient to distribute the IRK.
9.5 Periodic advertising modes and procedure
The periodic advertising modes and procedure allow two or more devices to
communicate in a connectionless manner using extended advertising events and
periodic advertising events. These modes and procedures can also make use of
existing connections. The requirements for a device operating in a specific GAP role
to support these modes and procedures are defined in Table 9.5.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1417 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part C Page 1418
Generic Access Profile
Mode and Procedures Ref. Broadcaster Observer Peripheral Central
Periodic Advertising 9.5.1 O E E E
Synchronizability mode
Periodic Advertising 9.5.2 C.1 E E E
mode
Periodic Advertising 9.5.3 E O O O
Synchronization Estab-
lishment procedure
Periodic Advertising 9.5.4 E E C.2 C.2
Synchronization Trans-
fer procedure
C.1: Mandatory if Periodic Advertising Synchronizability mode is supported, otherwise excluded.
C.2: Optional if Periodic Advertising Mode is supported or the Periodic Advertising Synchronization
Establishment procedure is supported, otherwise excluded.
Table 9.5: Periodic advertising modes and periodic advertising procedure requirements
9.5.1 Periodic Advertising Synchronizability mode
9.5.1.1 Definition
The periodic advertising synchronizability mode provides a method for a device to
send synchronization information about a periodic advertising train (with or without
responses) using advertisements.
9.5.1.2 Conditions
A device in the periodic advertising synchronizability mode shall send synchronization
information for a periodic advertising train (with or without responses) in non-
connectable and non-scannable extended advertising events. The advertising interval
used is unrelated to the interval between the periodic advertising events.
A device shall not be in periodic advertising synchronizability mode unless it is also
in periodic advertising mode. It may leave, and possibly re-enter, periodic advertising
synchronizability mode while remaining in periodic advertising mode.
9.5.2 Periodic Advertising mode
9.5.2.1 Definition
On periodic advertising trains without responses, the periodic advertising mode provides
a method for a device to send advertising data at periodic and deterministic intervals.
On periodic advertising trains with responses, a device may send advertising data in
one or more subevents to synchronized devices who may also send data back to the
device.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1418 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part C Page 1419
Generic Access Profile
9.5.2.2 Conditions
A device in the periodic advertising mode shall send periodic advertising events at the
interval and using the frequency hopping sequence specified in the periodic advertising
synchronization information. On periodic advertising trains with responses, the interval
may be divided into subevents. During a subevent, a synchronized device may send
data back to the device in response slots.
A device entering periodic advertising mode shall also enter periodic advertising
synchronizability mode for at least long enough to complete one extended advertising
event (see [Vol 6] Part B, Section 4.4.2.12).
9.5.3 Periodic Advertising Synchronization Establishment procedure
9.5.3.1 Definition
The periodic advertising synchronization establishment procedure provides a method
for a device to receive periodic advertising synchronization information and to
synchronize to a periodic advertising train.
9.5.3.2 Conditions
A device performing the periodic advertising synchronization establishment procedure
shall scan for non-connectable and non-scannable advertising events containing
synchronization information about a periodic advertising train or shall accept periodic
advertising synchronization information over an existing connection by taking part in
the Link Layer Periodic Advertising Sync Transfer procedure defined in [Vol 6] Part
B, Section 5.1.13. When a device receives synchronization information for a periodic
advertising train, it may listen for periodic advertising events at the intervals and using
the frequency hopping sequence specified in the periodic advertising synchronization
information. If a device receives synchronization information about periodic advertising
with responses, it may listen to one or more subevents in the interval and may send
data to the periodic advertiser.
9.5.4 Periodic Advertising Synchronization Transfer procedure
9.5.4.1 Definition
The periodic advertising synchronization transfer procedure provides a method for a
device to send synchronization information about a periodic advertising train over an
existing connection.
9.5.4.2 Conditions
A device performing the periodic advertising synchronization transfer procedure shall
initiate the Link Layer Periodic Advertising Sync Transfer procedure defined in [Vol 6]
Part B, Section 5.1.13.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1419 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part C Page 1420
Generic Access Profile
9.5.5 [This section is no longer used]
The Periodic Advertising Connection procedure is described in Section 9.3.17.
9.6 Isochronous Broadcast modes and procedures
The Isochronous Broadcast modes and procedures allow two or more devices to
communicate in a unidirectional, connectionless manner by using extended advertising
events, periodic advertising events, and BIG and BIS events. The requirements for a
device that operates in a specific GAP role to support these modes and procedures are
defined in Table 9.6.
Modes and Procedures Ref. Peripheral Central Broadcaster Observer
Broadcast Isochronous Synchronizability 9.6.1 E E C.1 E
mode
Broadcast Isochronous Broadcasting 9.6.2 E E O E
mode
Broadcast Isochronous Synchronization 9.6.3 E E E O
Establishment procedure
Broadcast Isochronous Channel Map Up- 9.6.4 E E C.1 C.2
date procedure
Broadcast Isochronous Terminate proce- 9.6.5 E E C.1 C.2
dure
C.1: Mandatory if Broadcast Isochronous Broadcasting mode is supported, otherwise excluded.
C.2: Mandatory if Broadcast Isochronous Synchronization Establishment procedure is supported,
otherwise excluded.
Table 9.6: Isochronous Broadcast modes and procedure requirements
9.6.1 Broadcast Isochronous Synchronizability mode
9.6.1.1 Definition
The Broadcast Isochronous Synchronizability mode provides a method for a device to
transmit the synchronization information of a BIG.
9.6.1.2 Conditions
A device shall also be in the Broadcast Isochronous Broadcasting mode while it is in the
Broadcast Isochronous Synchronizability mode. A device in the Broadcast Isochronous
Synchronizability mode shall send the BIGInfo in the ACAD field which is located in the
AUX_SYNC_IND PDU of periodic advertisement ([Vol 6] Part B, Section 2.3.4.8).
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1420 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part C Page 1421
Generic Access Profile
9.6.2 Broadcast Isochronous Broadcasting mode
9.6.2.1 Definition
The Broadcast Isochronous Broadcasting mode provides a method for a device in the
Broadcaster role to send encrypted or unencrypted Broadcast Isochronous PDUs in
subevents of BISes of a BIG ([Vol 6] Part B, Section 4.4.6).
9.6.2.2 Conditions
A device in the Broadcast Isochronous Broadcasting mode shall send isochronous
PDUs in subevents of BISes of a BIG ([Vol 6] Part B, Section 4.4.6).
9.6.3 Broadcast Isochronous Synchronization Establishment procedure
9.6.3.1 Definition
The Broadcast Isochronous Synchronization Establishment procedure provides a way
for a device to synchronize to a BIS.
9.6.3.2 Conditions
A device that performs the Broadcast Isochronous Synchronization Establishment
procedure shall first perform the Periodic Advertising Synchronization Establishment
procedure (Section 9.5.3) and receive the synchronization information. The
synchronization information is used to synchronize to the required BIS in the BIG ([Vol
6] Part B, Section 4.4.6).
9.6.4 Broadcast Isochronous Channel Map Update procedure
9.6.4.1 Definition
The Broadcast Isochronous Channel Map Update procedure allows a Broadcaster to
use and transmit a new channel map of a BIG, or an Observer to receive and use a new
channel map for a BIG.
9.6.4.2 Conditions
In this procedure, the Broadcaster sends the channel map command in the BIG events
([Vol 6] Part B, Section 4.4.6.4). When an Observer receives a channel map message, it
uses the new channel when receiving data from the BIG.
9.6.5 Broadcast Isochronous Terminate procedure
9.6.5.1 Definition
The Broadcast Isochronous Terminate procedure allows a Host of a Broadcaster to
terminate a BIG, or the Host of an Observer to terminate synchronization with a BIG.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1421 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part C Page 1422
Generic Access Profile
9.6.5.2 Conditions
The Host initiating the Broadcast Isochronous Stream Terminate procedure shall use
the Broadcast Isochronous Stream Termination control procedure defined in [Vol 6] Part
B, Section 5.6.2.
9.7 Channel Sounding procedures
The Channel Sounding procedures allow two devices to exchange information that may
be used for distance approximation between the two. During this exchange, each device
must select the alternate procedure type.
Channel Sounding Procedures Ref. Peripheral Central Broadcaster Observer
CS initiator procedure 9.7.1 O O E E
CS reflector procedure 9.7.2 O O E E
Table 9.7: Channel Sounding procedure requirements
9.7.1 Channel Sounding initiator procedure
9.7.1.1 Description
The CS initiator procedure allows a Peripheral or Central to initiate a CS procedure.
9.7.1.2 Conditions
If the CS initiator role is supported by the Controller, then the Host may enable
the initiator role by commanding the Controller to set the initiator role flag in the
Configuration Exchange procedure as described in [Vol 6] Part B, Section 5.1.25.
If both the Central and Peripheral support the CS procedure, then the Central or
Peripheral initiating the CS procedure shall do so in the manner described in [Vol 6]
Part B, Section 5.1.26.
9.7.2 Channel Sounding reflector procedure
9.7.2.1 Description
The CS reflector procedure allows a Peripheral or Central to respond to a CS initiator
procedure.
9.7.2.2 Conditions
If the CS reflector role is supported by the Controller, then the Host may enable the
reflector role by commanding the Controller to set the Responder Role flag in the
Configuration Exchange procedure as described in [Vol 6] Part B, Section 5.1.25.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1422 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part C Page 1423
Generic Access Profile
The Central or Peripheral responding to the CS procedure shall do so in the manner
described in [Vol 6] Part B, Section 5.1.26.
Bluetooth SIG Proprietary Version Date: 2025-11-03
