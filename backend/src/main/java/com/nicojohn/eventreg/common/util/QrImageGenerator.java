package com.nicojohn.eventreg.common.util;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Map;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;

/** Generates PNG QR code images cleanly for confirmation and promotion emails. */
public final class QrImageGenerator {

    private static final int DEFAULT_SIZE_PX = 240;

    private QrImageGenerator() {}

    public static byte[] toPngBytes(String content) {
        if (content == null || content.isBlank()) {
            throw new IllegalArgumentException("QR content must not be blank.");
        }
        try {
            QRCodeWriter writer = new QRCodeWriter();
            Map<EncodeHintType, Object> hints = Map.of(
                    EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.M,
                    EncodeHintType.MARGIN, 2
            );
            BitMatrix matrix = writer.encode(content, BarcodeFormat.QR_CODE, DEFAULT_SIZE_PX, DEFAULT_SIZE_PX, hints);
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(matrix, "PNG", out);
            return out.toByteArray();
        } catch (WriterException | IOException ex) {
            throw new IllegalStateException("Failed to generate QR code PNG.", ex);
        }
    }
}
