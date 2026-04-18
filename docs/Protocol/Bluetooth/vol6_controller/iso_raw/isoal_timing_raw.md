# ISOAL Timing (Time Stamp & Offset)

> 本文档提取自 Vol 6, Part G Isochronous Adaptation Layer (ISOAL)。

### Page 3770 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 6, Part G Page 3771
Isochronous Adaptation Layer
3 TIME_STAMP AND TIME_OFFSET
Framed PDUs include a Time_Offset field to allow the reconstruction of the original SDU
timing. When using HCI ISO Data packets, a Time_Stamp field may be included. This
section defines the usage of these parameters. Every Time_Stamp and Time_Offset
shall be derived from a free running reference clock associated with the Controller
(the "Controller's clock") that is not affected by adjustments to synchronize with other
devices, such as a Peripheral synchronizing to a received packet from the Central
(see [Vol 6] Part B, Section 4.5.7) or an adjustment done as part of the Piconet Clock
Adjustment feature (see [Vol 2] Part B, Section 8.6.10).
3.1 Time_Offset in framed PDUs
At the transmitter, the Time_Offset is measured from the reference time of the SDU at
the source to the CIG Reference point or BIG anchor point of the corresponding CIG
or BIG event of the isochronous payload containing the first Segmentation Header of
that SDU. This computation ignores any potential retransmissions or missed subevents,
resulting in the time of transmission under perfect link conditions. The Time_Offset shall
be a positive value.
The reference time of the SDU is determined based on the local timing in the Controller
based on either a time stamp of that SDU (e.g., provided via the Time_Stamp parameter
in the HCI ISO Data packet) or another mechanism used by the implementation tracking
the SDU timing to the transport timing.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 3771 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 6, Part G Page 3772
Isochronous Adaptation Layer
SDU_Interval
CIS1 SDU
at source CIG Reference
point
CIS2 SDU
at source
TRANSPORT LATENCY
Time_Offset
CIS1 PDU
payload
ISO_Interval
CIS1_Sync_Delay
(FT-1)×ISO_Interval Maximum framing delay
CIS1 Reference Time_Offset
Anchor point
SDU at
Time_Offset CIG_Sync_Delay destination
SDU synchronization CIS1 Subevents SDU_Interval SDU_Interval
reference (for CIS1 P→C SDUs)
SDU synchronization
reference (for CIS1 C→P SDUs)
CIS2 Subevents
CIS2 PDU
payload
CIS2_Sync_Delay
CIS2 reference
Anchor point (FT-1)×ISO_Interval Maximum framing delay
CIG_Sync_Delay Time_Offset
Time_Offset
CIG Reference SDU at
SDU synchronization point destination
reference (for CIS2 P→C SDUs) SDU_Interval SDU_Interval
SDU synchronization
reference (for CIS2 C→P SDUs)
Figure 3.1: SDU synchronization reference using the Time_Offset parameter
For details on the computation of the SDU synchronization reference and transport
latency for all options of framed and unframed PDU in CIS and BIS, see Section 3.2.
At the receiver, the CIS reference anchor point is computed ignoring any
retransmissions or missed subevents, resulting in the time of transmission under perfect
link conditions. Similar calculations can be performed for BIG.
Any potential delays in effective transmission shall be omitted in the calculation of
Time_Offset.
When BN is greater than 1, all PDUs belonging to the same CIS or BIG event use the
same reference anchor point.
For example, in a CIS with BN=2 and FT = 10, payload number 720 can have its first
transmission potentially in CIS event 360 and its last potential transmission in CIS event
369. Even when the transfer effectively takes place in CIS event 365, the CIS reference
anchor point for this payload is the anchor point of CIS event 360.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 3772 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 6, Part G Page 3773
Isochronous Adaptation Layer
The Controller transmitting an SDU may use any of the following methods to determine
the value of the SDU reference time, indicated in Figure 3.1, to define the Time_Offset
for that SDU:
• A captured timestamp of the SDU
• A timestamp provided by the higher layer
• A computed timestamp based on a sequence counter provided by the higher layer
• Any other method of determining Time_Offset
3.2 SDU synchronization reference
This section describes the method of managing the SDU synchronization reference in
framed and unframed PDUs.
3.2.1 SDU synchronization reference using framed PDUs
Using framed PDUs introduces additional delay in transferring SDUs. This additional
delay shall be included when computing the SDU synchronization reference.
When using framed PDUs, the additional delay caused by the segmentation in a system
where SDU creation is not synchronized to the transport timing equals one SDU interval
plus one Isochronous interval.
The transport latency is the duration between the CIG reference point (or BIG anchor
point) of the first possible CIG or BIG event containing the payload and the CIG or
BIG synchronization point of the last possible CIG or BIG event containing the payload,
plus the maximum framing delay1 (shown in Figure 3.1 for CIG). Transport latency is
measured from the reference time of the SDU to its SDU_Synchronization_Reference
and does not include any implementation specific processing times or internal transport
delays (e.g., delays over the HCI transport or PDU processing times).
The maximum framing delay is one isochronous interval plus one SDU interval
in Segmentable mode and is one isochronous interval in Unsegmented mode. In
the following formulae, Framing_Delay_C, Framing_Delay_P, and Framing_Delay_B
equal SDU_Interval_C_To_P, SDU_Interval_P_To_C, and SDU_Interval respectively in
Segmentable mode and all equal zero in Unsegmented mode.
The transport latency for a CIG is the actual latency of transmitting payloads of all
CISes in the CIG, and is calculated as:
Transport_Latency_C_To_P = CIG_Sync_Delay + (FT_C_To_P) × ISO_Interval +
Framing_Delay_C
1This parameter was named “segmentation delay” in earlier specification versions.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 3773 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 6, Part G Page 3774
Isochronous Adaptation Layer
Transport_Latency_P_To_C = CIG_Sync_Delay + (FT_P_To_C) × ISO_Interval +
Framing_Delay_P
The transport latency for a BIG is the actual latency of transmitting payloads of all BISes
in the BIG, and is calculated as:
Transport_Latency_BIG = BIG_Sync_Delay + PTO × (NSE ÷ BN – IRC) ×
ISO_Interval + ISO_Interval + Framing_Delay_B
The calculated transport latencies shall be less than or equal to those set by the Host.
Each SDU is given a synchronization reference based on the Reference Anchor point.
The CIS reference anchor point is computed ignoring any retransmissions or missed
subevents and shall be set to the anchor point of the CIS event in which the first PDU
containing the SDU could have been transferred.
The BIG reference anchor point is the anchor point of the BIG event that the PDU is
associated with (see [Vol 6] Part B, Section 4.4.6.6).
For the Central to Peripheral direction or from the Isochronous Broadcaster to
Synchronized Receiver direction, the SDU synchronization point represents the
absolute time where the data from a CIG or BIG should be available, and can be used
to synchronize between multiple devices.
For SDUs sent from the Central to the Peripheral in a CIS using framed PDUs the
SDU_Synchronization_Reference shall be calculated as follows:
SDU_Synchronization_Reference = CIS Reference Anchor point + CIS_Sync_Delay +
Framing_Delay_C + FT_C_To_P × ISO_Interval – Time_Offset
For the Peripheral to Central direction, the SDU synchronization point represents the
absolute reference time of the origin of an SDU and can be used to synchronize data
coming from multiple sources. This point is at the start of the CIG reference point. It
could be earlier for framed PDUs.
For SDUs sent from the Peripheral to the Central in CIS using framed PDUs, the
SDU_Synchronization_Reference shall be calculated as follows:
SDU_Synchronization_Reference = CIS reference anchor point + CIS_Sync_Delay –
CIG_Sync_Delay – Time_Offset
For SDUs received in a BIS using framed PDUs, the SDU_Synchronization_Reference
shall be calculated as follows:
SDU_Synchronization_Reference = BIG reference anchor point + BIG_Sync_Delay +
ISO_Interval + Framing_Delay_B – Time_Offset
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 3774 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 6, Part G Page 3775
Isochronous Adaptation Layer
For example, when Segmentable mode is in use, the SDU interval is 10.6 ms, and the
isochronous interval is 10 ms, an additional 20.6 ms is added due to segmentation,
while if Unsegmented mode is in use, only 10 ms is added.
This example clarifies the usage of Time_Offset in the Central to Peripheral direction of
CIS: at the source an SDU has a reference time X at the Controller's clock. The start
of the CIS event of the first potential transmission of the PDU that can contain the first
part of that SDU is 6.123 ms later in time. The Time_Offset for the initial segment for
that SDU will contain the value 6123 decimal or 0x0017EB. During the exchange over
the isochronous transport, the PDU was not transmitted at the first possible opportunity,
rather the PDU was received by the peer in the pth subevent n events later due to actual
conditions of physical transport and potential Controller behavior such as scheduling
conflicts at a subevent with starting time Y. Time Y is captured at the Controller's clock
of the receiving device.
The receiving device computes the CIS reference anchor point time Y1 as follows:
Y1 = Y – (p–1) × Sub_Interval – n × ISO_Interval
The SDU synchronization reference for the SDU known as Y2 in µs is computed as:
Y2 = Y1 + CIS_Sync_Delay + SDU_Interval_C_To_P + (FT_C_To_P ×
ISO_Interval) – 6123
The SDU may be exchanged over multiple PDUs, but the synchronization reference
point shall only be computed based on the PDU timing of the PDU containing the first
Segmentation Header of the applicable SDU.
3.2.2 SDU synchronization reference using unframed PDUs
Using unframed PDUs does not introduce additional delay when the SDU interval
equals the isochronous interval. When the Isochronous interval is larger than
the SDU interval, multiple SDUs are received per BIS or CIS event which
increases the delay. This additional delay shall be included when computing the
SDU_Synchronization_Reference.
The transport latency is the duration between the CIG reference point (or BIG anchor
point) of the first possible CIG or BIG event containing the payload and the CIG
or BIG synchronization point of the last possible CIG or BIG event containing the
payload, plus the additional delay when grouping multiple SDUs in a single ISO_Interval
(as shown in Figure 3.2 for CIG). Transport latency is measured from the reference
time of the SDU to its SDU_Synchronization_Reference and does not include any
implementation specific processing times or internal transport delays (e.g., delays over
the HCI transport or PDU processing times).
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 3775 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 6, Part G Page 3776
Isochronous Adaptation Layer
The Transport_Latency for a CIG is the actual latency of transmitting payloads of all
CISes in the CIG, and is calculated as:
Transport_Latency_C_To_P = CIG_Sync_Delay + (FT_C_To_P – 1) ×
ISO_Interval + (USPI_C_To_P – 1) ×
SDU_Interval_C_To_P
Transport_Latency_P_To_C = CIG_Sync_Delay + (FT_P_To_C – 1) ×
ISO_Interval + (USPI_P_To_C – 1) ×
SDU_Interval_P_To_C
where USPI_C_To_P and USPI_P_To_C are the values of USPI for the two directions.
These calculations can be simplified as follows:
Transport_Latency_C_To_P = CIG_Sync_Delay + FT_C_To_P × ISO_Interval –
SDU_Interval_C_To_P
Transport_Latency_P_To_C = CIG_Sync_Delay + FT_P_To_C × ISO_Interval –
SDU_Interval_P_To_C
The Transport_Latency for a BIG is the actual latency of transmitting payloads of all
BISes in the BIG, and is calculated as:
Transport_Latency = BIG_Sync_Delay + PTO × (NSE ÷ BN – IRC) × ISO_Interval
+ (USPI – 1) × SDU_Interval
This calculation can be simplified as follows:
Transport_Latency = BIG_Sync_Delay + (PTO × (NSE ÷ BN – IRC) + 1) ×
ISO_Interval – SDU_Interval
For example, when the SDU interval is 10 ms and the Isochronous interval is 20 ms an
additional 10 ms is added due to combination of 2 SDUs in one BIS or CIS event.
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 3776 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 6, Part G Page 3777
Isochronous Adaptation Layer
SDU_
CIS1 SDU Interval
at source
CIS2 SDU
at source
CIS1 PDU payload
CIS2 PDU payload
CIG Reference
point
TRANSPORT LATENCY
SDU at destination
SDU_
(FT-1)×ISO_Interval Interval
SDU synchronization CIG_Sync_Delay SDU synchronization
reference reference (for CIS1 C→P SDUs)
(for CIS1 P→C SDUs)
CIS1 Reference
Anchor point
CIS1_Sync_Delay
CIS1 Subevents
ISO_Interval – SDU_Interval CIS2 Subevents
CIS2_Sync
_Delay (FT-1)×ISO_Interval SDU at destination
CIS2 Reference SDU_
Anchor point Interval
SDU synchronization
reference CIG_Sync_Delay SDU synchronization
reference
(for CIS2 P→C SDUs)
(for CIS2 C→P SDUs)
Figure 3.2: SDU synchronization reference using the unframed PDUs
Each SDU is given a synchronization reference point based on the reference anchor
point.
The CIS reference anchor point is computed ignoring any retransmissions or missed
subevents and shall be set to the start of the CIS event in which the first PDU containing
the SDU could have been transferred.
The BIG reference anchor point is the anchor point of the BIG event that the PDU is
associated with (see [Vol 6] Part B, Section 4.4.6.6).
For the Central to Peripheral direction or from the Isochronous Broadcaster to
Synchronized Receiver direction, the SDU synchronization point represents the
absolute time where the data from a CIG or BIG should be available, and can be used
to synchronize between multiple devices.
For SDUs sent from the Central to the Peripheral in CIS using unframed PDUs the
SDU_Synchronization_Reference for the first SDU received in a burst of PDUs shall be
calculated as follows:
SDU_Synchronization_Reference = CIS reference anchor point + CIS_Sync_Delay +
(FT_C_To_P – 1) × ISO_Interval
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 3777 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 6, Part G Page 3778
Isochronous Adaptation Layer
For the Peripheral to Central direction, the SDU synchronization point represents the
absolute reference time of the origin of an SDU and can be used to synchronize data
coming from multiple sources. This point is at the start of the CIG reference point.
For SDUs sent from the Peripheral to the Central in CIS using unframed PDUs, the
SDU_Synchronization_Reference for the first SDU received in a burst of PDUs shall be
calculated as follows:
SDU_Synchronization_Reference = CIS reference anchor point + CIS_Sync_Delay –
CIG_Sync_Delay + SDU_Interval – ISO_Interval
For SDUs received in BIS using unframed PDUs, the SDU_Synchronization_Reference
shall be calculated as follows:
SDU_Synchronization_Reference = BIG reference anchor point + BIG_Sync_Delay
All PDUs belonging to a burst as defined by the configuration of BN have the same
reference anchor point. When multiple SDUs have the same reference anchor point, the
first SDU uses the reference anchor point timing. Each subsequent SDU increases the
SDU_Synchronization_Reference timing by one SDU interval.
3.3 Time Stamp for SDU
When the Time_Stamp field is included in an HCI ISO Data packet from the Controller
to the Host, the value of Time_Stamp is set to the synchronization reference for the
SDU, as defined in Section 3.2, and is based on the CIS or BIG reference anchor point
of the Controller’s clock. The Controller should include a Time_Stamp.
The Host may determine the CIG reference point or BIG anchor point for the last
transmitted SDU from the TX_Time_Stamp and Time_Offset return parameters of the
HCI_LE_Read_ISO_TX_Sync command, as shown in Figure 3.1. It may then use this
information when providing the Time_Stamp in future HCI ISO Data packets. For each
HCI ISO Data packet where the Host can provide a valid Time_Stamp value, it should
include a Time_Stamp in those HCI ISO Data packets that it sends.
When an HCI ISO Data packet sent by the Host does not contain a Time_Stamp or
the Time_Stamp value is not based on the Controller's clock, the Controller should
determine the CIS or BIS event to be used to transmit the SDU contained in that packet
based on the time of arrival of that packet.
In each direction, in a given packet, the Time_Stamp provided (if any) shall be one that
applies to the SDU corresponding to the Packet_Sequence_Number.
When using the Time_Stamp or another suitable method for synchronization, both the
higher layer and Controller should implement a mechanism to compensate potential
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 3778 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 6, Part G Page 3779
Isochronous Adaptation Layer
clock drift and jitter. These mechanisms should include long term drift compensation
and tolerances on the synchronization method used.
The Controller or the higher layer sending or receiving an SDU may use any of the
following methods to transfer the synchronization reference of the SDU to the higher
layer:
• Timestamps at the Controller’s clock
• Any other signaling method suitable to the higher layer
Bluetooth SIG Proprietary Version Date: 2025-11-03
