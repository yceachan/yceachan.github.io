# HCI Command: Read Local Version

> 本文档提取自 Vol 4, Part E HCI Functional Specification。

### Page 2205 (Original)

BLUETOOTH CORE SPECIFICATION Version 6.2 | Vol 4, Part E Page 2206
Host Controller Interface Functional Specification
7.4 Informational parameters
The informational parameters are fixed by the manufacturer of the Bluetooth hardware.
These parameters provide information about the BR/EDR Controller and the capabilities
of the Link Manager and Baseband in the BR/EDR Controller. The Host device cannot
modify any of these parameters.
For Informational Parameters commands, the OGF is defined as 0x04.
7.4.1 Read Local Version Information command
Command OCF Command Parameters Return Parameters
HCI_Read_Local_Version_Information 0x0001 none Status,
HCI_Version,
HCI_Subversion,
LMP_Version,
Company_Identifier,
LMP_Subversion
Description:
This command reads the values for the version information for the local Controller.
The HCI_Version information defines the version information of the HCI layer. The
LMP_Version information defines the version of the LMP. The Company_Identifier
information indicates the manufacturer of the local device.
The HCI_Subversion and LMP_Subversion are vendor-specific.
Command parameters:
None.
Return parameters:
Status: Size: 1 octet
Value Parameter Description
0x00 HCI_Read_Local_Version_Information command succeeded.
0x01 to 0xFF HCI_Read_Local_Version_Information command failed. See [Vol 1] Part F, Controller
Error Codes for a list of error codes and descriptions.
Bluetooth SIG Proprietary Version Date: 2025-11-03
