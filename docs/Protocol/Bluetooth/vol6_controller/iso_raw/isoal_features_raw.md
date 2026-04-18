# ISOAL Features (Framed vs Unframed PDU)

> 本文档提取自 Vol 6, Part G Isochronous Adaptation Layer (ISOAL)。

### Page 3763 (Original)

2 ISOAL FEATURES
Figure 2.1 shows the architectural diagram of the ISOAL. The multiplexer in Figure 2.1
shows the route of SDUs to either unframed PDU or framed PDU path.
Isochronous Data
Upper
Layer
(SDUs)
Multiplexer
ISO
Adaptation Fragmentation/ Segmentation/
Layer
Recombination Reassembly
(ISOAL)
Encapsulation with
TimeOffset
Framed
PDUs
Lower
Layer
Baseband Resource Manager
Manager
ISO
Adaptation
BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 6, Part G Page 3764
Isochronous Adaptation Layer
Unframed
PDUs
Figure 2.1: ISOAL architectural blocks
• Fragmentation and recombination
The fragmentation process splits an SDU into one or more fragments which are
carried by one or more unframed PDUs (see Section 4) in a Connected or Broadcast
Isochronous Stream. A fragment shall contain only isochronous data. An SDU with a
length less than or equal to the Max_PDU shall be sent in a single unframed PDU. An
SDU with a length greater than the Max_PDU shall be sent in multiple fragments in
multiple unframed PDUs. The fragmentation process shall use the minimum number
of unframed PDUs to transmit the SDU. The recombination process generates an
SDU from one or more fragments received in unframed PDUs.
• Segmentation and reassembly
The segmentation process splits an SDU into one or more segments which are
carried by one or more framed PDUs (see Figure 2.1) in a Connected or Broadcast
Isochronous Stream. A segment shall contain a Segmentation Header (see Section
3) and may contain Time_Offset and isochronous data. The reassembly process
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 3764 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 6, Part G Page 3765
Isochronous Adaptation Layer
combines data from one or more segments received in framed PDUs and generates
one or more SDUs.
• Encapsulation and Time_Offset
In the encapsulation process Segmentation Headers and a Time_Offset parameter
are added before the first segment of each new SDU allowing timing reconstruction at
the peer device (see Section 3.)
Unframed PDUs shall only be used when the ISO_Interval is equal to or an integer
multiple of the SDU_Interval and a constant time offset alignment is maintained between
the SDU generation and the timing in the isochronous transport. This requires the upper
layer to synchronize generation of its data to the effective transport timing. When the
Host requests the use of framed PDUs, the Controller shall use framed PDUs.
Framed PDUs are not restricted by the limitations of unframed PDUs and can support
any valid combinations of SDU_Interval and ISO_Interval.
SDU_Interval shall be a value, in microseconds, between 0x0000FF and 0x0FFFFF.
When the Host requests a framing packet type and mode, the Controller may use
another permitted framing packet type and mode if permitted in Table 2.1.
Note: If the original type and mode cannot be used, then the Controller is not required to
use another type and mode.
Requested framing packet Permitted framing packet type and mode
type and mode
Unframed Framed, Framed,
Segmentable mode Unsegmented mode
Unframed Yes Yes Yes
Framed, Segmentable mode No Yes Yes
Framed, Unsegmented mode No Yes Yes
Table 2.1: Permitted framing modes in isochronous PDUs
SDUs sent to the upper layer by the ISOAL shall be given a sequence number which
is initialized to 0 when the CIS or BIS is created. SDUs received by the ISOAL from
the upper layer shall be given a sequence number which is initialized to 0 when the
CIS or BIS is created. The upper layer may synchronize its sequence number with
the sequence number in the ISOAL once the Datapath is configured and the link is
established.
The sequence number shall be incremented by one for each SDU_Interval, whether or
not an SDU was received from the upper layer or included in reports sent to the upper
layer.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 3765 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 6, Part G Page 3766
Isochronous Adaptation Layer
The sequence number shall be 16 bits and shall be included in the
Packet_Sequence_Number parameter in HCI ISO Data Packets.
2.1 Unframed PDU
An unframed PDU is an ISO Data PDU; it shall contain payload from the SDU without
additional headers in the payload. An unframed PDU shall only contain payload from a
single SDU.
There are two types of unframed PDUs. An unframed PDU containing an end fragment
or a complete SDU, and an unframed PDU containing a start or a continuation
fragment. Unframed PDUs are identified by the LLID field as described below:
LLID in the header of the ISO Data PDU shall be set to 0b00 in the following conditions:
• When the payload of the ISO Data PDU contains the end fragment of an SDU.
• When the payload of the ISO Data PDU contains a complete SDU.
LLID in the header of the ISO Data PDU shall be set to 0b01 in the following conditions:
• When the payload of the ISO Data PDU contains a start or a continuation fragment of
an SDU.
• When the ISO Data PDU is used as padding. This is required when the fragments do
not add up to the configured number of PDUs specified by the BN parameter per BIS
or CIS event.
In the receiving device the payload from a PDU with LLID = 0b00 shall append the
payload from PDUs with LLID = 0b01 to derive the length of the payload of the SDU.
The SDU can contain some invalid or missing data due to missing or invalid PDUs. All
SDUs shall be sent to the upper layer including the indication of validity of data. A report
shall be sent to the upper layer if the SDU is completely missing.
Each fragment shall be sent in a new unframed PDU. Multiple fragments shall not be
sent in a single PDU.
BN, Max_PDU and ISO_Interval parameters of the Connected or Broadcast
Isochronous Stream shall be set such that the bandwidth of the data transmitted by
the Link Layer shall be greater than or equal to the bandwidth of data from the upper
layer.
The following two additional parameters are defined for unframed PDUs. USPI is the
number of SDUs scheduled per ISO_Interval and equals ISO_Interval ÷ SDU_Interval.
UPPS is the maximum number of fragments that an SDU is divided into and therefore
the number of PDUs allocated to transmit each SDU. Both these parameters are
integers.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 3766 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 6, Part G Page 3767
Isochronous Adaptation Layer
UPPS shall be at least . BN shall equal UPPS × USPI.
Max_SDU ÷ Max_PDU
Each SDU shall generate UPPS fragments. All these fragments shall be sent to the
Link Layer before any fragments of the next SDU. If an SDU generates less than UPPS
fragments, empty payloads shall be used to make up the number. Empty payloads shall
be PDUs with LLID 0b01 with zero length payload, e.g., when UPPS=4 and only 3
PDUs are generated from the SDU, an additional padding PDU needs to be added.
When an SDU contains zero length data, the corresponding PDU(s) shall be of zero
length and the LLID field shall be set to 0b00.
2.2 Framed PDU
A framed PDU is an ISO Data PDU where the payload field is made up of segments or
is empty. Each segment is encapsulated by a Segmentation Header and, for each first
segment of a new SDU, a Time_Offset field is included to allow for reconstruction of the
original SDU timing.
Framed PDUs shall be used when the requirements for using unframed PDUs are not
met. Framed PDUs support the aggregation of data from multiple SDUs into a single
PDU. The maximum allowed drift (MaxDrift) on the average timing of SDU delivery shall
not exceed 100 ppm from the configured value of SDU_Interval.
There are two modes for use with framed1 PDUs: Segmentable mode and
Unsegmented mode. Segmentable mode shall be supported; Unsegmented mode may
be supported.
In the Segmentable mode, the Controller may segment an SDU over multiple PDUs and
a PDU may contain segments from more than one SDU. In the Unsegmented mode,
each SDU shall be contained in a single segment in a single PDU; a PDU may contain
more than one SDU.
Both modes use the same Segmentation Header format.
In Segmentable mode, the BN, Max_PDU and ISO_Interval parameters of the
Connected or Broadcast Isochronous Stream shall be set such that the bandwidth of
the data transmitted by the Link Layer shall be greater than or equal to the bandwidth of
data from the upper layer plus the amount of space needed for the headers (including
an allowance for MaxDrift). This requirement is met if:
BN × (Max_PDU − 2) ≥ × 5 +
F F × Max_SDU
where F = (1 + MaxDrift) × ISO_Interval ÷ SDU_Interval
1Before the introduction of Unsegmented mode, “Framed” only referred to Segmentable mode.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 3767 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 6, Part G Page 3768
Isochronous Adaptation Layer
The requirement can be met without the inequality being satisfied.
In Unsegmented Mode, the Max_PDU parameter shall be set to
. For example, 40-
ISO_Interval÷SDU_Interval× 1+MaxDrift ÷BN × 5 + Max_SDU
octet SDUs generated at 10 ms intervals (with the worst-case drift of 100 ppm) will
require a Max_PDU of 45 octets when sent at 7.5 ms ISO_Interval (since there is at
most one SDU per PDU, BN will equal 1).
Figure 2.2 shows how multiple segments from multiple SDUs may fit in multiple ISO
Data PDUs. Each row in the figure shows the payload field of one PDU. The number
and length of segments in the payload shall be limited such that the length of the
ISO Data PDU does not exceed the Max_PDU set for the Connected or Broadcast
Isochronous Stream.
2 octets 3 octets
Segmentation TimeOffset
ISO SDU 1 Seg 1
Header (ISO SDU 1)
Segmentation Segmentation TimeOffset
ISO SDU 1 Seg 2 ISO SDU 2 Seg 1
Header Header (ISO SDU 2)
Segmentation
ISO SDU 2 Seg 2
Header
Segmentation Segmentation TimeOffset
ISO SDU 2 Seg 3 ISO SDU 3
Header Header (ISO SDU 3)
Figure 2.2: Examples of ISO data PDU payload fields with one or more segments
The format of a Segmentation Header is shown in Figure 2.3.
Figure 2.3: Segmentation header format
The fields in the Header is shown in Table 2.2.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 3768 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 6, Part G Page 3769
Isochronous Adaptation Layer
Field Description
Name
SC The Start or Continuation (SC) field indicates that the data following the Segmentation
Header is the start of a new SDU or the continuation of a previous SDU.
CMPLT The Completion (CMPLT) field indicates that the segment following the Segmentation
Header in the PDU is the end segment of an SDU.
Length The length field indicates the size, in octets, of the segment that follows the Segmenta-
tion Header in this PDU and, when present, includes the Time_Offset parameter.
Table 2.2: Segmentation Header fields
Each framed PDU starts with a Segmentation Header that contains a SC, CMPLT
and a Length field. Depending on the SC field, an additional Time_Offset parameter is
included between the Segmentation Header and the start of SDU data to indicate the
relative timing difference between the SDU and CIG reference point or BIG anchor point
timing.
A framed PDU with non-zero length shall contain one or more segments. A framed
PDU with zero length can be used as a padding PDU; such a PDU does not have
a Segmentation Header. Padding is required when the data does not add up to the
configured number of PDUs that are specified by the BN parameter per BIS or CIS
event.
The Segmentation Header includes the SC and the CMPLT fields with the following
requirements:
• When SC is set to 0, it indicates the start of a new SDU and that the data that follows
the header is part of a new SDU. If SC is set to 1, it indicates a continuation of an
SDU that was partially transmitted in a previous isochronous PDU.
• When SC is set to 0, the Segmentation Header shall be followed by a Time_Offset
field, otherwise the Time_Offset is omitted and the header is directly followed by a
segment of an SDU.
• When CMPLT is set to 0, not all data of the SDU has been included in the current
PDU. One or more additional framed PDUs are required to complete the SDU
transfer. When CMPLT is set to 1, all remaining data of the SDU is included in the
segment and the SDU may be transferred to the higher layer.
• CMPLT is independent of the value of SC.
The Segmentation Header shall contain a Length field. The Length field indicates
the number of octets of the SDU data segment following the Segmentation Header
including the length of Time_Offset when present (see Section 3).
Data from a single SDU shall not be split over multiple segments in a single PDU.
Additional Segmentation Headers and data from other SDUs may be added depending
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 3769 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 6, Part G Page 3770
Isochronous Adaptation Layer
on available remaining octets in that PDU. When an SDU has zero length, the SDU
shall be included with a Segmentation Header with SC set to 0, CMPLT set to 1, and
the length field set to the length of the Time_Offset. Such an empty SDU shall contain a
correct Time_Offset, to allow the higher layer of the device that receives the empty SDU
to maintain synchronization.
Because an isochronous transport is not a reliable transport, Segmentation Headers
shall integrally be contained in a single PDU. When insufficient octets remain in a
framed isochronous PDU to contain the Segmentation Header and the Time_Offset
field, no new Segmentation Header can be added, as shown in Table 2.3. When only 5
octets remain, a new Segmentation Header, including the start of the next SDU, may be
included but is not recommended.
SC Start/ COMPLT Time_Offset Description
continuation Completion Added
0 0 Yes The start of a new SDU, where not all SDU data is
included in the current PDU, and additional PDUs
are required to complete the SDU.
0 1 Yes The start of a new SDU that contains the full SDU
data in the current PDU.
1 0 No The continuation of a previous SDU. The SDU
payload is appended to the previous data and ad-
ditional PDUs are required to complete the SDU.
1 1 No The continuation of a previous SDU. Frame data
is appended to previously received SDU data and
completes in the current PDU.
Table 2.3: Description of Segmentation Header types in framed isochronous PDUs
A start of a new SDU with SC = 0 shall only be used when the previous frame has
completed. A continuation of an SDU with SC = 1 shall only be used if the previous
transmitted Segmentation Header had the completion flag set to 0.
When one or more ISO Data PDUs are not received, the receiving device may discard
all SDUs affected by the missing PDUs. Any partially received SDU may also be
discarded. A report shall be sent to the upper layer for each discarded SDU.
Bluetooth SIG Proprietary Version Date: 2025-11-03
