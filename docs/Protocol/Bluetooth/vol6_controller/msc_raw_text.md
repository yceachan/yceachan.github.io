# MSC Raw Text Extraction

### Page 3571 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 6, Part D Page 3572
Message Sequence Charts
3 ADVERTISING STATE
3.1 Undirected advertising
A device may enter the Advertising state by enabling advertising. It should also
configure the advertising parameters before doing this (see Figure 3.1).
Host A LL A LL B Host B
Step1: SetupDeviceB tosendAdverts
LESetAdvertisingParameters
CommandComplete
LEReadAdvertisingPhysical
ChannelTxPower
CommandComplete
LESetAdvertisingData
CommandComplete
LESetScanResponseData
CommandComplete
LESetAdvertisingEnable(Enable)
CommandComplete
Advert
Advert
Advert
Advert
Advert
Advert
LESetAdvertising
Enable(Disable)
CommandComplete
Figure 3.1: Undirected advertising
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 3572 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 6, Part D Page 3573
Message Sequence Charts
3.2 Directed advertising
A device may use directed advertising to allow an initiator to connect to it. High
duty cycle directed advertising is time limited in the Controller and therefore this may
fail before a connection is created. This example only shows the failure case (see
Figure 3.2).
Host A LL A LL B Host B
Step1: SetupDeviceB toAdvertise
LESetAdvertisingParameters
CommandComplete
LESetAdvertisingEnable(Enable)
CommandComplete
ADV_DIRECT_IND
ADV_DIRECT_IND
ADV_DIRECT_IND
ADV_DIRECT_IND
ADV_DIRECT_IND
ADV_DIRECT_IND
LEConnectionComplete
(AdvertisingTimeout)
Figure 3.2: High duty cycle directed advertising showing failure case
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 3573 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 6, Part D Page 3574
Message Sequence Charts
Low duty cycle directed advertising is not time-limited. This example shows the
case where no connection is made. A device should also configure the advertising
parameters before doing this (see Figure 3.3).
Host A LL A LL B Host B
Step1: SetupDeviceB tosendAdverts
LESetAdvertisingParameters
CommandComplete
LESetAdvertisingEnable(Enable)
CommandComplete
ADV_DIRECT_IND
ADV_DIRECT_IND
ADV_DIRECT_IND
ADV_DIRECT_IND
ADV_DIRECT_IND
ADV_DIRECT_IND
LESetAdvertising
Enable(Disable)
CommandComplete
Figure 3.3: Low duty cycle directed advertising
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 3574 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 6, Part D Page 3575
Message Sequence Charts
3.3 Advertising using ADV_EXT_IND
A device may enter the Advertising state by enabling advertising a set. It should also
configure the advertising set parameters before doing this (see Figure 3.4).
Host A LL A LL B Host B
Step1: SetupDeviceB tosendadverts
LESetExtendedAdvertising
Parameters
CommandComplete
LESetExtendedAdvertisingData
CommandComplete
LESetExtendedScanResponse
Data
CommandComplete
LESetExtended
AdvertisingEnable
(Enable)
CommandComplete
ADV_EXT_IND
ADV_EXT_IND
ADV_EXT_IND
AUX_ADV_IND
. . .
ADV_EXT_IND
ADV_EXT_IND
ADV_EXT_IND
AUX_ADV_IND
LESetExtended
AdvertisingEnable
(Disable)
CommandComplete
Figure 3.4: Advertising using ADV_EXT_IND
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 3585 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 6, Part D Page 3586
Message Sequence Charts
4 SCANNING STATE
4.1 Passive scanning
A device can use passive scanning to find advertising devices in the area. This would
receive advertising packets from peer devices and report these to the Host (see
Figure 4.1).
Host A LL A LL B Host B
Step1: DeviceBis sendingAdverts,Device AisPassiveScanning
LESetScanParameters
(PassiveScanning)
CommandComplete
LESetScanEnable(Enable)
CommandComplete
Advert
LEAdvertisingReport
Advert
LEAdvertisingReport
LESetScanEnable(Disable)
CommandComplete
Figure 4.1: Passive scanning
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 3586 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 6, Part D Page 3587
Message Sequence Charts
4.2 Active scanning
A device may use active scanning to obtain more information about devices that may
be useful to populate a user interface. Active scanning involves more Link Layer
advertising messages (see Figure 4.2).
Host A LL A LL B Host B
Step1: DeviceBis sendingAdverts,Device Awishesto ActiveScan
LESetScanParameters
(ActiveScanning)
CommandComplete
LESetScanEnable(Enable)
CommandComplete
Advert
SCAN_REQ
SCAN_RSP
LEAdvertisingReport
Advert
SCAN_REQ
LEAdvertisingReport
LESetScanEnable(Disable)
CommandComplete
Figure 4.2: Active scanning
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 3587 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 6, Part D Page 3588
Message Sequence Charts
4.3 Passive scanning for directed advertisements with Privacy
If a device does not support Privacy in the Controller, it may choose to forward LE
Directed Advertising Report events from devices supporting Privacy without requiring
filtering through the Controller Resolving List.
Host A LL­A LL­B Host B
Step1: SetupDeviceA toActiveScan withHostBased ResolutionofRPAs
SetupDeviceBto sendadvertsusing PRAs
LEAddDevicetoResolvingList
CommandComplete
LESetAddressResolutionEnable
CommandComplete
LESetScanParameters LESetAdvertisingParameters
CommandComplete CommandComplete
LESetScanEnable LESetAdvertisingEnable
CommandComplete CommandComplete
ADV_DIRECT_IND
LEDirectedAdvertisingReport
Figure 4.3: Directed advertising with Privacy
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 3598 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 6, Part D Page 3599
Message Sequence Charts
5 INITIATING STATE
5.1 Initiating a connection
A device can initiate a connection to an advertiser. This example shows a successful
initiation, resulting in both devices able to send application data (see Figure 5.1).
Host A LL A LL B Host B
(Central) (Central) (Peripheral) (Peripheral)
Step1: DeviceBis sendingAdverts,Device Ainitiatesconnectionto DeviceB
LECreateConnection
CommandStatus
Advert
CONNECT_IND
LEConnectionComplete LEConnectionComplete
DataPhysicalChannelPDU
DataPhysicalChannelPDU
DataPhysicalChannelPDU
DataPhysicalChannelPDU
Figure 5.1: Initiating a connection
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 3599 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 6, Part D Page 3600
Message Sequence Charts
5.2 Canceling an initiation
A device can cancel a pending connection creation. This example shows an
unsuccessful initiation, followed by a cancellation of the initiation (see Figure 5.2).
Host A LL A LL B Host B
(Central) (Central) (Peripheral) (Peripheral)
Step1: DeviceAis initiatingaconnection toDeviceB
LECreateConnection
CommandStatus
LECreateConnectionCancel
CommandComplete
LEConnectionComplete
(UnknownConnectionIdentifier)
Figure 5.2: Canceling an initiation
Bluetooth SIG Proprietary Version Date: 2025-11-03

