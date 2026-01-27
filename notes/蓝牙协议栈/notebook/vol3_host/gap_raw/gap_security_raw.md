# GAP Security Aspects (LE 安全模式)

> 本文档提取自 Vol 3, Part C Generic Access Profile (GAP)。

### Page 1423 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part C Page 1424
Generic Access Profile
10 SECURITY ASPECTS – LE PHYSICAL
TRANSPORT
This section defines the modes and procedures that relate to the security of either an
ACL connection or broadcast. The modes and procedures that relate to the security of
a CIS shall be the same as that used in its associated ACL. The following modes and
procedures are defined:
• LE security mode 1
• LE security mode 2
• LE security mode 3
• Authentication procedure
• Authorization procedure
• Connection data signing procedure
• Authenticate signed data procedure
• Encrypted Advertising Data procedure
Requirements for a device to support the LE security modes and procedures is shown
in Table 10.1.
10.1 Requirements
Security Modes and Procedures Ref. Broadcaster Observer Peripheral Central
LE Security mode 1 10.2.1 E E O O
LE Security mode 2 10.2.2 E E O O
LE Security mode 3 10.2.5 O O E E
Authentication procedure 10.3 E E O O
Authorization procedure 10.5 E E O O
Connection data signing procedure 10.4.1 E E O O
Authenticate signed data procedure 10.4.2 E E O O
Encrypted Advertising Data procedure 10.10 O O O O
Table 10.1: Requirements related to security modes and procedures
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1424 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part C Page 1425
Generic Access Profile
10.2 LE security modes
The security requirements of a device, a service or a service request are expressed in
terms of a security mode and security level. Each service or service request may have
its own security requirement. The device may also have a security requirement.
There are three LE security modes, LE security mode 1, LE security mode 2, and LE
security mode 3.
10.2.1 LE security mode 1
LE security mode 1 has the following security levels:
1. No security (No authentication and no encryption)
2. Unauthenticated pairing with encryption
3. Authenticated pairing with encryption
4. Authenticated LE Secure Connections pairing with encryption using a 128-bit
strength encryption key.
For certain services that require LE security mode 1, levels 2 or 3, a device may enforce
the use of LE Secure Connections pairing before those services can be used.
A connection operating in LE security mode 1 level 2 shall also satisfy the security
requirements for LE security mode 1 level 1.
A connection operating in LE security mode 1 level 3 shall also satisfy the security
requirements for LE security mode 1 level 2 or LE security mode 1 level 1.
A connection operating in LE security mode 1 level 3 shall also satisfy the security
requirements for LE security mode 2.
A connection operating in LE security mode 1 level 4 shall also satisfy the security
requirements for LE security mode 1 level 3 or LE security mode 1 level 2 or LE security
mode 1 level 1.
A connection operating in LE security mode 1 level 4 shall also satisfy the security
requirements for LE security mode 2.
10.2.2 LE security mode 2
LE security mode 2 has two security levels:
1. Unauthenticated pairing with data signing
2. Authenticated pairing with data signing
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1425 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part C Page 1426
Generic Access Profile
LE security mode 2 shall only be used for connection based data signing.
Data signing as defined in Section 10.4 shall not be used when a connection is
operating in LE security mode 1 level 2, LE security mode 1 level 3, or LE security
mode 1 level 4.
10.2.3 Mixed security modes requirements
If there are requirements for both LE security mode 1 and LE security mode 2 level 2 for
a given physical link then LE security mode 1 level 3 shall be used.
If there are requirements for both LE security mode 1 level 3 and LE security mode 2 for
a given physical link then LE security mode 1 level 3 shall be used.
If there are requirements for both LE security mode 1 level 2 and LE security mode 2
level 1 for a given physical link then LE security mode 1 level 2 shall be used.
If there are requirements for both LE security mode 1 level 4 and any other security
mode or level for a given physical link then LE security mode 1 level 4 shall be used.
10.2.4 Secure Connections Only mode
A device may be in a Secure Connections Only mode. When in Secure Connections
Only mode only security mode 1 level 4 shall be used except for services that only
require security mode 1 level 1.
The device shall only accept new outgoing and incoming service level connections for
services that require Security Mode 1, Level 4 when the remote device supports LE
Secure Connections and authenticated pairing is used.
10.2.5 LE security mode 3
LE security mode 3 has three security levels:
1. No security (no authentication and no encryption)
2. Use of unauthenticated Broadcast_Code
3. Use of authenticated Broadcast_Code
LE security mode 3 shall be used to broadcast a Broadcast Isochronous Group (BIG) in
an Isochronous Broadcaster or receive a BIS in a Synchronized Receiver.
A device operating in security mode 3 level 1 shall require that the isochronous data is
unencrypted.
A device that operates in LE security mode 3 level 2 shall require a Broadcast_Code to
encrypt the data that is transmitted in a BIS.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1426 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part C Page 1427
Generic Access Profile
A device that operates in LE security mode 3 level 3 shall require a Broadcast_Code
to encrypt the data that is transmitted in a BIS. If the device has not received a
Broadcast_Code using an authenticated method when the service requires Level 3
security and has a user interface capable of doing so, then the device shall indicate an
appropriate error to the user (e.g., Insufficient Security for Broadcast_Code).
10.3 Authentication procedure
The authentication procedure describes how the required security is established when
a device initiates a service request to a remote device and when a device receives a
service request from a remote device. The authentication procedure covers LE security
mode 1. The authentication procedure shall only be initiated after a connection has
been established.
LE security mode 2 pertains to the use of data signing and is covered in Section 10.4.
Authentication in LE security mode 1 is achieved by enabling encryption as defined
in Section 10.6. The security of the encryption is impacted by the type of pairing
performed. There are two types of pairing: authenticated pairing or unauthenticated
pairing. Authenticated pairing involves performing the pairing procedure defined in [Vol
3] Part H, Section 2.1 with the authentication set to ‘MITM protection’. Unauthenticated
pairing involves performing the pairing procedure with authentication set to ‘No MITM
protection’.
Note: In this section, the terms “authenticated pairing” and “unauthenticated pairing”
refer to the security method used to perform pairing and are not related to the
authentication of previously bonded devices during a reconnection.
Section 10.3.1 specifies the authentication procedure when a device responds to a
service request. Section 10.3.2 specifies the authentication procedure when a device
initiates a service request.
10.3.1 Responding to a service request
In this section the local device is the device responding to a service request made by
a remote device. In the L2CAP protocol the local device responds with a connection
response to a remote device making a connection request. In GATT, the local device is
the GATT Server and the remote device is the GATT Client.
When a local device receives a service request from a remote device, it shall respond
with an error code if the service request is denied. The error code is dependent on
whether the current connection is encrypted or not and on the type of pairing that was
performed to create the LTK or STK to be used.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1427 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part C Page 1428
Generic Access Profile
When a local device receives a service request from a remote device it shall behave
according to the following rules:
• The local device’s security database specifies the security settings required to accept
a service request. If no encryption and no data signing are required, the service
request shall be accepted. If encryption is required the local device shall send an
error code as defined in Table 10.2. If no encryption is required, but data signing is
required, then the local device behavior is as defined in Section 10.4.
• If neither an LTK nor an STK is available, the service request shall be rejected with
the error code “Insufficient Authentication”.
Note: When the link is not encrypted, the error code “Insufficient Authentication” does
not indicate that MITM protection is required.
• If an LTK or an STK is available and encryption is required (LE security mode 1) but
encryption is not enabled, the service request shall be rejected with the error code
“Insufficient Encryption”. If the encryption is enabled with a key size that is too short
then the service request shall be rejected with the error code “Encryption Key Size
Too Short.”
• If an authenticated pairing is required but only an unauthenticated pairing has
occurred and the link is currently encrypted, the service request shall be rejected
with the error code “Insufficient Authentication.”
Note: When unauthenticated pairing has occurred and the link is currently encrypted,
the error code “Insufficient Authentication” indicates that MITM protection is required.
• If LE Secure Connections pairing is required but LE legacy pairing has occurred and
the link is currently encrypted, the service request shall be rejected with the error
code “Insufficient Authentication”.
The local device will respond with the minimum security level required for access to its
services. If the local device has no security requirement it should default to the minimum
security level that the local device is capable of as defined in pairing phase 1, (see [Vol
3] Part H, Section 2.1).
A local device shall not require an authenticated pairing (MITM) if the local device does
not support the required IO capabilities or OOB data1.
The local device responds to a service request from a remote device are summarized in
Table 10.2.
1If an OOB mechanism is used, the level of MITM protection is dependent upon the properties of the OOB
communications channel. See [Vol 3] Part H, Section 2.3.5.1 for more information
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1428 (Original)

