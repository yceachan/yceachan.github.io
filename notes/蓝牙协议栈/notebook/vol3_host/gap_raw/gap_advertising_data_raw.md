# GAP Advertising Data Format (广播数据结构)

> 本文档提取自 Vol 3, Part C Generic Access Profile (GAP)。

### Page 1445 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part C Page 1446
Generic Access Profile
11 ADVERTISING AND SCAN RESPONSE DATA
FORMAT
The format of Advertising, Periodic Advertising, and Scan Response data is shown
in Figure 11.1. The data consists of a significant part and a non-significant part. The
significant part contains a sequence of AD structures. Each AD structure shall have a
Length field of one octet, which contains the Length value and shall not be zero, and
a Data field of Length octets. The first octet of the Data field shall contain the AD type
field. The content of the remaining Length - 1 octets in the Data field depends on the
value of the AD type field and is called the AD data. The non-significant part shall only
be present when necessary to fill a fixed-length field and shall contain all-zero octets.
Data
Significant part Non-significant part
I
I
A D Structure 1 - A - D - St-ruc-tu-re -2
-----
A
-
D
-
S
-
tru
-
ctu
-
re
-
'N
- -----
Ob000 ...0 00
Length
i octets
Data
I
Length
1 -·
I
I
I
I Length
1 octet - 1 octets
I AD Type IAD Data
Figure 11.1: Advertising and Scan Response data format
Only the significant part of the data should be sent over the air.
The data is sent in advertising or periodic advertising events. Host Advertising data
is placed in the AdvData field of ADV_IND, ADV_NONCONN_IND, ADV_SCAN_IND,
AUX_ADV_IND, and AUX_CHAIN_IND PDUs. Additional Controller Advertising Data is
placed in the ACAD field of AUX_ADV_IND, AUX_SYNC_IND, and AUX_SCAN_RSP
PDUs. Periodic Advertising data is placed in the AdvData field of AUX_SYNC_IND,
AUX_SYNC_SUBEVENT_IND, AUX_SYNC_SUBEVENT_RSP, and AUX_CHAIN_IND
PDUs. Scan Response data is sent in the ScanRspData field of SCAN_RSP PDUs
or the AdvData field of AUX_SCAN_RSP PDUs. If the complete data cannot fit in
the AdvData field of an AUX_ADV_IND, AUX_SYNC_IND, or AUX_SCAN_RSP PDU,
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 1446 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 3, Part C Page 1447
Generic Access Profile
AUX_CHAIN_IND PDUs are used to send the remaining fragments of the data. In this
case, an AD Structure may be fragmented over two or more PDUs.
The AD type data formats and meanings are defined in Section 1 of [4]. The AD type
identifier values are defined in Assigned Numbers.
Bluetooth SIG Proprietary Version Date: 2025-11-03
