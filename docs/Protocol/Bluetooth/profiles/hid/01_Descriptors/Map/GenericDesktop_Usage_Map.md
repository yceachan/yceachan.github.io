---
title: Generic Desktop Page Usage Map
tags: [HID, Usage-Table, Generic]
last_updated: 2026-02-02
type: Tech-Insight
---
# Generic Desktop Page (0x01)

**Reference**: `Docs/HUT/hut1_7.pdf`

| Usage ID (Hex) | Usage Name                                      | Usage Type | Description / Notes |
| :------------- | :---------------------------------------------- | :--------- | :------------------ |
| **00**         | Undefined                                       |            |                     |
| **01**         | Pointer                                         | CP         |                     |
| **02**         | Mouse                                           | CA         |                     |
| **03-03**      | Reserved                                        |            |                     |
| **04**         | Joystick                                        | CA         |                     |
| **05**         | Gamepad                                         | CA         |                     |
| **06**         | Keyboard                                        | CA         |                     |
| **07**         | Keypad                                          | CA         |                     |
| **08**         | Multi-axis Controller                           | CA         |                     |
| **09**         | Tablet PC System Controls                       | CA         |                     |
| **0A**         | Water Cooling Device [6]                        | CA         |                     |
| **0B**         | Computer Chassis Device [6]                     | CA         |                     |
| **0C**         | Wireless Radio Controls [13]                    | CA         |                     |
| **0D**         | Portable Device Control [23]                    | CA         |                     |
| **0E**         | System Multi-Axis Controller [33]               | CA         |                     |
| **0F**         | Spatial Controller [39]                         | CA         |                     |
| **10**         | Assistive Control [49]                          | CA         |                     |
| **11**         | Device Dock [57]                                | CA         |                     |
| **12**         | Dockable Device [57]                            | CA         |                     |
| **13**         | Call State Management Control [73]              | CA         |                     |
| **14-2F**      | Reserved                                        |            |                     |
| **30**         | X                                               | DV         |                     |
| **31**         | Y                                               | DV         |                     |
| **32**         | Z                                               | DV         |                     |
| **33**         | Rx                                              | DV         |                     |
| **34**         | Ry                                              | DV         |                     |
| **35**         | Rz                                              | DV         |                     |
| **36**         | Slider                                          | DV         |                     |
| **37**         | Dial                                            | DV         |                     |
| **38**         | Wheel                                           | DV         |                     |
| **39**         | Hat Switch                                      | DV         |                     |
| **3A**         | Counted Buffer                                  | CL         |                     |
| **3B**         | Byte Count                                      | DV         |                     |
| **3C**         | Motion Wakeup                                   | OSC/DF     |                     |
| **3D**         | Start                                           | OOC        |                     |
| **3E**         | Select                                          | OOC        |                     |
| **3F-3F**      | Reserved                                        |            |                     |
| **40**         | Vx                                              | DV         |                     |
| **41**         | Vy                                              | DV         |                     |
| **42**         | Vz                                              | DV         |                     |
| **43**         | Vbrx                                            | DV         |                     |
| **44**         | Vbry                                            | DV         |                     |
| **45**         | Vbrz                                            | DV         |                     |
| **46**         | Vno                                             | DV         |                     |
| **47**         | Feature Notification                            | DV/DF      |                     |
| **48**         | Resolution Multiplier                           | DV         |                     |
| **49**         | Qx [39]                                         | DV         |                     |
| **4A**         | Qy [39]                                         | DV         |                     |
| **4B**         | Qz [39]                                         | DV         |                     |
| **4C**         | Qw [39]                                         | DV         |                     |
| **4D-7F**      | Reserved                                        |            |                     |
| **80**         | System Control                                  | CA         |                     |
| **81**         | System Power Down                               | OSC        |                     |
| **82**         | System Sleep                                    | OSC        |                     |
| **83**         | System Wake Up                                  | OSC        |                     |
| **84**         | System Context Menu                             | OSC        |                     |
| **85**         | System Main Menu                                | OSC        |                     |
| **86**         | System App Menu                                 | OSC        |                     |
| **87**         | System Menu Help                                | OSC        |                     |
| **88**         | System Menu Exit                                | OSC        |                     |
| **89**         | System Menu Select                              | OSC        |                     |
| **8A**         | System Menu Right                               | RTC        |                     |
| **8B**         | System Menu Left                                | RTC        |                     |
| **8C**         | System Menu Up                                  | RTC        |                     |
| **8D**         | System Menu Down                                | RTC        |                     |
| **8E**         | System Cold Restart                             | OSC        |                     |
| **8F**         | System Warm Restart                             | OSC        |                     |
| **90**         | D-pad Up                                        | OOC        |                     |
| **91**         | D-pad Down                                      | OOC        |                     |
| **92**         | D-pad Right                                     | OOC        |                     |
| **93**         | D-pad Left                                      | OOC        |                     |
| **94**         | Index Trigger [39]                              | MC/DV      |                     |
| **95**         | Palm Trigger [39]                               | MC/DV      |                     |
| **96**         | Thumbstick [39]                                 | CP         |                     |
| **97**         | System Function Shift [42]                      | MC         |                     |
| **98**         | System Function Shift Lock [42]                 | OOC        |                     |
| **99**         | System Function Shift Lock Indicator [42]       | DV         |                     |
| **9A**         | System Dismiss Notification [53]                | OSC        |                     |
| **9B**         | System Do Not Disturb [61]                      | OOC        |                     |
| **9C-9F**      | Reserved                                        |            |                     |
| **A0**         | System Dock                                     | OSC        |                     |
| **A1**         | System Undock                                   | OSC        |                     |
| **A2**         | System Setup                                    | OSC        |                     |
| **A3**         | System Break                                    | OSC        |                     |
| **A4**         | System Debugger Break                           | OSC        |                     |
| **A5**         | Application Break                               | OSC        |                     |
| **A6**         | Application Debugger Break                      | OSC        |                     |
| **A7**         | System Speaker Mute                             | OSC        |                     |
| **A8**         | System Hibernate                                | OSC        |                     |
| **A9**         | System Microphone Mute [77]                     | OOC        |                     |
| **AA**         | System Accessibility Binding [83]               | OOC        |                     |
| **AB-AF**      | Reserved                                        |            |                     |
| **B0**         | System Display Invert                           | OSC        |                     |
| **B1**         | System Display Internal                         | OSC        |                     |
| **B2**         | System Display External                         | OSC        |                     |
| **B3**         | System Display Both                             | OSC        |                     |
| **B4**         | System Display Dual                             | OSC        |                     |
| **B5**         | System Display Toggle Int/Ext Mode              | OSC        |                     |
| **B6**         | System Display Swap Primary/Secondary           | OSC        |                     |
| **B7**         | System Display Toggle LCD Autoscale             | OSC        |                     |
| **B8-BF**      | Reserved                                        |            |                     |
| **C0**         | Sensor Zone [6]                                 | CL         |                     |
| **C1**         | RPM [6]                                         | DV         |                     |
| **C2**         | Coolant Level [6]                               | DV         |                     |
| **C3**         | Coolant Critical Level [6]                      | SV         |                     |
| **C4**         | Coolant Pump [6]                                | US         |                     |
| **C5**         | Chassis Enclosure [6]                           | CL         |                     |
| **C6**         | Wireless Radio Button [13]                      | OOC        |                     |
| **C7**         | Wireless Radio LED [13]                         | OOC        |                     |
| **C8**         | Wireless Radio Slider Switch [13]               | OOC        |                     |
| **C9**         | System Display Rotation Lock Button [24]        | OOC        |                     |
| **CA**         | System Display Rotation Lock Slider Switch [24] | OOC        |                     |
| **CB**         | Control Enable [22]                             | DF         |                     |
| **CC-CF**      | Reserved                                        |            |                     |
| **D0**         | Dockable Device Unique ID [57]                  | DV         |                     |
| **D1**         | Dockable Device Vendor ID [57]                  | DV         |                     |
| **D3**         | Dockable Device Primary Usage ID [57]           | DV         |                     |
| **D4**         | Dockable Device Docking State [57]              | DF         |                     |
| **D5**         | Dockable Device Display Occlusion [57]          | CL         |                     |
| **D6**         | Dockable Device Object Type [58]                | DV         |                     |
| **D7-DF**      | Reserved                                        |            |                     |
| **E0**         | Call Active LED [73]                            | OOC        |                     |
| **E1**         | Call Mute Toggle [73]                           | OSC        |                     |
| **E2**         | Call Mute LED [73]                              | OOC        |                     |
| **E3-FFFF**    | Reserved                                        |            |                     |
| **be**         | considered as dimensionless.                    |            |                     |
