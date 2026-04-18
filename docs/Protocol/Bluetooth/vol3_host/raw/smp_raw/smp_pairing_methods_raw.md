# SMP Pairing Methods (配对方法与算法)

> 本文档提取自 Vol 3, Part H Security Manager Specification。

### Page 1649 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part H Page 1650
Security Manager Specification
The inputs to function h7 are:
SALT is 128 bits
W is 128 bits
W is used as input m to the hashing function AES-CMAC and SALT is used as the key
k.
The output of h7 is as follows:
h7(SALT, W) = AES-CMAC (W)
SALT
2.3 Pairing methods
There are two types of pairing: LE legacy pairing and LE Secure Connections pairing.
All Security Manager implementations shall support one of these and may support both.
When pairing is started, the Pairing Feature Exchange shall be initiated by the
initiating device. If the responding device does not support pairing or pairing cannot be
performed then the responding device shall respond using the Pairing Failed message
with the error code “Pairing Not Supported” otherwise it responds with a Pairing
Response message.
The Pairing Feature Exchange is used to exchange IO capabilities, OOB authentication
data availability, authentication requirements, key size requirements and which transport
specific keys to distribute. The IO capabilities, OOB authentication data availability and
authentication requirements are used to determine the key generation method used in
Phase 2.
All of the LE legacy pairing methods use and generate 2 keys:
1. Temporary Key (TK): a 128-bit temporary key used in the pairing process which is
used to generate STK (see Section 2.3.5.5).
2. Short Term Key (STK): a 128-bit temporary key used to encrypt a connection
following pairing.
The LE Secure Connections pairing methods use and generate 1 key:
1. Long Term Key (LTK): a 128-bit key used to encrypt the connection following
pairing and subsequent connections.
Authentication requirements are set by GAP, (see [Vol 3] Part C, Section 10.3).
The authentication requirements include the type of bonding and man-in-the-middle
protection (MITM) requirements.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1650 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part H Page 1651
Security Manager Specification
The initiating device indicates to the responding device which transport specific keys it
would like to send to the responding device and which keys it would like the responding
device to send to the initiator. The responding device replies with the keys that the
initiating device shall send and the keys that the responding device shall send. The keys
that can be distributed are defined in Section 2.4.3. If the device receives a command
with invalid parameters, it shall respond with Pairing Failed command with the error
code “Invalid Parameters.”
2.3.1 Security Properties
Security Properties provided by SM are classified into the following categories:
• LE Secure Connections pairing
• Authenticated MITM protection
• Unauthenticated no MITM protection
• No security requirements
LE Secure Connections pairing utilizes the P-256 elliptic curve (see [Vol 2] Part H,
Section 7.6).
In LE legacy pairing, Authenticated man-in-the-middle (MITM) protection is obtained
by using the out of band pairing method with 128 bits of OOB data entropy and an
OOB channel resistant to eavesdropping and MITM attacks. In LE Secure Connections
pairing, Authenticated man-in-the-middle (MITM) protection is obtained by using the
passkey entry pairing method or the numeric comparison method or may be obtained
using the out of band pairing method. To ensure that Authenticated MITM Protection is
generated, the selected Authentication Requirements option must have MITM protection
specified.
Unauthenticated no MITM Protection does not have protection against MITM attacks.
For LE Legacy Pairing, none of the pairing methods provide protection against a
passive eavesdropper during the pairing process as predictable or easily established
values for TK are used. If the pairing information is distributed without an eavesdropper
being present then all the pairing methods provide confidentiality.
An initiating device shall maintain a record of the Security Properties for the distributed
keys in a security database.
A responding device may maintain a record of the distributed key sizes and Security
Properties for the distributed keys in a security database. Depending upon the key
generation method and negotiated key size a responding device may have to shorten
the key length (see Section 2.3.4) so that the initiator and responder are using identical
keys.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1651 (Original)

