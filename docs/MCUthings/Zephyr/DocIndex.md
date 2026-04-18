与Zephyr 官方wiki url 文档对齐的本地 rts 文档

# tree -d  docs

.
├── ./_doxygen
├── ./_extensions
│   └── ./_extensions/zephyr
│       ├── ./_extensions/zephyr/domain
│       │   ├── ./_extensions/zephyr/domain/static
│       │   │   ├── ./_extensions/zephyr/domain/static/css
│       │   │   └── ./_extensions/zephyr/domain/static/js
│       │   └── ./_extensions/zephyr/domain/templates
│       ├── ./_extensions/zephyr/doxytooltip
│       │   └── ./_extensions/zephyr/doxytooltip/static
│       │       └── ./_extensions/zephyr/doxytooltip/static/tippy
│       └── ./_extensions/zephyr/kconfig
│           └── ./_extensions/zephyr/kconfig/static
├── ./_scripts
├── ./_static
│   ├── ./_static/css
│   ├── ./_static/images
│   ├── ./_static/js
│   └── ./_static/latex
├── ./_templates
├── ./build
│   ├── ./build/cmake
│   ├── ./build/dts
│   │   └── ./build/dts/api
│   ├── ./build/flashing
│   ├── ./build/kconfig
│   ├── ./build/signing
│   ├── ./build/snippets
│   ├── ./build/sysbuild
│   └── ./build/version
├── ./connectivity
│   ├── ./connectivity/bluetooth
│   │   ├── ./connectivity/bluetooth/api
│   │   │   ├── ./connectivity/bluetooth/api/audio
│   │   │   │   └── ./connectivity/bluetooth/api/audio/img
│   │   │   ├── ./connectivity/bluetooth/api/classic
│   │   │   └── ./connectivity/bluetooth/api/mesh
│   │   │       └── ./connectivity/bluetooth/api/mesh/images
│   │   ├── ./connectivity/bluetooth/autopts
│   │   ├── ./connectivity/bluetooth/img
│   │   └── ./connectivity/bluetooth/shell
│   │       ├── ./connectivity/bluetooth/shell/audio
│   │       ├── ./connectivity/bluetooth/shell/classic
│   │       └── ./connectivity/bluetooth/shell/host
│   ├── ./connectivity/canbus
│   ├── ./connectivity/lora_lorawan
│   ├── ./connectivity/modbus
│   ├── ./connectivity/networking
│   │   ├── ./connectivity/networking/api
│   │   │   └── ./connectivity/networking/api/images
│   │   └── ./connectivity/networking/conn_mgr
│   │       └── ./connectivity/networking/conn_mgr/figures
│   └── ./connectivity/usb
│       ├── ./connectivity/usb/api
│       ├── ./connectivity/usb/device
│       │   └── ./connectivity/usb/device/api
│       ├── ./connectivity/usb/device_next
│       │   └── ./connectivity/usb/device_next/api
│       ├── ./connectivity/usb/host
│       │   └── ./connectivity/usb/host/api
│       └── ./connectivity/usb/pd
├── ./contribute
│   ├── ./contribute/coding_guidelines
│   ├── ./contribute/documentation
│   ├── ./contribute/media
│   └── ./contribute/style
├── ./develop
│   ├── ./develop/api
│   ├── ./develop/application
│   ├── ./develop/debug
│   ├── ./develop/flash_debug
│   ├── ./develop/getting_started
│   │   └── ./develop/getting_started/img
│   ├── ./develop/languages
│   │   ├── ./develop/languages/c
│   │   ├── ./develop/languages/cpp
│   │   └── ./develop/languages/rust
│   ├── ./develop/manifest
│   │   └── ./develop/manifest/external
│   ├── ./develop/optimizations
│   ├── ./develop/sca
│   ├── ./develop/test
│   │   ├── ./develop/test/figures
│   │   └── ./develop/test/twister
│   ├── ./develop/toolchains
│   ├── ./develop/tools
│   │   └── ./develop/tools/img
│   └── ./develop/west
├── ./hardware
│   ├── ./hardware/arch
│   ├── ./hardware/barriers
│   ├── ./hardware/cache
│   ├── ./hardware/emulator
│   │   └── ./hardware/emulator/img
│   ├── ./hardware/peripherals
│   │   ├── ./hardware/peripherals/audio
│   │   ├── ./hardware/peripherals/can
│   │   ├── ./hardware/peripherals/display
│   │   ├── ./hardware/peripherals/edac
│   │   ├── ./hardware/peripherals/eeprom
│   │   ├── ./hardware/peripherals/otp
│   │   ├── ./hardware/peripherals/sensor
│   │   └── ./hardware/peripherals/stepper
│   ├── ./hardware/pinctrl
│   │   └── ./hardware/pinctrl/images
│   ├── ./hardware/porting
│   │   └── ./hardware/porting/board
│   └── ./hardware/virtualization
├── ./images
├── ./introduction
├── ./kernel
│   ├── ./kernel/data_structures
│   ├── ./kernel/drivers
│   ├── ./kernel/iterable_sections
│   ├── ./kernel/memory_management
│   ├── ./kernel/object_cores
│   ├── ./kernel/services
│   │   ├── ./kernel/services/data_passing
│   │   ├── ./kernel/services/other
│   │   ├── ./kernel/services/scheduling
│   │   ├── ./kernel/services/smp
│   │   ├── ./kernel/services/synchronization
│   │   ├── ./kernel/services/threads
│   │   └── ./kernel/services/timing
│   ├── ./kernel/timing_functions
│   ├── ./kernel/usermode
│   └── ./kernel/util
├── ./project
│   └── ./project/img
├── ./releases
├── ./safety
│   └── ./safety/images
├── ./security
│   ├── ./security/media
│   └── ./security/standards
├── ./services
│   ├── ./services/binary_descriptors
│   ├── ./services/cpu_freq
│   │   └── ./services/cpu_freq/policies
│   ├── ./services/cpu_load
│   ├── ./services/crc
│   ├── ./services/crypto
│   │   ├── ./services/crypto/api
│   │   └── ./services/crypto/random
│   ├── ./services/debugging
│   ├── ./services/device_mgmt
│   │   └── ./services/device_mgmt/smp_groups
│   ├── ./services/dsp
│   ├── ./services/input
│   ├── ./services/instrumentation
│   ├── ./services/ipc
│   │   └── ./services/ipc/ipc_service
│   │       └── ./services/ipc/ipc_service/backends
│   ├── ./services/llext
│   ├── ./services/logging
│   │   └── ./services/logging/images
│   ├── ./services/mem_mgmt
│   ├── ./services/modem
│   │   └── ./services/modem/images
│   ├── ./services/net_buf
│   ├── ./services/pm
│   │   ├── ./services/pm/api
│   │   └── ./services/pm/images
│   ├── ./services/portability
│   │   └── ./services/portability/posix
│   │       ├── ./services/portability/posix/aep
│   │       ├── ./services/portability/posix/conformance
│   │       ├── ./services/portability/posix/implementation
│   │       ├── ./services/portability/posix/kconfig
│   │       ├── ./services/portability/posix/option_groups
│   │       └── ./services/portability/posix/overview
│   ├── ./services/profiling
│   ├── ./services/resource_management
│   ├── ./services/rtio
│   ├── ./services/sensing
│   │   └── ./services/sensing/images
│   ├── ./services/serialization
│   ├── ./services/shell
│   │   └── ./services/shell/images
│   ├── ./services/smf
│   ├── ./services/storage
│   │   ├── ./services/storage/disk
│   │   ├── ./services/storage/fcb
│   │   ├── ./services/storage/file_system
│   │   ├── ./services/storage/flash_map
│   │   ├── ./services/storage/nvmem
│   │   ├── ./services/storage/nvs
│   │   ├── ./services/storage/retention
│   │   ├── ./services/storage/secure_storage
│   │   ├── ./services/storage/settings
│   │   ├── ./services/storage/stream
│   │   └── ./services/storage/zms
│   ├── ./services/task_wdt
│   ├── ./services/tfm
│   ├── ./services/tracing
│   ├── ./services/virtualization
│   └── ./services/zbus
│       └── ./services/zbus/images
└── ./templates



