# Keyboard/Keypad Page (0x07)



This section is the Usage Page for key codes to be used in implementing a USB keyboard. A Boot Keyboard (84-, 101- or 104-key) should at a minimum support all associated usage codes as indicated in the Boot column below.

The usage type of all key codes is Selectors (Sel), except for the modifier keys Keyboard Left Control (0x224) to Keyboard Right GUI (0x231) which are Dynamic Flags (DV).

> Note: A general note on Usages and languages: Due to the variation of keyboards from language to language, it is not feasible to specify exact key mappings for every language. Where this list is not specific for a key function in a language, the closest equivalent key position should be used, so that a keyboard may be modified for a different language by simply printing different keycaps. One example is the Y key on a North American keyboard. In Germany this is typically Z. Rather than changing the keyboard firmware to put the Z Usage into that place in the descriptor list, the vendor should use the Y Usage on both the North American and German keyboards. This continues to be the existing practice in the industry, in order to minimize the number of changes to the electronics to accommodate other languages.

| Dec     | Hex       | Name                            | Type | AT-101 | PC-AT | Mac  | Unix | Boot      | Footnotes |
| ------- | --------- | ------------------------------- | ---- | ------ | ----- | ---- | ---- | --------- | --------- |
| 0       | 0x00      | Reserved                        |      |        |       |      |      |           |           |
| 1       | 0x01      | Keyboard ErrorRollOver          | Sel  | N/A    | ✓     | ✓    | ✓    | 4/101/104 | 1         |
| 2       | 0x02      | Keyboard POSTFail               | Sel  | N/A    | ✓     | ✓    | ✓    | 4/101/104 | 1         |
| 3       | 0x03      | Keyboard ErrorUndefined         | Sel  | N/A    | ✓     | ✓    | ✓    | 4/101/104 | 1         |
| 4       | 0x04      | Keyboard a and A                | Sel  | 31     | ✓     | ✓    | ✓    | 4/101/104 | 2         |
| 5       | 0x05      | Keyboard b and B                | Sel  | 50     | ✓     | ✓    | ✓    | 4/101/104 |           |
| 6       | 0x06      | Keyboard c and C                | Sel  | 48     | ✓     | ✓    | ✓    | 4/101/104 | 2         |
| 7       | 0x07      | Keyboard d and D                | Sel  | 33     | ✓     | ✓    | ✓    | 4/101/104 |           |
| 8       | 0x08      | Keyboard e and E                | Sel  | 19     | ✓     | ✓    | ✓    | 4/101/104 |           |
| 9       | 0x09      | Keyboard f and F                | Sel  | 34     | ✓     | ✓    | ✓    | 4/101/104 |           |
| 10      | 0x0A      | Keyboard g and G                | Sel  | 35     | ✓     | ✓    | ✓    | 4/101/104 |           |
| 11      | 0x0B      | Keyboard h and H                | Sel  | 36     | ✓     | ✓    | ✓    | 4/101/104 |           |
| 12      | 0x0C      | Keyboard i and I                | Sel  | 24     | ✓     | ✓    | ✓    | 4/101/104 |           |
| 13      | 0x0D      | Keyboard j and J                | Sel  | 37     | ✓     | ✓    | ✓    | 4/101/104 |           |
| 14      | 0x0E      | Keyboard k and K                | Sel  | 38     | ✓     | ✓    | ✓    | 4/101/104 |           |
| 15      | 0x0F      | Keyboard l and L                | Sel  | 39     | ✓     | ✓    | ✓    | 4/101/104 |           |
| 16      | 0x10      | Keyboard m and M                | Sel  | 52     | ✓     | ✓    | ✓    | 4/101/104 | 2         |
| 17      | 0x11      | Keyboard n and N                | Sel  | 51     | ✓     | ✓    | ✓    | 4/101/104 |           |
| 18      | 0x12      | Keyboard o and O                | Sel  | 25     | ✓     | ✓    | ✓    | 4/101/104 | 2         |
| 19      | 0x13      | Keyboard p and P                | Sel  | 26     | ✓     | ✓    | ✓    | 4/101/104 | 2         |
| 20      | 0x14      | Keyboard q and Q                | Sel  | 17     | ✓     | ✓    | ✓    | 4/101/104 | 2         |
| 21      | 0x15      | Keyboard r and R                | Sel  | 20     | ✓     | ✓    | ✓    | 4/101/104 |           |
| 22      | 0x16      | Keyboard s and S                | Sel  | 32     | ✓     | ✓    | ✓    | 4/101/104 |           |
| 23      | 0x17      | Keyboard t and T                | Sel  | 21     | ✓     | ✓    | ✓    | 4/101/104 |           |
| 24      | 0x18      | Keyboard u and U                | Sel  | 23     | ✓     | ✓    | ✓    | 4/101/104 |           |
| 25      | 0x19      | Keyboard v and V                | Sel  | 49     | ✓     | ✓    | ✓    | 4/101/104 |           |
| 26      | 0x1A      | Keyboard w and W                | Sel  | 18     | ✓     | ✓    | ✓    | 4/101/104 | 2         |
| 27      | 0x1B      | Keyboard x and X                | Sel  | 47     | ✓     | ✓    | ✓    | 4/101/104 | 2         |
| 28      | 0x1C      | Keyboard y and Y                | Sel  | 22     | ✓     | ✓    | ✓    | 4/101/104 | 2         |
| 29      | 0x1D      | Keyboard z and Z                | Sel  | 46     | ✓     | ✓    | ✓    | 4/101/104 | 2         |
| 30      | 0x1E      | Keyboard 1 and !                | Sel  | 2      | ✓     | ✓    | ✓    | 4/101/104 | 2         |
| 31      | 0x1F      | Keyboard 2 and @                | Sel  | 3      | ✓     | ✓    | ✓    | 4/101/104 | 2         |
| 32      | 0x20      | Keyboard 3 and #                | Sel  | 4      | ✓     | ✓    | ✓    | 4/101/104 | 2         |
| 33      | 0x21      | Keyboard 4 and $                | Sel  | 5      | ✓     | ✓    | ✓    | 4/101/104 | 2         |
| 34      | 0x22      | Keyboard 5 and %                | Sel  | 6      | ✓     | ✓    | ✓    | 4/101/104 | 2         |
| 35      | 0x23      | Keyboard 6 and ∧                | Sel  | 7      | ✓     | ✓    | ✓    | 4/101/104 | 2         |
| 36      | 0x24      | Keyboard 7 and &                | Sel  | 8      | ✓     | ✓    | ✓    | 4/101/104 | 2         |
| 37      | 0x25      | Keyboard 8 and *                | Sel  | 9      | ✓     | ✓    | ✓    | 4/101/104 | 2         |
| 38      | 0x26      | Keyboard 9 and (                | Sel  | 10     | ✓     | ✓    | ✓    | 4/101/104 | 2         |
| 39      | 0x27      | Keyboard 0 and )                | Sel  | 11     | ✓     | ✓    | ✓    | 4/101/104 | 2         |
| 40      | 0x28      | Keyboard Return (ENTER)         | Sel  | 43     | ✓     | ✓    | ✓    | 4/101/104 | 3         |
| 41      | 0x29      | Keyboard ESCAPE                 | Sel  | 110    | ✓     | ✓    | ✓    | 4/101/104 |           |
| 42      | 0x2A      | Keyboard DELETE (Backspace)     | Sel  | 15     | ✓     | ✓    | ✓    | 4/101/104 | 4         |
| 43      | 0x2B      | Keyboard Tab                    | Sel  | 16     | ✓     | ✓    | ✓    | 4/101/104 |           |
| 44      | 0x2C      | Keyboard Spacebar               | Sel  | 61     | ✓     | ✓    | ✓    | 4/101/104 |           |
| 45      | 0x2D      | Keyboard - and (underscore)     | Sel  | 12     | ✓     | ✓    | ✓    | 4/101/104 | 2         |
| 46      | 0x2E      | Keyboard = and +                | Sel  | 13     | ✓     | ✓    | ✓    | 4/101/104 | 2         |
| 47      | 0x2F      | Keyboard [ and {                | Sel  | 27     | ✓     | ✓    | ✓    | 4/101/104 | 2         |
| 48      | 0x30      | Keyboard ] and }                | Sel  | 28     | ✓     | ✓    | ✓    | 4/101/104 | 2         |
| 49      | 0x31      | Keyboard \ and \|               | Sel  | 29     | ✓     | ✓    | ✓    | 4/101/104 |           |
| 50      | 0x32      | Keyboard Non-US # and ̃          | Sel  | 42     | ✓     | ✓    | ✓    | 4/101/104 | 5         |
| 51      | 0x33      | Keyboard ; and :                | Sel  | 40     | ✓     | ✓    | ✓    | 4/101/104 | 2         |
| 52      | 0x34      | Keyboard ‘ and “                | Sel  | 41     | ✓     | ✓    | ✓    | 4/101/104 | 2         |
| 53      | 0x35      | Keyboard Grave Accent and Tilde | Sel  | 1      | ✓     | ✓    | ✓    | 4/101/104 | 2         |
| 54      | 0x36      | Keyboard , and <                | Sel  | 53     | ✓     | ✓    | ✓    | 4/101/104 | 2         |
| 55      | 0x37      | Keyboard . and >                | Sel  | 54     | ✓     | ✓    | ✓    | 4/101/104 | 2         |
| 56      | 0x38      | Keyboard / and ?                | Sel  | 55     | ✓     | ✓    | ✓    | 4/101/104 | 2         |
| 57      | 0x39      | Keyboard Caps Lock              | Sel  | 30     | ✓     | ✓    | ✓    | 4/101/104 | 6         |
| 58      | 0x3A      | Keyboard F1                     | Sel  | 112    | ✓     | ✓    | ✓    | 4/101/104 |           |
| 59      | 0x3B      | Keyboard F2                     | Sel  | 113    | ✓     | ✓    | ✓    | 4/101/104 |           |
| 60      | 0x3C      | Keyboard F3                     | Sel  | 114    | ✓     | ✓    | ✓    | 4/101/104 |           |
| 61      | 0x3D      | Keyboard F4                     | Sel  | 115    | ✓     | ✓    | ✓    | 4/101/104 |           |
| 62      | 0x3E      | Keyboard F5                     | Sel  | 116    | ✓     | ✓    | ✓    | 4/101/104 |           |
| 63      | 0x3F      | Keyboard F6                     | Sel  | 117    | ✓     | ✓    | ✓    | 4/101/104 |           |
| 64      | 0x40      | Keyboard F7                     | Sel  | 118    | ✓     | ✓    | ✓    | 4/101/104 |           |
| 65      | 0x41      | Keyboard F8                     | Sel  | 119    | ✓     | ✓    | ✓    | 4/101/104 |           |
| 66      | 0x42      | Keyboard F9                     | Sel  | 120    | ✓     | ✓    | ✓    | 4/101/104 |           |
| 67      | 0x43      | Keyboard F10                    | Sel  | 121    | ✓     | ✓    | ✓    | 4/101/104 |           |
| 68      | 0x44      | Keyboard F11                    | Sel  | 122    | ✓     | ✓    | ✓    | 4/101/104 |           |
| 69      | 0x45      | Keyboard F12                    | Sel  | 123    | ✓     | ✓    | ✓    | 4/101/104 |           |
| 70      | 0x46      | Keyboard PrintScreen            | Sel  | 124    | ✓     | ✓    | ✓    | 4/101/104 | 7         |
| 71      | 0x47      | Keyboard Scroll Lock            | Sel  | 125    | ✓     | ✓    | ✓    | 4/101/104 | 6         |
| 72      | 0x48      | Keyboard Pause                  | Sel  | 126    | ✓     | ✓    | ✓    | 4/101/104 | 7         |
| 73      | 0x49      | Keyboard Insert                 | Sel  | 75     | ✓     | ✓    | ✓    | 4/101/104 | 7         |
| 74      | 0x4A      | Keyboard Home                   | Sel  | 80     | ✓     | ✓    | ✓    | 4/101/104 | 7         |
| 75      | 0x4B      | Keyboard PageUp                 | Sel  | 85     | ✓     | ✓    | ✓    | 4/101/104 | 7         |
| 76      | 0x4C      | Keyboard Delete Forward         | Sel  | 76     | ✓     | ✓    | ✓    | 4/101/104 | 7, 8      |
| 77      | 0x4D      | Keyboard End                    | Sel  | 81     | ✓     | ✓    | ✓    | 4/101/104 | 7         |
| 78      | 0x4E      | Keyboard PageDown               | Sel  | 86     | ✓     | ✓    | ✓    | 4/101/104 | 7         |
| 79      | 0x4F      | Keyboard RightArrow             | Sel  | 89     | ✓     | ✓    | ✓    | 4/101/104 | 7         |
| 80      | 0x50      | Keyboard LeftArrow              | Sel  | 79     | ✓     | ✓    | ✓    | 4/101/104 | 7         |
| 81      | 0x51      | Keyboard DownArrow              | Sel  | 84     | ✓     | ✓    | ✓    | 4/101/104 | 7         |
| 82      | 0x52      | Keyboard UpArrow                | Sel  | 83     | ✓     | ✓    | ✓    | 4/101/104 | 7         |
| 83      | 0x53      | Keypad Num Lock and Clear       | Sel  | 90     | ✓     | ✓    | ✓    | 4/101/104 | 6         |
| 84      | 0x54      | Keypad /                        | Sel  | 95     | ✓     | ✓    | ✓    | 4/101/104 | 7         |
| 85      | 0x55      | Keypad *                        | Sel  | 100    | ✓     | ✓    | ✓    | 4/101/104 |           |
| 86      | 0x56      | Keypad -                        | Sel  | 105    | ✓     | ✓    | ✓    | 4/101/104 |           |
| 87      | 0x57      | Keypad +                        | Sel  | 106    | ✓     | ✓    | ✓    | 4/101/104 |           |
| 88      | 0x58      | Keypad ENTER                    | Sel  | 108    | ✓     | ✓    | ✓    | 4/101/104 | 3         |
| 89      | 0x59      | Keypad 1 and End                | Sel  | 93     | ✓     | ✓    | ✓    | 4/101/104 |           |
| 90      | 0x5A      | Keypad 2 and Down Arrow         | Sel  | 98     | ✓     | ✓    | ✓    | 4/101/104 |           |
| 91      | 0x5B      | Keypad 3 and PageDn             | Sel  | 103    | ✓     | ✓    | ✓    | 4/101/104 |           |
| 92      | 0x5C      | Keypad 4 and Left Arrow         | Sel  | 92     | ✓     | ✓    | ✓    | 4/101/104 |           |
| 93      | 0x5D      | Keypad 5                        | Sel  | 97     | ✓     | ✓    | ✓    | 4/101/104 |           |
| 94      | 0x5E      | Keypad 6 and Right Arrow        | Sel  | 102    | ✓     | ✓    | ✓    | 4/101/104 |           |
| 95      | 0x5F      | Keypad 7 and Home               | Sel  | 91     | ✓     | ✓    | ✓    | 4/101/104 |           |
| 96      | 0x60      | Keypad 8 and Up Arrow           | Sel  | 96     | ✓     | ✓    | ✓    | 4/101/104 |           |
| 97      | 0x61      | Keypad 9 and PageUp             | Sel  | 101    | ✓     | ✓    | ✓    | 4/101/104 |           |
| 98      | 0x62      | Keypad 0 and Insert             | Sel  | 99     | ✓     | ✓    | ✓    | 4/101/104 |           |
| 99      | 0x63      | Keypad . and Delete             | Sel  | 104    | ✓     | ✓    | ✓    | 4/101/104 |           |
| 100     | 0x64      | Keyboard Non-US \ and \|        | Sel  | 45     | ✓     | ✓    | ✓    | 4/101/104 | 9, 10     |
| 101     | 0x65      | Keyboard Application            | Sel  | 129    | ✓     |      | ✓    | 104       | 11        |
| 102     | 0x66      | Keyboard Power                  | Sel  |        |       | ✓    | ✓    |           | 1         |
| 103     | 0x67      | Keypad =                        | Sel  |        |       | ✓    |      |           |           |
| 104     | 0x68      | Keyboard F13                    | Sel  |        |       | ✓    |      |           |           |
| 105     | 0x69      | Keyboard F14                    | Sel  |        |       | ✓    |      |           |           |
| 106     | 0x6A      | Keyboard F15                    | Sel  |        |       | ✓    |      |           |           |
| 107     | 0x6B      | Keyboard F16                    | Sel  |        |       |      |      |           |           |
| 108     | 0x6C      | Keyboard F17                    | Sel  |        |       |      |      |           |           |
| 109     | 0x6D      | Keyboard F18                    | Sel  |        |       |      |      |           |           |
| 110     | 0x6E      | Keyboard F19                    | Sel  |        |       |      |      |           |           |
| 111     | 0x6F      | Keyboard F20                    | Sel  |        |       |      |      |           |           |
| 112     | 0x70      | Keyboard F21                    | Sel  |        |       |      |      |           |           |
| 113     | 0x71      | Keyboard F22                    | Sel  |        |       |      |      |           |           |
| 114     | 0x72      | Keyboard F23                    | Sel  |        |       |      |      |           |           |
| 115     | 0x73      | Keyboard F24                    | Sel  |        |       |      |      |           |           |
| 116     | 0x74      | Keyboard Execute                | Sel  |        |       |      | ✓    |           |           |
| 117     | 0x75      | Keyboard Help                   | Sel  |        |       |      | ✓    |           |           |
| 118     | 0x76      | Keyboard Menu                   | Sel  |        |       |      | ✓    |           |           |
| 119     | 0x77      | Keyboard Select                 | Sel  |        |       |      | ✓    |           |           |
| 120     | 0x78      | Keyboard Stop                   | Sel  |        |       |      | ✓    |           |           |
| 121     | 0x79      | Keyboard Again                  | Sel  |        |       |      | ✓    |           |           |
| 122     | 0x7A      | Keyboard Undo                   | Sel  |        |       |      | ✓    |           |           |
| 123     | 0x7B      | Keyboard Cut                    | Sel  |        |       |      | ✓    |           |           |
| 124     | 0x7C      | Keyboard Copy                   | Sel  |        |       |      | ✓    |           |           |
| 125     | 0x7D      | Keyboard Paste                  | Sel  |        |       |      | ✓    |           |           |
| 126     | 0x7E      | Keyboard Find                   | Sel  |        |       |      | ✓    |           |           |
| 127     | 0x7F      | Keyboard Mute                   | Sel  |        |       |      | ✓    |           |           |
| 128     | 0x80      | Keyboard Volume Up              | Sel  |        |       |      | ✓    |           |           |
| 129     | 0x81      | Keyboard Volume Down            | Sel  |        |       |      | ✓    |           |           |
| 130     | 0x82      | Keyboard Locking Caps Lock      | Sel  |        |       |      | ✓    |           | 12        |
| 131     | 0x83      | Keyboard Locking Num Lock       | Sel  |        |       |      | ✓    |           | 12        |
| 132     | 0x84      | Keyboard Locking Scroll Lock    | Sel  |        |       |      | ✓    |           | 12        |
| 133     | 0x85      | Keypad Comma                    | Sel  | 107    |       |      |      |           | 13        |
| 134     | 0x86      | Keypad Equal Sign               | Sel  |        |       |      | ✓    |           | 14        |
| 135     | 0x87      | Keyboard International1         | Sel  | 56     |       |      |      |           | 15, 16    |
| 136     | 0x88      | Keyboard International2         | Sel  |        |       |      |      |           | 17        |
| 137     | 0x89      | Keyboard International3         | Sel  |        |       |      |      |           | 18        |
| 138     | 0x8A      | Keyboard International5         | Sel  |        |       |      |      |           | 19        |
| 139     | 0x8B      | Keyboard International5         | Sel  |        |       |      |      |           | 20        |
| 140     | 0x8C      | Keyboard International6         | Sel  |        |       |      |      |           | 21        |
| 141     | 0x8D      | Keyboard International7         | Sel  |        |       |      |      |           | 22        |
| 142     | 0x8E      | Keyboard International8         | Sel  |        |       |      |      |           | 23        |
| 143     | 0x8F      | Keyboard International9         | Sel  |        |       |      |      |           | 23        |
| 144     | 0x90      | Keyboard LANG1                  | Sel  |        |       |      |      |           | 24        |
| 145     | 0x91      | Keyboard LANG2                  | Sel  |        |       |      |      |           | 25        |
| 146     | 0x92      | Keyboard LANG3                  | Sel  |        |       |      |      |           | 26        |
| 147     | 0x93      | Keyboard LANG4                  | Sel  |        |       |      |      |           | 27        |
| 148     | 0x94      | Keyboard LANG5                  | Sel  |        |       |      |      |           | 28        |
| 149     | 0x95      | Keyboard LANG6                  | Sel  |        |       |      |      |           | 29        |
| 150     | 0x96      | Keyboard LANG7                  | Sel  |        |       |      |      |           | 29        |
| 151     | 0x97      | Keyboard LANG8                  | Sel  |        |       |      |      |           | 29        |
| 152     | 0x98      | Keyboard LANG9                  | Sel  |        |       |      |      |           | 29        |
| 153     | 0x99      | Keyboard Alternate Erase        | Sel  |        |       |      |      |           | 30        |
| 154     | 0x9A      | Keyboard SysReq/Attention       | Sel  |        |       |      |      |           | 7         |
| 155     | 0x9B      | Keyboard Cancel                 | Sel  |        |       |      |      |           |           |
| 156     | 0x9C      | Keyboard Clear                  | Sel  |        |       |      |      |           |           |
| 157     | 0x9D      | Keyboard Prior                  | Sel  |        |       |      |      |           |           |
| 158     | 0x9E      | Keyboard Return                 | Sel  |        |       |      |      |           |           |
| 159     | 0x9F      | Keyboard Separator              | Sel  |        |       |      |      |           |           |
| 160     | 0xA0      | Keyboard Out                    | Sel  |        |       |      |      |           |           |
| 161     | 0xA1      | Keyboard Oper                   | Sel  |        |       |      |      |           |           |
| 162     | 0xA2      | Keyboard Clear/Again            | Sel  |        |       |      |      |           |           |
| 163     | 0xA3      | Keyboard CrSel/Props            | Sel  |        |       |      |      |           |           |
| 164     | 0xA4      | Keyboard ExSel                  | Sel  |        |       |      |      |           |           |
| 165-175 | 0xA5-0xAF | Reserved                        |      |        |       |      |      |           |           |
| 176     | 0xB0      | Keypad 00                       | Sel  |        |       |      |      |           |           |
| 177     | 0xB1      | Keypad 000                      | Sel  |        |       |      |      |           |           |
| 178     | 0xB2      | Thousands Separator             | Sel  |        |       |      |      |           | 31        |
| 179     | 0xB3      | Decimal Separator               | Sel  |        |       |      |      |           | 31        |
| 180     | 0xB4      | Currency Unit                   | Sel  |        |       |      |      |           | 32        |
| 181     | 0xB5      | Currency Sub-unit               | Sel  |        |       |      |      |           | 32        |
| 182     | 0xB6      | Keypad (                        | Sel  |        |       |      |      |           |           |
| 183     | 0xB7      | Keypad )                        | Sel  |        |       |      |      |           |           |
| 184     | 0xB8      | Keypad {                        | Sel  |        |       |      |      |           |           |
| 185     | 0xB9      | Keypad }                        | Sel  |        |       |      |      |           |           |
| 186     | 0xBA      | Keypad Tab                      | Sel  |        |       |      |      |           |           |
| 187     | 0xBB      | Keypad Backspace                | Sel  |        |       |      |      |           |           |
| 188     | 0xBC      | Keypad A                        | Sel  |        |       |      |      |           |           |
| 189     | 0xBD      | Keypad B                        | Sel  |        |       |      |      |           |           |
| 190     | 0xBE      | Keypad C                        | Sel  |        |       |      |      |           |           |
| 191     | 0xBF      | Keypad D                        | Sel  |        |       |      |      |           |           |
| 192     | 0xC0      | Keypad E                        | Sel  |        |       |      |      |           |           |
| 193     | 0xC1      | Keypad F                        | Sel  |        |       |      |      |           |           |
| 194     | 0xC2      | Keypad XOR                      | Sel  |        |       |      |      |           |           |
| 195     | 0xC3      | Keypad ∧                        | Sel  |        |       |      |      |           |           |
| 196     | 0xC4      | Keypad %                        | Sel  |        |       |      |      |           |           |
| 197     | 0xC5      | Keypad <                        | Sel  |        |       |      |      |           |           |
| 198     | 0xC6      | Keypad >                        | Sel  |        |       |      |      |           |           |
| 199     | 0xC7      | Keypad &                        | Sel  |        |       |      |      |           |           |
| 200     | 0xC8      | Keypad &&                       | Sel  |        |       |      |      |           |           |
| 201     | 0xC9      | Keypad \|                       | Sel  |        |       |      |      |           |           |
| 202     | 0xCA      | Keypad \|\|                     | Sel  |        |       |      |      |           |           |
| 203     | 0xCB      | Keypad :                        | Sel  |        |       |      |      |           |           |
| 204     | 0xCC      | Keypad #                        | Sel  |        |       |      |      |           |           |
| 205     | 0xCD      | Keypad Space                    | Sel  |        |       |      |      |           |           |
| 206     | 0xCE      | Keypad @                        | Sel  |        |       |      |      |           |           |
| 207     | 0xCF      | Keypad !                        | Sel  |        |       |      |      |           |           |
| 208     | 0xD0      | Keypad Memory Store             | Sel  |        |       |      |      |           |           |
| 209     | 0xD1      | Keypad Memory Recall            | Sel  |        |       |      |      |           |           |
| 210     | 0xD2      | Keypad Memory Clear             | Sel  |        |       |      |      |           |           |
| 211     | 0xD3      | Keypad Memory Add               | Sel  |        |       |      |      |           |           |
| 212     | 0xD4      | Keypad Memory Subtract          | Sel  |        |       |      |      |           |           |
| 213     | 0xD5      | Keypad Memory Multiply          | Sel  |        |       |      |      |           |           |
| 214     | 0xD6      | Keypad Memory Divide            | Sel  |        |       |      |      |           |           |
| 215     | 0xD7      | Keypad +/-                      | Sel  |        |       |      |      |           |           |
| 216     | 0xD8      | Keypad Clear                    | Sel  |        |       |      |      |           |           |
| 217     | 0xD9      | Keypad Clear Entry              | Sel  |        |       |      |      |           |           |
| 218     | 0xDA      | Keypad Binary                   | Sel  |        |       |      |      |           |           |
| 219     | 0xDB      | Keypad Octal                    | Sel  |        |       |      |      |           |           |
| 220     | 0xDC      | Keypad Decimal                  | Sel  |        |       |      |      |           |           |
| 221     | 0xDD      | Keypad Hexadecimal              | Sel  |        |       |      |      |           |           |
| 222-223 | 0xDE-0xDF | Reserved                        |      |        |       |      |      |           |           |
| 224     | 0xE0      | Keyboard LeftControl            | DV   | 58     | ✓     | ✓    | ✓    | 4/101/104 |           |
| 225     | 0xE1      | Keyboard LeftShift              | DV   | 44     | ✓     | ✓    | ✓    | 4/101/104 |           |
| 226     | 0xE2      | Keyboard LeftAlt                | DV   | 60     | ✓     | ✓    | ✓    | 4/101/104 |           |
| 227     | 0xE3      | Keyboard Left GUI               | DV   | 127    | ✓     | ✓    | ✓    | 104       | 11, 33    |
| 228     | 0xE4      | Keyboard RightControl           | DV   | 64     | ✓     | ✓    | ✓    | 101/104   |           |
| 229     | 0xE5      | Keyboard RightShift             | DV   | 57     | ✓     | ✓    | ✓    | 4/101/104 |           |
| 230     | 0xE6      | Keyboard RightAlt               | DV   | 62     | ✓     | ✓    | ✓    | 101/104   |           |
| 231     | 0xE7      | Keyboard Right GUI              | DV   | 128    | ✓     | ✓    | ✓    | 104       | 11, 34    |