Security Properties of the key generated in phase 2 under which the keys are
distributed shall be stored in the security database.
2.3.2 IO capabilities
Input and output capabilities of a device are combined to generate its IO capabilities.
The input capabilities are described in Table 2.3. The output capabilities are described
in Table 2.4.
Capability Description
No input Device does not have the ability to indicate ‘yes’ or ‘no’
Yes / No Device has at least two buttons that can be easily mapped to 'yes' and 'no' or the device
has a mechanism whereby the user can indicate either 'yes' or 'no' (see note below).
Keyboard Device has a numeric keyboard that can input the numbers '0' to '9' and a confirmation.
Device also has at least two buttons that can be easily mapped to 'yes' and 'no' or the
device has a mechanism whereby the user can indicate either 'yes' or 'no' (see note
below).
Table 2.3: User input capabilities
Note: 'yes' could be indicated by pressing a button within a certain time limit otherwise
'no' would be assumed.
Capability Description
No output Device does not have the ability to display or communicate a 6 digit decimal number
Numeric output Device has the ability to display or communicate a 6 digit decimal number
Table 2.4: User output capabilities
The individual input and output capabilities are mapped to a single IO capability for
that device which is used in the pairing feature exchange. The mapping is described in
Table 2.5.
Local output capacity
No output Numeric output
tupni
lacoL
yticapac
BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part H Page 1652
Security Manager Specification
No input NoInputNoOutput DisplayOnly
Yes/No NoInputNoOutput1 DisplayYesNo
Keyboard KeyboardOnly KeyboardDisplay
Table 2.5: IO capabilities mapping
1None of the pairing algorithms can use Yes/No input and no output, therefore NoInputNoOutput is used as
the resulting IO capability.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1652 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part H Page 1653
Security Manager Specification
2.3.3 OOB authentication data
An out of band mechanism may be used to communicate information which is used
during the pairing process. The information shall be a sequence of AD structures (see
[Vol 3] Part C, Section 11).
The OOB data flag shall be set if a device has the peer device's out of band
authentication data. A device uses the peer device's out of band authentication data
to authenticate the peer device. In LE legacy pairing, the out of band method is used if
both the devices have the other device's out of band authentication data available. In LE
Secure Connections pairing, the out of band method is used if at least one device has
the peer device's out of band authentication data available.
2.3.4 Encryption key size
Each device shall have maximum and minimum encryption key length parameters
which defines the maximum and minimum size of the encryption key allowed in octets.
The maximum and minimum encryption key length parameters shall be between 7
octets (56 bits) and 16 octets (128 bits), in 1 octet (8 bit) steps. This is defined by a
profile or device application.
The shorter of the initiating and responding devices’ maximum encryption key length
parameters shall be used as the encryption key size.
Both the initiating and responding devices shall check that the resultant encryption key
size is not shorter than the minimum key size parameter for that device and if it is, the
device shall send the Pairing Failed command with error code “Encryption Key Size”.
The encryption key size may be stored so it can be checked by any service that has
minimum encryption key length requirements.
If a key has an encryption key size that is shorter than 16 octets (128 bits), it shall be
created by masking the appropriate number of most significant octets of the generated
key to provide a resulting key that has the agreed encryption key size. The key shall
be masked after generation and, if required, after the key is used to derive a BR/EDR
link key. The key shall be masked before the key is distributed, used for encryption, or
stored.
For example, if a 128-bit encryption key is
0x12345678_9ABCDEF0_12345678_9ABCDEF0
and it is reduced to 7 octets (56 bits), then the resulting key is
0x00000000_00000000_00345678_9ABCDEF0.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1653 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part H Page 1654
Security Manager Specification
2.3.5 Pairing algorithms
The information exchanged in Phase 1 is used to select which key generation method is
used in Phase 2.
When LE legacy pairing is used, the pairing is performed by each device generating
a Temporary Key (TK). The method to generate TK depends upon the pairing method
chosen using the algorithm described in Section 2.3.5.1. If Just Works is used then
TK shall be generated as defined in Section 2.3.5.2. If Passkey Entry is used then
TK shall be generated as defined in Section 2.3.5.3. If Out Of Band is used then TK
shall be generated as defined in Section 2.3.5.4. The TK value shall be used in the
authentication mechanism defined in Section 2.3.5.5 to generate the STK and encrypt
the link.
2.3.5.1 Selecting key generation method
If both devices have not set the MITM option in the Authentication Requirements Flags,
then the IO capabilities shall be ignored and the Just Works association model shall be
used.
In LE legacy pairing, if both devices have Out of Band authentication data, then the
Authentication Requirements Flags shall be ignored when selecting the pairing method
and the Out of Band pairing method shall be used. Otherwise, the IO capabilities of the
device shall be used to determine the pairing method as defined in Table 2.8.
In LE Secure Connections pairing, if one or both devices have out of band
authentication data, then the Authentication Requirements Flags shall be ignored when
selecting the pairing method and the Out of Band pairing method shall be used.
Otherwise, the IO capabilities of the device shall be used to determine the pairing
method as defined in Table 2.8.
Table 2.6 defines the STK generation method when at least one of the devices does not
support LE Secure Connections.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1654 (Original)

