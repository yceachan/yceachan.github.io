# GATT Hierarchy (服务与特征层级)

> 本文档提取自 Vol 3, Part G GATT Specification。

### Page 1565 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part G Page 1566
Generic Attribute Profile (GATT)
3 SERVICE INTEROPERABILITY REQUIREMENTS
3.1 Service definition
A service definition shall contain a service declaration and may contain include
definitions and characteristic definitions. The service definition ends before the next
service declaration or after the maximum Attribute Handle is reached. Service
definitions appear on the server in an order based on Attribute Handle.
All include definitions and characteristic definitions contained within the service
definition are considered to be part of the service. All include definitions shall
immediately follow the service declaration and precede any characteristic definitions. A
service definition may have zero or more include definitions. All characteristic definitions
shall be immediately following the last include definition or, in the event of no include
definitions, immediately following the service declaration. A service definition may
have zero or more characteristic definitions. There is no upper limit for include or
characteristic definitions.
A service declaration is an Attribute with the Attribute Type set to the UUID for «Primary
Service» or «Secondary Service». The Attribute Value shall be the 16-bit Bluetooth
UUID or 128-bit UUID for the service, known as the service UUID. A client shall
support the use of both 16-bit and 128-bit UUIDs. A client may ignore any service
definition with an unknown service UUID. An unknown service UUID is a UUID for an
unsupported service. The Attribute Permissions shall be read-only and shall not require
authentication or authorization.
When multiple services exist, services definitions with service declarations using 16-
bit Bluetooth UUID should be grouped together (i.e. listed sequentially) and services
definitions with service declarations using 128-bit UUID should be grouped together.
Attribute Attribute Type Attribute Value Attribute Permission
Handle
0xNNNN 0x2800 – UUID for «Primary 16-bit Bluetooth UUID or Read Only,
Service» OR 0x2801 for «Sec- 128-bit UUID for Service
No Authentication,
ondary Service»
No Authorization
Table 3.1: Service declaration
A device or higher level specification may have multiple service definitions and may
have multiple service definitions with the same service UUID.
All Attributes on a server shall either contain a service declaration or exist within a
service definition.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1566 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part G Page 1567
Generic Attribute Profile (GATT)
Service definitions contained in a server may appear in any order; a client shall not
assume the order of service definitions on a server.
3.2 Include definition
An include definition shall contain only one include declaration.
The include declaration is an Attribute with the Attribute Type set to the UUID for
«Include». The Attribute Value shall be set to the included service Attribute Handle,
the End Group Handle, and the service UUID. The Service UUID shall only be present
when the UUID is a 16-bit Bluetooth UUID.The Attribute Permissions shall be read only
and not require authentication or authorization.
Attribute Attribute Attribute Value Attribute Permission
Handle Type
0xNNNN 0x2802 – Included Service End Group Service Read Only,
UUID for Attribute Handle Handle UUID
No Authentication,
«Include»
No Authorization
Table 3.2: Include declaration
A server shall not contain a service definition with an include definition to another
service that includes the original service. This applies to each of the services the
included definition references. This is referred to as a circular reference.
If the client detects a circular reference or detects nested include declarations to a
greater level than it expects, it should terminate or stop using the ATT bearer.
3.3 Characteristic definition
A characteristic definition shall contain a characteristic declaration, a Characteristic
Value declaration and may contain characteristic descriptor declarations. A
characteristic definition ends at the start of the next characteristic declaration or service
declaration or after the maximum Attribute Handle. Characteristic definitions appear on
the server within a service definition in an order based on Attribute Handle.
Each declaration above is contained in a separate Attribute. The two required
declarations are the characteristic declaration and the Characteristic Value declaration.
The Characteristic Value declaration shall exist immediately following the characteristic
declaration. Any optional characteristic descriptor declarations are placed after the
Characteristic Value declaration. The order of the optional characteristic descriptor
declarations is not significant.
A characteristic definition may be defined to concatenate several Characteristic Values
into a single aggregated Characteristic Value. This may be used to optimize read
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1567 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part G Page 1568
Generic Attribute Profile (GATT)
and writes of multiple Characteristic Values through the reading and writing of a
single aggregated Characteristic Value. This type of characteristic definition is the
same as a normal characteristic definition. The characteristic declaration shall use
a characteristic UUID that is unique to the aggregated characteristic definition. The
aggregated characteristic definition may also contain a characteristic aggregate format
descriptor that describes the display format of the aggregated Characteristic Value.
3.3.1 Characteristic declaration
A characteristic declaration is an Attribute with the Attribute Type set to the UUID for
«Characteristic» and Attribute Value set to the Characteristic Properties, Characteristic
Value Attribute Handle and Characteristic UUID. The Attribute Permissions shall be
readable and not require authentication or authorization.
If the server changes any characteristic declaration Attribute Value while the server has
a trusted relationship with any client, then it shall send each client a Service Changed
Indication indicating a change in the service holding the Characteristic Declaration (see
Section 7.1).
Attribute Attribute Attribute Value Attribute Permissions
Handle Types
0xNNNN 0x2803–UUID Character- Characteristic Character- Read Only,
for «Character- istic Proper- Value Attribute istic UUID
No Authentication,
istic» ties Handle
No Authorization
Table 3.3: Characteristic declaration
The Attribute Value of a characteristic declaration is read only.
Attribute Value Size Description
Characteristic Properties 1 octets Bit field of characteristic properties
Characteristic Value Handle 2 octets Handle of the Attribute containing the value of this
characteristic
Characteristic UUID 2 or 16 octets 16-bit Bluetooth UUID or 128-bit UUID for Character-
istic Value
Table 3.4: Attribute Value field in characteristic declaration
A service may have multiple characteristic definitions with the same Characteristic
UUID.
Within a service definition, some characteristics may be mandatory and those
characteristics shall be located after the include declarations and before any optional
characteristics within the service definition. A client shall not assume any order
of those characteristics that are mandatory or any order of those characteristics
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1568 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part G Page 1569
Generic Attribute Profile (GATT)
that are optional within a service definition. Whenever possible and within the
requirements stated earlier, characteristics definitions with characteristic declarations
using 16-bit Bluetooth UUIDs should be grouped together (i.e. listed sequentially) and
characteristics definitions with characteristic declarations using 128-bit UUIDs should be
grouped together.
3.3.1.1 Characteristic Properties
The Characteristic Properties bit field determines how the Characteristic Value can be
used, or how the characteristic descriptors (see Section 3.3.3) can be accessed. If the
bits defined in Table 3.5 are set, the action described is permitted. Multiple characteristic
properties can be set.
These bits shall be set according to the procedures allowed for this characteristic, as
defined by higher layer specifications, without regard to security requirements.
Properties Value Description
Broadcast 0x01 If set, permits broadcasts of the Characteristic Value using Server Charac-
teristic Configuration Descriptor. If set, the Server Characteristic Configu-
ration Descriptor shall exist.
Read 0x02 If set, permits reads of the Characteristic Value using procedures defined
in Section 4.8
Write Without 0x04 If set, permit writes of the Characteristic Value without response using
Response procedures defined in Section 4.9.1.
Write 0x08 If set, permits writes of the Characteristic Value with response using proce-
dures defined in Section 4.9.3 or Section 4.9.4.
Notify 0x10 If set, permits notifications of a Characteristic Value without acknowledg-
ment using the procedure defined in Section 4.10. If set, the Client Char-
acteristic Configuration Descriptor shall exist.
Indicate 0x20 If set, permits indications of a Characteristic Value with acknowledgment
using the procedure defined in Section 4.11. If set, the Client Characteris-
tic Configuration Descriptor shall exist.
Authenticated 0x40 If set, permits signed writes to the Characteristic Value using the proce-
Signed Writes dure defined in Section 4.9.2.
Extended Prop- 0x80 If set, additional characteristic properties are defined in the Characteristic
erties Extended Properties Descriptor defined in Section 3.3.3.1. If set, the Char-
acteristic Extended Properties Descriptor shall exist.
Table 3.5: Characteristic Properties bit field
3.3.1.2 Characteristic Value Attribute Handle
The Characteristic Value Attribute Handle field is the Attribute Handle of the Attribute
that contains the Characteristic Value.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1569 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part G Page 1570
Generic Attribute Profile (GATT)
3.3.1.3 Characteristic UUID
The Characteristic UUID field is a 16-bit Bluetooth UUID or 128-bit UUID that describes
the type of Characteristic Value. A client shall support the use of both 16-bit and 128-bit
Characteristic UUIDs. A client may ignore any characteristic definition with an unknown
Characteristic UUID. An unknown characteristic UUID is a UUID for an unsupported
characteristic.
3.3.2 Characteristic Value declaration
The Characteristic Value declaration contains the value of the characteristic. It is the
first Attribute after the characteristic declaration. All characteristic definitions shall have
a Characteristic Value declaration.
A Characteristic Value declaration is an Attribute with the Attribute Type set to the
16-bit Bluetooth or 128-bit UUID for the Characteristic Value used in the characteristic
declaration. The Attribute Value is set to the Characteristic Value.
Attribute Attribute Type Attribute Value Attribute Permissions
Handle
0xNNNN 0xUUUU – 16-bit Bluetooth Characteristic Val- Higher layer profile or imple-
UUID or 128-bit UUID for ue mentation specific
Characteristic UUID
Table 3.6: Characteristic Value declaration
3.3.3 Characteristic descriptor declarations
Characteristic descriptors are used to contain related information about the
Characteristic Value. The GATT profile defines a standard set of characteristic
descriptors that can be used by higher layer profiles. Higher layer profiles may
define additional characteristic descriptors that are profile specific. Each characteristic
descriptor is identified by the characteristic descriptor UUID. A client shall support the
use of both 16-bit and 128-bit characteristic descriptor UUIDs. A client may ignore any
characteristic descriptor declaration with an unknown characteristic descriptor UUID. An
unknown characteristic descriptor UUID is a UUID for an unsupported characteristic
descriptor.
Characteristic descriptors if present within a characteristic definition shall follow the
Characteristic Value declaration. The characteristic descriptor declaration may appear
in any order within the characteristic definition. The client shall not assume the order
in which a characteristic descriptor declaration appears in a characteristic definition
following the Characteristic Value declaration.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1570 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part G Page 1571
Generic Attribute Profile (GATT)
Characteristic descriptor declaration permissions may be defined by a higher layer
profile or are implementation specific. A client shall not assume all characteristic
descriptor declarations are readable.
3.3.3.1 Characteristic Extended Properties
The Characteristic Extended Properties declaration is a descriptor that defines
additional Characteristic Properties. If the Extended Properties bit of the Characteristic
Properties is set then this characteristic descriptor shall exist. The characteristic
descriptor may occur in any position within the characteristic definition after the
Characteristic Value. Only one Characteristic Extended Properties declaration shall exist
in a characteristic definition.
The characteristic descriptor is contained in an Attribute and the Attribute Type shall
be set to the UUID for «Characteristic Extended Properties» and the Attribute Value
shall be two octets in length and shall contain the Characteristic Extended Properties Bit
Field.
Attribute Attribute Type Attribute Value Attribute Permissions
Handle
0xNNNN 0x2900 – UUID for «Charac- Characteristic Extended Read Only,
teristic Extended Properties» Properties Bit Field
No Authentication,
No Authorization
Table 3.7: Characteristic Extended Properties declaration
The Characteristic Extended Properties bit field describes additional properties on
how the Characteristic Value can be used, or how the characteristic descriptors (see
Section 3.3.3.3) can be accessed. If the bits defined in Table 3.8 are set, the action
described is permitted. Multiple additional properties can be set.
Bit Number Property Description
0 Reliable Write If set, permits reliable writes of the Characteristic Value using the
procedure defined in Section 4.9.5
1 Writable Auxiliaries If set, permits writes to the characteristic descriptor defined in
Section 3.3.3.2
All other bits Reserved for future use
Table 3.8: Characteristic Extended Properties bit field
3.3.3.2 Characteristic User Description
The Characteristic User Description declaration is an optional characteristic descriptor
that defines a UTF-8 string of variable size that is a user textual description of
the Characteristic Value. If the Writable Auxiliaries bit of the Characteristic Extended
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1571 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part G Page 1572
Generic Attribute Profile (GATT)
Properties is set then this characteristic descriptor can be written. The characteristic
descriptor may occur in any position within the characteristic definition after the
Characteristic Value. Only one Characteristic User Description declaration shall exist
in a characteristic definition.
The characteristic descriptor is contained in an Attribute and the Attribute Type shall be
set to the UUID for «Characteristic User Description» and the Attribute Value shall be
set to the characteristic user description UTF-8 string.
Attribute Attribute Type Attribute Value Attribute Permissions
Handle
0xNNNN 0x2901 – UUID for Characteristic User De- Higher layer profile or imple-
«Characteristic User De- scription UTF-8 String mentation specific
scription»
Table 3.9: Characteristic User Description declaration
3.3.3.3 Client Characteristic Configuration
The Client Characteristic Configuration declaration is an optional characteristic
descriptor that defines how the characteristic may be configured by a specific client.
The Client Characteristic Configuration descriptor value shall be persistent across
connections for bonded devices. The Client Characteristic Configuration descriptor
value shall be set to the default value at each connection with non-bonded devices.The
characteristic descriptor value is a bit field. When a bit is set, that action shall
be enabled, otherwise it will not be used. The Client Characteristic Configuration
descriptor may occur in any position within the characteristic definition after the
Characteristic Value. Only one Client Characteristic Configuration declaration shall exist
in a characteristic definition.
A client may write this configuration descriptor to control the configuration of this
characteristic on the server for the client. Each client has its own instantiation of the
Client Characteristic Configuration. Reads of the Client Characteristic Configuration
only shows the configuration for that client and writes only affect the configuration of
that client. Authentication and authorization may be required by the server to write
the configuration descriptor. The Client Characteristic Configuration declaration shall be
readable and writable.
The characteristic descriptor is contained in an Attribute. The Attribute Type shall be set
to the UUID for «Client Characteristic Configuration». The Attribute Value shall be two
octets in length and shall be set to the characteristic descriptor value.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1572 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part G Page 1573
Generic Attribute Profile (GATT)
Attribute Attribute Type Attribute Value Attribute Permissions
Handle
0xNNNN 0x2902 – UUID for Characteristic Readable with no authentication or authoriza-
«Client Character- Configuration tion.
istic Configuration» Bits
Writable with authentication and authorization
defined by a higher layer specification or is
implementation specific.
Table 3.10: Client Characteristic Configuration declaration
The following Client Characteristic Configuration bits are defined:
Bit Number Configuration Description
0 Notification The Characteristic Value shall be notified. This value shall only be set
if the characteristic’s properties have the notify bit set.
1 Indication The Characteristic Value shall be indicated. This value shall only be
set if the characteristic’s properties have the indicate bit set.
All other bits Reserved for future use.
Table 3.11: Client Characteristic Configuration bit field definition
If both the Notification and Indication bits are set, then the server shall use the
notification procedure (see Section 4.10) when an acknowledgment is not required by a
higher-layer specification or shall use the indication procedure (see Section 4.11) when
an acknowledgment is required. The server should not use both procedures to send the
same characteristic value.
The server may reject a request to set both the Notification and Indication bits for the
same characteristic.
The default value for the Client Characteristic Configuration descriptor value shall be
0x0000.
Between a client and a server there shall be a single Client Characteristic Configuration
Descriptor irrespective of the number of ATT bearers between them.
3.3.3.4 Server Characteristic Configuration
The Server Characteristic Configuration declaration is an optional characteristic
descriptor that defines how the characteristic may be configured for the server. The
characteristic descriptor value is a bit field. When a bit is set, that action shall
be enabled, otherwise it will not be used. The Server Characteristic Configuration
descriptor may occur in any position within the characteristic definition after the
Characteristic Value. Only one Server Characteristic Configuration declaration shall
exist in a characteristic definition. The Server Characteristic Configuration declaration
shall be readable and writable.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1573 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part G Page 1574
Generic Attribute Profile (GATT)
A client may write this configuration descriptor to control the configuration of this
characteristic on the server for all clients. There is a single instantiation of the
Server Characteristic Configuration for all clients. Reads of the Server Characteristic
Configuration shows the configuration all clients and writes affect the configuration for
all clients. Authentication and authorization may be required by the server to write the
configuration descriptor.
The characteristic descriptor is contained in an Attribute. The Attribute Type shall be set
to the UUID for «Server Characteristic Configuration». The Attribute Value shall be two
octets in length and shall be set to the characteristic descriptor value.
Attribute Attribute Type Attribute Value Attribute Permissions
Handle
0xNNNN 0x2903 – UUID for Characteristic Readable with no authentication or authoriza-
«Server Character- Configuration tion.
istic Configuration» Bits
Writable with authentication and authorization
defined by a higher layer specification or is
implementation specific.
Table 3.12: Server Characteristic Configuration declaration
The following Server Characteristic Configuration bits are defined:
Bit Number Configuration Description
0 Broadcast The Characteristic Value shall be broadcast when the server is in
the broadcast procedure if advertising data resources are available.
This value can only be set if the characteristic’s properties have the
broadcast bit set.
All other bits Reserved for future use.
Table 3.13: Server Characteristic Configuration bit field definition
3.3.3.5 Characteristic Presentation Format
The Characteristic Presentation Format declaration is an optional characteristic
descriptor that defines the format of the Characteristic Value. The characteristic
descriptor may occur in any position within the characteristic definition after the
Characteristic Value. If more than one Characteristic Presentation Format declaration
exists in a characteristic definition, then a Characteristic Aggregate Format declaration
shall exist as part of the characteristic definition.
The characteristic presentation format value is composed of five parts: format,
exponent, unit, name space, and description.
The characteristic descriptor is contained in an Attribute. The Attribute Type shall be set
to the UUID for «Characteristic Presentation Format». The Attribute Value shall be set
to the characteristic descriptor value.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1574 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part G Page 1575
Generic Attribute Profile (GATT)
Attribute Attribute Type Attribute Value Attribute
Handle Permissions
0xNNNN 0x2904 – UUID For- Expo- Unit Name De- Read only
for «Characteris- mat nent Space scrip-
No Authentication,
tic Presentation tion
Format» No Authorization
Table 3.14: Characteristic Presentation Format declaration
The definition of the Characteristic Presentation Format descriptor Attribute Value field
is the following.
Field Name Value Size Description
Format 1 octet Format of the value of this characteristic as defined in [1].
Exponent 1 octet Exponent field to determine how the value of this characteristic is further
formatted.
Unit 2 octets The unit of this characteristic as defined in [1]
Name Space 1 octet The name space of the description as defined in [1]
Description 2 octets The description of this characteristic as defined in a higher layer profile.
Table 3.15: Characteristic Presentation Format value definition
3.3.3.5.1 Bit ordering
The bit ordering used for the Characteristic Presentation Format descriptor shall be
little-endian.
3.3.3.5.2 Format
The format field determines how a single value contained in the Characteristic Value is
formatted. The values of this field are defined in Assigned Numbers [1].
3.3.3.5.3 Exponent
The exponent field is used with integer data types to indicate that the actual value being
represented differs from the value stored in the characteristic by a power of 10. The
exponent field is only used on integer format types; this field is RFU for all other format
types. The exponent field has type sint8.
actual value = Characteristic Value × 10Exponent
As can be seen in the above equation, the actual value is a combination of the
Characteristic Value and the value 10 to the power Exponent. This is sometimes known
as a fixed point number.
For example, if the Exponent is 2 and the Characteristic Value is 23, the actual value
would be 2300.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1575 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part G Page 1576
Generic Attribute Profile (GATT)
For example, if the Exponent is -3 and the Characteristic Value is 3892, the actual value
would be 3.892.
3.3.3.5.4 Unit
The Unit is a UUID as defined in Assigned Numbers [1].
3.3.3.5.5 Name Space
The Name Space field is used to identify the organization, as defined in Assigned
Numbers [1], that is responsible for defining the enumerations for the description field.
3.3.3.5.6 Description
The Description is an enumerated value as defined in Assigned Numbers [1] from the
organization identified by the Name Space field. The Description is used to distinguish
between different instances of the same characteristic; for example, if a sound system
has several speakers each with a "volume" characteristic, the Description would identify
which speaker a given characteristic refers to.
3.3.3.6 Characteristic Aggregate Format
The Characteristic Aggregate Format declaration is an optional characteristic descriptor
that defines the format of an aggregated Characteristic Value.
The characteristic descriptor may occur in any position within the characteristic
definition after the Characteristic Value. Only one Characteristic Aggregate Format
declaration shall exist in a characteristic definition.
The Characteristic Aggregate Format value is composed of a list of Attribute Handles of
Characteristic Presentation Format declarations, where each Attribute Handle points to
a Characteristic Presentation Format declaration.
Attribute Attribute Type Attribute Value Attribute Permissions
Handle
0xNNNN 0x2905 – UUID for List of Attribute Handles for the Read only
«Characteristic Aggre- Characteristic Presentation For-
No authentication
gate Format» mat Declarations
No authorization
Table 3.16: Characteristic Aggregate Format declaration
The List of Attribute Handles is the concatenation of multiple 16-bit Attribute Handle
values into a single Attribute Value. The list shall contain at least two Attribute Handles
for Characteristic Presentation Format declarations. The Characteristic Value shall be
decomposed by each of the Characteristic Presentation Format declarations pointed to
by the Attribute Handles. The order of the Attribute Handles in the list is significant.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1576 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part G Page 1577
Generic Attribute Profile (GATT)
If more than one Characteristic Presentation Format declaration exists in a
characteristic definition, there shall also be one Characteristic Aggregate Format
declaration. The Characteristic Aggregate Format declaration shall include each
Characteristic Presentation Format declaration in the characteristic definition in the
list of Attribute Handles. Characteristic Presentation Format declarations from other
characteristic definitions may also be used.
A Characteristic Aggregate Format declaration may exist without a Characteristic
Presentation Format declaration existing in the characteristic definition. The
Characteristic Aggregate Format declaration may use Characteristic Presentation
Format declarations from other characteristic definitions.
3.4 Summary of GATT Profile attribute types
Table 3.17 summarizes the attribute types defined by the GATT Profile.
Attribute Type UUID Description
«Primary Service» 0x2800 Primary Service Declaration
«Secondary Service» 0x2801 Secondary Service Declaration
«Include» 0x2802 Include Declaration
«Characteristic» 0x2803 Characteristic Declaration
«Characteristic Extended Properties» 0x2900 Characteristic Extended Properties
«Characteristic User Description» 0x2901 Characteristic User Description Descriptor
«Client Characteristic Configuration» 0x2902 Client Characteristic Configuration Descriptor
«Server Characteristic Configuration» 0x2903 Server Characteristic Configuration Descriptor
«Characteristic Presentation Format» 0x2904 Characteristic Presentation Format Descriptor
«Characteristic Aggregate Format» 0x2905 Characteristic Aggregate Format Descriptor
Table 3.17: Summary of GATT Profile attribute types
Bluetooth SIG Proprietary Version Date: 2025-11-03
