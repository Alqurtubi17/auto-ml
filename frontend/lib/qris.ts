export function generateDynamicQRIS(staticCode: string, amount: number) {
    let qrisStr = staticCode.slice(0, -4);
    const step1 = qrisStr.replace("510200", "510201");
    const amtStr = amount.toString();
    const amtField = "54" + amtStr.length.toString().padStart(2, "0") + amtStr;

    const finalStr = step1 + amtField;

    // Fungsi CRC16 Sederhana untuk QRIS
    function crc16(data: string): string {
        let crc = 0xFFFF;
        for (let i = 0; i < data.length; i++) {
            crc ^= data.charCodeAt(i) << 8;
            for (let j = 0; j < 8; j++) {
                if ((crc & 0x8000) !== 0) {
                    crc = (crc << 1) ^ 0x1021;
                } else {
                    crc <<= 1;
                }
            }
        }
        return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, "0");
    }

    return finalStr + crc16(finalStr);
}