Initiator
OOB Set OOB Not Set
MITM Set MITM Not MITM Set MITM Not
Set Set
rednopseR
OOB MITM Use OOB Use OOB Use IO Capa- Use IO Capa-
Set Set bilities bilities
MITM Use OOB Use OOB Use IO Capa- Use Just
Not Set bilities Works
OOB MITM Use IO Ca- Use IO Ca- Use IO Capa- Use IO Capa-
Not Set Set pabilities pabilities bilities bilities
MITM Use IO Ca- Use Just Use IO Capa- Use Just
Not Set pabilities Works bilities Works
Table 2.6: Rules for using Out-of-Band and MITM flags for LE legacy pairing
Table 2.7 defines the LTK generation method when both devices support LE Secure
Connections.
Initiator
OOB Set OOB Not Set
MITM Set MITM Not MITM Set MITM Not Set
Set
rednopseR
BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part H Page 1655
Security Manager Specification
OOB Set MITM Set Use OOB Use OOB Use OOB Use OOB
MITM Not Use OOB Use OOB Use OOB Use OOB
Set
OOB Not MITM Set Use OOB Use OOB Use IO Capa- Use IO Capa-
Set bilities bilities
MITM Not Use OOB Use OOB Use IO Capa- Use Just
Set bilities Works
Table 2.7: Rules for using Out-of-Band and MITM flags for LE Secure Connections pairing
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1655 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part H Page 1656
Security Manager Specification
Initiator
Responder DisplayOnly Keyboard Only Keyboard
Display NoInput Display
YesNo NoOutput
Display On- Just Works Just Works Passkey Entry: Just Works Passkey Entry:
ly responder dis- responder dis-
Unauthenticated Unauthen- Unauthen-
plays, initiator in- plays, initiator
ticated ticated
puts inputs
(For LE Legacy (For LE Legacy
Pairing): Unau- Pairing): Unau-
thenticated thenticated
(For LE Secure (For LE Secure
Connections): Connections):
Authenticated Authenticated
Display Just Works Just Works Passkey Entry: Just Works Passkey Entry
YesNo (For LE Lega- responder dis- (For LE Legacy
Unauthenticated Unauthen-
cy Pairing) plays, initiator in- Pairing): res-
ticated
puts ponder dis-
Unauthen-
plays, initiator
ticated (For LE Legacy
inputs
Pairing): Unau-
thenticated Unauthen-
ticated
(For LE Secure
Numeric Connections): Numeric Com-
Comparison Authenticated parison (For
(For LE Se- LE Secure
cure Connec- Connections)
tions)
Authenticated
Authenticated
Keyboard Passkey Entry: Passkey En- Passkey Entry: Just Works Passkey Entry:
Only initiator displays, try: initiator initiator and res- initiator dis-
Unauthen-
responder inputs displays, res- ponder input plays, respond-
ticated
ponder inputs er inputs
(For LE Legacy (For LE Legacy
Pairing): Unau- (For LE Lega- Pairing): Unau- (For LE Legacy
thenticated cy Pairing): thenticated Pairing): Unau-
Unauthentica- thenticated
(For LE Secure (For LE Secure
ted
Connections): Connections): (For LE Secure
Authenticated (For LE Se- Authenticated Connections):
cure Connec- Authenticated
tions):
Authenticated
NoInput Just Works Just Works Just Works Just Works Just Works
NoOutput
Unauthenticated Unauthen- Unauthenticated Unauthen- Unauthen-
ticated ticated ticated
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1656 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part H Page 1657
Security Manager Specification
Initiator
Responder DisplayOnly Keyboard Only Keyboard
Display NoInput Display
YesNo NoOutput
Keyboard Passkey Entry: Passkey En- Passkey Entry: Just Works Passkey Entry
Display initiator displays, try (For LE responder dis- (For LE Legacy
Unauthen-
responder inputs Legacy Pair- plays, initiator in- Pairing):
ticated
ing): puts
(For LE Legacy initiator dis-
Pairing): Unau- initiator dis- (For LE Legacy plays, respond-
thenticated plays, res- Pairing): Unau- er inputs
ponder inputs thenticated
(For LE Secure Unauthen-
Connections): Unauthen- (For LE Secure ticated
Authenticated ticated Connections):
Numeric Authenticated Numeric Com-
Comparison parison (For
(For LE Se- LE Secure
cure Connec- Connections)
tions)
Authenticated
Authenticated
Table 2.8: Mapping of IO capabilities to key generation method
The generated key will either be an Authenticated or Unauthenticated key. If the out
of band authentication method is used and the Out of Band mechanism is known to
be secure from eavesdropping the key is assumed to be Authenticated; however, the
exact strength depends upon the method used to transfer the out of band information.
If the Out of Band method is used and the Out of Band mechanism is not secure from
eavesdropping or the level of eavesdropping protection is unknown, the key shall be
Unauthenticated. The mapping of IO capabilities to an authenticated or unauthenticated
key is described in Table 2.8.
In LE legacy pairing, if the initiating device has Out of Band data and the responding
device does not have Out of Band data then the responding device may send the
Pairing Failed command with the error code “OOB Not Available” instead of the Pairing
Response command.
If the key generation method does not result in a key that provides sufficient Security
Properties (see Section 2.3.1) then the device shall send the Pairing Failed command
with the error code “Authentication Requirements”.
2.3.5.2 LE legacy pairing - Just Works
The Just Works STK generation method provides no protection against eavesdroppers
or man in the middle attacks during the pairing process. If the attacker is not present
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1657 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part H Page 1658
Security Manager Specification
during the pairing process then confidentiality can be established by using encryption on
a future connection.
Both devices set the TK value used in the authentication mechanism defined in
Section 2.3.5.5 to zero.
2.3.5.3 LE legacy pairing - Passkey Entry
The Passkey Entry STK generation method uses 6 numeric digits passed out of band
by the user between the devices. A 6 digit numeric randomly generated passkey
achieves approximately 20 bits of entropy.
If the IO capabilities of a device are DisplayOnly or if Table 2.8 defines that the device
displays the passkey, then that device shall display a randomly generated passkey
value between 000,000 and 999,999. The display shall ensure that all 6 digits are
displayed – including zeros. The other device shall allow the user to input a value
between 000,000 and 999,999.
If the IO capabilities of both devices are KeyboardOnly then the user generates a
random 6-digit passkey value and enters it into both devices. Both devices shall allow
the user to input a value between 000,000 and 999,999.
A new passkey shall be generated randomly for each pairing procedure.
If entry of passkey in UI fails to occur or is cancelled then the device shall send Pairing
Failed command with reason code “Passkey Entry Failed”.
For example, if the user entered passkey is ‘019655’ then TK shall be
0x00000000000000000000000000004CC7.
The passkey Entry method does not provide protection against active “man-in-the-
middle” (MITM) attacks.
The Passkey Entry STK generation method provides very limited protection against
eavesdroppers during the pairing process because of the limited range of possible TK
values which STK is dependent upon. If the attacker is not present during the pairing
process then confidentiality and authentication can be established by using encryption
on a future connection.
The TK value shall then be used in the authentication mechanism defined in
Section 2.3.5.5.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1658 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part H Page 1659
Security Manager Specification
2.3.5.4 Out of band
An out of band mechanism may be used to communicate information to help with device
discovery, for example device address, and the 128-bit TK value used in the pairing
process. The TK value shall be a 128-bit random number.
If the OOB communication is resistant to MITM attacks, then this association method
is also resistant to MITM attacks. Also, in the Out of Band method, the size of
authentication parameter (TK) need not be restricted by what the user can comfortably
read or type. For that reason, the Out of Band method can be more secure than
using the Passkey Entry or Just Works methods. However, both devices need to have
matching OOB interfaces.
MITM protection is only provided if an active man-in-the-middle chance of a successful
attack has a probability of 0.000001 or less in succeeding.
2.3.5.5 LE legacy pairing phase 2
The initiating device generates a 128-bit random number (LP_RAND_I).
The initiating device calculates the 128-bit confirm value (LP_CONFIRM_I) using the
confirm value generation function c1 (see Section 2.2.3) with the input parameter k set
to TK, the input parameter r set to LP_RAND_I, the input parameter preq set to Pairing
Request command as exchanged with the peer device (i.e. without any modifications),
the input parameter pres set to the Pairing Response command as exchanged with the
peer device (i.e. without any modifications), the input parameter iat set to the initiating
device address type, ia set to the initiating device address, rat set to the responding
device address type and ra set to the responding device address:
LP_CONFIRM_I = c1(TK, LP_RAND_I,
Pairing Request command, Pairing Response command,
initiating device address type, initiating device address,
responding device address type, responding device address)
Initiating and responding device addresses used for confirmation generation shall be
device addresses used during connection setup, see [Vol 3] Part C, Section 9.3
The responding device generates a 128-bit random number (LP_RAND_R).
The responding device calculates the 128-bit confirm value (LP_CONFIRM_R) using
the confirm value generation function c1 (see Section 2.2.3) with the input parameter
k set to TK, the input parameter r set to LP_RAND_R, the input parameter preq set
to Pairing Request command, the input parameter pres set to the Pairing Response
command, the input parameter iat set to the initiating device address type, ia set to the
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1659 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part H Page 1660
Security Manager Specification
initiating device address, rat set to the responding device address type and ra set to the
responding device address:
LP_CONFIRM_R = c1(TK, LP_RAND_R,
Pairing Request command, Pairing Response command,
initiating device address type, initiating device address,
responding device address type, responding device address)
The initiating device transmits LP_CONFIRM_I to the responding device. When the
responding device receives LP_CONFIRM_I it transmits LP_CONFIRM_R to the
initiating device. When the initiating device receives LP_CONFIRM_R it transmits
LP_RAND_I to the responding device.
The responding device verifies the LP_CONFIRM_I value by repeating the calculation
the initiating device performed, using the LP_RAND_I value received.
If the responding device’s calculated LP_CONFIRM_I value does not match the
received LP_CONFIRM_I value from the initiating device then the pairing process shall
be aborted and the responding device shall send the Pairing Failed command with
reason code “Confirm Value Failed”.
If the responding device’s calculated LP_CONFIRM_I value matches the received
LP_CONFIRM_I value from the initiating device the responding device transmits
LP_RAND_R to the initiating device.
The initiating device verifies the received LP_CONFIRM_R value by repeating the
calculation the responding device performed, using the LP_RAND_R value received.
If the initiating device receives an LP_CONFIRM_R value that is equal to the
LP_CONFIRM_I value or that is not equal to the calculated LP_CONFIRM_R value,
then the pairing process shall be aborted and the initiating device shall send the Pairing
Failed command with the reason code “Confirm Value Failed”.
If the initiating device’s calculated LP_CONFIRM_R value matches the received
LP_CONFIRM_R value from the responding device the initiating device then calculates
STK and tells the Controller to enable encryption.
STK is generated using the key generation function s1 defined in Section 2.2.4 with the
input parameter k set to TK, the input parameter r1 set to LP_RAND_R, and the input
parameter r2 set to LP_RAND_I:
STK = s1(TK, LP_RAND_R, LP_RAND_I)
If the encryption key size is shorter than 128 bits then the STK shall be masked to the
correct key size as described in Section 2.3.4.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1660 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part H Page 1661
Security Manager Specification
The initiator shall use the generated STK to either enable encryption on the link or if
encryption has already been enabled, perform the encryption pause procedure (see
Section 2.4.4.1).
2.3.5.6 LE Secure Connections pairing phase 2
The Long Term Key is generated in LE Secure Connections pairing phase 2.
2.3.5.6.1 Public key exchange
Initially, each device generates its own Elliptic Curve Diffie-Hellman (ECDH) public-
private key pair (phase 1). The public-private key pair contains a private (secret) key,
and a public key. The private keys of devices A and B are denoted as SKa and
SKb respectively. The public keys of devices A and B are denoted as PKa and PKb
respectively. See Section 2.3.6 for recommendations on how frequently this key pair
should be changed.
Pairing is initiated by the initiating device sending its public key to the receiving device
(phase 1a). The responding device replies with its own public key (phase 1b). If the two
public keys have the same X coordinate and neither is the debug key, each device shall
fail the pairing process. These public keys are not regarded as secret although they
may identify the devices.
Initiating Non-initiating
DeviceA DeviceB
PublicKeyExchange
1a.PKa
1b.PKb
StartcomputingDHKey StartcomputingDHKey
DHKey=P256(SKa,PKb) DHKey=P256(SKb,PKa)
Figure 2.2: Public key exchange
A device shall validate that any public key received from any BD_ADDR is on the
correct curve (P-256).
A valid public key Q = (X , Y ) is one where X and Y are both in the range 0 to p -
Q Q Q Q
1 and satisfy the equation (Y )2 = (X )3 + aX + b (mod p) in the relevant curve's finite
Q Q Q
field. See [Vol 2] Part H, Section 7.6 for the values of a, b, and p.
A device can validate a public key by directly checking the curve equation, by
implementing elliptic curve point addition and doubling using formulas that are valid
only on the correct curve, or by other means.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1661 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part H Page 1662
Security Manager Specification
A device that detects an invalid public key from the peer at any point during the LE
Secure Connections pairing process shall not use the resulting LTK, if any.
After the public keys have been exchanged, the device can then start computing the
Diffie-Hellman Key.
When the Security Manager is placed in a Debug mode it shall use the following
Diffie-Hellman private / public key pair:
Private key: 3f49f6d4 a3c55f38 74c9b3e3 d2103f50 4aff607b eb40b799 5899b8a6 cd3c1abd
Public key (X): 20b003d2 f297be2c 5e2c83a7 e9f9a5b9 eff49111 acf4fddb cc030148 0e359de6
Public key (Y): dc809c49 652aeb6d 63329abf 5a52155c 766345c2 8fed3024 741c8ed0 1589d28b
If a device receives this debug public key and it is in a mode in which it cannot accept
the debug key then it may send the Pairing Failed command with the reason set to
"Invalid Parameters".
Note: Only one side (initiator or responder) needs to set Secure Connections debug
mode in order for debug equipment to be able to determine the LTK and, therefore, be
able to monitor the encrypted connection.
2.3.5.6.2 Authentication stage 1 – Just Works or Numeric Comparison
The Numeric Comparison association model will be used during pairing if the MITM
bit is set to 1 in the Authentication Requirements in the Pairing Request PDU
and/or Pairing Response PDU and both devices have IO capabilities set to either
DisplayYesNo or KeyboardDisplay.
The sequence diagram of Authentication stage 1 for the Just Works or Numeric
Comparison protocol from the cryptographic point of view is shown in Figure 2.3.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1662 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part H Page 1663
Security Manager Specification
Initiating Non­initiating
Device A Device B
Authenticationstage1: JustWorks
2a. Select RandomNa 2b. Select RandomNb
3a. Set raandrb to0 3b. Set rbandra to0
3c. Computeconfirmation:
Cb=f4(PKb,PKa,Nb,0)
4. Cb
5. Na
6. Nb
6a. CheckifCb=f4(PKb,PKa,Nb,0)
Ifcheckfails,abort
VaandVbare6 digit
numberstobedisplayed
oneachside,if possible.
7a. Va=g2(PKa,PKb,Na,Nb) 7b. Vb=g2(PKa,PKb,Na,Nb)
USERchecksifVa= Vb
ProceedifeachUSER confirms”OK”
Proceedifuser Proceedifuser
confirms”OK” confirms”OK”
Figure 2.3: "Authentication stage 1: Just Works or Numeric Comparison, LE Secure Connections
After the public keys have been exchanged, each device selects a random 128-bit
nonce (step 2). This value is used to mitigate replay attacks and shall be freshly
generated with each instantiation of the pairing protocol.
Following this the responding device then computes a commitment to the two public
keys that have been exchanged and its own nonce value (step 3c). This commitment
is computed as a one-way function of these values and is transmitted to the initiating
device (step 4). The commitment prevents an attacker from changing these values at a
later time.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1663 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part H Page 1664
Security Manager Specification
The initiating and responding devices then exchange their respective nonce values
(steps 5 and 6) and the initiating device confirms the commitment (step 6a). A failure at
this point indicates the presence of an attacker or other transmission error and causes
the protocol to abort. The protocol may be repeated with or without the generation
of new public-private key pairs, but new nonces shall be generated if the protocol is
repeated.
When Just Works is used, the commitment checks (steps 7a and 7b) are not performed
and the user is not shown the 6-digit values.
When Numeric Comparison is used, assuming that the commitment check succeeds,
the two devices each compute 6-digit confirmation values that are displayed to the user
on their respective devices (steps 7a, 7b, and 8). The user is expected to check that
these 6-digit values match and to confirm if there is a match. If there is no match, the
protocol aborts and, as before, new nonces shall be generated if the protocol is to be
repeated.
An active MITM must inject its own key material into this process to have any effect
other than denial-of-service. A simple MITM attack will result in the two 6-digit display
values being different with probability 0.999999. A more sophisticated attack may
attempt to engineer the display values to match, but this is thwarted by the commitment
sequence. If the attacker first exchanges nonces with the responding device, it must
commit to the nonce that it will use with the initiating device before it sees the nonce
from the initiating device. If the attacker first exchanges nonces with the initiating
device, it must send a nonce to the responding device before seeing the nonce from
the responding device. In each case, the attacker must commit to at least the second
of its nonces before knowing the second nonce from the legitimate devices. It therefore
cannot choose its own nonces in such a way as to cause the display values to match.
2.3.5.6.3 Authentication stage 1 – Passkey Entry
The Passkey Entry protocol is used when SMP IO capability exchange sequence
indicates that Passkey Entry shall be used.
The sequence diagram for Authentication stage 1 for Passkey Entry from the
cryptographic point of view is shown in Figure 2.4.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1664 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part H Page 1665
Security Manager Specification
Initiating Non­initiating
Device A Device B
Authenticationstage1: PasskeyEntry
2a. Injectsecretra, 2b. Injectsecretrb,
setrb=ra setra=rb
Execute 20 times:
ra = ra1 | ra2 | … ra20
rb = rb1 | rb2 | … rb20
New random numbers are
selected in each round
3a. SelectrandomNai 3b. SelectrandomNbi
4a. Computeconfirm: 4b. Computeconfirm:
Cai=f4(PKa,PKb,Nai,rai) Cbi=f4(PKb,PKa,Nbi,rbi)
5. Cai
6. Cbi
7. Nai
7a. Checkif
Cai=f4(PKa,PKb,Nai,rbi).
Ifcheckfails,abort.
8. Nbi
8a. Checkif
Cbi=f4(PKb,PKa,Nbi,rai).
Ifcheckfails,abort.
Figure 2.4: Authentication stage 1: Passkey Entry, LE Secure Connections
The user inputs an identical Passkey into both devices. Alternately, the Passkey may be
generated and displayed on one device, and the user then inputs it into the other (step
2). This short shared key will be the basis of the mutual authentication of the devices. A
new Passkey shall be generated randomly for each pairing procedure.
Steps 3 to 8 are repeated 20 times since a 6-digit Passkey is 20 bits
(999999=0xF423F). If the device allows a shorter passkey to be entered, it shall be
prefixed with zeros (e.g. “1234” is equivalent to “001234”).
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1665 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part H Page 1666
Security Manager Specification
In Steps 3 to 8, each side commits to each bit of the Passkey, using a long nonce (128
bits), and sending the hash of the nonce, the bit of the Passkey, and both public keys to
the other party. The parties then take turns revealing their commitments until the entire
Passkey has been mutually disclosed. The first party to reveal a commitment for a given
bit of the Passkey effectively reveals that bit of the Passkey in the process, but the other
party then has to reveal the corresponding commitment to show the same bit value for
that bit of the Passkey, or else the first party will then abort the protocol, after which no
more bits of the Passkey are revealed.
This "gradual disclosure" prevents leakage of more than 1 bit of un-guessed Passkey
information in the case of a MITM attack. A MITM attacker with only partial knowledge
of the Passkey will only receive one incorrectly-guessed bit of the Passkey before the
protocol fails. Hence, a MITM attacker who engages first one side, then the other will
only gain an advantage of at most two bits over a simple brute-force guesser, making
the probability of success 0.000004 instead of 0.000001.
The long nonce is included in the commitment hash to make it difficult to brute force
even after the protocol has failed. The public Diffie-Hellman values are included to tie
the Passkey protocol to the original ECDH key exchange, to prevent a MITM from
substituting the attacker's public key on both sides of the ECDH exchange in standard
MITM fashion.
At the end of this stage, Na is set to Na20 and Nb is set to Nb20 for use in
Authentication stage 2.
2.3.5.6.4 Authentication stage 1 – Out of Band
The Out-of-Band protocol is used when authentication information has been received
by at least one of the devices and indicated in the OOB data flag parameter included
in the SMP Pairing Request and SMP Pairing Response PDU. The mode in which the
discovery of the peer device is first done in-band and then followed by the transmission
of authentication parameters through OOB interface is not supported. The sequence
diagram for Authentication stage 1 for Out of Band from the cryptographic point of view
is shown in Figure 2.5.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1666 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part H Page 1667
Security Manager Specification
Initiating Non-initiating
DeviceA DeviceB
Authenticationstage1:OutofBand
2a.Setra=rand,rb=0 2b.Setrb=rand,ra=0
3a.Computeconfirm: 3b.Computeconfirm:
Ca=f4(PKa,PKa,ra,0) Cb=f4(PKb,PKb,rb,0)
andsend4a. andsend4b.
OOBCommunication
A=DeviceAddressusedduringpairing
B=DeviceAddressusedduringpairing
4a.A,ra,Ca
4b.B,rb,Cb
SecurityManagerPairingbegins
5a.If4breceivedresetrb 5b.If4areceivedresetra
tothereceivedvalue,and tothereceivedvalue,and
ifCb≠f4(PKb,PKb,rb,0) ifCa≠f4(PKa,PKa,ra,0)
abort.If4breceivedand abort.If4areceivedand
DeviceB’sIOdataflag DeviceA’sIOdataflag
doesnotindicateOOB doesnotindicateOOB
authenticationdata authenticationdata
present,setra=0 present,setrb=0
6a.SelectrandomNa 6b.SelectrandomNb
7.Na
8.Nb
Figure 2.5: Authentication stage 1: Out of Band, LE Secure Connections
Principle of operation. If both devices can transmit and/or receive data over an
out-of-band channel, then mutual authentication will be based on the commitments
of the public keys (Ca and Cb) exchanged OOB in Authentication stage 1. If OOB
communication is possible only in one direction, then authentication of the device
receiving the OOB communication will be based on that device knowing a random
number r sent via OOB. In this case, r must be secret: r can be created afresh every
time, or access to the device sending r must be restricted. If r is not sent by a device, it
is assumed to be 0 by the device receiving the OOB information in step 4a or 4b.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1667 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part H Page 1668
Security Manager Specification
Roles of A and B. The OOB Authentication stage 1 protocol is symmetric with respect
to the roles of A and B. It does not require that device A always will initiate pairing and it
automatically resolves asymmetry in the OOB communication.
Order of steps. The public key exchange must happen before the verification step 5.
In the diagram the in-band public key exchange between the devices (step 1) is done
before the OOB communication (step 4). But when the pairing is initiated by an OOB
interface, public key exchange will happen after the OOB communication (step 1 will be
between steps 4 and 5).
Values of ra and rb: Since the direction of the peer's OOB interface cannot be verified
before the OOB communication takes place, a device should always generate and if
possible transmit through its OOB interface a random number r to the peer. Each device
applies the following rules locally to set the values of its own r and the value of the
peer's r:
1. Initially, r of the device is set to a random number and r of the peer is set to 0 (step
2).
2. If a device has received OOB, it sets the peer's r value to what was sent by the
peer (Step 5).
3. If the remote device's OOB data flag sent in the SMP Pairing Request or SMP
Pairing Response is set to “OOB Authentication data not present”, it sets its own r
value to 0 (Step 5)
2.3.5.6.5 Authentication stage 2 and long term key calculation
The second stage of authentication then confirms that both devices have successfully
completed the exchange. This stage is identical in all three protocols and is shown in
Figure 2.6.
Each device computes the MacKey and the LTK using the previously exchanged values
and the newly derived shared key (step 9). Each device then computes a new key
confirmation value that includes the previously exchanged values and the newly derived
MacKey (step 10a and 10b). The initiating device then transmits its key confirmation
value, which is checked by the responding device (step 11). If this check fails, it
indicates that the initiating device has not confirmed the pairing, and the protocol shall
be aborted. The responding device then transmits its key confirmation value, which is
checked by the initiating device (step 12). A failure indicates that the responding device
has not confirmed the pairing and the protocol shall abort.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1668 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part H Page 1669
Security Manager Specification
Initiating Non­initiating
Device A Device B
Authenticationstage2: LTKCalculation
IOcapAisfromPairing Requestcommand
IOcapBisfromPairing Responsecommand
A=DeviceAddress ofAused duringpairing
B=DeviceAddress ofBused duringpairing
9. Compute theLTKandMacKey: 9. Compute theLTKandMacKey:
MacKey||LTK= f5(DHKey,Na,Nb,A,B) MacKey||LTK= f5(DHKey,Na,Nb,A,B)
10a. Compute: EA= 10b. Compute: EB=
f6(MacKey,Na,Nb,rb,IOcapA,A,B) f6(MacKey,Nb,Na,ra,IOcapB,B,A)
10. Ea
11. Check ifEa=
f6(MacKey,Na,Nb,rb,IOcapA,A,B)
Ifcheckfails,abort.
12. Eb
12a. Check ifEb=
f6(MacKey,Nb,Na,ra,IOcapB,B,A)
Ifcheckfails,abort.
Figure 2.6: Authentication stage 2 and long term key calculation
2.3.5.7 Cross-transport key derivation
When a pair of BR/EDR/LE devices support Secure Connections on a transport, the
devices may generate a key of identical strength for the other transport. There are two
sequences:
• If Secure Connections pairing occurs on the LE transport, the procedures in
Section 2.4.2.4 may be used.
• If Secure Connections pairing occurs on the BR/EDR transport, the procedures in
Section 2.4.2.5 may be used.
2.3.6 Repeated attempts
When a pairing procedure fails a waiting interval shall pass before the verifier will
initiate a new Pairing Request command or Security Request command to the same
claimant, or before it will respond to a Pairing Request command or Security Request
command initiated by a device claiming the same identity as the failed device. For
Bluetooth SIG Proprietary Version Date: 2025-11-03
