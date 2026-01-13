```c++
typedef struct Uart_Devt {
    char *name;
    void *impl;
    void *send(Uart_Devt dev,char *buf , uint8_t len);
}
static void impl_Uart_send(Uart_Devt * dev ,char *buf , uint8_t len) {
    HAL_UART_Transmit((UART_HandleTypeDef*)dev.impl,buf,len,/*time out*/300);
}

```

