# HCI Command: Reset

> 本文档提取自 Vol 4, Part E HCI Functional Specification。

### Page 2053 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 4, Part E Page 2054
Host Controller Interface Functional Specification
7.3.2 Reset command
Command OCF Command Parameters Return Parameters
HCI_Reset 0x0003 none Status
Description:
This command will reset the Controller and the Link Manager on the BR/EDR Controller
or the Link Layer on an LE Controller. If the Controller supports both BR/EDR and LE
then the HCI_Reset command shall reset the Link Manager, Baseband and Link Layer.
The HCI_Reset command shall not affect the used HCI transport layer since the HCI
transport layers may have reset mechanisms of their own. After the reset is completed,
the current operational state will be lost, the Controller will enter standby mode and the
Controller will automatically revert to the default values for the parameters for which
default values are defined in the specification.
Note: The HCI_Reset command will not necessarily perform a hardware reset. This is
implementation defined.
The Host shall not send additional HCI commands before the
HCI_Command_Complete event related to the HCI_Reset command has been
received.
Command parameters:
None.
Return parameters:
Status: Size: 1 octet
Value Parameter Description
0x00 HCI_Reset command succeeded, was received and will be executed.
0x01 to 0xFF HCI_Reset command failed. See [Vol 1] Part F, Controller Error Codes for a list of error
codes and descriptions.
Event(s) generated (unless masked away):
When the reset has been performed, an HCI_Command_Complete event shall be
generated.
Bluetooth SIG Proprietary Version Date: 2025-11-03