### Page 3600 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 6, Part D Page 3601
Message Sequence Charts
5.3 Initiating a connection using undirected advertising with Privacy
A device can initiate a connection to an advertiser. Privacy may be used during
connection initiation to make it more difficult to track either device during connection
setup. The example shows a successful initiation, resulting in both devices able to send
application data (see Figure 5.3).
HostA LLA LLB HostB
(Central) (Central) (Peripheral) (Peripheral)
Step1: SetupDeviceAtoinitiateaconnectionusingRPAs
SetupDeviceBtosendadvertsusingRPAs
LESetEventMask LESetEventMask
CommandComplete CommandComplete
LEAddDevicetoResolvingList LEAddDevicetoResolvingList
CommandComplete CommandComplete
LESetAddressResolutionEnable LESetAddressResolutionEnable
CommandComplete CommandComplete
LECreateConnection LESetAdvertisingParameters
CommandStatus CommandComplete
LESetAdvertisingEnable
CommandComplete
ADV_IND
ResolveAdvARPA
UseAdvARPA
GenerateInitARPA
CONNECT_IND
LEEnhancedConnectionComplete
VerifyAdvARPA
ResolveInitARPA
LEEnhancedConnectionComplete
DataPhysicalChannelPDU
DataPhysicalChannelPDU
DataPhysicalChannelPDU
DataPhysicalChannelPDU
Figure 5.3: Initiating a connection using undirected advertising with Privacy
Bluetooth SIG Proprietary Version Date: 2025-11-03