## tree -f  docs/kernel/services

200 directories
.
├── ./data_passing
│   ├── ./data_passing/fifos.rst
│   ├── ./data_passing/lifos.rst
│   ├── ./data_passing/mailboxes.rst
│   ├── ./data_passing/message_queues.rst
│   ├── ./data_passing/pipes.rst
│   ├── ./data_passing/queues.rst
│   └── ./data_passing/stacks.rst
├── ./index.rst
├── ./interrupts.rst
├── ./other
│   ├── ./other/atomic.rst
│   ├── ./other/fatal.rst
│   ├── ./other/float.rst
│   ├── ./other/thread_local_storage.rst
│   └── ./other/version.rst
├── ./polling.rst
├── ./scheduling
│   ├── ./scheduling/cooperative.svg
│   ├── ./scheduling/index.rst
│   ├── ./scheduling/preemptive.svg
│   └── ./scheduling/timeslicing.svg
├── ./smp
│   ├── ./smp/smp.rst
│   └── ./smp/smpinit.svg
├── ./synchronization
│   ├── ./synchronization/condvar.rst
│   ├── ./synchronization/events.rst
│   ├── ./synchronization/mutexes.rst
│   └── ./synchronization/semaphores.rst
├── ./threads
│   ├── ./threads/index.rst
│   ├── ./threads/nothread.rst
│   ├── ./threads/priorities.svg
│   ├── ./threads/system_threads.rst
│   ├── ./threads/thread_states.svg
│   └── ./threads/workqueue.rst
└── ./timing
    ├── ./timing/clocks.rst
    └── ./timing/timers.rst

8 directories, 33 files