Link Local Local Device Pairing Status
Encryp- Device’s
No LTK Unauthenticated Authenticated Authenticated
tion Access
LTK (with LTK without LTK with
State Requirement No STK
or without LE Secure Secure
for Service
LE Secure Connections Connections
Connections) or or
Unauthenticated Authenticated
STK STK
detpyrcnenU
None Request suc- Request suc- Request suc- Request suc-
ceeds ceeds ceeds ceeds
Encryption, Error Resp.: Error Resp.: In- Error Resp.: Error Resp.:
No MITM Pro- Insufficient Au- sufficient Encryp- Insufficient En- Insufficient En-
tection thentication tion cryption cryption
Encryption, Error Resp.: Error Resp.: In- Error Resp.: Error Resp.:
MITM Protec- Insufficient Au- sufficient Encryp- Insufficient En- Insufficient En-
tion thentication tion cryption cryption
Encryption, Error Resp.: Error Resp.: In- Error Resp.: Error Resp.:
MITM Protec- Insufficient Au- sufficient Encryp- Insufficient En- Insufficient En-
tion, Secure thentication tion cryption cryption
Connections
detpyrcnE
BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part C Page 1429
Generic Access Profile
None N/A Request suc- Request suc- Request suc-
ceeds ceeds ceeds
(Not possible
Encryption, to be encryp- Request suc- Request suc- Request suc-
No MITM Pro- ted without ceeds ceeds ceeds
tection LTK)
Encryption, Error Resp.: In- Request suc- Request suc-
MITM Protec- sufficient Authen- ceeds ceeds
tion tication
Encryption, Error Resp.: In- Error Resp.: Request suc-
MITM Protec- sufficient Authen- Insufficient Au- ceeds
tion, Secure tication thentication
Connections
Table 10.2: Local device responds to a service request
Figure 10.1 shows how a server handles a service request.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1429 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part C Page 1430
Generic Access Profile
Receive a Service
Request
Query security DB
Access to service No, security not
rejected
successful? required (level 1)
Yes
Bond Exists? Yes
No
Current security
No
Good Enough?
Pairing
Yes
Success and Encryption No
No correct Security Yes
Needed? (Mode 2)
level?
Yes
Remote
No supports
encryption?
Yes
Encryption
Cross-transport
No
Key derivation
possible?
Yes
PerformService
Abort BR/EDR Request on
Link Key generation Local Device
Figure 10.1: Flow chart for a local device handling a service request from a remote device
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1430 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part C Page 1431
Generic Access Profile
10.3.1.1 Handling of GATT indications and notifications
A client “requests” a server to send indications and notifications by appropriately
configuring the server via a Client Characteristic Configuration Descriptor. Since the
configuration is persistent across a disconnection and reconnection, the security
requirements for the connection shall be checked against the configuration upon a
reconnection before sending indications or notifications. When a server reconnects to
a client to send an indication or notification for which a specific level of security for the
connection is required, the server shall initiate or request encryption with the client prior
to sending an indication or notification. If the client does not have an LTK, indicating that
the client has lost the bond, enabling encryption will fail.
10.3.1.2 Cross-transport key generation
After encryption is enabled, the correct security level has been achieved, and both
devices support cross-transport key generation, the both devices may perform BR/EDR
link key derivation.
Note: If the LTK has an encryption key size that is shorter than 16 octets (128 bits), the
BR/EDR link key is derived before the LTK gets masked.
10.3.2 Initiating a service request
In this section the local device is the device initiating a service request to a remote
device. In the L2CAP protocol the local device sends the connection request and the
remote device sends the connection response. In GATT, the local device is the GATT
Client and the remote device is the GATT Server.
When a local device initiates a service request to a remote device it shall behave
according to the following rules:
• The local device’s security database specifies the security required to initiate a
service request. If no encryption is required by the local device then the service
request may proceed without encryption or pairing.
• If an LTK is not available but encryption is required, the pairing procedure shall
be initiated with the local device’s required authentication settings. If the pairing
procedure fails then the service request shall be aborted.
Note: When encryption is not enabled, the error code “Insufficient Authentication”
does not indicate to the local device that MITM protection is required.
Note: If the local device is a Peripheral then it may send a Peripheral Initiated
Security Request as defined in [Vol 3] Part H, Section 2.4.6.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1431 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part C Page 1432
Generic Access Profile
• If pairing has occurred but the encryption key size is insufficient the pairing procedure
shall be executed with the required encryption key size. If the pairing procedure fails
then the service request shall be aborted.
• If an LTK is available and encryption is required (LE security mode 1) then encryption
shall be enabled before the service request proceeds as defined in Section 10.6.
Once encryption is enabled the service request shall proceed. If encryption fails,
then either the bond no longer exists on the remote device or the wrong device has
been connected. If the local device does not abandon the service request, it shall
trigger a user interaction to confirm the remote device and then re-bond, perform
service discovery, and reconfigure the remote device (reconfiguring the remote device
can involve actions such as re-enabling indications and notifications on the relevant
characteristics). If the local device had previously determined that the remote device
did not have the «Service Changed» characteristic, or if the local device determines
by reading the «Database Hash» characteristic that the database has not changed,
then service discovery may be skipped.
• If an authenticated pairing is required but only an unauthenticated pairing has
occurred and the link is currently encrypted, the pairing procedure shall be executed
with the required authentication settings. If the pairing procedure fails or an
authenticated pairing cannot be performed with the IO capabilities of the local device
and remote device, then the service request shall be aborted.
When a bond has been created between two devices, any reconnection should result
in the local device enabling or requesting encryption with the remote device before
initiating any service request.
If a local device does not enable encryption before initiating a service request and
relies on the error codes to determine the security requirements, the local device
shall not request pairing with MITM protection in response to receiving an “Insufficient
Authentication” error code from the remote device while the link is unencrypted. The
local device shall only set the MITM protection required flag if the local device itself
requires MITM protection.
• If encryption is not enabled at the time of the service request, the error code
“Insufficient Authentication” is received, and the local device currently has an LTK,
then the encryption procedure should be started (see Section 10.6). If this fails (likely
indicating that the remote device has lost the bond and no longer has the LTK) or
the local device does not have the correct LTK, then it should re-pair. If it re-pairs, it
shall trigger a user interaction to confirm the remote device before starting the pairing
procedure. IO capabilities are exchanged in pairing phase 1, (see [Vol 3] Part H,
Section 2.1) and the security level shall be determined by the devices’ IO capabilities
and MITM requirements.
• If encryption is not enabled at the time of the service request, the error code
“Insufficient Encryption” is received, and the local device currently has an LTK, then
the encryption procedure shall be started (see Section 10.6). If starting encryption
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1432 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part C Page 1433
Generic Access Profile
fails (likely indicating that the remote device has lost the bond and no longer has the
LTK) or the local device does not have the correct LTK, then it should re-pair. If it
re-pairs, it shall trigger a user interaction to confirm the remote device before starting
the pairing procedure.
• If LE Secure Connections authenticated pairing is required but the remote device
does not support LE Secure Connections, then the service request shall be aborted.
Figure 10.2 shows how a client issues a service request.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1433 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part C Page 1434
Generic Access Profile
Initiate a service
request to a
remote device
Local device
queries security
DB
Access
to service
No
allowed?
Yes
Remote
No, security not
device needs
authenticating? required Mode1,
(level 1)
Yes
Bond Exists
Yes
Locally?
No
Current security
No
Good Enough?
Pairing
Yes
Success and
No correct Security Encryption
level?
Yes
Cross-transport
No
Key derivation
possible?
Yes
Local device Perform Service
BR/EDR
abandons request on
Link Key generation
procedure remote device
Figure 10.2: Flow chart for a local device issuing a service request to a remote device
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1434 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part C Page 1435
Generic Access Profile
10.3.2.1 Cross-transport key generation
After encryption is enabled, the correct security level has been achieved, and both
devices support cross-transport key generation, the both devices may perform BR/EDR
link key derivation.
Note: If the LTK has an encryption key size that is shorter than 16 octets (128 bits), the
BR/EDR link key is derived before the LTK gets masked.
10.3.2.2 Handling of GATT indications and notifications
A client requests a server to send indications and notifications by appropriately
configuring the server via a Client Characteristic Configuration Descriptor. Since the
configuration is persistent across a disconnection and reconnection, the client shall
check the security requirements for the connection against the configuration upon a
reconnection before processing any indications or notifications from the server. Any
notifications received before the security requirements are met shall be ignored. Any
indications received before the security requirements are met shall be confirmed and
then discarded. When a client reconnects to a server and expects to receive indications
or notifications for which a specific level of security for the connection is required, the
client shall enable encryption with the server. If the server does not have an LTK,
indicating that the server has lost the bond, enabling encryption will fail.
10.4 Data signing
The data signing is used for transferring authenticated data between two devices in an
unencrypted connection. The data signing method is used by services that require fast
connection set up and fast data transfer.
If a service request specifies LE security mode 2, the connection data signing procedure
shall be used.
10.4.1 Connection Data Signing procedure
A device shall generate a new Connection Signature Resolving Key CSRK for each set
of peer device(s) to which it sends signed data in connections. CSRK is defined in [Vol
3] Part H, Section 2.4.2.2.
The data shall be formatted using the Signing Algorithm as defined in [Vol 3] Part
H, Section 2.4.5 where m is the Data PDU to be signed, k is the CSRK and the
SignCounter is the counter value. A Signature is composed of the counter value and the
Message Authentication Code (MAC) generated by the Signing Algorithm. The counter
value shall be incremented by one for each new Data PDU sent.
The format of signed data is shown in Figure 10.3.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1435 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part C Page 1436
Generic Access Profile
Data PDU Signature
LSB MSB
Variable 12 octets
SignCounter MAC
LSB MSB
4 octets 8 octets
Figure 10.3: Generic format of signed data
10.4.2 Authenticate Signed Data procedure
If encryption is not required and CSRK is available (LE security mode 2) then the
data signing procedure shall be used when making a service request involving a write
operation.
Note: The existence of the bond on the server can be determined by successfully
enabling encryption with the server using the encryption procedure defined in Section
10.6. A higher layer profile may allow a client to not perform the authentication
procedure. Alternatively, a higher layer protocol may signal the client that the signature
check has failed due to a lost bond, and the client may then take action to notify the
user or attempt to pair again to reestablish the bond.
A device receiving signed data shall authenticate it by performing the Signing Algorithm.
The signed data shall be authenticated by performing the Signing Algorithm where m
is the Data PDU to be authenticated, k is the stored CSRK and the SignCounter is the
received counter value. If the MAC computed by the Signing Algorithm does not match
the received MAC, the verification fails and the Host shall ignore the received Data
PDU.
Since the server does not respond to a Signed Write command, the higher layer
application is not necessarily notified of the ignored request. Hence, it is recommended
that the server disconnect the link in case the client is a malicious device attempting to
mount a security attack.
If the server has no stored CSRK upon receiving a signed write command, it shall
ignore the received Data PDU. Since the server does not respond to a Signed
Write command, the higher layer application is not necessarily notified of the ignored
request. Although the disconnection may be an adequate indication to the user that
the devices need to be paired, it is recommended that implementers consider providing
an explanatory indication to the user that the devices need to be paired to establish a
CSRK.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1436 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part C Page 1437
Generic Access Profile
If the server receives a request from a client for a write operation that requires
a response (i.e. other than a Signed Write command or Write command), and
encryption is not enabled, then the server shall respond with the error code “Insufficient
Authentication”.
If the link is encrypted and the server receives a request from a client for which the
server requires data signing but does not require encryption, then the server shall
complete the request if it is otherwise valid as the encrypted state of the link is
considered to satisfy the signing requirement.
As required by Section 10.2.2, for a given link, signed data is not used at the same time
as encryption. Therefore, if the client wishes to test that the server is still bonded, and
thus enables encryption, further data transfer must occur without signing, assuming the
server does not disconnect the link as recommended above.
If a higher layer determines the bond no longer exists on the server, the client shall
trigger a user interaction to confirm the remote device and then re-bond, perform
service discovery, and reconfigure the server. If the client had previously determined
that the server did not have the «Service Changed» characteristic, or the client
determines by reading the «Database Hash» characteristic that the database has not
changed, then service discovery may be skipped.
The receiving device shall protect against a replay attack by comparing the received
SignCounter with previously received SignCounter from the same peer device. If the
SignCounter was previously used then the receiving device shall ignore the Data PDU.
10.5 Authorization procedure
A service may require authorization before allowing access. Authorization is a
confirmation by the user to continue with the procedure. Authentication does not
necessarily provide authorization. Authorization may be granted by user confirmation
after successful authentication.
10.6 Encryption procedure
A Central may encrypt a connection using the Encryption Session Setup as defined in
[Vol 3] Part H, Section 2.4.4 to provide integrity and confidentiality.
A Peripheral may encrypt a connection using the Peripheral Initiated Security Request
as defined in [Vol 3] Part H, Section 2.4.6 to provide integrity and confidentiality.
If the encryption procedure fails and either the Central or Peripheral used a Resolvable
Private Address for the connection establishment, then the current Resolvable Private
Address(es) shall be immediately discarded and new Resolvable Private Address(es)
shall be generated.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1437 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part C Page 1438
Generic Access Profile
10.7 Privacy feature
The privacy feature provides a level of privacy which makes it more difficult for an
attacker to track a device over a period of time. The requirements for a device to
support the privacy feature are defined in Table 10.3.
Privacy Requirements Ref. Broadcaster Observer Peripheral Central
Privacy feature 10.7 O O O O
Non-resolvable private ad- 10.8.2.1 C.2 C.4 O O
dress generation procedure
Resolvable private address 10.8.2.2 C.3 C.5 C.1 C.1
generation procedure
Resolvable private address 10.8.2.3 E O C.1 C.1
resolution procedure
Bondable Mode 9.4.3 E E C.1 C.1
Bonding procedure 9.4.4 E E C.1 C.1
C.1: Mandatory if privacy feature is supported, otherwise optional
C.2: Mandatory if privacy feature is supported and resolvable private address generation procedure
is not supported, otherwise optional
C.3: Mandatory if privacy feature is supported and non-resolvable private address generation proce-
dure is not supported, otherwise optional
C.4: Mandatory if privacy feature and active scanning are supported and resolvable private address
generation procedure is not supported, otherwise optional
C.5: Mandatory if privacy feature and active scanning are supported and non-resolvable private
address generation procedure is not supported, otherwise optional
Table 10.3: Requirements related to privacy feature
Two modes of privacy exist:
• Device Privacy Mode: When a device is in device privacy mode, it is only concerned
about its own privacy. It should accept advertising packets from peer devices that
contain their Identity Addresses as well as their private address, even if the peer
device has distributed its IRK.
• Network Privacy Mode. When a device is in network privacy mode, it shall not
accept advertising packets containing the Identity Address of peer devices that have
distributed their IRK.
Note: If the Resolvable Private Address Only characteristic is not present in the GAP
Service of the remote device then it may use its Identity Address over the air.
A device may use different modes for different peers.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1438 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part C Page 1439
Generic Access Profile
If a device, i.e. Host and Controller, claims support for the privacy feature, the
requirements in this section shall be met.
A device may support either just Host-based privacy or both Host-based and Controller-
based privacy. When a device supports Controller-based privacy, the Host configures
the Controller to perform some of the privacy functionality.
If a device supports Controller-based privacy, the requirements in the following
paragraphs shall be met.
• The Host may maintain a resolving list by adding and removing device identities. A
device identity consists of the peer’s Identity Address and a local and peer’s IRK pair.
The local or peer’s IRK shall be an all-zero key if not applicable for the particular
device identity.
• If a peer device provides an all-zero Identity Address during pairing, the Host shall
choose a unique identifier to substitute the peer’s device Identity Address. The Host
shall ensure that all identities provided to the Controller are unique.
• When address resolution is enabled in the Controller, all references to peer devices
that are included in the resolving list from Host to the Controller shall be done using
the peer’s device Identity Address. Likewise, all incoming events from the Controller
to the Host will use the peer’s device identity, if the peer’s device address has been
resolved.
• To select device privacy mode, the Host shall so instruct the Controller for each peer
in the resolving list.
• If the Host requires network privacy mode, then it shall only populate entries in the
Controller's resolving list that have non-zero IRKs and shall not instruct the Controller
to use device privacy mode.
10.7.1 Privacy feature in a Peripheral
The privacy-enabled Peripheral shall use a resolvable private address as the
advertiser's device address when in connectable mode.
A Peripheral shall use non-resolvable or resolvable private addresses when in non-
connectable mode as defined in Section 9.3.2.
If a privacy-enabled Peripheral, that has a stored bond, receives a resolvable private
address, the Host may resolve the resolvable private address by performing the
‘resolvable private address resolution procedure’ as defined in Section 10.8.2.3. If the
resolution is successful, the Host may accept the connection. If the resolution procedure
fails, then the Host shall either accept the connection from the new, unresolved device,
disconnect with the error code "Authentication failure", or perform the pairing procedure,
or perform the authentication procedure as defined in Section 10.3. Accepting the
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1439 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part C Page 1440
Generic Access Profile
connection from the new, unresolved device, can result in exposing the device name
or unique data to the Central.
The device should not send the device name or unique data in the advertising data that
can be used to recognize the device.
10.7.1.1 Privacy feature in a Peripheral with Controller-based privacy
A privacy-enabled Peripheral shall use either the undirected connectable mode as
defined in Section 9.3.4 or directed connectable mode as defined in Section 9.3.3.
The directed connectable mode shall only be used if the peer device supports Address
Resolution in the Controller.
The Host shall enable resolvable private address generation by enabling it in the
Controller and populating the resolving list.
By default, network privacy mode is used when private addresses are resolved and
generated by the Controller.
If the advertising data or the scan response data change regularly then those changes
should be synchronized with any changes in private addresses (both local and remote).
For this purpose, the Host should either instruct the Controller to synchronize address
changes with those data changes or, if the Controller does not support that feature,
generate private addresses as described in Section 10.7.1.2 instead of offloading
private address generation to the Controller.
10.7.1.2 Privacy feature in a Peripheral with Host-based privacy
A privacy-enabled Peripheral should use the undirected connectable mode as defined in
Section 9.3.2, to create a connection.
The Host shall generate a resolvable private address using the ‘resolvable private
address generation procedure’ as defined in Section 10.8.2.2 or non-resolvable private
address procedure as defined in Section 10.8.2.1. The Host shall set a timer equal to
T (private_addr_int). The Host shall generate a new resolvable private address or
GAP
non-resolvable private address when the timer T (private_addr_int) expires.
GAP
Note: T (private_addr_int) timer need not be run if a Peripheral is not advertising.
GAP
10.7.2 Privacy feature in a Central
The privacy-enabled Central shall use a resolvable private address as the initiator's
device address.
During active scanning, a privacy enabled Central shall use a non-resolvable or
resolvable private address.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1440 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part C Page 1441
Generic Access Profile
If, a privacy-enabled Central, that has a stored bond, receives a resolvable private
address, the Host may resolve the resolvable private address by performing the
"resolvable private address resolution procedure" as defined in Section 10.8.2.3.
10.7.2.1 Privacy feature in a Central with Controller-based privacy
A privacy-enabled Central with Address Resolution enabled in the Controller can use
any of the connection establishment procedures defined in Section 9.3.
By default, network privacy mode is used when private addresses are resolved and
generated by the Controller.
10.7.2.2 Privacy feature in a Central with Host-based privacy
A privacy-enabled Central should use the general connection establishment procedure
defined in Section 9.3.6 to create a connection.
The Host shall generate a resolvable private address using the ‘resolvable private
address generation procedure’ as defined in Section 10.8.2.2 or non-resolvable private
address procedure as defined in Section 10.8.2.1. The Host shall set a timer equal to
T (private_addr_int). The Host shall generate a new resolvable private address or
GAP
non-resolvable private address when the timer T (private_addr_int) expires.
GAP
Note: T (private_addr_int) timer need not be run if a Central is not scanning or
GAP
connected.
10.7.3 Privacy feature in a Broadcaster
A privacy-enabled Broadcaster shall use the Broadcast mode defined in Section 9.1.1.
The Broadcaster shall use either a resolvable private address or non-resolvable private
address.
If Address Resolution is not supported or disabled in the Controller, the following applies
to the Host: The Host shall generate a resolvable private address using the ‘resolvable
private address generation procedure’ as defined in Section 10.8.2.2 or non-resolvable
private address procedure as defined in Section 10.8.2.1. The Host shall set a timer
to T (private_addr_int). The Host shall generate a new resolvable private address or
GAP
non-resolvable private address when the timer T (private_addr_int) expires.
GAP
Note: T (private_addr_int) timer need not be run if a Broadcaster is not advertising.
GAP
The device should not send the device name or unique data in the advertising data
which can be used to recognize the device.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1441 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part C Page 1442
Generic Access Profile
10.7.4 Privacy feature in an Observer
A privacy-enabled Observer shall use the Observation procedure defined in
Section 9.1.2. During active scanning, a privacy enabled Observer shall use either a
resolvable private address or non-resolvable private address.
If Address Resolution is not supported or disabled in the Controller, the following applies
to the Host: The Host shall generate a resolvable private address using the ‘resolvable
private address generation procedure’ as defined in Section 10.8.2.2 or non-resolvable
private address procedure as defined in Section 10.8.2.1. The Host shall set a timer
equal to T (private_addr_int). The Host shall generate a new resolvable private
GAP
address or non-resolvable private address when the timer T (private_addr_int)
GAP
expires. The value of T (private_addr_int) shall not be greater than 1 hour.
GAP
Note: T (private_addr_int) timer need not be run if an Observer is not scanning.
GAP
10.8 Random Device address
For the purposes of this profile, the random device address may be of either of the
following two sub-types:
• Static address
• Private address
The term random device address refers to both static and private address types.
The transmission of a random device address is optional. A device shall accept the
reception of a random device address from a remote device.
The private address may be of either of the following two sub-types:
• Non-resolvable private address
• Resolvable private address
A bonded device shall process a resolvable private address as defined in
Section 10.8.2.3 or by establishing a connection and then performing the authentication
procedure as defined in Section 10.3. A device that generates a resolvable private
address for its local address shall always request to distribute its IRK value as defined
in [Vol 3] Part H, Section 3.6.4 if both sides are bondable, unless keys have been
pre-distributed.
After a device has distributed its IRK, it should use resolvable private addresses when
establishing a connection with a peer device to which the IRK has been distributed.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1442 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part C Page 1443
Generic Access Profile
10.8.1 Static address
The Host can generate a static address using the procedure described in [Vol 6] Part B,
Section 1.3.2.1.
10.8.2 Private address
The private address may be of either of the following two sub-types:
• Non-resolvable private address
• Resolvable private address
10.8.2.1 Non-Resolvable Private Address Generation procedure
The Host can generate a non resolvable private address using the procedure described
in [Vol 6] Part B, Section 1.3.2.2.
10.8.2.2 Resolvable Private Address Generation procedure
The Host can generate a resolvable private address where the Host has its IRK using
the procedure described in [Vol 6] Part B, Section 1.3.2.2.
10.8.2.3 Resolvable Private Address Resolution procedure
The Host can resolve a resolvable private address where the Host has the peer
device’s IRK or the local device's IRK, using the procedure described in [Vol 6] Part
B, Section 1.3.2.3.
10.9 Encrypted Broadcast Isochronous Group
A device with a service that requires using an unauthenticated encrypted BIG shall set
its security to LE security mode 3 level 2. A device with a service that requires using an
authenticated encrypted BIG shall set its security to LE security mode 3 level 3.
When a user initiates a service that includes broadcasting an encrypted BIG, the Host
shall provide the Broadcast_Code associated with the encrypted BIG to the Controller.
When a user initiates a service that requires the reception of an encrypted BIS, the
device needs to know the Broadcast_Code for that encrypted BIS. If the device does
not have the Broadcast_Code or cannot obtain the Broadcast_Code and has a user
interface, then it shall indicate an appropriate error (e.g., Code Unavailable) to the user.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1443 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part C Page 1444
Generic Access Profile
10.10 Encrypted Advertising Data procedure
A Broadcaster may encrypt advertising data using an Encrypted Data data type. The
data is encrypted using key material that is known by both devices as defined in Section
1.23.3 of [7].
The key material may be exposed using the Encrypted Data Key Material characteristic
on the Broadcaster or may be supplied to scanning devices using an out-of-band
mechanism.
The scanning device shall read the Encrypted Data Key Material characteristic on an
advertising device or use an out-of-band mechanism to obtain the key material for a
device needed to interpret the encrypted advertising data being sent.
10.11 LE Channel Sounding
A device with a service that requires using the CS procedure described in Section 9.7
must first encrypt the underlying LE connection as described in [Vol 6] Part B,
Section 4.5.18.2.
10.11.1 Channel Sounding security
Channel Sounding provides the following levels of channel measurement security for
the application layer:
1. Either CS tone or CS RTT
2. 150 ns CS RTT accuracy and CS tones
3. 10 ns CS RTT accuracy and CS tones
4. Level 3 with the addition of CS RTT sounding sequence or random sequence
payloads, and support of the Normalized Attack Detector Metric requirements as
described in [Vol 6] Part H, Section 3.5.1.
A device that operates in security level 1 shall use CS tone or CS RTT within a CS
procedure.
A device that operates in security level 2 shall use 150 ns or better CS RTT accuracy
and CS tones within a CS procedure.
A device that operates in security level 3 shall use 10 ns or better CS RTT accuracy and
CS tones within a CS procedure.
A device that operates in security level 4 shall meet the requirements of security level
3 and shall also require that the CS procedure uses either CS RTT with sounding
sequence or CS RTT with random sequence, and that the device shall also support
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1444 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part C Page 1445
Generic Access Profile
the Normalized Attack Detector Metric requirements as described in [Vol 6] Part H,
Section 3.5.1.
Bluetooth SIG Proprietary Version Date: 2025-11-03
